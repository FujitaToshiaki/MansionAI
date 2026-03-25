import { useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { 
  ChevronRight, 
  TrendingUp, 
  ArrowUpRight,
  AlertTriangle,
  Lightbulb,
  CheckSquare,
  ClipboardCheck,
  BarChart2,
  History
} from "lucide-react";
import { SubNav } from "@/components/SubNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

const SCORE_DATA = [
  { category: "収支・会計", current: 32, max: 40 },
  { category: "運営体制", current: 15, max: 20 },
  { category: "建築・維持", current: 12, max: 20 },
  { category: "耐震性", current: 8, max: 10 },
  { category: "生活・防犯", current: 5, max: 10 },
];

const IMPROVEMENTS = [
  { id: 1, title: "長期修繕計画の見直し", priority: "高", score: 5, category: "建築・維持", action: "長期修繕計画シミュレーションへ", link: "/longterm/simulation" },
  { id: 2, title: "WEB議事録公開の導入", priority: "中", score: 3, category: "運営体制", action: "議事録管理へ", link: "/minutes/list" },
  { id: 3, title: "滞納督促ルールの明確化", priority: "高", score: 4, category: "収支・会計", action: "規約分析を確認", link: "/condominiums/:id/analysis" },
  { id: 4, title: "防犯カメラの増設検討", priority: "低", score: 2, category: "生活・防犯", action: "相談チャットで聞く", link: "/consultation/chat" },
];

export default function EvaluationScore() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const condominiumId = params.get("condominiumId") ?? "";
  
  const [selectedSimulations, setSelectedSimulations] = useState<number[]>([]);

  const { data: condominium } = useQuery<any>({
    queryKey: ['/api/condominiums', condominiumId],
    enabled: !!condominiumId,
  });

  const baseScore = 72;
  const simulatedScore = baseScore + IMPROVEMENTS
    .filter(imp => selectedSimulations.includes(imp.id))
    .reduce((sum, imp) => sum + imp.score, 0);

  const toggleSimulation = (id: number) => {
    setSelectedSimulations(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-gray-500 mb-6">
        <Link href={`/condominiums/${condominiumId}`} className="hover:text-gray-700">
          {condominium?.name ?? "マンション詳細"}
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <Link href={`/evaluation/check?condominiumId=${condominiumId}`} className="hover:text-gray-700">
          セルフチェック
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-gray-900 font-medium">スコア詳細・改善提案</span>
      </nav>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">管理適正評価</h1>
        <SubNav items={[
          { label: "セルフチェック実施", path: `/evaluation/check?condominiumId=${condominiumId}`, icon: ClipboardCheck },
          { label: "スコア詳細・改善提案", path: `/evaluation/score?condominiumId=${condominiumId}`, icon: BarChart2 },
          { label: "評価履歴・推移", path: `/evaluation/history?condominiumId=${condominiumId}`, icon: History },
        ]} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Chart Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-orange-600" />
              カテゴリ別スコア分析
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SCORE_DATA} layout="vertical" margin={{ left: 40, right: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" domain={[0, 40]} hide />
                  <YAxis 
                    dataKey="category" 
                    type="category" 
                    width={100} 
                    tick={{ fontSize: 12 }}
                  />
                  <RechartsTooltip 
                    cursor={{ fill: 'transparent' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-2 border rounded shadow-sm text-xs">
                            <p className="font-bold">{data.category}</p>
                            <p>得点: {data.current} / {data.max}</p>
                            <p className="text-gray-500">充足率: {Math.round(data.current/data.max*100)}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="current" radius={[0, 4, 4, 0]} barSize={32}>
                    {SCORE_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.current / entry.max > 0.7 ? "#ea580c" : "#f97316"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-bold">AI分析アドバイス</p>
                <p>「建築・維持」カテゴリのスコアが平均を下回っています。長期修繕計画の更新期限が近づいていることが主な要因です。計画を見直すことで合計スコアを最大5点向上させることが可能です。</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Score Simulation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What-If シミュレーション</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">想定スコア</div>
              <div className="text-6xl font-bold text-orange-600">{simulatedScore}</div>
              <div className="flex items-center justify-center gap-1 mt-2 text-green-600 font-medium">
                {simulatedScore > baseScore && (
                  <>
                    <ArrowUpRight className="w-4 h-4" />
                    <span>+{simulatedScore - baseScore}点アップ</span>
                  </>
                )}
                {simulatedScore === baseScore && <span className="text-gray-400">改善項目を選択してください</span>}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <CheckSquare className="w-4 h-4" />
                改善施策のシミュレート
              </h4>
              <div className="space-y-3">
                {IMPROVEMENTS.map((imp) => (
                  <div key={imp.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-md transition-colors border border-transparent hover:border-gray-100">
                    <Checkbox 
                      id={`imp-${imp.id}`} 
                      checked={selectedSimulations.includes(imp.id)}
                      onCheckedChange={() => toggleSimulation(imp.id)}
                      data-testid={`checkbox-imp-${imp.id}`}
                    />
                    <div className="flex-1 space-y-1">
                      <label htmlFor={`imp-${imp.id}`} className="text-sm font-medium leading-none cursor-pointer">
                        {imp.title}
                      </label>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] py-0 h-4 border-orange-200 text-orange-700">+{imp.score}点</Badge>
                        <span className="text-[10px] text-gray-400">{imp.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link href={`/evaluation/history?condominiumId=${condominiumId}`}>
              <Button variant="outline" className="w-full" data-testid="button-view-history">
                過去の評価履歴を確認
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Improvement Strategy Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
            改善優先項目一覧
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">優先度</TableHead>
                <TableHead>改善項目</TableHead>
                <TableHead className="w-[100px]">効果点</TableHead>
                <TableHead className="w-[150px]">カテゴリ</TableHead>
                <TableHead className="text-right">対応アクション</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {IMPROVEMENTS.map((imp) => (
                <TableRow key={imp.id} data-testid={`row-improvement-${imp.id}`}>
                  <TableCell>
                    <Badge variant={imp.priority === "高" ? "destructive" : imp.priority === "中" ? "secondary" : "outline"}>
                      {imp.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{imp.title}</TableCell>
                  <TableCell>
                    <span className="text-orange-600 font-bold">+{imp.score}</span>
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm">{imp.category}</TableCell>
                  <TableCell className="text-right">
                    <Link href={imp.link.replace(":id", condominiumId)}>
                      <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                        {imp.action}
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
