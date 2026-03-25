import { useSearch } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { History, TrendingUp, TrendingDown, ArrowRight, LayoutDashboard, List, BarChart } from "lucide-react";
import { SubNav } from "@/components/SubNav";

export default function LongtermHistory() {
  const params = new URLSearchParams(useSearch());
  const condominiumId = params.get("condominiumId") ?? "1";

  const history = [
    { year: 2023, name: "給水ポンプ更新工事", cost: "245万円", plan: "250万円", vendor: "××設備工業", status: "完了" },
    { year: 2023, name: "共用部LED化工事", cost: "120万円", plan: "150万円", vendor: "〇〇電気", status: "完了" },
    { year: 2022, name: "鉄部塗装工事", cost: "310万円", plan: "320万円", vendor: "△△塗装", status: "完了" },
    { year: 2020, name: "インターホンシステム更新", cost: "850万円", plan: "800万円", vendor: "□□セキュア", status: "完了" },
    { year: 2018, name: "アスファルト舗装補修", cost: "420万円", plan: "450万円", vendor: "××道路", status: "完了" },
    { year: 2016, name: "第1回大規模修繕工事", cost: "7,800万円", plan: "8,200万円", vendor: "〇〇建設", status: "完了" },
    { year: 2015, name: "増圧給水ポンプ新設", cost: "450万円", plan: "400万円", vendor: "××設備工業", status: "完了" },
    { year: 2012, name: "バルコニー床防水補修", cost: "280万円", plan: "300万円", vendor: "△△防水", status: "完了" },
  ];

  return (
    <div className="space-y-6">
      <nav className="text-sm text-gray-500">
        <Link href={`/condominiums/${condominiumId}`} className="hover:text-gray-700">マンション詳細</Link>
        <span className="mx-2">{'>'}</span>
        <Link href={`/longterm/dashboard?condominiumId=${condominiumId}`} className="hover:text-gray-700">長期修繕計画</Link>
        <span className="mx-2">{'>'}</span>
        <span>修繕履歴</span>
      </nav>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">年度別修繕履歴</h1>
        <SubNav items={[
          { label: "修繕計画ダッシュボード", path: `/longterm/dashboard?condominiumId=${condominiumId}`, icon: LayoutDashboard },
          { label: "修繕項目一覧", path: `/longterm/items?condominiumId=${condominiumId}`, icon: List },
          { label: "修繕履歴", path: `/longterm/history?condominiumId=${condominiumId}`, icon: History },
          { label: "積立金シミュレーション", path: `/longterm/simulation?condominiumId=${condominiumId}`, icon: TrendingUp },
          { label: "AI見直し分析", path: `/longterm/analysis?condominiumId=${condominiumId}`, icon: BarChart },
        ]} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <TrendingDown className="w-5 h-5 mr-2 text-green-600" />
              コスト削減実績（直近5年）
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">計画比合計</p>
                <h3 className="text-3xl font-bold text-green-600">▲435万円</h3>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">適正価格査定・AI見積比較による</p>
                <p className="text-xs text-gray-400">コスト抑制効果</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              資産価値向上工事
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">実施件数</p>
                <h3 className="text-3xl font-bold text-blue-600">3件</h3>
              </div>
              <div className="text-right text-sm text-gray-600">
                <p>・LED化による省エネ化</p>
                <p>・インターホン機能強化</p>
                <p>・宅配ボックス増設</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg">修繕履歴一覧</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50 text-left">
                  <th className="py-3 px-4 text-sm font-medium text-gray-500">年度</th>
                  <th className="py-3 px-4 text-sm font-medium text-gray-500">工事名</th>
                  <th className="py-3 px-4 text-sm font-medium text-gray-500 text-right">費用(実績)</th>
                  <th className="py-3 px-4 text-sm font-medium text-gray-500 text-right">費用(計画)</th>
                  <th className="py-3 px-4 text-sm font-medium text-gray-500">施工業者</th>
                  <th className="py-3 px-4 text-sm font-medium text-gray-500">状態</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {history.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900 font-medium">{item.year}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{item.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right font-semibold">{item.cost}</td>
                    <td className="py-3 px-4 text-sm text-gray-500 text-right">{item.plan}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{item.vendor}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {item.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
