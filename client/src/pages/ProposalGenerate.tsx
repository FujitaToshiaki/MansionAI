import { ClipboardList, Bot } from "lucide-react";

export default function ProposalGenerate() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <ClipboardList className="text-orange-600" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI議案書生成</h1>
          <p className="text-sm text-gray-500">05 総会議案書AI</p>
        </div>
      </div>
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <Bot className="text-orange-600" size={20} />
          <span className="font-semibold text-orange-800">開発中</span>
        </div>
        <p className="text-orange-700 text-sm">
          前回議事録・規約分析結果・財務データから論点を抽出し、議案テンプレートを自動生成する画面を準備中です。
        </p>
      </div>
    </div>
  );
}
