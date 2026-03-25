import { FileVideo, CheckSquare } from "lucide-react";

export default function MinutesActions() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <FileVideo className="text-purple-600" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">アクション管理</h1>
          <p className="text-sm text-gray-500">04 議事録作成AI</p>
        </div>
      </div>
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <CheckSquare className="text-purple-600" size={20} />
          <span className="font-semibold text-purple-800">開発中</span>
        </div>
        <p className="text-purple-700 text-sm">
          議事録から抽出された決定事項・ToDoの一覧管理と担当者別ビューを準備中です。
        </p>
      </div>
    </div>
  );
}
