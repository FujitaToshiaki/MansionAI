import { useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer
} from "recharts";
import { 
  ChevronRight, 
  History,
  FileText,
  Star
} from "lucide-react";
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

const HISTORY_DATA = [
  { date: "2024/03/15", total: 68, finance: 28, organization: 14, building: 12, earthquake: 8, living: 6, stars: 3 },
  { date: "2024/09/20", total: 70, finance: 30, organization: 15, building: 12, earthquake: 8, living: 5, stars: 4 },
  { date: "2025/03/10", total: 72, finance: 32, organization: 15, building: 12, earthquake: 8, living: 5, stars: 4 },
];

const TREND_DATA = HISTORY_DATA.map(d => ({
  name: d.date.split('/')[1] + '月',
  score: d.total,
  fullDate: d.date
}));

export default function EvaluationHistory() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const condominiumId = params.get("condominiumId") ?? "";

  const { data: condominium } = useQuery<any>({
    queryKey: ['/api/condominiums', condominiumId],
    enabled: !!condominiumId,
  });

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
        <span className="text-gray-900 font-medium">評価履歴・推移</span>
      </nav>

      {/* Line Chart Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <History className="w-6 h-6 text-orange-600" />
            評価スコア推移
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TREND_DATA} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis domain={[60, 80]} />
                <RechartsTooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-2 border rounded shadow-sm text-xs">
                          <p className="font-bold">{payload[0].payload.fullDate}</p>
                          <p className="text-orange-600">総合スコア: {payload[0].value}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#ea580c" 
                  strokeWidth={3}
                  dot={{ r: 6, fill: "#ea580c", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">実施履歴一覧</CardTitle>
          <Link href={`/evaluation/check?condominiumId=${condominiumId}`}>
            <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
              新規チェック実施
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>実施日</TableHead>
                <TableHead>総合点</TableHead>
                <TableHead>ランク</TableHead>
                <TableHead className="hidden md:table-cell text-center">収支</TableHead>
                <TableHead className="hidden md:table-cell text-center">運営</TableHead>
                <TableHead className="hidden md:table-cell text-center">維持</TableHead>
                <TableHead className="text-right">アクション</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...HISTORY_DATA].reverse().map((record, index) => (
                <TableRow key={index} data-testid={`row-history-${index}`}>
                  <TableCell className="font-medium">{record.date}</TableCell>
                  <TableCell>
                    <span className="text-lg font-bold text-orange-600">{record.total}</span>
                    <span className="text-xs text-gray-400 ml-1">/ 100</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < record.stars ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-center">
                    <span className="text-xs">{record.finance}/40</span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-center">
                    <span className="text-xs">{record.organization}/20</span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-center">
                    <span className="text-xs">{record.building}/20</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-orange-600">
                      <FileText className="w-4 h-4 mr-1" />
                      詳細
                    </Button>
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
