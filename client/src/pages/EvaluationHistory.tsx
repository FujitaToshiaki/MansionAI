import { Star, History } from "lucide-react";

export default function EvaluationHistory() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Star className="text-yellow-500" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">評価履歴・推移</h1>
          <p className="text-sm text-gray-500">適正評価セルフチェック</p>
        </div>
      </div>
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <History className="text-yellow-600" size={20} />
          <span className="font-semibold text-yellow-800">開発中</span>
        </div>
        <p className="text-yellow-700 text-sm">
          過去の評価履歴とスコア推移グラフを表示する画面を準備中です。
        </p>
      </div>
    </div>
  );
}
