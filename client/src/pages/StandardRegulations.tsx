import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation, useParams } from "wouter";
import { 
  FileText, 
  Download, 
  Eye, 
  AlertCircle,
  CheckCircle,
  Car,
  Package,
  Users,
  Shield,
  Monitor,
  ArrowLeft
} from "lucide-react";

interface RegulationRevision {
  id: number;
  category: string;
  title: string;
  change_description: string;
  before_text: string | null;
  after_text: string | null;
  article_number: string | null;
  reference_section: string | null;
  change_type: string;
  creation_date: string;
}

export default function StandardRegulations() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const versionId = params.versionId;

  const { data: revisions = [], isLoading } = useQuery({
    queryKey: ['/api/regulation-revisions', versionId],
    queryFn: async () => {
      const response = await fetch('/api/regulation-revisions');
      if (!response.ok) throw new Error('改正情報の取得に失敗しました');
      return response.json() as RegulationRevision[];
    }
  });

  const getVersionName = (versionId: string) => {
    switch (versionId) {
      case 'r6':
        return '令和6年度改訂';
      case 'r3':
        return '令和3年度改訂';
      case 'h29':
        return '平成29年度改訂';
      default:
        return '不明な改正版';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '充電設備':
        return <Car className="h-5 w-5 text-green-600" />;
      case '宅配ボックス設置':
        return <Package className="h-5 w-5 text-blue-600" />;
      case '外部専門家活用':
      case '外部専門家活用詳細':
        return <Users className="h-5 w-5 text-purple-600" />;
      case '役員欠格条項':
      case '監事機能強化':
        return <Shield className="h-5 w-5 text-red-600" />;
      case '電磁的方法活用':
      case '管理情報提供':
      case '組合員名簿管理':
        return <Monitor className="h-5 w-5 text-orange-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '充電設備':
        return 'bg-green-100 text-green-800';
      case '宅配ボックス設置':
        return 'bg-blue-100 text-blue-800';
      case '外部専門家活用':
      case '外部専門家活用詳細':
        return 'bg-purple-100 text-purple-800';
      case '役員欠格条項':
      case '監事機能強化':
        return 'bg-red-100 text-red-800';
      case '電磁的方法活用':
      case '管理情報提供':
      case '組合員名簿管理':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getChangeTypeIcon = (changeType: string) => {
    switch (changeType) {
      case '新設':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case '追加':
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      case '義務化':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setLocation('/standard-regulations')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              改正版一覧に戻る
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{getVersionName(versionId || '')} - 改正項目一覧</h1>
          <p className="text-gray-600 mt-2">この改正版における全ての変更項目と新設規定</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Download className="h-4 w-4 mr-2" />
          改正項目をエクスポート
        </Button>
      </div>

      <div className="grid gap-4">
        {revisions.map((revision) => (
          <Card key={revision.id} className="bg-white hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getCategoryIcon(revision.category)}
                    <CardTitle className="text-lg">{revision.title}</CardTitle>
                    <Badge className={getCategoryColor(revision.category)}>
                      {revision.category}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getChangeTypeIcon(revision.change_type)}
                      {revision.change_type}
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm">{revision.change_description}</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {revision.article_number && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">条文: {revision.article_number}</span>
                  </div>
                )}
                {revision.reference_section && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">参照: {revision.reference_section}</span>
                  </div>
                )}
              </div>

              {(revision.before_text || revision.after_text) && (
                <div className="space-y-3">
                  {revision.before_text && revision.before_text !== '（新設）' && (
                    <div>
                      <h5 className="font-medium text-red-700 mb-1">改正前</h5>
                      <p className="text-sm text-gray-700 bg-red-50 p-3 rounded border-l-4 border-red-200">
                        {revision.before_text}
                      </p>
                    </div>
                  )}
                  {revision.after_text && (
                    <div>
                      <h5 className="font-medium text-green-700 mb-1">
                        {revision.before_text === '（新設）' ? '新設内容' : '改正後'}
                      </h5>
                      <p className="text-sm text-gray-700 bg-green-50 p-3 rounded border-l-4 border-green-200">
                        {revision.after_text}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setLocation(`/standard-regulations/${versionId}/${revision.id}`)}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  詳細を見る
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  出力
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {revisions.length === 0 && (
        <Card className="bg-white">
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">改正情報がありません</h3>
            <p className="text-gray-600">標準管理規約の改正情報が見つかりませんでした。</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}