import { Wrench, FileText } from "lucide-react";

export default function LongTermPlanSummary() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Wrench className="text-blue-600" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">住民説明用要約生成</h1>
          <p className="text-sm text-gray-500">02 長期修繕計画AI</p>
        </div>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="text-blue-600" size={20} />
          <span className="font-semibold text-blue-800">開発中</span>
        </div>
        <p className="text-blue-700 text-sm">住民向け説明資料の自動生成・PDF出力機能を準備中です。</p>
      </div>
    </div>
  );
}
