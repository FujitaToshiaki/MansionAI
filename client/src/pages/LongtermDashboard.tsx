import { useSearch } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  Wrench, 
  TrendingUp, 
  History, 
  List, 
  BarChart, 
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle
} from "lucide-react";

export default function LongtermDashboard() {
  const params = new URLSearchParams(useSearch());
  const condominiumId = params.get("condominiumId") ?? "1";

  const summaryCards = [
    { title: "計画総額", value: "3.6億円", description: "30年間合計", icon: Wrench, color: "text-blue-600" },
    { title: "積立金残高", value: "9,600万円", description: "2024年度末見込", icon: TrendingUp, color: "text-green-600" },
    { title: "月額積立金", value: "12,000円", description: "1戸あたり平均", icon: History, color: "text-orange-600" },
    { title: "資金過不足", value: "▲1.2億円", description: "30年後の最終残高", icon: AlertTriangle, color: "text-red-600" },
  ];

  const timelineYears = Array.from({ length: 12 }, (_, i) => 2024 + i);
  const categories = ["共通・外構", "屋上・防水", "外壁・塗装", "給排水設備", "電気・消防", "エレベーター"];

  const schedule = [
    { category: "共通・外構", years: [2028, 2040] },
    { category: "屋上・防水", years: [2025, 2037] },
    { category: "外壁・塗装", years: [2028, 2040] },
    { category: "給排水設備", years: [2030, 2031] },
    { category: "電気・消防", years: [2026, 2038] },
    { category: "エレベーター", years: [2035] },
  ];

  const recentItems = [
    { year: 2025, item: "屋上防水工事", cost: "1,200万円", status: "計画中" },
    { year: 2026, item: "消防設備更新", cost: "850万円", status: "計画中" },
    { year: 2028, item: "第2回大規模修繕工事", cost: "1.2億円", status: "検討前" },
  ];

  return (
    <div className="space-y-6">
      <nav className="text-sm text-gray-500">
        <Link href={`/condominiums/${condominiumId}`} className="hover:text-gray-700">マンション詳細</Link>
        <span className="mx-2">{'>'}</span>
        <span>長期修繕計画</span>
      </nav>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">長期修繕計画ダッシュボード</h1>
        <div className="flex gap-2">
          <Link href={`/longterm/items?condominiumId=${condominiumId}`}>
            <Button variant="outline" size="sm">
              <List className="w-4 h-4 mr-2" />
              修繕項目一覧
            </Button>
          </Link>
          <Link href={`/longterm/history?condominiumId=${condominiumId}`}>
            <Button variant="outline" size="sm">
              <History className="w-4 h-4 mr-2" />
              修繕履歴
            </Button>
          </Link>
          <Link href={`/longterm/simulation?condominiumId=${condominiumId}`}>
            <Button variant="outline" size="sm">
              <TrendingUp className="w-4 h-4 mr-2" />
              積立金推移
            </Button>
          </Link>
          <Link href={`/longterm/analysis?condominiumId=${condominiumId}`}>
            <Button variant="default" size="sm" className="bg-orange-600 hover:bg-orange-700">
              <BarChart className="w-4 h-4 mr-2" />
              AI分析
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <Card key={i} className="bg-white">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">{card.title}</p>
                  <h3 className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</h3>
                  <p className="text-xs text-gray-400 mt-1">{card.description}</p>
                </div>
                <div className={`p-2 rounded-lg bg-gray-50`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg">修繕タイムライン（12年間）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-[150px_repeat(12,1fr)] border-b pb-2 mb-2">
                <div className="text-sm font-medium text-gray-500">工事区分</div>
                {timelineYears.map(year => (
                  <div key={year} className="text-center text-xs font-medium text-gray-500">{year}</div>
                ))}
              </div>
              <div className="space-y-1">
                {schedule.map((row, i) => (
                  <div key={i} className="grid grid-cols-[150px_repeat(12,1fr)] items-center py-2 hover:bg-gray-50 rounded">
                    <div className="text-sm text-gray-700 font-medium">{row.category}</div>
                    {timelineYears.map(year => (
                      <div key={year} className="flex justify-center">
                        {row.years.includes(year) && (
                          <div className="w-full h-6 bg-orange-100 border border-orange-200 rounded flex items-center justify-center">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg">直近の修繕予定</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-3 px-4 text-sm font-medium text-gray-500">予定年</th>
                  <th className="py-3 px-4 text-sm font-medium text-gray-500">工事項目</th>
                  <th className="py-3 px-4 text-sm font-medium text-gray-500 text-right">概算費用</th>
                  <th className="py-3 px-4 text-sm font-medium text-gray-500">ステータス</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentItems.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900 font-medium">{item.year}年度</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{item.item}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right font-semibold">{item.cost}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
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
