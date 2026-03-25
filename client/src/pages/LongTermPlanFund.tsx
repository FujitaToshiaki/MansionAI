import { Wrench, BarChart2 } from "lucide-react";

export default function LongTermPlanFund() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Wrench className="text-blue-600" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">積立金推移・シミュレーション</h1>
          <p className="text-sm text-gray-500">02 長期修繕計画AI</p>
        </div>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <BarChart2 className="text-blue-600" size={20} />
          <span className="font-semibold text-blue-800">開発中</span>
        </div>
        <p className="text-blue-700 text-sm">積立金の年次推移グラフと将来シミュレーション画面を準備中です。</p>
      </div>
    </div>
  );
}
