import { useState, useEffect } from "react";
import { useSearch, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "wouter";
import { Save, Download, ArrowLeft, Loader2, FileText, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProposalsEdit() {
  const params = new URLSearchParams(useSearch());
  const proposalId = params.get("proposalId") ?? "1";
  const condominiumId = params.get("condominiumId") ?? "";
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { data: condominium } = useQuery<any>({
    queryKey: ["/api/condominiums", condominiumId],
    enabled: !!condominiumId,
  });

  const mockProposals = {
    "1": {
      title: "管理規約一部改訂について",
      body: "本議案は、2025年の区分所有法改正およびマンション標準管理規約の改定に鑑み、当マンションの管理規約を最新の状態にアップデートするものです。\n\n主な改訂項目：\n1. ITを活用した総会・理事会の運用規定整備\n2. 専有部分の修繕等に関する理事会の承認プロセスの明確化\n3. 暴力団排除条項の最新化\n\nこれにより、円滑な合意形成と、より安全で透明性の高い管理体制の構築を目指します。",
      status: "approved",
      qa: [
        { q: "なぜ今改訂が必要なのですか？", a: "法令改正に対応しないまま運用を続けると、将来的に法的なトラブルや、助成金の申請などで不利になる可能性があるためです。" },
        { q: "住民の負担は増えますか？", a: "規約の文言整理が主であり、管理費の増額などは本議案には含まれません。" },
        { q: "オンライン参加は義務化されますか？", a: "選択肢を増やすための改正であり、対面参加を否定するものではありません。" }
      ]
    },
    "2": {
      title: "大規模修繕積立金改定",
      body: "長期修繕計画の見直しに基づき、将来の修繕費用の不足分を解消するため、修繕積立金の月額を2,000円値上げする案を提案いたします。",
      status: "reviewing",
      qa: [
        { q: "値上げの根拠は？", a: "最新の物価上昇と劣化診断の結果に基づいています。" }
      ]
    }
  };

  const proposal = (mockProposals as any)[proposalId] || mockProposals["1"];

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      toast({
        title: "ダウンロード完了",
        description: "議案書のPDFを生成し、ダウンロードしました。",
      });
    }, 3000);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(true);
      toast({
        title: "保存完了",
        description: "議案の内容を保存しました。",
      });
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <Link href={`/proposals/list?condominiumId=${condominiumId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" /> 戻る
            </Button>
          </Link>
          <h1 className="text-xl font-bold truncate max-w-md">{proposal.title}</h1>
        </div>
        <div className="flex items-center space-x-3">
          <Select defaultValue={proposal.status}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">下書き</SelectItem>
              <SelectItem value="reviewing">審議中</SelectItem>
              <SelectItem value="approved">承認済</SelectItem>
              <SelectItem value="presented">総会提示済</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleDownload} disabled={isDownloading}>
            {isDownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            {isDownloading ? "PDF生成中..." : "PDF出力"}
          </Button>
          <Button className="bg-orange-600 hover:bg-orange-700" onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" /> 保存
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Left: Text Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardHeader className="py-3 bg-gray-50 border-b">
              <CardTitle className="text-sm font-medium flex items-center">
                <FileText className="w-4 h-4 mr-2 text-gray-500" /> 議案本文
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <Textarea 
                className="w-full h-full resize-none border-0 rounded-none p-6 focus-visible:ring-0 text-base leading-relaxed"
                defaultValue={proposal.body}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right: AI Support */}
        <div className="w-80 flex flex-col gap-4 overflow-y-auto pr-2">
          <Card>
            <CardHeader className="bg-blue-50 py-3 border-b">
              <CardTitle className="text-sm font-bold text-blue-800 flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2" /> AI生成想定Q&A
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Accordion type="multiple" className="w-full">
                {proposal.qa.map((item: any, i: number) => (
                  <AccordionItem key={i} value={`item-${i}`} className="border-b px-4">
                    <AccordionTrigger className="text-xs font-bold text-left hover:no-underline py-3">
                      Q. {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-xs text-gray-600 leading-relaxed pb-4">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardHeader className="py-3">
              <CardTitle className="text-xs font-bold text-orange-800">住民説明のアドバイス</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-orange-700 leading-relaxed">
              法令改正への「守りの改正」であることを強調し、将来の資産価値維持に不可欠なステップであることを伝えると、合意形成がスムーズになります。
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
