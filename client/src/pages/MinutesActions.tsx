import { useState } from "react";
import { useSearch, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckSquare, FileText, Mic, Sparkles } from "lucide-react";
import { SubNav } from "@/components/SubNav";

const mockActions = [
  {
    id: "1",
    content: "駐車場空き区画の募集要項の作成・広報",
    assignee: "管理会社",
    deadline: "2025-03-31",
    status: "進行中",
    source: "第12回理事会",
  },
  {
    id: "2",
    content: "植栽剪定業者の手配",
    assignee: "理事長",
    deadline: "2025-04-10",
    status: "未着手",
    source: "第12回理事会",
  },
  {
    id: "3",
    content: "大規模修繕中間報告会の住民案内",
    assignee: "副理事長",
    deadline: "2025-04-05",
    status: "完了",
    source: "第11回理事会",
  },
  {
    id: "4",
    content: "消防設備点検の実施報告確認",
    assignee: "管理会社",
    deadline: "2025-03-25",
    status: "進行中",
    source: "第12回理事会",
  },
  {
    id: "5",
    content: "駐輪場ステッカー更新の通知",
    assignee: "管理会社",
    deadline: "2025-04-15",
    status: "未着手",
    source: "修繕委員会 第5回会合",
  },
];

export default function MinutesActions() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const condominiumId = params.get("condominiumId") ?? "";

  const { data: condominium } = useQuery<any>({
    queryKey: ["/api/condominiums", condominiumId],
    enabled: !!condominiumId,
  });

  const [actions, setActions] = useState(mockActions);

  const toggleStatus = (id: string) => {
    setActions(
      actions.map((action) =>
        action.id === id
          ? {
              ...action,
              status: action.status === "完了" ? "進行中" : "完了",
            }
          : action
      )
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "完了":
        return <Badge className="bg-green-100 text-green-700 border-green-200">完了</Badge>;
      case "進行中":
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">進行中</Badge>;
      case "未着手":
        return <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200">未着手</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <nav className="text-sm text-gray-500">
        <Link href={`/condominiums/${condominiumId}`} className="hover:text-gray-700">
          {condominium?.name ?? "マンション詳細"}
        </Link>
        <span className="mx-2">{">"}</span>
        <Link href={`/minutes/list?condominiumId=${condominiumId}`} className="hover:text-gray-700">
          議事録管理
        </Link>
        <span className="mx-2">{">"}</span>
        <span>決定事項管理</span>
      </nav>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CheckSquare className="w-8 h-8 text-orange-600" />
          <h1 className="text-2xl font-bold text-gray-900">決定事項管理</h1>
        </div>
        <SubNav items={[
          { label: "議事録一覧", path: `/minutes/list?condominiumId=${condominiumId}`, icon: FileText },
          { label: "音声・メモ取込", path: `/minutes/import?condominiumId=${condominiumId}`, icon: Mic },
          { label: "AI議事録生成", path: `/minutes/generate?condominiumId=${condominiumId}`, icon: Sparkles },
          { label: "決定事項管理", path: `/minutes/actions?condominiumId=${condominiumId}`, icon: CheckSquare },
        ]} />
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>アクションアイテム一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">完了</TableHead>
                <TableHead>内容</TableHead>
                <TableHead>担当者</TableHead>
                <TableHead>期限</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>発生元</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {actions.map((action) => (
                <TableRow key={action.id} className={action.status === "完了" ? "opacity-60" : ""}>
                  <TableCell>
                    <Checkbox 
                      checked={action.status === "完了"} 
                      onCheckedChange={() => toggleStatus(action.id)}
                      data-testid={`checkbox-action-${action.id}`}
                    />
                  </TableCell>
                  <TableCell className={`font-medium ${action.status === "完了" ? "line-through" : ""}`}>
                    {action.content}
                  </TableCell>
                  <TableCell>{action.assignee}</TableCell>
                  <TableCell>{action.deadline}</TableCell>
                  <TableCell>{getStatusBadge(action.status)}</TableCell>
                  <TableCell className="text-xs text-gray-500">{action.source}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
