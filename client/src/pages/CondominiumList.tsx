import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, Clock, AlertTriangle, Search, Plus, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function CondominiumList() {
  const { toast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const { data: condominiums, isLoading } = useQuery({
    queryKey: ['/api/condominiums'],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/condominiums/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/condominiums'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({ title: "削除完了", description: "マンションを削除しました。" });
      setDeleteTarget(null);
    },
    onError: () => {
      toast({ title: "エラー", description: "削除に失敗しました。", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">マンション管理</h1>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="mr-2" size={16} />
          新規登録
        </Button>
      </div>

      <Card className="bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>マンション一覧</CardTitle>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={16} />
              <Input type="text" placeholder="検索..." className="bg-gray-100 border-0 pl-10 w-64" />
            </div>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="法改正対応状況" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="completed">完了</SelectItem>
                <SelectItem value="in_progress">進行中</SelectItem>
                <SelectItem value="pending">未着手</SelectItem>
                <SelectItem value="not_required">対応不要</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="管理開始年" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="2023">2023年</SelectItem>
                <SelectItem value="2022">2022年</SelectItem>
                <SelectItem value="2021">2021年</SelectItem>
                <SelectItem value="2020">2020年</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>マンション名</TableHead>
                <TableHead>所在地</TableHead>
                <TableHead>戸数</TableHead>
                <TableHead>管理開始日</TableHead>
                <TableHead>法改正対応</TableHead>
                <TableHead>担当者</TableHead>
                <TableHead>最終活動日</TableHead>
                <TableHead>アクション</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {condominiums?.map((condo: any) => (
                <TableRow key={condo.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center">
                      <img 
                        src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&w=40&h=40&fit=crop" 
                        alt={condo.name} 
                        className="w-10 h-10 rounded-lg mr-3"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{condo.name}</div>
                        <div className="text-sm text-gray-500">築{new Date().getFullYear() - condo.buildYear}年</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">{condo.address}</TableCell>
                  <TableCell className="text-sm text-gray-500">{condo.units}戸</TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(condo.managementStartDate).toLocaleDateString('ja-JP')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      condo.lawRevisionStatus === 'completed' ? 'default' :
                      condo.lawRevisionStatus === 'in_progress' ? 'secondary' :
                      condo.lawRevisionStatus === 'pending' ? 'destructive' : 'outline'
                    }>
                      {condo.lawRevisionStatus === 'completed' && <CheckCircle className="mr-1" size={12} />}
                      {condo.lawRevisionStatus === 'in_progress' && <Clock className="mr-1" size={12} />}
                      {condo.lawRevisionStatus === 'pending' && <AlertTriangle className="mr-1" size={12} />}
                      {condo.lawRevisionStatus === 'completed' ? '完了' :
                       condo.lawRevisionStatus === 'in_progress' ? '進行中' :
                       condo.lawRevisionStatus === 'pending' ? '未着手' : '対応不要'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">{condo.assignedManager || '未設定'}</TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {condo.lastActivity ? new Date(condo.lastActivity).toLocaleDateString('ja-JP') : '未記録'}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Link href={`/condominiums/${condo.id}`}>
                        <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-900">
                          詳細
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-900">
                        編集
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-900"
                        onClick={() => setDeleteTarget({ id: condo.id, name: condo.name })}
                      >
                        <Trash2 size={14} className="mr-1" />
                        削除
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )) || (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    マンションデータがありません
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>マンションの削除</DialogTitle>
            <DialogDescription>
              「{deleteTarget?.name}」を削除します。この操作は取り消せません。本当に削除しますか？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "削除中..." : "削除する"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
