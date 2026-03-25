import { Star, ClipboardCheck, TrendingUp, History } from "lucide-react";
import { Link } from "wouter";

export default function EvaluationCheck() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Star className="text-yellow-500" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">適正評価セルフチェック</h1>
          <p className="text-sm text-gray-500">セルフチェック実施</p>
        </div>
      </div>
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <ClipboardCheck className="text-yellow-600" size={20} />
          <span className="font-semibold text-yellow-800">開発中</span>
        </div>
        <p className="text-yellow-700 text-sm">
          協会の適正評価制度（5カテゴリ30項目100点満点）のセルフ評価機能を準備中です。
          AI が各項目の適否を判定し、改善提案を自動生成します。
        </p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: ClipboardCheck, label: "セルフチェック実施", path: "" },
          { icon: TrendingUp, label: "スコア詳細・改善提案", path: "/detail" },
          { icon: History, label: "評価履歴・推移", path: "/history" },
        ].map((item) => (
          <div key={item.label} className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <item.icon className="mx-auto mb-2 text-yellow-500" size={24} />
            <p className="text-xs text-gray-600">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
