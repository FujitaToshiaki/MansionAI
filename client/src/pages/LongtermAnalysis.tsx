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
  LayoutDashboard,
  List,
  History,
  TrendingUp,
  BarChart
} from "lucide-react";
import { SubNav } from "@/components/SubNav";

export default function LongtermAnalysis() {
  const params = new URLSearchParams(useSearch());
  const condominiumId = params.get("condominiumId") ?? "1";

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
        <SubNav items={[
            { label: "修繕計画ダッシュボード", path: `/longterm/dashboard?condominiumId=${condominiumId}`, icon: LayoutDashboard },
            { label: "修繕項目一覧", path: `/longterm/items?condominiumId=${condominiumId}`, icon: List },
            { label: "修繕履歴", path: `/longterm/history?condominiumId=${condominiumId}`, icon: History },
            { label: "積立金シミュレーション", path: `/longterm/simulation?condominiumId=${condominiumId}`, icon: TrendingUp },
            { label: "AI見直し分析", path: `/longterm/analysis?condominiumId=${condominiumId}`, icon: BarChart },
          ]} />
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
    </div>
  );
}
