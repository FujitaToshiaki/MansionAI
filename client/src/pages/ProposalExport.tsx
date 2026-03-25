import { ClipboardList, FileOutput } from "lucide-react";

export default function ProposalExport() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <ClipboardList className="text-orange-600" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">PDF出力</h1>
          <p className="text-sm text-gray-500">05 総会議案書AI</p>
        </div>
      </div>
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <FileOutput className="text-orange-600" size={20} />
          <span className="font-semibold text-orange-800">開発中</span>
        </div>
        <p className="text-orange-700 text-sm">
          議案書・住民説明資料の PDF 一括出力機能を準備中です。
        </p>
      </div>
    </div>
  );
}
