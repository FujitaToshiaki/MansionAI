import { MessageCircle, History } from "lucide-react";

export default function ConsultationHistory() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <MessageCircle className="text-green-600" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">相談履歴・ナレッジ検索</h1>
          <p className="text-sm text-gray-500">03 業務相談Bot</p>
        </div>
      </div>
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <History className="text-green-600" size={20} />
          <span className="font-semibold text-green-800">開発中</span>
        </div>
        <p className="text-green-700 text-sm">過去の相談履歴の一覧とナレッジ検索機能を準備中です。</p>
      </div>
    </div>
  );
}
