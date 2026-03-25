import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { AlertTriangle, MessageSquare, Clock, CheckCircle2, Plus, Bot, Filter } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Issue {
  id: number;
  receivedDate: string;
  category: "クレーム" | "設備不具合" | "規約確認" | "その他";
  summary: string;
  requester: string;
  status: "未対応" | "対応中" | "完了";
  assignee: string;
  urgency: "緊急" | "通常";
  detail: string;
}

const MOCK_ISSUES: Issue[] = [
  {
    id: 1,
    receivedDate: "2026-03-20",
    category: "クレーム",
    summary: "上階からの騒音について",
    requester: "住民A（匿名）",
    status: "未対応",
    assignee: "田中 一郎",
    urgency: "緊急",
    detail: "夜間22時以降に上階からドンドンという音がして眠れない状況です。管理組合として対応をお願いします。",
  },
  {
    id: 2,
    receivedDate: "2026-03-19",
    category: "設備不具合",
    summary: "エレベーターの異音が発生している",
    requester: "住民B（匿名）",
    status: "対応中",
    assignee: "鈴木 花子",
    urgency: "緊急",
    detail: "1号エレベーター利用時にギーという異音が聞こえます。安全面が心配です。",
  },
  {
    id: 3,
    receivedDate: "2026-03-18",
    category: "規約確認",
    summary: "ペット飼育の規約についての確認",
    requester: "住民C（匿名）",
    status: "対応中",
    assignee: "佐藤 次郎",
    urgency: "通常",
    detail: "小型犬を飼育したいのですが、管理規約上の条件を教えていただけますか。",
  },
  {
    id: 4,
    receivedDate: "2026-03-15",
    category: "クレーム",
    summary: "駐輪場への不正駐輪が増えている",
    requester: "住民D（匿名）",
    status: "完了",
    assignee: "田中 一郎",
    urgency: "通常",
    detail: "登録外の自転車が常時駐輪されており、登録者が止められない状況です。",
  },
  {
    id: 5,
    receivedDate: "2026-03-14",
    category: "設備不具合",
    summary: "共用廊下の照明が切れている",
    requester: "住民E（匿名）",
    status: "完了",
    assignee: "鈴木 花子",
    urgency: "通常",
    detail: "3階共用廊下の突き当たりの照明が切れており、夜間は暗くて危険です。",
  },
  {
    id: 6,
    receivedDate: "2026-03-12",
    category: "その他",
    summary: "ゴミ置き場の利用マナーについて",
    requester: "住民F（匿名）",
    status: "未対応",
    assignee: "佐藤 次郎",
    urgency: "通常",
    detail: "分別がされていないゴミが頻繁に出されています。注意喚起をお願いしたいです。",
  },
  {
    id: 7,
    receivedDate: "2026-03-10",
    category: "設備不具合",
    summary: "オートロックの鍵が反応しにくい",
    requester: "住民G（匿名）",
    status: "対応中",
    assignee: "田中 一郎",
    urgency: "緊急",
    detail: "エントランスのオートロックにカードキーをかざしても反応しないことがあります。",
  },
  {
    id: 8,
    receivedDate: "2026-03-08",
    category: "規約確認",
    summary: "民泊利用の可否についての問い合わせ",
    requester: "住民H（匿名）",
    status: "完了",
    assignee: "鈴木 花子",
    urgency: "通常",
    detail: "所有する部屋を短期賃貸（民泊）として利用することは管理規約上認められますか。",
  },
  {
    id: 9,
    receivedDate: "2026-03-05",
    category: "クレーム",
    summary: "タバコの煙が室内に入ってくる",
    requester: "住民I（匿名）",
    status: "未対応",
    assignee: "佐藤 次郎",
    urgency: "緊急",
    detail: "隣室と思われるタバコの煙が換気口から入り込み、非常に困っています。",
  },
  {
    id: 10,
    receivedDate: "2026-03-01",
    category: "その他",
    summary: "掲示板への貼り紙許可について",
    requester: "住民J（匿名）",
    status: "完了",
    assignee: "田中 一郎",
    urgency: "通常",
    detail: "住民間のコミュニティ活動の告知を掲示板に貼ることはできますか。手続きを教えてください。",
  },
];

const CATEGORIES = ["クレーム", "設備不具合", "規約確認", "その他"] as const;
const STATUSES = ["未対応", "対応中", "完了"] as const;
const URGENCIES = ["緊急", "通常"] as const;

function getStatusBadge(status: Issue["status"]) {
  switch (status) {
    case "未対応":
      return (
        <Badge className="bg-red-100 text-red-800 border-red-300 border" data-testid={`badge-status-未対応`}>
          未対応
        </Badge>
      );
    case "対応中":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 border" data-testid={`badge-status-対応中`}>
          対応中
        </Badge>
      );
    case "完了":
      return (
        <Badge className="bg-green-100 text-green-800 border-green-300 border" data-testid={`badge-status-完了`}>
          完了
        </Badge>
      );
  }
}

function getUrgencyBadge(urgency: Issue["urgency"]) {
  switch (urgency) {
    case "緊急":
      return (
        <Badge className="bg-red-100 text-red-800 border-red-300 border" data-testid={`badge-urgency-緊急`}>
          <AlertTriangle className="w-3 h-3 mr-1" />
          緊急
        </Badge>
      );
    case "通常":
      return (
        <Badge className="bg-gray-100 text-gray-700 border-gray-300 border" data-testid={`badge-urgency-通常`}>
          通常
        </Badge>
      );
  }
}

export default function IssueManagement() {
  const { id } = useParams();
  const { toast } = useToast();

  const { data: condominium } = useQuery<any>({
    queryKey: ["/api/condominiums", id],
  });

  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [newIssueOpen, setNewIssueOpen] = useState(false);

  const [newCategory, setNewCategory] = useState<string>("");
  const [newContent, setNewContent] = useState("");
  const [newUrgency, setNewUrgency] = useState<string>("");

  const [issues, setIssues] = useState<Issue[]>(MOCK_ISSUES);

  const filteredIssues = issues.filter((issue) => {
    const categoryMatch = filterCategory === "all" || issue.category === filterCategory;
    const statusMatch = filterStatus === "all" || issue.status === filterStatus;
    return categoryMatch && statusMatch;
  });

  const unresolved = issues.filter((i) => i.status === "未対応").length;
  const inProgress = issues.filter((i) => i.status === "対応中").length;
  const thisMonth = issues.filter((i) => i.receivedDate.startsWith("2026-03")).length;

  function handleRowClick(issue: Issue) {
    setSelectedIssue(issue);
    setDetailOpen(true);
  }

  function handleNewIssueSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newCategory || !newContent || !newUrgency) {
      toast({ title: "入力エラー", description: "すべての項目を入力してください。", variant: "destructive" });
      return;
    }
    const nextId = Math.max(...issues.map((i) => i.id)) + 1;
    const newIssue: Issue = {
      id: nextId,
      receivedDate: new Date().toISOString().slice(0, 10),
      category: newCategory as Issue["category"],
      summary: newContent.slice(0, 30) + (newContent.length > 30 ? "…" : ""),
      requester: "住民（匿名）",
      status: "未対応",
      assignee: "未割当",
      urgency: newUrgency as Issue["urgency"],
      detail: newContent,
    };
    setIssues((prev) => [newIssue, ...prev]);
    setNewIssueOpen(false);
    setNewCategory("");
    setNewContent("");
    setNewUrgency("");
    toast({ title: "登録完了", description: "問合せを新規登録しました。" });
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500">
        <Link href="/condominiums" className="hover:text-gray-700">
          マンション一覧
        </Link>
        <span className="mx-2">{">"}</span>
        <Link href={`/condominiums/${id}`} className="hover:text-gray-700">
          {condominium?.name ?? "物件"}
        </Link>
        <span className="mx-2">{">"}</span>
        <span className="text-gray-700">問合せ管理</span>
      </nav>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <MessageSquare className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">問合せ管理</h1>
            <p className="text-sm text-gray-500">{condominium?.name ?? ""}</p>
          </div>
        </div>
        <Dialog open={newIssueOpen} onOpenChange={setNewIssueOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white"
              data-testid="button-new-issue"
            >
              <Plus className="w-4 h-4 mr-2" />
              新規登録
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>問合せ新規登録</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleNewIssueSubmit} className="space-y-4 mt-2">
              <div className="space-y-1">
                <Label htmlFor="new-category">カテゴリ</Label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger id="new-category" data-testid="select-new-category">
                    <SelectValue placeholder="カテゴリを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="new-content">内容</Label>
                <Textarea
                  id="new-content"
                  placeholder="問合せの内容を入力してください"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={4}
                  data-testid="textarea-new-content"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="new-urgency">緊急度</Label>
                <Select value={newUrgency} onValueChange={setNewUrgency}>
                  <SelectTrigger id="new-urgency" data-testid="select-new-urgency">
                    <SelectValue placeholder="緊急度を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {URGENCIES.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setNewIssueOpen(false)}
                  data-testid="button-cancel-new-issue"
                >
                  キャンセル
                </Button>
                <Button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                  data-testid="button-submit-new-issue"
                >
                  登録
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-md bg-red-500 text-white">
          <CardContent className="pt-6 pb-5">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/80 font-medium">未対応件数</p>
                <p className="text-4xl font-bold text-white leading-tight" data-testid="text-count-unresolved">
                  {unresolved}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-yellow-500 text-white">
          <CardContent className="pt-6 pb-5">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/80 font-medium">対応中</p>
                <p className="text-4xl font-bold text-white leading-tight" data-testid="text-count-inprogress">
                  {inProgress}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-orange-500 text-white">
          <CardContent className="pt-6 pb-5">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/80 font-medium">今月受付件数</p>
                <p className="text-4xl font-bold text-white leading-tight" data-testid="text-count-thismonth">
                  {thisMonth}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter + Table */}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">問合せ一覧</CardTitle>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500 mr-1">絞込み：</span>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-36 h-8 text-sm" data-testid="select-filter-category">
                  <SelectValue placeholder="カテゴリ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全カテゴリ</SelectItem>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32 h-8 text-sm" data-testid="select-filter-status">
                  <SelectValue placeholder="ステータス" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全ステータス</SelectItem>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-orange-50 border-b border-orange-100 hover:bg-orange-50">
                <TableHead className="pl-6 py-3 text-xs font-semibold text-orange-700 uppercase tracking-wide">受付日</TableHead>
                <TableHead className="py-3 text-xs font-semibold text-orange-700 uppercase tracking-wide">カテゴリ</TableHead>
                <TableHead className="py-3 text-xs font-semibold text-orange-700 uppercase tracking-wide">問合せ概要</TableHead>
                <TableHead className="py-3 text-xs font-semibold text-orange-700 uppercase tracking-wide">問合せ者</TableHead>
                <TableHead className="py-3 text-xs font-semibold text-orange-700 uppercase tracking-wide">ステータス</TableHead>
                <TableHead className="py-3 text-xs font-semibold text-orange-700 uppercase tracking-wide">緊急度</TableHead>
                <TableHead className="pr-6 py-3 text-xs font-semibold text-orange-700 uppercase tracking-wide">担当者</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white">
              {filteredIssues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-gray-400">
                    該当する問合せがありません
                  </TableCell>
                </TableRow>
              ) : (
                filteredIssues.map((issue) => (
                  <TableRow
                    key={issue.id}
                    className="cursor-pointer hover:bg-orange-50 transition-colors border-b border-gray-100 last:border-0"
                    onClick={() => handleRowClick(issue)}
                    data-testid={`row-issue-${issue.id}`}
                  >
                    <TableCell className="pl-6 py-3.5 text-sm text-gray-600 font-medium">{issue.receivedDate}</TableCell>
                    <TableCell className="py-3.5">
                      <Badge variant="outline" className="text-xs font-medium border-gray-300 text-gray-600" data-testid={`badge-category-${issue.id}`}>
                        {issue.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs py-3.5">
                      <span className="text-sm text-gray-800 font-medium line-clamp-1" data-testid={`text-summary-${issue.id}`}>
                        {issue.summary}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 text-sm text-gray-500" data-testid={`text-requester-${issue.id}`}>
                      {issue.requester}
                    </TableCell>
                    <TableCell className="py-3.5">{getStatusBadge(issue.status)}</TableCell>
                    <TableCell className="py-3.5">{getUrgencyBadge(issue.urgency)}</TableCell>
                    <TableCell className="pr-6 py-3.5 text-sm text-gray-600" data-testid={`text-assignee-${issue.id}`}>
                      {issue.assignee}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Issue Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          {selectedIssue && (
            <>
              <DialogHeader className="pb-2">
                <DialogTitle className="flex items-center gap-2 text-gray-900">
                  <MessageSquare className="w-5 h-5 text-orange-500" />
                  問合せ詳細
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-5 mt-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="border-gray-300 text-gray-600 font-medium">{selectedIssue.category}</Badge>
                  {getStatusBadge(selectedIssue.status)}
                  {getUrgencyBadge(selectedIssue.urgency)}
                </div>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">受付日</p>
                    <p className="text-sm text-gray-800 font-semibold">{selectedIssue.receivedDate}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">担当者</p>
                    <p className="text-sm text-gray-800 font-semibold">{selectedIssue.assignee}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">問合せ者</p>
                    <p className="text-sm text-gray-800 font-semibold">{selectedIssue.requester}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">概要</p>
                  <p className="text-sm text-gray-900 font-semibold">{selectedIssue.summary}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">詳細内容</p>
                  <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-4 border border-gray-100">
                    {selectedIssue.detail}
                  </p>
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <Link
                    href="/consultation/chat"
                    className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 text-sm font-medium transition-colors"
                    data-testid="link-consultation-chat"
                  >
                    <Bot className="w-4 h-4" />
                    相談チャットボットで対応案を生成 →
                  </Link>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
