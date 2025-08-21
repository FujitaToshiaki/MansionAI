import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar,
  ArrowRight
} from "lucide-react";

interface RegulationVersion {
  id: string;
  name: string;
  year: string;
  description: string;
  revisionCount: number;
  status: 'active' | 'archived';
  lastUpdated: string;
}

// 改正版の一覧データ
const regulationVersions: RegulationVersion[] = [
  {
    id: "r7",
    name: "令和7年度改訂",
    year: "2025",
    description: "総会決議要件見直し、役員選任範囲拡大、防災業務明確化、国内管理人制度導入、マンション財産管理制度活用等",
    revisionCount: 16,
    status: 'active',
    lastUpdated: "2025-06-01"
  },
  {
    id: "r6",
    name: "令和6年度改訂",
    year: "2024",
    description: "住宅宿泊事業規制強化、外部専門家活用制度導入、電気自動車充電設備設置規定新設等",
    revisionCount: 15,
    status: 'active',
    lastUpdated: "2024-04-01"
  },
  {
    id: "r3",
    name: "令和3年度改訂", 
    year: "2021",
    description: "IT・デジタル化対応、管理組合運営の透明化、外部管理者制度の明確化等",
    revisionCount: 8,
    status: 'active',
    lastUpdated: "2021-04-01"
  },
  {
    id: "h29",
    name: "平成29年度改訂",
    year: "2017", 
    description: "暴力団排除条項、コミュニティ条項、災害時の管理組合業務等",
    revisionCount: 6,
    status: 'archived',
    lastUpdated: "2017-08-29"
  }
];

export default function StandardRegulationVersions() {
  const [, setLocation] = useLocation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return '運用中';
      case 'archived':
        return 'アーカイブ';
      default:
        return '不明';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">標準管理規約改正管理</h1>
          <p className="text-gray-600 mt-2">標準管理規約の改正版一覧・各改正版の詳細管理</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Download className="h-4 w-4 mr-2" />
          改正版一覧をエクスポート
        </Button>
      </div>

      <div className="grid gap-6">
        {regulationVersions.map((version) => (
          <Card key={version.id} className="bg-white hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="h-6 w-6 text-blue-600" />
                    <CardTitle className="text-xl">{version.name}</CardTitle>
                    <Badge className={getStatusColor(version.status)}>
                      {getStatusLabel(version.status)}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {version.revisionCount}項目
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-base leading-relaxed">
                    {version.description}
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">改正年: {version.year}年</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">
                    最終更新: {new Date(version.lastUpdated).toLocaleDateString('ja-JP')}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => setLocation(`/standard-regulations/${version.id}`)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Eye className="h-4 w-4" />
                  改正項目を見る
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  資料ダウンロード
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {regulationVersions.length === 0 && (
        <Card className="bg-white">
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">改正版情報がありません</h3>
            <p className="text-gray-600">標準管理規約の改正版情報が見つかりませんでした。</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}