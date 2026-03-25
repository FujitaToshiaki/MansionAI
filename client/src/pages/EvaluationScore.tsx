import { useMemo } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, Building, AlertCircle, TrendingUp, History } from "lucide-react";
import { Link } from "wouter";
import CondominiumSearchPanel from "@/components/CondominiumSearchPanel";

const CATEGORIES = ["財務", "管理体制", "建物", "防災", "居住環境"] as const;
type Category = typeof CATEGORIES[number];

const CATEGORY_COLORS: Record<string, string> = {
  財務: "bg-blue-500",
  管理体制: "bg-purple-500",
  建物: "bg-green-500",
  防災: "bg-red-500",
  居住環境: "bg-orange-500",
};

const CATEGORY_LIGHT: Record<string, string> = {
  財務: "bg-blue-50 text-blue-700 border-blue-200",
  管理体制: "bg-purple-50 text-purple-700 border-purple-200",
  建物: "bg-green-50 text-green-700 border-green-200",
  防災: "bg-red-50 text-red-700 border-red-200",
  居住環境: "bg-orange-50 text-orange-700 border-orange-200",
};

function StarDisplay({ count }: { count: number }) {
  return (
    <span className="text-yellow-400 text-2xl">
      {"★".repeat(count)}{"☆".repeat(5 - count)}
    </span>
  );
}

function RadarBar({ label, score, max, colorClass }: { label: string; score: number; max: number; colorClass: string }) {
  const pct = max > 0 ? Math.round((score / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-bold text-gray-900">{score}<span className="text-gray-400 font-normal">/{max}</span></span>
      </div>
      <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-right text-xs text-gray-400">{pct}%</div>
    </div>
  );
}

export default function EvaluationScore() {
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

  const { data: items = [] } = useQuery<any[]>({
    queryKey: ["/api/evaluation/items-master"],
  });

  const latestCheck = checks[0] ?? null;
  const previousCheck = checks[1] ?? null;

  const categoryScores: Record<string, { score: number; max: number }> = useMemo(() => {
    if (!latestCheck) {
      return Object.fromEntries(CATEGORIES.map((c) => [c, { score: 0, max: 20 }]));
    }
    const catScores = typeof latestCheck.category_scores === "string"
      ? JSON.parse(latestCheck.category_scores)
      : latestCheck.category_scores;

    return Object.fromEntries(CATEGORIES.map((c) => [c, { score: catScores[c] ?? 0, max: 20 }]));
  }, [latestCheck]);

  const answers: Record<number, string> = useMemo(() => {
    if (!latestCheck) return {};
    return typeof latestCheck.answers === "string"
      ? JSON.parse(latestCheck.answers)
      : latestCheck.answers;
  }, [latestCheck]);

  const improvementItems = useMemo(() => {
    return items.filter((item) => {
      const ans = answers[item.item_number];
      return ans === "no" || ans === "partial";
    }).slice(0, 10);
  }, [items, answers]);

  if (!id) {
    return (
      <CondominiumSearchPanel
        targetPath="/evaluation/score"
        title="スコア詳細・改善提案"
        description="スコアを確認する物件を選択してください"
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

  if (!latestCheck) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-4">
        <div className="flex justify-center">
          <div className="bg-gray-100 p-4 rounded-full">
            <ClipboardCheck className="w-10 h-10 text-gray-400" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-700">評価データがありません</h2>
        <p className="text-gray-500">まずセルフチェックを実施してください</p>
        <Link href={`/condominiums/${id}/evaluation/check`}>
          <Button className="mt-4 bg-blue-600 hover:bg-blue-700">セルフチェックを開始</Button>
        </Link>
      </div>
    );
  }

  const totalScore = latestCheck.total_score;
  const totalMax = latestCheck.max_score;
  const starRating = latestCheck.star_rating;
  const prevScore = previousCheck?.total_score;
  const scoreDiff = prevScore !== undefined ? totalScore - prevScore : null;

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
          <span>スコア詳細</span>
        </nav>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            スコア詳細・改善提案
          </h1>
          <div className="flex gap-2">
            <Link href={`/condominiums/${id}/evaluation/check`}>
              <Button variant="outline" size="sm" data-testid="button-start-check">新規チェック</Button>
            </Link>
            <Link href={`/condominiums/${id}/evaluation/history`}>
              <Button variant="outline" size="sm" data-testid="button-history">
                <History className="w-4 h-4 mr-1" />
                履歴
              </Button>
            </Link>
          </div>
        </div>
        {condominium && (
          <p className="text-gray-500 mt-1 flex items-center gap-1">
            <Building className="w-4 h-4" />
            {condominium.name}
          </p>
        )}
      </div>

      {/* Score summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-1 text-center">
          <CardContent className="pt-6 pb-6">
            <p className="text-sm text-gray-500 mb-2">総合スコア</p>
            <p className="text-5xl font-bold text-blue-600" data-testid="text-total-score">{totalScore}</p>
            <p className="text-gray-400">/{totalMax}点</p>
            <div className="mt-3">
              <StarDisplay count={starRating} />
            </div>
            <div className="mt-2">
              <Badge className={starRating >= 4 ? "bg-green-100 text-green-700" : starRating >= 3 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}>
                {starRating >= 4 ? "優良" : starRating >= 3 ? "良好" : starRating >= 2 ? "要改善" : "要注意"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-700">カテゴリ別スコア</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {CATEGORIES.map((cat) => {
              const cs = categoryScores[cat];
              return (
                <RadarBar
                  key={cat}
                  label={cat}
                  score={cs.score}
                  max={cs.max}
                  colorClass={CATEGORY_COLORS[cat]}
                />
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Previous comparison */}
      {scoreDiff !== null && (
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-4">
              <div className="bg-gray-50 rounded-lg px-4 py-3 text-center">
                <p className="text-xs text-gray-500">前回スコア</p>
                <p className="text-2xl font-bold text-gray-600">{prevScore}</p>
              </div>
              <div className={`text-center px-4 py-3 rounded-lg ${scoreDiff >= 0 ? "bg-green-50" : "bg-red-50"}`}>
                <p className="text-xs text-gray-500">前回比</p>
                <p className={`text-2xl font-bold ${scoreDiff >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {scoreDiff >= 0 ? "+" : ""}{scoreDiff}
                </p>
              </div>
              <p className="text-sm text-gray-600 flex-1">
                {scoreDiff > 0
                  ? "前回より改善されています。引き続き取り組みを続けてください。"
                  : scoreDiff < 0
                  ? "前回よりスコアが下がっています。改善項目を確認してください。"
                  : "前回と同じスコアです。"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Improvement list */}
      {improvementItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              改善提案リスト
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {improvementItems.map((item) => {
              const ans = answers[item.item_number];
              return (
                <div
                  key={item.item_number}
                  data-testid={`improvement-item-${item.item_number}`}
                  className="border border-amber-100 bg-amber-50 rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className={`text-xs shrink-0 ${CATEGORY_LIGHT[item.category]}`}>
                      {item.category}
                    </Badge>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">
                        Q{item.item_number}. {item.question}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={ans === "partial" ? "bg-yellow-100 text-yellow-700 text-xs" : "bg-red-100 text-red-700 text-xs"}>
                          {ans === "partial" ? "一部対応" : "未対応"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {item.improvement_suggestion && (
                    <p className="text-xs text-amber-700 ml-0">{item.improvement_suggestion}</p>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
