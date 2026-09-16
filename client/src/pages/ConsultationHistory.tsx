import { useSearch } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, MessageSquare, AlertCircle } from "lucide-react";
import { SubNav } from "@/components/SubNav";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ConsultationLog {
  id: string;
  category: string;
  title: string;
  content: string;
  response: string | null;
  status: string;
  priority: string;
  consulted_at: string;
}

export default function ConsultationHistory() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const condominiumId = params.get("condominiumId") ?? "";
  const { data: history = [], isLoading, isError } = useQuery<ConsultationLog[]>({
    queryKey: [`/api/condominiums/${condominiumId}/consultation-logs`],
    enabled: Boolean(condominiumId),
  });
  const currentMonth = new Date().toISOString().slice(0, 7);
  const thisMonthCount = history.filter((item) => item.consulted_at?.slice(0, 7) === currentMonth).length;
  const openCount = history.filter((item) => item.status !== "resolved").length;
  const formatDate = (value: string) => new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500">
        <Link href={`/condominiums/${condominiumId}`} className="hover:text-gray-700">マンション詳細</Link>
        <span className="mx-2">{'>'}</span>
        <span className="text-gray-400">AIチャット</span>
        <span className="mx-2">{'>'}</span>
        <span>相談履歴</span>
      </nav>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center">
          <History className="mr-2 h-6 w-6 text-orange-500" />
          相談履歴
        </h1>
        <SubNav items={[
          { label: "チャット相談", path: `/consultation/chat?condominiumId=${condominiumId}`, icon: MessageSquare },
          { label: "相談履歴", path: `/consultation/history?condominiumId=${condominiumId}`, icon: History },
        ]} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">今月の相談件数</p>
              <p className="text-3xl font-bold text-gray-900">{thisMonthCount}件</p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">未対応・対応中</p>
              <p className="text-3xl font-bold text-gray-900">{openCount}件</p>
            </div>
            <div className="h-12 w-12 bg-yellow-50 rounded-full flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
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
                <TableHead className="w-[120px]">ステータス</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow><TableCell colSpan={5} className="py-8 text-center text-gray-500">読み込み中...</TableCell></TableRow>
              )}
              {isError && (
                <TableRow><TableCell colSpan={5} className="py-8 text-center text-red-600">相談履歴を読み込めませんでした</TableCell></TableRow>
              )}
              {!isLoading && !isError && history.length === 0 && (
                <TableRow><TableCell colSpan={5} className="py-8 text-center text-gray-500">相談履歴はありません</TableCell></TableRow>
              )}
              {history.map((item) => (
                <TableRow key={item.id} className="cursor-pointer hover:bg-gray-50">
                  <TableCell className="text-sm text-gray-600">{formatDate(item.consulted_at)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-normal">
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm font-medium text-gray-900">
                    {item.title.length > 30 ? `${item.title.substring(0, 30)}...` : item.title}
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.status === "resolved" ? "secondary" : "outline"}>
                      {item.status === "resolved" ? "解決済み" : item.status === "in_progress" ? "対応中" : "未対応"}
                    </Badge>
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
                          <DialogTitle>{item.title}</DialogTitle>
                          <DialogDescription>相談日: {formatDate(item.consulted_at)} | カテゴリ: {item.category}</DialogDescription>
                        </DialogHeader>
                        <div className="mt-4 space-y-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="text-sm font-bold mb-2">ユーザーの相談内容</h4>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {item.content}
                            </p>
                          </div>
                          <div className="bg-white border-l-4 border-orange-500 p-4 shadow-sm">
                            <h4 className="text-sm font-bold text-orange-800 mb-2">AIの回答</h4>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {item.response || "対応内容はまだ登録されていません。"}
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
