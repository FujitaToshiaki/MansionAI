import { useState } from "react";
import { useSearch, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { Sparkles, Save, ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProposalsGenerate() {
  const params = new URLSearchParams(useSearch());
  const condominiumId = params.get("condominiumId") ?? "";
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<any>(null);

  const { data: condominium } = useQuery<any>({
    queryKey: ["/api/condominiums", condominiumId],
    enabled: !!condominiumId,
  });

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedResult({
        body: "本議案は、2025年の区分所有法改正およびマンション標準管理規約の改定に鑑み、当マンションの管理規約を最新の状態にアップデートするものです。\n\n主な改訂項目：\n1. ITを活用した総会・理事会の運用規定整備\n2. 専有部分の修繕等に関する理事会の承認プロセスの明確化\n3. 暴力団排除条項の最新化\n\nこれにより、円滑な合意形成と、より安全で透明性の高い管理体制の構築を目指します。",
        qa: [
          { q: "なぜ今改訂が必要なのですか？", a: "法令改正に対応しないまま運用を続けると、将来的に法的なトラブルや、助成金の申請などで不利になる可能性があるためです。" },
          { q: "住民の負担は増えますか？", a: "規約の文言整理が主であり、管理費の増額などは本議案には含まれません。" },
          { q: "オンライン参加は義務化されますか？", a: "選択肢を増やすための改正であり、対面参加を否定するものではありません。" }
        ],
        explanation: "法改正に合わせた「守りの改正」です。将来の資産価値維持に不可欠なステップであることを強調します。"
      });
      setIsGenerating(false);
      toast({
        title: "AI生成完了",
        description: "議案の骨子と想定Q&Aを生成しました。",
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500">
        <Link href={`/condominiums/${condominiumId}`} className="hover:text-gray-700">
          {condominium?.name || "マンション詳細"}
        </Link>
        <span className="mx-2">{">"}</span>
        <Link href={`/proposals/list?condominiumId=${condominiumId}`} className="hover:text-gray-700">
          総会議案書管理
        </Link>
        <span className="mx-2">{">"}</span>
        <span>AI議案書生成</span>
      </nav>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="text-orange-500" />
          新規議案作成 (AIアシスト)
        </h1>
        <Button variant="outline" onClick={() => setLocation(`/proposals/list?condominiumId=${condominiumId}`)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> 一覧に戻る
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Form */}
        <Card>
          <CardHeader>
            <CardTitle>議案基本情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">議案タイトル</Label>
              <Input id="title" placeholder="例：管理規約の一部改訂について" defaultValue="管理規約の一部改訂について" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">カテゴリ</Label>
                <Select defaultValue="regulations">
                  <SelectTrigger id="category">
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regulations">規約</SelectItem>
                    <SelectItem value="maintenance">修繕</SelectItem>
                    <SelectItem value="finance">財務</SelectItem>
                    <SelectItem value="operation">運営</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">決議種別</Label>
                <Select defaultValue="special">
                  <SelectTrigger id="type">
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ordinary">普通決議</SelectItem>
                    <SelectItem value="special">特別決議</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="summary">要旨・背景</Label>
              <Textarea 
                id="summary" 
                placeholder="議案の目的や背景を簡潔に入力してください" 
                className="min-h-[100px]"
                defaultValue="2025年の法改正に合わせ、当マンションの規約も最新の標準規約に準拠させる必要がある。"
              />
            </div>
            
            <div className="pt-4 flex gap-3">
              <Button 
                className="flex-1 bg-orange-600 hover:bg-orange-700" 
                onClick={handleGenerate}
                disabled={isGenerating}
                data-testid="button-ai-generate"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                AI論点整理・文案生成
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right: AI Result */}
        <div className="space-y-6">
          {generatedResult ? (
            <>
              <Card className="animate-fadeIn">
                <CardHeader className="bg-orange-50">
                  <CardTitle className="text-sm font-medium text-orange-800">AI生成議案本文（案）</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {generatedResult.body}
                  </p>
                </CardContent>
              </Card>

              <Card className="animate-fadeIn">
                <CardHeader className="bg-blue-50">
                  <CardTitle className="text-sm font-medium text-blue-800">想定Q&A</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {generatedResult.qa.map((item: any, i: number) => (
                    <div key={i} className="space-y-1">
                      <p className="text-xs font-bold text-blue-700">Q. {item.q}</p>
                      <p className="text-xs text-gray-600">A. {item.a}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" /> 規約分析を参照
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" /> 議事録を参照
                </Button>
              </div>

              <Button 
                className="w-full" 
                onClick={() => {
                  toast({ title: "保存完了", description: "一覧に戻ります。" });
                  setLocation(`/proposals/list?condominiumId=${condominiumId}`);
                }}
                data-testid="button-save-return"
              >
                <Save className="w-4 h-4 mr-2" /> 保存して一覧に戻る
              </Button>
            </>
          ) : (
            <div className="h-full flex items-center justify-center border-2 border-dashed rounded-lg text-gray-400 p-12 text-center">
              <div>
                <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>左側のフォームを入力して<br />AI分析を開始してください</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
