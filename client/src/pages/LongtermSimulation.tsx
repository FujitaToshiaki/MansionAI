import { useSearch } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { TrendingUp, Info } from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

export default function LongtermSimulation() {
  const params = new URLSearchParams(useSearch());
  const condominiumId = params.get("condominiumId") ?? "1";

  const data = [
    { year: '2024', current: 9600, level: 9600, stepwise: 9600 },
    { year: '2029', current: 11000, level: 12500, stepwise: 11500 },
    { year: '2034', current: 4500, level: 9500, stepwise: 7500 },
    { year: '2039', current: -2000, level: 8500, stepwise: 5000 },
    { year: '2044', current: -8500, level: 7500, stepwise: 2500 },
    { year: '2049', current: -12000, level: 6500, stepwise: -500 },
    { year: '2054', current: -15000, level: 5500, stepwise: -2000 },
  ];

  return (
    <div className="space-y-6">
      <nav className="text-sm text-gray-500">
        <Link href={`/condominiums/${condominiumId}`} className="hover:text-gray-700">マンション詳細</Link>
        <span className="mx-2">{'>'}</span>
        <Link href={`/longterm/dashboard?condominiumId=${condominiumId}`} className="hover:text-gray-700">長期修繕計画</Link>
        <span className="mx-2">{'>'}</span>
        <span>積立金シミュレーション</span>
      </nav>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">修繕積立金シミュレーション</h1>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg">30年間積立金残高推移予測</CardTitle>
          <p className="text-sm text-gray-500">現行方式では2039年頃に資金不足に陥る可能性があります</p>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" />
                <YAxis unit="万円" />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="current" 
                  name="現行方式（据置）" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="level" 
                  name="均等積立方式（推奨）" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="stepwise" 
                  name="段階増額方式" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-red-200 bg-red-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-red-700">現行方式</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">▲1.5億円</p>
            <p className="text-xs text-red-500 mt-1">30年後最終残高</p>
            <Badge className="mt-2 bg-red-100 text-red-700 border-red-200">資金不足リスク高</Badge>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-green-700">均等積立方式</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">+5,500万円</p>
            <p className="text-xs text-green-500 mt-1">30年後最終残高</p>
            <Badge className="mt-2 bg-green-100 text-green-700 border-green-200">健全・安定運用</Badge>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-blue-700">段階増額方式</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">▲2,000万円</p>
            <p className="text-xs text-blue-500 mt-1">30年後最終残高</p>
            <Badge className="mt-2 bg-blue-100 text-blue-700 border-blue-200">将来の負担増大</Badge>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg">5年ごとの推移予測（単位：万円）</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="py-3 px-4 text-sm font-medium text-gray-500">年度</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-500 text-right">現行方式</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-500 text-right">均等積立</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-500 text-right">段階増額</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900 font-medium">{row.year}年度</td>
                  <td className={`py-3 px-4 text-sm text-right font-medium ${row.current < 0 ? 'text-red-600' : 'text-gray-700'}`}>{row.current.toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm text-gray-700 text-right font-medium">{row.level.toLocaleString()}</td>
                  <td className={`py-3 px-4 text-sm text-right font-medium ${row.stepwise < 0 ? 'text-red-600' : 'text-gray-700'}`}>{row.stepwise.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
