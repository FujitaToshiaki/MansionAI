import { useState, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, ClipboardCheck, Building, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import CondominiumSearchPanel from "@/components/CondominiumSearchPanel";

const CATEGORIES = ["財務", "管理体制", "建物", "防災", "居住環境"] as const;
type Category = typeof CATEGORIES[number];

type Answer = "yes" | "no" | "partial" | null;

function calcStarRating(score: number): number {
  if (score >= 90) return 5;
  if (score >= 75) return 4;
  if (score >= 60) return 3;
  if (score >= 45) return 2;
  return 1;
}

function StarDisplay({ count }: { count: number }) {
  return (
    <span className="text-yellow-400 text-xl">
      {"★".repeat(count)}{"☆".repeat(5 - count)}
    </span>
  );
}

export default function EvaluationCheck() {
  const { id } = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    Object.fromEntries(CATEGORIES.map((c) => [c, true]))
  );

  const { data: condominium } = useQuery<any>({
    queryKey: ["/api/condominiums", id],
    enabled: !!id,
  });

  const { data: items = [], isLoading: itemsLoading } = useQuery<any[]>({
    queryKey: ["/api/evaluation/items-master"],
  });

  const itemsByCategory = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    for (const cat of CATEGORIES) {
      grouped[cat] = items.filter((i) => i.category === cat);
    }
    return grouped;
  }, [items]);

  const categoryScores = useMemo(() => {
    const scores: Record<string, { score: number; max: number }> = {};
    for (const cat of CATEGORIES) {
      const catItems = itemsByCategory[cat] || [];
      let score = 0;
      let max = 0;
      for (const item of catItems) {
        max += item.max_score;
        const ans = answers[item.item_number];
        if (ans === "yes") score += item.yes_score;
        else if (ans === "partial") score += item.partial_score;
      }
      scores[cat] = { score, max };
    }
    return scores;
  }, [answers, itemsByCategory]);

  const totalScore = useMemo(() =>
    Object.values(categoryScores).reduce((s, c) => s + c.score, 0),
    [categoryScores]
  );
  const totalMax = useMemo(() =>
    Object.values(categoryScores).reduce((s, c) => s + c.max, 0),
    [categoryScores]
  );

  const answeredCount = Object.values(answers).filter((a) => a !== null).length;
  const starRating = calcStarRating(totalMax > 0 ? (totalScore / totalMax) * 100 : 0);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const catScores: Record<string, number> = {};
      for (const cat of CATEGORIES) {
        catScores[cat] = categoryScores[cat]?.score || 0;
      }
      return apiRequest("POST", `/api/condominiums/${id}/evaluation/checks`, {
        totalScore,
        maxScore: totalMax,
        starRating,
        categoryScores: catScores,
        answers,
        checkedBy: "管理者",
      });
    },
    onSuccess: async (res) => {
      const data = await res.json();
      queryClient.invalidateQueries({ queryKey: ["/api/condominiums", id, "evaluation", "checks"] });
      toast({ title: "評価結果を保存しました" });
      setLocation(`/condominiums/${id}/evaluation/score`);
    },
    onError: () => {
      toast({ title: "保存に失敗しました", variant: "destructive" });
    },
  });

  if (!id) {
    return (
      <CondominiumSearchPanel
        targetPath="/evaluation/check"
        title="適正評価セルフチェック"
        description="チェックを実施する物件を選択してください"
        standalone={true}
      />
    );
  }

  if (itemsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <nav className="text-sm text-gray-500 mb-1">
            <Link href="/condominiums" className="hover:text-gray-700">マンション一覧</Link>
            <span className="mx-2">{">"}</span>
            {condominium ? (
              <Link href={`/condominiums/${id}`} className="hover:text-gray-700">{condominium.name}</Link>
            ) : (
              <span>物件</span>
            )}
            <span className="mx-2">{">"}</span>
            <span>適正評価セルフチェック</span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-blue-600" />
            適正評価セルフチェック
          </h1>
          {condominium && (
            <p className="text-gray-500 mt-1 flex items-center gap-1">
              <Building className="w-4 h-4" />
              {condominium.name}
            </p>
          )}
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-blue-600">{totalScore}<span className="text-lg text-gray-500">/{totalMax}点</span></div>
          <StarDisplay count={starRating} />
          <p className="text-sm text-gray-500 mt-1">{answeredCount}/{items.length}項目回答済み</p>
        </div>
      </div>

      {/* Overall progress */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">総合進捗</span>
            <span className="text-sm text-gray-500">{answeredCount}/{items.length}項目</span>
          </div>
          <Progress value={(answeredCount / Math.max(items.length, 1)) * 100} className="h-2" />
          <div className="grid grid-cols-5 gap-2 mt-3">
            {CATEGORIES.map((cat) => {
              const cs = categoryScores[cat];
              return (
                <div key={cat} className="text-center">
                  <p className="text-xs text-gray-500">{cat}</p>
                  <p className="text-sm font-semibold text-blue-700">{cs.score}<span className="text-gray-400">/{cs.max}</span></p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Questions by category */}
      <div className="space-y-4">
        {CATEGORIES.map((cat) => {
          const catItems = itemsByCategory[cat] || [];
          const cs = categoryScores[cat];
          const isOpen = openCategories[cat];
          const catAnswered = catItems.filter((i) => answers[i.item_number] !== undefined && answers[i.item_number] !== null).length;

          return (
            <Collapsible key={cat} open={isOpen} onOpenChange={(o) => setOpenCategories((prev) => ({ ...prev, [cat]: o }))}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50 rounded-t-lg transition-colors py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                        <CardTitle className="text-base font-semibold text-gray-800">{cat}</CardTitle>
                        <Badge variant="outline" className="text-xs">{catAnswered}/{catItems.length}回答済</Badge>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-blue-600">{cs.score}</span>
                        <span className="text-gray-400 text-sm">/{cs.max}点</span>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 space-y-3">
                    {catItems.map((item) => {
                      const ans = answers[item.item_number] ?? null;
                      return (
                        <div
                          key={item.item_number}
                          data-testid={`evaluation-item-${item.item_number}`}
                          className="border border-gray-100 rounded-lg p-4 space-y-3"
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-xs font-mono text-gray-400 mt-1 w-6 shrink-0">{String(item.item_number).padStart(2, "0")}</span>
                            <p className="text-sm text-gray-800 flex-1">{item.question}</p>
                            <Badge variant="outline" className="text-xs shrink-0">{item.max_score}点</Badge>
                          </div>
                          <div className="flex gap-2 ml-9">
                            {(["yes", "partial", "no"] as const).map((val) => {
                              const labels: Record<string, string> = { yes: "はい", partial: "一部", no: "いいえ" };
                              const colors: Record<string, string> = {
                                yes: ans === "yes" ? "bg-green-600 text-white border-green-600" : "border-gray-200 hover:border-green-400 hover:bg-green-50",
                                partial: ans === "partial" ? "bg-yellow-500 text-white border-yellow-500" : "border-gray-200 hover:border-yellow-400 hover:bg-yellow-50",
                                no: ans === "no" ? "bg-red-500 text-white border-red-500" : "border-gray-200 hover:border-red-400 hover:bg-red-50",
                              };
                              return (
                                <button
                                  key={val}
                                  data-testid={`button-answer-${item.item_number}-${val}`}
                                  onClick={() => setAnswers((prev) => ({ ...prev, [item.item_number]: val }))}
                                  className={`px-4 py-1.5 rounded-md border text-sm font-medium transition-colors ${colors[val]}`}
                                >
                                  {labels[val]}
                                  {val === "yes" && <span className="ml-1 text-xs opacity-75">(+{item.yes_score})</span>}
                                  {val === "partial" && item.partial_score > 0 && <span className="ml-1 text-xs opacity-75">(+{item.partial_score})</span>}
                                </button>
                              );
                            })}
                          </div>
                          {ans === "no" && item.improvement_suggestion && (
                            <div className="ml-9 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-md p-3">
                              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                              <p className="text-xs text-amber-700">{item.improvement_suggestion}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between pb-6">
        <Link href={`/condominiums/${id}`}>
          <Button variant="outline" data-testid="button-back">キャンセル</Button>
        </Link>
        <div className="flex gap-3">
          <Link href={`/condominiums/${id}/evaluation/history`}>
            <Button variant="outline" data-testid="button-history">評価履歴</Button>
          </Link>
          <Button
            data-testid="button-save-evaluation"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || answeredCount < items.length}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saveMutation.isPending ? "保存中..." : "評価を完了・保存する"}
          </Button>
        </div>
      </div>
    </div>
  );
}
