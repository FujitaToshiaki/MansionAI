import { useSearch } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, Star, MessageSquare } from "lucide-react";
import { Link } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const MOCK_HISTORY = [
  {
    id: "1",
    date: "2025/03/10 14:20",
    category: "法令解釈",
    summary: "2025年改正区分所有法における「多数決」の要件緩和について",
    rating: 5,
  },
  {
    id: "2",
    date: "2025/03/05 10:15",
    category: "クレーム",
    summary: "ベランダでの喫煙に関するトラブル対応と掲示物案の作成",
    rating: 4,
  },
  {
    id: "3",
    date: "2025/02/28 16:45",
    category: "運用判断",
    summary: "理事会のオンライン開催を導入するための規約改訂手順",
    rating: 5,
  },
  {
    id: "4",
    date: "2025/02/15 09:30",
    category: "その他",
    summary: "管理費等の滞納者に対する督促状の送付スケジュール",
    rating: 3,
  },
  {
    id: "5",
    date: "2025/02/01 11:00",
    category: "法令解釈",
    summary: "大規模修繕工事における専有部分への立ち入り権限の確認",
    rating: 4,
  },
];

export default function ConsultationHistory() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const condominiumId = params.get("condominiumId") ?? "";

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500">
        <Link href={`/condominiums/${condominiumId}`} className="hover:text-gray-700">マンション詳細</Link>
        <span className="mx-2">{'>'}</span>
        <span>相談履歴</span>
      </nav>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center">
          <History className="mr-2 h-6 w-6 text-orange-500" />
          相談履歴
        </h1>
        <Link href={`/consultation/chat?condominiumId=${condominiumId}`}>
          <Button className="bg-orange-500 hover:bg-orange-600">
            <MessageSquare className="mr-2 h-4 w-4" />
            新規相談を開始
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">今月の相談件数</p>
              <p className="text-3xl font-bold text-gray-900">5件</p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">評価平均</p>
              <div className="flex items-center gap-1">
                <p className="text-3xl font-bold text-gray-900">4.2</p>
                <div className="flex text-yellow-400">
                  <Star className="h-5 w-5 fill-current" />
                </div>
              </div>
            </div>
            <div className="h-12 w-12 bg-yellow-50 rounded-full flex items-center justify-center">
              <Star className="h-6 w-6 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History Table */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>過去の相談一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">日時</TableHead>
                <TableHead className="w-[100px]">カテゴリ</TableHead>
                <TableHead>概要</TableHead>
                <TableHead className="w-[120px]">評価</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_HISTORY.map((item) => (
                <TableRow key={item.id} className="cursor-pointer hover:bg-gray-50">
                  <TableCell className="text-sm text-gray-600">{item.date}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-normal">
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm font-medium text-gray-900">
                    {item.summary.length > 30 ? `${item.summary.substring(0, 30)}...` : item.summary}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < item.rating ? "text-yellow-400 fill-current" : "text-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                          詳細
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{item.summary}</DialogTitle>
                          <DialogDescription>相談日: {item.date} | カテゴリ: {item.category}</DialogDescription>
                        </DialogHeader>
                        <div className="mt-4 space-y-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="text-sm font-bold mb-2">ユーザーの相談内容</h4>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {item.summary}に関する具体的な質問内容と背景情報がここに表示されます。
                            </p>
                          </div>
                          <div className="bg-white border-l-4 border-orange-500 p-4 shadow-sm">
                            <h4 className="text-sm font-bold text-orange-800 mb-2">AIの回答</h4>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              相談内容に基づいたAIによるアドバイスや法的根拠の提示、推奨されるアクションプランがここに表示されます。
                            </p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
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
