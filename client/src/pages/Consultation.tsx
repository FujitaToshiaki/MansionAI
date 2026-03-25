import { MessageCircle, Send, History } from "lucide-react";

export default function Consultation() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <MessageCircle className="text-green-600" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">03 業務相談チャットボット</h1>
          <p className="text-sm text-gray-500">チャット相談</p>
        </div>
      </div>
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Send className="text-green-600" size={20} />
          <span className="font-semibold text-green-800">開発中</span>
        </div>
        <p className="text-green-700 text-sm">
          クレーム対応・法令解釈・運用判断など管理業務の実務相談を AI が一次対応する機能を準備中です。
          滞納対応・騒音トラブル・ペット問題など様々なシナリオに対応します。
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <Send className="mb-2 text-green-500" size={22} />
          <p className="text-sm font-medium text-gray-800">チャット相談</p>
          <p className="text-xs text-gray-500 mt-1">リアルタイムAI相談</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <History className="mb-2 text-green-500" size={22} />
          <p className="text-sm font-medium text-gray-800">相談履歴</p>
          <p className="text-xs text-gray-500 mt-1">過去の相談・ナレッジ検索</p>
        </div>
      </div>
    </div>
  );
}
