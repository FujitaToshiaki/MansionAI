import { useSearch } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  Wrench,
  TrendingUp,
  History,
  List,
  BarChart,
  AlertTriangle,
  LayoutDashboard,
  Building2,
  PiggyBank,
  CalendarCheck,
} from "lucide-react";
import { SubNav } from "@/components/SubNav";

export default function LongtermDashboard() {
  const params = new URLSearchParams(useSearch());
  const condominiumId = params.get("condominiumId") ?? "1";

  const summaryCards = [
    {
      title: "計画総額",
      value: "3.6億円",
      description: "30年間合計",
      icon: Building2,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      valueColor: "text-blue-700",
      borderColor: "border-blue-100",
    },
    {
      title: "積立金残高",
      value: "9,600万円",
      description: "2024年度末見込",
      icon: PiggyBank,
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
      valueColor: "text-emerald-700",
      borderColor: "border-emerald-100",
    },
    {
      title: "月額積立金",
      value: "12,000円",
      description: "1戸あたり平均",
      icon: CalendarCheck,
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
      valueColor: "text-amber-700",
      borderColor: "border-amber-100",
    },
    {
      title: "資金過不足",
      value: "▲1.2億円",
      description: "30年後の最終残高",
      icon: AlertTriangle,
      bgColor: "bg-red-50",
      iconColor: "text-red-500",
      valueColor: "text-red-600",
      borderColor: "border-red-100",
    },
  ];

  const GANTT_START = 2024;
  const GANTT_END = 2035;
  const timelineYears = Array.from({ length: GANTT_END - GANTT_START + 1 }, (_, i) => GANTT_START + i);

  const categoryColors = [
    { bg: "bg-violet-500", light: "bg-violet-100", text: "text-violet-700", border: "border-violet-300" },
    { bg: "bg-sky-500", light: "bg-sky-100", text: "text-sky-700", border: "border-sky-300" },
    { bg: "bg-orange-500", light: "bg-orange-100", text: "text-orange-700", border: "border-orange-300" },
    { bg: "bg-teal-500", light: "bg-teal-100", text: "text-teal-700", border: "border-teal-300" },
    { bg: "bg-rose-500", light: "bg-rose-100", text: "text-rose-700", border: "border-rose-300" },
    { bg: "bg-amber-500", light: "bg-amber-100", text: "text-amber-700", border: "border-amber-300" },
  ];

  const schedule = [
    { category: "共通・外構", years: [2028, 2040] },
    { category: "屋上・防水", years: [2025, 2037] },
    { category: "外壁・塗装", years: [2028, 2040] },
    { category: "給排水設備", years: [2030, 2031] },
    { category: "電気・消防", years: [2026, 2038] },
    { category: "エレベーター", years: [2035] },
  ];

  const currentYear = new Date().getFullYear();

  const recentItems = [
    { year: 2025, item: "屋上防水工事", cost: "1,200万円", status: "計画中", statusColor: "bg-blue-100 text-blue-700 border-blue-200" },
    { year: 2026, item: "消防設備更新", cost: "850万円", status: "計画中", statusColor: "bg-blue-100 text-blue-700 border-blue-200" },
    { year: 2028, item: "第2回大規模修繕工事", cost: "1.2億円", status: "検討前", statusColor: "bg-gray-100 text-gray-600 border-gray-200" },
  ];

  return (
    <div className="space-y-6">
      <nav className="text-sm text-gray-500 flex items-center gap-1">
        <Link href={`/condominiums/${condominiumId}`} className="hover:text-gray-700 hover:underline">
          マンション詳細
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-700 font-medium">長期修繕計画</span>
      </nav>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">長期修繕計画ダッシュボード</h1>
        <SubNav
          items={[
            { label: "修繕計画ダッシュボード", path: `/longterm/dashboard?condominiumId=${condominiumId}`, icon: LayoutDashboard },
            { label: "修繕項目一覧", path: `/longterm/items?condominiumId=${condominiumId}`, icon: List },
            { label: "修繕履歴", path: `/longterm/history?condominiumId=${condominiumId}`, icon: History },
            { label: "積立金シミュレーション", path: `/longterm/simulation?condominiumId=${condominiumId}`, icon: TrendingUp },
            { label: "AI見直し分析", path: `/longterm/analysis?condominiumId=${condominiumId}`, icon: BarChart },
          ]}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <Card
            key={i}
            data-testid={`card-summary-${i}`}
            className={`border ${card.borderColor} ${card.bgColor} shadow-sm hover:shadow-md transition-shadow`}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">{card.title}</p>
                  <p className={`text-2xl font-extrabold leading-tight ${card.valueColor}`}>{card.value}</p>
                  <p className="text-xs text-gray-400 mt-1.5">{card.description}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${card.bgColor} border ${card.borderColor} ml-3 shrink-0`}>
                  <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gantt Chart */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-lg font-bold">修繕タイムライン（ガントチャート）</CardTitle>
            <div className="flex items-center gap-3 flex-wrap">
              {schedule.map((row, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span className={`inline-block w-3 h-3 rounded-sm ${categoryColors[i % categoryColors.length].bg}`} />
                  {row.category}
                </div>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              {/* Year header */}
              <div className="grid gap-0 mb-1" style={{ gridTemplateColumns: `160px repeat(${timelineYears.length}, 1fr)` }}>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide pl-1 pb-2">工事区分</div>
                {timelineYears.map((year) => (
                  <div
                    key={year}
                    className={`text-center text-xs font-bold pb-2 ${year === currentYear ? "text-blue-600" : "text-gray-400"}`}
                  >
                    {year}
                  </div>
                ))}
              </div>

              {/* Grid rows */}
              <div className="rounded-xl overflow-hidden border border-gray-100">
                {schedule.map((row, rowIdx) => {
                  const color = categoryColors[rowIdx % categoryColors.length];
                  const isEven = rowIdx % 2 === 0;
                  return (
                    <div
                      key={rowIdx}
                      data-testid={`gantt-row-${rowIdx}`}
                      className={`grid items-center ${isEven ? "bg-white" : "bg-gray-50/70"} hover:bg-blue-50/40 transition-colors`}
                      style={{ gridTemplateColumns: `160px repeat(${timelineYears.length}, 1fr)` }}
                    >
                      <div className={`py-3 pl-3 pr-2 text-sm font-semibold ${color.text} truncate`}>
                        {row.category}
                      </div>
                      {timelineYears.map((year) => {
                        const isWork = row.years.includes(year);
                        const isStart = row.years[0] === year;
                        const isEnd = row.years[row.years.length - 1] === year && row.years.length > 1;
                        const isSingle = row.years.length === 1 && row.years[0] === year;

                        if (isWork) {
                          return (
                            <div key={year} className="py-2.5 px-0.5 relative h-full flex items-center">
                              <div
                                className={`
                                  h-7 w-full flex items-center justify-center
                                  ${color.bg} text-white text-[10px] font-bold
                                  ${isSingle ? "rounded-md" : isStart ? "rounded-l-md" : isEnd ? "rounded-r-md" : "rounded-none"}
                                  shadow-sm
                                `}
                              >
                                {isStart || isSingle ? <Wrench className="w-3 h-3" /> : null}
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={year}
                            className={`py-2.5 px-0.5 h-full flex items-center ${year === currentYear ? "border-l border-blue-200" : ""}`}
                          >
                            <div className="h-7 w-full" />
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {/* Today indicator label */}
              <p className="text-xs text-blue-500 mt-2 pl-[160px]">
                ▲ {currentYear}年（現在）
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Repair Schedule Table */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold">直近の修繕予定</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50 text-left">
                  <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">予定年</th>
                  <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">工事項目</th>
                  <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">概算費用</th>
                  <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">ステータス</th>
                </tr>
              </thead>
              <tbody>
                {recentItems.map((item, i) => (
                  <tr
                    key={i}
                    data-testid={`row-recent-${i}`}
                    className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3.5 px-5 text-sm text-gray-900 font-semibold">{item.year}年度</td>
                    <td className="py-3.5 px-5 text-sm text-gray-700">{item.item}</td>
                    <td className="py-3.5 px-5 text-sm text-gray-900 text-right font-bold">{item.cost}</td>
                    <td className="py-3.5 px-5">
                      <Badge
                        variant="outline"
                        className={`text-xs font-medium ${item.statusColor}`}
                      >
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
