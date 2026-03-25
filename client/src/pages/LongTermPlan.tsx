import { Wrench, LayoutDashboard, List, BarChart2, Bot, FileText } from "lucide-react";

const subPages = [
  { icon: LayoutDashboard, label: "長計ダッシュボード", desc: "タイムライン・サマリ表示" },
  { icon: List, label: "修繕項目一覧", desc: "28項目の修繕計画一覧" },
  { icon: BarChart2, label: "積立金推移", desc: "シミュレーション・グラフ" },
  { icon: Bot, label: "AI見直し分析", desc: "前提条件の棚卸し・提案" },
  { icon: FileText, label: "住民説明要約", desc: "住民向け説明資料の自動生成" },
];

export default function LongTermPlan() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Wrench className="text-blue-600" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">02 長期修繕計画の見直しAI</h1>
          <p className="text-sm text-gray-500">長計ダッシュボード</p>
        </div>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Wrench className="text-blue-600" size={20} />
          <span className="font-semibold text-blue-800">開発中</span>
        </div>
        <p className="text-blue-700 text-sm">
          前提条件の棚卸し、修繕周期・工事項目の見直し提案、住民説明用要約の自動生成機能を準備中です。
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {subPages.map((p) => (
          <div key={p.label} className="bg-white border border-gray-200 rounded-lg p-4">
            <p.icon className="mb-2 text-blue-500" size={22} />
            <p className="text-sm font-medium text-gray-800">{p.label}</p>
            <p className="text-xs text-gray-500 mt-1">{p.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
