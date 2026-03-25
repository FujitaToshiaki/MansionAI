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

  const qaByCategory: Record<string, { q: string; a: string }[]> = {
    "規約改訂": [
      { q: "なぜ今改訂が必要なのですか？", a: "法令改正や社会情勢の変化に対応しないまま運用を続けると、将来的に法的なトラブルや助成金申請などで不利になる可能性があります。今回の改訂はリスク回避の「守りの改正」です。" },
      { q: "改訂によって住民の生活に影響はありますか？", a: "日常的な生活への影響は最小限に抑えています。新たに禁止される行為については、移行措置として周知期間を設ける予定です。" },
      { q: "規約改訂の議決要件はどうなっていますか？", a: "区分所有法第31条により、規約の変更には区分所有者総数および議決権総数のそれぞれ4分の3以上の賛成が必要です。" },
      { q: "改訂後の規約はどこで確認できますか？", a: "改訂後は管理事務所に原本を保管し、各戸に冊子を配布いたします。電子データはマンション管理組合のポータルサイトでもご覧いただけます。" },
    ],
    "修繕": [
      { q: "工事中の生活への影響はどの程度ですか？", a: "工事期間中は騒音・振動が発生する時間帯があります。作業は平日8:00〜17:00を基本とし、週1回の定例報告会で進捗と生活影響を丁寧にお伝えします。" },
      { q: "修繕積立金は本当に十分ですか？", a: "長期修繕計画に基づいた積立を行っており、今回の工事費用は計画内に収まっています。ただし将来の物価変動リスクに備え、積立額の定期的な見直しも並行して検討しています。" },
      { q: "業者選定はどのように行いますか？", a: "3社以上から相見積もりを取得し、価格・実績・アフターサービスを総合的に評価して選定します。選定結果は全区分所有者にお知らせします。" },
      { q: "工事が遅れた場合はどうなりますか？", a: "施工会社との契約に工期遅延ペナルティを盛り込む予定です。万が一の天候不良等による軽微な遅延については柔軟に対応しつつ、最終引渡し期限は厳守させます。" },
    ],
    "管理費": [
      { q: "なぜ値上げが必要なのですか？", a: "人件費・光熱費・業務委託費の上昇が主な理由です。現状の収入では毎年赤字が続く見込みとなっており、マンションの適切な維持管理を継続するために値上げが不可欠です。" },
      { q: "値上げ幅はどのように決まりましたか？", a: "過去3年間の実際の支出増加額を分析し、今後3年間の収支シミュレーションをもとに最低限必要な増額幅を算出しました。管理会社とも複数回にわたり協議を重ねています。" },
      { q: "値上げ後の管理費はどのように使われますか？", a: "清掃費・警備費・共用部光熱費・管理事務委託費などの運営経費に充当されます。使途は毎年の収支報告書で詳細を開示します。" },
      { q: "値上げが嫌な場合はどうすればよいですか？", a: "総会での議決が必要なため、ご意見は総会でご発言いただくか、事前に書面での質問提出が可能です。ご意見はすべて理事会で真摯に検討します。" },
    ],
    "運営": [
      { q: "この変更は本当に必要ですか？", a: "居住者アンケートや理事会での議論を経て、居住者の皆様からのご要望に応える形で提案しています。マンション全体の利便性・安全性・快適性の向上につながります。" },
      { q: "費用はどこから出るのですか？", a: "管理費会計から支出します。今期の予算内に収まる範囲での実施を基本とし、大幅な追加費用が発生する場合には改めてご報告します。" },
      { q: "決定後の運用はどのように行いますか？", a: "承認後は速やかに実施細則を整備し、全戸に案内文を配布します。導入後3ヶ月を目安に効果検証を行い、必要に応じて見直しを行います。" },
      { q: "反対した場合どうなりますか？", a: "本議案は出席議決権の過半数の賛成で承認されます。総会での採決結果に基づき対応を決定します。反対意見はすべて議事録に記録されます。" },
    ],
    "その他": [
      { q: "この議案はなぜ今期に提出されたのですか？", a: "理事会での長期的な検討と各種調査の結果、今期が対応の適切なタイミングと判断しました。詳細は経緯欄をご参照ください。" },
      { q: "費用の根拠を教えてください。", a: "複数の専門業者からの見積もりと、類似マンションの事例を参考に積算しています。詳細な内訳は総会資料の添付書類に記載しています。" },
      { q: "否決された場合どうなりますか？", a: "否決の場合は現状維持となります。ただし問題が継続・悪化する可能性があるため、理事会として代替案の検討を継続します。" },
    ],
  };

  const adviceByCategory: Record<string, string> = {
    "規約改訂": "「皆さんの生活を守るためのルール整備」という観点から説明すると合意を得やすくなります。特に民泊禁止やペット規定は、すでにトラブルを経験した方への共感を示しながら、全体の資産価値と住環境を守るための措置として伝えることが重要です。",
    "修繕": "「放置すればより高い費用がかかる」という視点を数字で示すと説得力が増します。工事による一時的な不便を丁寧に説明しつつ、完了後の建物価値向上と安全性確保のメリットを具体的に伝えましょう。写真や図面を使ったビジュアル説明も効果的です。",
    "管理費": "値上げへの抵抗感は当然です。「値上げをしない場合のリスク（サービス低下・積立不足）」を具体的に示すことで、値上げが必要不可欠であることを理解してもらいやすくなります。過去の収支データと今後のシミュレーションを一緒に提示しましょう。",
    "運営": "マンション全体の「住みやすさ・安全・快適性」の向上につながることを強調しましょう。実際の居住者の声や要望を紹介することで、「自分たちの声が反映された」と感じてもらえ、賛成を得やすくなります。",
    "その他": "議案の背景と必要性を簡潔に整理し、「なぜ今か」「誰にとってのメリットか」「費用対効果」の3点を中心に説明することで、居住者の理解と賛同を得やすくなります。",
  };

  const proposalCategory = proposal?.category ?? "";
  const qaItems = qaByCategory[proposalCategory] ?? qaByCategory["その他"];
  const adviceText = adviceByCategory[proposalCategory] ?? adviceByCategory["その他"];

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
                {qaItems.map((item: any, i: number) => (
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
              {adviceText}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
