import { useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { BookOpen, FileText, Plus, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { SubNav } from "@/components/SubNav";

export default function ProposalsList() {
  const params = new URLSearchParams(useSearch());
  const condominiumId = params.get("condominiumId") ?? "";

  const { data: condominium } = useQuery<any>({
    queryKey: ["/api/condominiums", condominiumId],
    enabled: !!condominiumId,
  });

  const { data: proposals = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/condominiums", condominiumId, "proposals"],
    queryFn: () => fetch(`/api/condominiums/${condominiumId}/proposals`).then(r => r.json()),
    enabled: !!condominiumId,
  });

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "規約改訂": return "bg-purple-100 text-purple-700 border-purple-200";
      case "修繕": return "bg-orange-100 text-orange-700 border-orange-200";
      case "管理費": return "bg-blue-100 text-blue-700 border-blue-200";
      case "運営": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "draft": return "下書き";
      case "submitted": return "審議中";
      case "decided": return "承認済";
      case "archived": return "総会提示済";
      default: return status ?? "下書き";
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case "decided": return "default";
      case "submitted": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500">
        <Link href={`/condominiums/${condominiumId}`} className="hover:text-gray-700">
          {condominium?.name || "マンション詳細"}
        </Link>
        <span className="mx-2">{">"}</span>
        <span>総会議案書管理</span>
      </nav>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">総会議案書管理</h1>
        <SubNav items={[
          { label: "議案書一覧", path: `/proposals/list?condominiumId=${condominiumId}`, icon: FileText },
          { label: "AI議案書生成", path: `/proposals/generate?condominiumId=${condominiumId}`, icon: Sparkles },
        ]} />
      </div>

      {/* Banner */}
      <Card className="bg-orange-50 border-orange-200">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-orange-500 p-3 rounded-full">
              <BookOpen className="text-white w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-orange-900">2026年10月 第42回定期総会</h2>
              <p className="text-orange-700">開催予定日: 2026年10月25日（日）</p>
            </div>
          </div>
          <Link href={`/proposals/generate?condominiumId=${condominiumId}`}>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white" data-testid="button-add-proposal">
              <Plus className="w-4 h-4 mr-2" />
              新規議案追加
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Proposals List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {proposals.map((proposal) => (
            <Card key={proposal.id} className="bg-white hover:shadow-md transition-shadow" data-testid={`card-proposal-${proposal.id}`}>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={getCategoryBadge(proposal.category)}>
                      {proposal.category}
                    </Badge>
                    <Badge variant={getStatusVariant(proposal.status)}>
                      {getStatusLabel(proposal.status)}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-bold" data-testid={`text-proposal-title-${proposal.id}`}>{proposal.title}</CardTitle>
                </div>
                <Link href={`/proposals/edit?proposalId=${proposal.id}&condominiumId=${condominiumId}`}>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-orange-600" data-testid={`button-edit-proposal-${proposal.id}`}>
                    編集・詳細 <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                  {proposal.content ?? "内容未入力"}
                </p>
                <div className="mt-4 flex items-center text-xs text-gray-400">
                  <FileText className="w-3 h-3 mr-1" />
                  予定日: {proposal.scheduled_date ? new Date(proposal.scheduled_date).toLocaleDateString("ja-JP") : "未定"}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
