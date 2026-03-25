import { FileVideo, List, Upload, Bot, CheckSquare } from "lucide-react";

const subPages = [
  { icon: List, label: "議事録一覧", desc: "作成済み議事録の管理" },
  { icon: Upload, label: "音声・メモ取込", desc: "音声データ・メモのアップロード" },
  { icon: Bot, label: "AI議事録生成", desc: "文字起こし→構造化→議事録自動生成" },
  { icon: CheckSquare, label: "アクション管理", desc: "決定事項・ToDo の一覧管理" },
];

export default function MinutesAI() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <FileVideo className="text-purple-600" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">04 議事録作成AI</h1>
          <p className="text-sm text-gray-500">議事録一覧</p>
        </div>
      </div>
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <FileVideo className="text-purple-600" size={20} />
          <span className="font-semibold text-purple-800">開発中</span>
        </div>
        <p className="text-purple-700 text-sm">
          音声データやメモから議事録を自動生成し、決定事項・アクションアイテムを抽出する機能を準備中です。
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {subPages.map((p) => (
          <div key={p.label} className="bg-white border border-gray-200 rounded-lg p-4">
            <p.icon className="mb-2 text-purple-500" size={22} />
            <p className="text-sm font-medium text-gray-800">{p.label}</p>
            <p className="text-xs text-gray-500 mt-1">{p.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
