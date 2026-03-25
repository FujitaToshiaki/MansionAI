import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, Building, ClipboardCheck, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Link } from "wouter";
import CondominiumSearchPanel from "@/components/CondominiumSearchPanel";

const CATEGORIES = ["財務", "管理体制", "建物", "防災", "居住環境"] as const;

function StarDisplay({ count }: { count: number }) {
  return (
    <span className="text-yellow-400 text-lg">
      {"★".repeat(count)}{"☆".repeat(5 - count)}
    </span>
  );
}

function ScoreDiffBadge({ diff }: { diff: number | null }) {
  if (diff === null) return <Badge variant="outline" className="text-xs text-gray-400">初回</Badge>;
  if (diff > 0) return (
    <Badge className="bg-green-100 text-green-700 text-xs flex items-center gap-1">
      <TrendingUp className="w-3 h-3" />+{diff}
    </Badge>
  );
  if (diff < 0) return (
    <Badge className="bg-red-100 text-red-700 text-xs flex items-center gap-1">
      <TrendingDown className="w-3 h-3" />{diff}
    </Badge>
  );
  return (
    <Badge className="bg-gray-100 text-gray-600 text-xs flex items-center gap-1">
      <Minus className="w-3 h-3" />±0
    </Badge>
  );
}

export default function EvaluationHistory() {
  const { id } = useParams<{ id?: string }>();

  const { data: condominium } = useQuery<any>({
    queryKey: ["/api/condominiums", id],
    enabled: !!id,
  });

  const { data: checks = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/condominiums", id, "evaluation", "checks"],
    queryFn: async () => {
      const res = await fetch(`/api/condominiums/${id}/evaluation/checks`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!id,
  });

  if (!id) {
    return (
      <CondominiumSearchPanel
        targetPath="/evaluation/history"
        title="評価履歴・推移"
        description="評価履歴を確認する物件を選択してください"
        standalone={true}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <nav className="text-sm text-gray-500 mb-1">
          <Link href="/condominiums" className="hover:text-gray-700">マンション一覧</Link>
          <span className="mx-2">{">"}</span>
          {condominium && (
            <Link href={`/condominiums/${id}`} className="hover:text-gray-700">{condominium.name}</Link>
          )}
          <span className="mx-2">{">"}</span>
          <span>評価履歴</span>
        </nav>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <History className="w-6 h-6 text-blue-600" />
            評価履歴・推移
          </h1>
          <Link href={`/condominiums/${id}/evaluation/check`}>
            <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-start-new-check">
              <ClipboardCheck className="w-4 h-4 mr-2" />
              新規チェック
            </Button>
          </Link>
        </div>
        {condominium && (
          <p className="text-gray-500 mt-1 flex items-center gap-1">
            <Building className="w-4 h-4" />
            {condominium.name}
          </p>
        )}
      </div>

      {checks.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <div className="flex justify-center">
            <div className="bg-gray-100 p-4 rounded-full">
              <History className="w-10 h-10 text-gray-400" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-700">評価履歴がありません</h2>
          <p className="text-gray-500">まずセルフチェックを実施してください</p>
          <Link href={`/condominiums/${id}/evaluation/check`}>
            <Button className="mt-4 bg-blue-600 hover:bg-blue-700">セルフチェックを開始</Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Trend overview */}
          {checks.length >= 2 && (
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">評価推移</p>
                    <div className="flex items-center gap-3 mt-1">
                      {checks.slice(0, 5).reverse().map((check: any, index: number) => (
                        <div key={check.id} className="text-center">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                            style={{ backgroundColor: `hsl(${200 + index * 20}, 60%, 50%)` }}
                          >
                            {check.total_score}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{new Date(check.checked_at).toLocaleDateString("ja-JP", { month: "short", year: "numeric" })}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">最新スコア</p>
                    <p className="text-3xl font-bold text-blue-600">{checks[0].total_score}</p>
                    <StarDisplay count={checks[0].star_rating} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* History list */}
          <div className="space-y-4">
            {checks.map((check: any, index: number) => {
              const prevCheck = checks[index + 1];
              const diff = prevCheck !== undefined ? check.total_score - prevCheck.total_score : null;
              const catScores = typeof check.category_scores === "string"
                ? JSON.parse(check.category_scores)
                : check.category_scores;

              return (
                <Card
                  key={check.id}
                  data-testid={`history-item-${check.id}`}
                  className={index === 0 ? "border-blue-200 shadow-md" : ""}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {index === 0 && <Badge className="bg-blue-600 text-white text-xs">最新</Badge>}
                        <CardTitle className="text-base font-medium text-gray-800">
                          {new Date(check.checked_at).toLocaleDateString("ja-JP", {
                            year: "numeric", month: "long", day: "numeric"
                          })}
                        </CardTitle>
                        {check.checked_by && (
                          <span className="text-sm text-gray-500">担当: {check.checked_by}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <ScoreDiffBadge diff={diff} />
                        <div className="text-right">
                          <span className="text-2xl font-bold text-blue-600">{check.total_score}</span>
                          <span className="text-gray-400 text-sm">/{check.max_score}点</span>
                        </div>
                        <StarDisplay count={check.star_rating} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-5 gap-3">
                      {CATEGORIES.map((cat) => {
                        const score = catScores[cat] ?? 0;
                        const pct = Math.round((score / 20) * 100);
                        return (
                          <div key={cat} className="text-center">
                            <p className="text-xs text-gray-500 mb-1">{cat}</p>
                            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-blue-400"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <p className="text-xs font-semibold text-gray-700 mt-1">{score}/20</p>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                      <Link href={`/condominiums/${id}/evaluation/score`}>
                        <Button variant="outline" size="sm" data-testid={`button-view-score-${check.id}`}>
                          <TrendingUp className="w-3 h-3 mr-1" />
                          スコア詳細
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
