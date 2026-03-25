import { useState, useEffect } from "react";
import { useSearch, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Save, Download, ArrowLeft, Loader2, FileText, CheckCircle2, Sparkles, Search, X, Plus, Link2 } from "lucide-react";
import { SubNav } from "@/components/SubNav";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

// Normalise decision objects from either camelCase API or snake_case DB
function normalizeDecision(d: any) {
  return {
    id: d.id,
    title: d.title ?? d.agenda ?? d.decision ?? "",
    result: d.result ?? "",
    meetingDate: d.meetingDate ?? d.meeting_date ?? null,
    votingResults: d.votingResults ?? d.voting_results ?? null,
    category: d.category ?? "",
  };
}

function formatMeetingDate(v: string | null | undefined): string {
  if (!v) return "−";
  if (typeof v === "string" && v.includes("年")) return v;
  return new Date(v).toLocaleDateString("ja-JP");
}

function getResultLabel(result: string) {
  switch (result) {
    case "approved": return "可決";
    case "rejected": return "否決";
    case "deferred": return "継続";
    default: return result ?? "−";
  }
}

function getResultVariant(result: string): "default" | "destructive" | "secondary" | "outline" {
  switch (result) {
    case "approved": return "default";
    case "rejected": return "destructive";
    default: return "secondary";
  }
}

export default function ProposalsEdit() {
  const params = new URLSearchParams(useSearch());
  const proposalId = params.get("proposalId") ?? "";
  const condominiumId = params.get("condominiumId") ?? "";
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [isDownloading, setIsDownloading] = useState(false);
  const [background, setBackground] = useState("");
  const [content, setContent] = useState("");
  const [decisionSearch, setDecisionSearch] = useState("");

  // Staged changes: decisions to add/remove on save
  // pendingRelated: current committed+staged snapshot (what user sees)
  const [pendingRelated, setPendingRelated] = useState<any[]>([]);
  const [toAdd, setToAdd] = useState<any[]>([]); // normalized decisions pending add
  const [toRemove, setToRemove] = useState<Set<string>>(new Set()); // decision IDs pending remove

  const { data: proposal, isLoading: proposalLoading } = useQuery<any>({
    queryKey: ["/api/proposals", proposalId],
    queryFn: () => fetch(`/api/proposals/${proposalId}`).then(r => r.json()),
    enabled: !!proposalId,
  });

  const { data: savedRelated = [] } = useQuery<any[]>({
    queryKey: ["/api/proposals", proposalId, "related-decisions"],
    queryFn: () => fetch(`/api/proposals/${proposalId}/related-decisions`).then(r => r.json()),
    enabled: !!proposalId,
  });

  const { data: allDecisions = [] } = useQuery<any[]>({
    queryKey: ["/api/condominiums", condominiumId, "decisions"],
    queryFn: () => fetch(`/api/condominiums/${condominiumId}/decisions`).then(r => r.json()),
    enabled: !!condominiumId,
  });

  // Initialize form state from fetched data
  useEffect(() => {
    if (proposal) {
      setBackground(proposal.background ?? "");
      setContent(proposal.content ?? "");
    }
  }, [proposal]);

  // Initialize staged related from saved
  useEffect(() => {
    if (savedRelated.length > 0 || proposal) {
      setPendingRelated(savedRelated.map(normalizeDecision));
      setToAdd([]);
      setToRemove(new Set());
    }
  }, [savedRelated]);

  // Current visible list = pendingRelated (already incorporates staged changes via stageAdd/stageRemove)
  const visibleRelated = pendingRelated;
  const visibleRelatedIds = new Set(visibleRelated.map((d: any) => d.id));

  function stageAdd(raw: any) {
    const d = normalizeDecision(raw);
    if (visibleRelatedIds.has(d.id)) return;
    setPendingRelated(prev => [...prev, d]);
    setToAdd(prev => {
      // If it was staged for remove and user re-adds, cancel the remove
      if (toRemove.has(d.id)) {
        setToRemove(r => { const s = new Set(r); s.delete(d.id); return s; });
        return prev;
      }
      return [...prev.filter(x => x.id !== d.id), d];
    });
  }

  function stageRemove(decisionId: string) {
    setPendingRelated(prev => prev.filter(d => d.id !== decisionId));
    // If it was staged for add (not yet committed), just cancel the add
    if (toAdd.find(d => d.id === decisionId)) {
      setToAdd(prev => prev.filter(d => d.id !== decisionId));
    } else {
      setToRemove(prev => new Set([...prev, decisionId]));
    }
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      // 1. Save background + content
      await apiRequest("PATCH", `/api/proposals/${proposalId}`, { content, background });

      // 2. Commit staged add operations
      for (const d of toAdd) {
        await apiRequest("POST", `/api/proposals/${proposalId}/related-decisions`, {
          decisionId: d.id,
          title: d.title,
          meetingDate: d.meetingDate,
          result: d.result,
          category: d.category,
          votingResults: d.votingResults,
        });
      }

      // 3. Commit staged remove operations
      for (const id of toRemove) {
        await apiRequest("DELETE", `/api/proposals/${proposalId}/related-decisions/${id}`);
      }
    },
    onSuccess: () => {
      setToAdd([]);
      setToRemove(new Set());
      queryClient.invalidateQueries({ queryKey: ["/api/proposals", proposalId] });
      queryClient.invalidateQueries({ queryKey: ["/api/proposals", proposalId, "related-decisions"] });
      toast({ title: "保存完了", description: "議案の内容を保存しました。" });
    },
    onError: () => {
      toast({ title: "エラー", description: "保存に失敗しました", variant: "destructive" });
    },
  });

  const filteredDecisions = allDecisions.filter((d: any) => {
    if (visibleRelatedIds.has(d.id)) return false;
    if (!decisionSearch) return true;
    const q = decisionSearch.toLowerCase();
    const title = (d.title ?? d.agenda ?? d.decision ?? "").toLowerCase();
    const category = (d.category ?? "").toLowerCase();
    return title.includes(q) || category.includes(q);
  });

  const hasPendingChanges = toAdd.length > 0 || toRemove.size > 0;

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      toast({ title: "ダウンロード完了", description: "議案書のPDFを生成し、ダウンロードしました。" });
    }, 3000);
  };

  const mockQa = [
    { q: "なぜ今改訂が必要なのですか？", a: "法令改正に対応しないまま運用を続けると、将来的に法的なトラブルや、助成金の申請などで不利になる可能性があるためです。" },
    { q: "住民の負担は増えますか？", a: "規約の文言整理が主であり、管理費の増額などは本議案には含まれません。" },
  ];

  if (proposalLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const proposalTitle = proposal?.title ?? "議案詳細";

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <Link href={`/proposals/list?condominiumId=${condominiumId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" /> 戻る
            </Button>
          </Link>
          <h1 className="text-xl font-bold truncate max-w-md">{proposalTitle}</h1>
        </div>
        <div className="flex items-center space-x-3">
          <Select defaultValue={proposal?.status ?? "draft"}>
            <SelectTrigger className="w-32" data-testid="select-proposal-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">下書き</SelectItem>
              <SelectItem value="submitted">審議中</SelectItem>
              <SelectItem value="decided">承認済</SelectItem>
              <SelectItem value="archived">総会提示済</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleDownload} disabled={isDownloading} data-testid="button-download-pdf">
            {isDownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            {isDownloading ? "PDF生成中..." : "PDF出力"}
          </Button>
          <Button
            className="bg-orange-600 hover:bg-orange-700"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            data-testid="button-save-proposal"
          >
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            保存{hasPendingChanges ? " *" : ""}
          </Button>
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="flex justify-end mb-2 flex-shrink-0">
        <SubNav items={[
          { label: "議案書一覧", path: `/proposals/list?condominiumId=${condominiumId}`, icon: FileText },
          { label: "AI議案書生成", path: `/proposals/generate?condominiumId=${condominiumId}`, icon: Sparkles },
        ]} />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Left: Text Area + Background + Related Decisions */}
        <div className="flex-1 flex flex-col min-w-0 gap-4 overflow-y-auto">
          {/* 議案本文 */}
          <Card className="flex flex-col" style={{ minHeight: "260px" }}>
            <CardHeader className="py-3 bg-gray-50 border-b">
              <CardTitle className="text-sm font-medium flex items-center">
                <FileText className="w-4 h-4 mr-2 text-gray-500" /> 議案本文
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <Textarea
                className="w-full h-full resize-none border-0 rounded-none p-6 focus-visible:ring-0 text-base leading-relaxed"
                style={{ minHeight: "200px" }}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                data-testid="textarea-proposal-content"
                placeholder="議案本文を入力してください"
              />
            </CardContent>
          </Card>

          {/* 経緯 */}
          <Card>
            <CardHeader className="py-3 bg-gray-50 border-b">
              <CardTitle className="text-sm font-medium flex items-center">
                <FileText className="w-4 h-4 mr-2 text-gray-500" /> 経緯
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Textarea
                className="w-full resize-none border-0 rounded-none p-4 focus-visible:ring-0 text-sm leading-relaxed"
                style={{ minHeight: "120px" }}
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                data-testid="textarea-proposal-background"
                placeholder="この議案に至る経緯・背景を入力してください（例：令和○年の法改正を受け…）"
              />
            </CardContent>
          </Card>

          {/* 過去の関連決議 */}
          <Card>
            <CardHeader className="py-3 bg-gray-50 border-b">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span className="flex items-center">
                  <Link2 className="w-4 h-4 mr-2 text-gray-500" /> 過去の関連決議
                </span>
                <div className="flex items-center gap-2">
                  {hasPendingChanges && (
                    <span className="text-xs text-orange-500 font-normal">未保存の変更あり</span>
                  )}
                  <Badge variant="secondary" data-testid="badge-related-decisions-count">
                    {visibleRelated.length}件
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {/* Linked decisions list */}
              {visibleRelated.length > 0 ? (
                <div className="space-y-2">
                  {visibleRelated.map((d: any) => (
                    <div
                      key={d.id}
                      className="flex items-start justify-between border rounded-lg p-3 bg-white"
                      data-testid={`card-related-decision-${d.id}`}
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs text-gray-500" data-testid={`text-decision-date-${d.id}`}>
                            {formatMeetingDate(d.meetingDate)}
                          </span>
                          <Badge variant={getResultVariant(d.result)} className="text-xs" data-testid={`badge-decision-result-${d.id}`}>
                            {getResultLabel(d.result)}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium leading-snug" data-testid={`text-decision-title-${d.id}`}>{d.title}</p>
                        {d.votingResults && (
                          <p className="text-xs text-gray-400 mt-1" data-testid={`text-decision-votes-${d.id}`}>
                            賛成 {d.votingResults.favor ?? 0} / 反対 {d.votingResults.against ?? 0} / 棄権 {d.votingResults.abstain ?? 0}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-red-500 flex-shrink-0"
                        onClick={() => stageRemove(d.id)}
                        data-testid={`button-unlink-decision-${d.id}`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400" data-testid="text-no-related-decisions">関連する決議はまだ紐づけられていません。</p>
              )}

              {/* Decision search & link */}
              <div className="border-t pt-3">
                <p className="text-xs font-medium text-gray-600 mb-2">決議を検索して追加</p>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <Input
                    className="pl-8 text-sm h-8"
                    placeholder="タイトル・カテゴリで検索..."
                    value={decisionSearch}
                    onChange={(e) => setDecisionSearch(e.target.value)}
                    data-testid="input-decision-search"
                  />
                </div>
                {decisionSearch && (
                  <div className="space-y-1 max-h-48 overflow-y-auto border rounded-lg p-1 bg-gray-50" data-testid="list-decision-search-results">
                    {filteredDecisions.length === 0 ? (
                      <p className="text-xs text-gray-400 p-2">該当する決議が見つかりません</p>
                    ) : (
                      filteredDecisions.slice(0, 10).map((raw: any) => {
                        const d = normalizeDecision(raw);
                        return (
                          <div
                            key={d.id}
                            className="flex items-center justify-between p-2 rounded hover:bg-white transition-colors"
                            data-testid={`item-decision-search-${d.id}`}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{d.title}</p>
                              <p className="text-xs text-gray-400">
                                {formatMeetingDate(d.meetingDate)}　{getResultLabel(d.result)}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-800 flex-shrink-0 h-7 px-2"
                              onClick={() => {
                                stageAdd(raw);
                                setDecisionSearch("");
                              }}
                              data-testid={`button-link-decision-${d.id}`}
                            >
                              <Plus className="w-3.5 h-3.5 mr-1" /> 追加
                            </Button>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: AI Support */}
        <div className="w-80 flex flex-col gap-4 overflow-y-auto pr-2">
          <Card>
            <CardHeader className="bg-blue-50 py-3 border-b">
              <CardTitle className="text-sm font-bold text-blue-800 flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2" /> AI生成想定Q&A
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Accordion type="multiple" className="w-full">
                {mockQa.map((item: any, i: number) => (
                  <AccordionItem key={i} value={`item-${i}`} className="border-b px-4">
                    <AccordionTrigger className="text-xs font-bold text-left hover:no-underline py-3">
                      Q. {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-xs text-gray-600 leading-relaxed pb-4">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardHeader className="py-3">
              <CardTitle className="text-xs font-bold text-orange-800">住民説明のアドバイス</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-orange-700 leading-relaxed">
              法令改正への「守りの改正」であることを強調し、将来の資産価値維持に不可欠なステップであることを伝えると、合意形成がスムーズになります。
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
