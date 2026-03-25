import { useSearch } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { Search, Sparkles, LayoutDashboard, List, History, TrendingUp, BarChart } from "lucide-react";
import { SubNav } from "@/components/SubNav";

export default function LongtermItems() {
  const params = new URLSearchParams(useSearch());
  const condominiumId = params.get("condominiumId") ?? "1";

  const items = [
    { id: 1, category: "共通・外構", name: "アスファルト舗装補修", cycle: 12, last: 2018, next: 2030, cost: "450万円", aiSuggested: false },
    { id: 2, category: "屋上・防水", name: "屋上アスファルト防水", cycle: 15, last: 2010, next: 2025, cost: "1,200万円", aiSuggested: true },
    { id: 3, category: "外壁・塗装", name: "外壁塗装塗替工事", cycle: 12, last: 2016, next: 2028, cost: "8,500万円", aiSuggested: false },
    { id: 4, category: "外壁・塗装", name: "鉄部塗装工事", cycle: 4, last: 2022, next: 2026, cost: "320万円", aiSuggested: false },
    { id: 5, category: "給排水設備", name: "給水ポンプ更新", cycle: 15, last: 2015, next: 2030, cost: "250万円", aiSuggested: false },
    { id: 6, category: "給排水設備", name: "排水管高圧洗浄", cycle: 1, last: 2023, next: 2024, cost: "85万円", aiSuggested: false },
    { id: 7, category: "電気・消防", name: "非常用照明更新", cycle: 12, last: 2014, next: 2026, cost: "180万円", aiSuggested: true },
    { id: 8, category: "エレベーター", name: "EV制御盤更新", cycle: 25, last: 2010, next: 2035, cost: "1,500万円", aiSuggested: false },
    { id: 9, category: "共通・外構", name: "植栽剪定", cycle: 1, last: 2023, next: 2024, cost: "45万円", aiSuggested: false },
    { id: 10, category: "屋上・防水", name: "バルコニー床防水", cycle: 12, last: 2016, next: 2028, cost: "1,800万円", aiSuggested: false },
    { id: 11, category: "外壁・塗装", name: "タイル剥落防止工事", cycle: 12, last: 2016, next: 2028, cost: "2,200万円", aiSuggested: true },
    { id: 12, category: "給排水設備", name: "貯水槽清掃", cycle: 1, last: 2023, next: 2024, cost: "15万円", aiSuggested: false },
    { id: 13, category: "電気・消防", name: "受変電設備更新", cycle: 20, last: 2015, next: 2035, cost: "1,200万円", aiSuggested: false },
    { id: 14, category: "エレベーター", name: "EVワイヤーロープ交換", cycle: 10, last: 2020, next: 2030, cost: "80万円", aiSuggested: false },
    { id: 15, category: "共通・外構", name: "フェンス塗装", cycle: 6, last: 2020, next: 2026, cost: "120万円", aiSuggested: false },
    { id: 16, category: "屋上・防水", name: "階段室防水", cycle: 15, last: 2012, next: 2027, cost: "350万円", aiSuggested: false },
    { id: 17, category: "給排水設備", name: "共用排水管更新", cycle: 30, last: 2000, next: 2030, cost: "4,500万円", aiSuggested: true },
    { id: 18, category: "電気・消防", name: "自動火災報知設備更新", cycle: 15, last: 2011, next: 2026, cost: "650万円", aiSuggested: false },
    { id: 19, category: "外壁・塗装", name: "シーリング打替", cycle: 12, last: 2016, next: 2028, cost: "1,100万円", aiSuggested: false },
    { id: 20, category: "共通・外構", name: "インターロック舗装", cycle: 20, last: 2010, next: 2030, cost: "280万円", aiSuggested: false },
  ];

  return (
    <div className="space-y-6">
      <nav className="text-sm text-gray-500">
        <Link href={`/condominiums/${condominiumId}`} className="hover:text-gray-700">マンション詳細</Link>
        <span className="mx-2">{'>'}</span>
        <Link href={`/longterm/dashboard?condominiumId=${condominiumId}`} className="hover:text-gray-700">長期修繕計画</Link>
        <span className="mx-2">{'>'}</span>
        <span>修繕項目一覧</span>
      </nav>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">修繕項目一覧</h1>
        <SubNav items={[
          { label: "修繕計画ダッシュボード", path: `/longterm/dashboard?condominiumId=${condominiumId}`, icon: LayoutDashboard },
          { label: "修繕項目一覧", path: `/longterm/items?condominiumId=${condominiumId}`, icon: List },
          { label: "修繕履歴", path: `/longterm/history?condominiumId=${condominiumId}`, icon: History },
          { label: "積立金シミュレーション", path: `/longterm/simulation?condominiumId=${condominiumId}`, icon: TrendingUp },
          { label: "AI見直し分析", path: `/longterm/analysis?condominiumId=${condominiumId}`, icon: BarChart },
        ]} />
      </div>

      <div className="flex gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={16} />
          <Input type="text" placeholder="項目名で検索..." className="pl-10 w-64" />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="工事区分" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべての区分</SelectItem>
            <SelectItem value="ext">共通・外構</SelectItem>
            <SelectItem value="roof">屋上・防水</SelectItem>
            <SelectItem value="wall">外壁・塗装</SelectItem>
            <SelectItem value="water">給排水設備</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="default" className="bg-orange-600 hover:bg-orange-700">新規項目追加</Button>
      </div>

      <Card className="bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50 text-left">
                  <th className="py-3 px-4 text-sm font-medium text-gray-500">工事区分</th>
                  <th className="py-3 px-4 text-sm font-medium text-gray-500">工事項目</th>
                  <th className="py-3 px-4 text-sm font-medium text-gray-500 text-center">周期(年)</th>
                  <th className="py-3 px-4 text-sm font-medium text-gray-500 text-center">前回</th>
                  <th className="py-3 px-4 text-sm font-medium text-gray-500 text-center">次回予定</th>
                  <th className="py-3 px-4 text-sm font-medium text-gray-500 text-right">概算費用</th>
                  <th className="py-3 px-4 text-sm font-medium text-gray-500">AI提案</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">{item.category}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 font-medium">{item.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-700 text-center">{item.cycle}</td>
                    <td className="py-3 px-4 text-sm text-gray-500 text-center">{item.last}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 font-semibold text-center">{item.next}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right font-medium">{item.cost}</td>
                    <td className="py-3 px-4">
                      {item.aiSuggested && (
                        <Badge className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200 cursor-default">
                          <Sparkles className="w-3 h-3 mr-1" />
                          見直し推奨
                        </Badge>
                      )}
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
