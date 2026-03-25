import { ClipboardList, List, Bot, Edit, FileOutput } from "lucide-react";

const subPages = [
  { icon: List, label: "議案書一覧", desc: "総会議案書の管理・ステータス確認" },
  { icon: Bot, label: "AI議案書生成", desc: "論点整理・テンプレート化・Q&A生成" },
  { icon: Edit, label: "議案書編集", desc: "2ペイン（エディタ+プレビュー）編集" },
  { icon: FileOutput, label: "PDF出力", desc: "議案書・説明資料の一括PDF出力" },
];

export default function ProposalAI() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <ClipboardList className="text-orange-600" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">05 総会議案書作成AI</h1>
          <p className="text-sm text-gray-500">議案書一覧</p>
        </div>
      </div>
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <ClipboardList className="text-orange-600" size={20} />
          <span className="font-semibold text-orange-800">開発中</span>
        </div>
        <p className="text-orange-700 text-sm">
          論点整理、議案テンプレート化、想定Q&A作成、住民説明資料の叩き台作成機能を準備中です。
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {subPages.map((p) => (
          <div key={p.label} className="bg-white border border-gray-200 rounded-lg p-4">
            <p.icon className="mb-2 text-orange-500" size={22} />
            <p className="text-sm font-medium text-gray-800">{p.label}</p>
            <p className="text-xs text-gray-500 mt-1">{p.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
