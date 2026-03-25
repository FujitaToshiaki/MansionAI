import { useState } from "react";
import { useSearch } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  Sparkles, 
  AlertTriangle, 
  Lightbulb, 
  CheckCircle2,
  ChevronRight,
  FileText,
  Loader2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function LongtermAnalysis() {
  const params = new URLSearchParams(useSearch());
  const condominiumId = params.get("condominiumId") ?? "1";
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const handleGenerateSummary = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowSummary(true);
    }, 2000);
  };

  const findings = [
    { title: "建築コスト指数の上昇", description: "計画策定時（2018年）から建築コスト指数が約25%上昇しており、現在の予算枠では不足する可能性が高い。", type: "risk" },
    { title: "周期設定の過度な保守性", description: "外壁塗装の周期を12年としているが、最新の塗料品質を考慮すると15年への延長が可能と判断される。", type: "opportunity" },
    { title: "未計上の重要項目", description: "EV充電設備の新設や、共用部IT化（スマートロック等）の予算が計上されていない。", type: "risk" },
  ];

  const proposals = [
    { item: "外壁・防水工事", change: "周期：12年 → 15年", effect: "▲2,400万円 (30年合計)", priority: "高" },
    { item: "EV充電設備", change: "新規計上 (2026年)", effect: "+800万円", priority: "中" },
    { item: "消防設備", change: "周期：15年 → 18年", effect: "▲350万円", priority: "低" },
    { item: "給排水管", change: "一部更新 → 更生工事", effect: "▲1,200万円", priority: "高" },
  ];

  return (
    <div className="space-y-6">
      <nav className="text-sm text-gray-500">
        <Link href={`/condominiums/${condominiumId}`} className="hover:text-gray-700">マンション詳細</Link>
        <span className="mx-2">{'>'}</span>
        <Link href={`/longterm/dashboard?condominiumId=${condominiumId}`} className="hover:text-gray-700">長期修繕計画</Link>
        <span className="mx-2">{'>'}</span>
        <span>AI見直し分析</span>
      </nav>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Sparkles className="w-6 h-6 mr-2 text-orange-500" />
          AI長期修繕計画見直し分析
        </h1>
        <Button 
          onClick={handleGenerateSummary} 
          disabled={isGenerating}
          className="bg-orange-600 hover:bg-orange-700"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              要約生成中...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 mr-2" />
              住民説明用要約を生成
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg">AI分析：主要な発見事項</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {findings.map((finding, i) => (
                <div key={i} className={`p-4 rounded-lg border ${finding.type === 'risk' ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                  <div className="flex items-start">
                    {finding.type === 'risk' ? (
                      <AlertTriangle className="w-5 h-5 mr-3 text-red-600 shrink-0 mt-0.5" />
                    ) : (
                      <Lightbulb className="w-5 h-5 mr-3 text-green-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h4 className={`font-bold ${finding.type === 'risk' ? 'text-red-900' : 'text-green-900'}`}>{finding.title}</h4>
                      <p className="text-sm text-gray-700 mt-1">{finding.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg">見直し提案テーブル</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50 text-left">
                    <th className="py-3 px-4 text-sm font-medium text-gray-500">対象項目</th>
                    <th className="py-3 px-4 text-sm font-medium text-gray-500">変更内容</th>
                    <th className="py-3 px-4 text-sm font-medium text-gray-500">財政影響</th>
                    <th className="py-3 px-4 text-sm font-medium text-gray-500">優先度</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {proposals.map((prop, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900 font-medium">{prop.item}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{prop.change}</td>
                      <td className={`py-3 px-4 text-sm font-semibold ${prop.effect.startsWith('▲') ? 'text-green-600' : 'text-red-600'}`}>
                        {prop.effect}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={
                          prop.priority === '高' ? 'bg-red-50 text-red-700 border-red-200' :
                          prop.priority === '中' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          'bg-blue-50 text-blue-700 border-blue-200'
                        }>
                          {prop.priority}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-orange-50 border-orange-100">
            <CardHeader>
              <CardTitle className="text-lg text-orange-900">AIアドバイス</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start">
                <CheckCircle2 className="w-5 h-5 mr-3 text-orange-600 shrink-0 mt-1" />
                <p className="text-sm text-orange-800">
                  建築コストの高騰を考慮し、積立金の設定を「均等積立方式」へ早期に移行することを強く推奨します。
                </p>
              </div>
              <div className="flex items-start">
                <CheckCircle2 className="w-5 h-5 mr-3 text-orange-600 shrink-0 mt-1" />
                <p className="text-sm text-orange-800">
                  更生工事（ライニング等）の採用により、配管更新費用を約30%抑制できる可能性があります。
                </p>
              </div>
              <div className="pt-4">
                <Button variant="outline" className="w-full bg-white border-orange-200 text-orange-700 hover:bg-orange-100">
                  詳細な分析レポートを表示
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">関連資料</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="ghost" className="w-full justify-between hover:bg-gray-50">
                <span className="text-sm">2018年度 長期修繕計画書</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Button>
              <Button variant="ghost" className="w-full justify-between hover:bg-gray-50">
                <span className="text-sm">直近の建物調査診断報告書</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Button>
              <Button variant="ghost" className="w-full justify-between hover:bg-gray-50">
                <span className="text-sm">建築物価指数推移データ</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>住民説明用 要約テキスト</DialogTitle>
            <DialogDescription>
              長期修繕計画の見直し必要性について、住民の方々に分かりやすく説明するための文章です。
            </DialogDescription>
          </DialogHeader>
          <div className="bg-gray-50 p-6 rounded-lg space-y-4 text-gray-800 leading-relaxed">
            <p className="font-bold text-lg border-b pb-2">【重要】将来の修繕積立金不足に関するお知らせとご提案</p>
            <p>
              現在の長期修繕計画をAI技術を用いて精査したところ、今後の建築資材および人件費の高騰（計画時より約25%上昇）により、このままでは将来的に約1.2億円の資金不足が生じる可能性が高いことが判明しました。
            </p>
            <p>
              一方で、外壁塗装などの修繕周期を最新技術に基づいて数年延長することや、工事手法の工夫により、合計で約4,000万円程度のコスト抑制も見込めます。
            </p>
            <p>
              皆様の資産価値を維持しつつ、将来の急な一時金徴収を避けるため、「修繕時期の最適化」と「積立金額の均等化」について、次回の理事会および総会にてご提案させていただく予定です。
            </p>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowSummary(false)}>閉じる</Button>
            <Button className="bg-orange-600 hover:bg-orange-700">クリップボードにコピー</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
