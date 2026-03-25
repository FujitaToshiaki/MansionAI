import { useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { BookOpen, FileText, Plus, ArrowRight } from "lucide-react";

export default function ProposalsList() {
  const params = new URLSearchParams(useSearch());
  const condominiumId = params.get("condominiumId") ?? "";

  const { data: condominium } = useQuery<any>({
    queryKey: ["/api/condominiums", condominiumId],
    enabled: !!condominiumId,
  });

  const proposals = [
    {
      id: "1",
      title: "管理規約改訂",
      category: "規約",
      categoryColor: "purple",
      status: "承認済",
      statusVariant: "default",
      date: "2026/08/24",
      description: "2025年区分所有法改正に伴う、ペット飼育細則およびIT活用に関する規定の整備。",
    },
    {
      id: "2",
      title: "大規模修繕積立金改定",
      category: "修繕",
      categoryColor: "orange",
      status: "審議中",
      statusVariant: "secondary",
      date: "2026/08/24",
      description: "長期修繕計画の見直しに基づく、修繕積立金の月額2,000円値上げ案。",
    },
    {
      id: "3",
      title: "管理委託契約更新",
      category: "運営",
      categoryColor: "green",
      status: "下書き",
      statusVariant: "outline",
      date: "2026/08/24",
      description: "次期管理委託契約の内容確認および委託費用の据え置きに関する合意。",
    },
  ];

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "規約": return "bg-purple-100 text-purple-700 border-purple-200";
      case "修繕": return "bg-orange-100 text-orange-700 border-orange-200";
      case "財務": return "bg-blue-100 text-blue-700 border-blue-200";
      case "運営": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
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

      {/* Banner */}
      <Card className="bg-orange-50 border-orange-200">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-orange-500 p-3 rounded-full">
              <BookOpen className="text-white w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-orange-900">2026年8月 第42回定期総会</h2>
              <p className="text-orange-700">開催予定日: 2026年8月24日 (月)</p>
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
      <div className="grid grid-cols-1 gap-4">
        {proposals.map((proposal) => (
          <Card key={proposal.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className={getCategoryBadge(proposal.category)}>
                    {proposal.category}
                  </Badge>
                  <Badge variant={proposal.statusVariant as any}>
                    {proposal.status}
                  </Badge>
                </div>
                <CardTitle className="text-lg font-bold">{proposal.title}</CardTitle>
              </div>
              <Link href={`/proposals/edit?proposalId=${proposal.id}&condominiumId=${condominiumId}`}>
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-orange-600" data-testid={`button-edit-proposal-${proposal.id}`}>
                  編集・詳細 <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 leading-relaxed">
                {proposal.description}
              </p>
              <div className="mt-4 flex items-center text-xs text-gray-400">
                <FileText className="w-3 h-3 mr-1" />
                作成日: {proposal.date}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
