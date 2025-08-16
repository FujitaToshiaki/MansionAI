import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation, useParams } from "wouter";
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Share,
  Car,
  Package,
  Users,
  Shield,
  Monitor
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

export default function StandardRegulationDetail() {
  const params = useParams();
  const versionId = params.versionId;
  const id = params.id;
  const [, setLocation] = useLocation();

  const { data: revision, isLoading } = useQuery({
    queryKey: ['/api/regulation-revisions', versionId, id],
    queryFn: async () => {
      const response = await fetch(`/api/regulation-revisions/${id}`);
      if (!response.ok) throw new Error('改正詳細の取得に失敗しました');
      return response.json();
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
        return <Car className="h-6 w-6 text-green-600" />;
      case '宅配ボックス設置':
        return <Package className="h-6 w-6 text-blue-600" />;
      case '外部専門家活用':
      case '外部専門家活用詳細':
        return <Users className="h-6 w-6 text-purple-600" />;
      case '役員欠格条項':
      case '監事機能強化':
        return <Shield className="h-6 w-6 text-red-600" />;
      case '電磁的方法活用':
      case '管理情報提供':
      case '組合員名簿管理':
        return <Monitor className="h-6 w-6 text-orange-600" />;
      default:
        return <FileText className="h-6 w-6 text-gray-600" />;
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!revision) {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          onClick={() => setLocation(`/standard-regulations/${versionId}`)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {getVersionName(versionId || '')}一覧に戻る
        </Button>
        <Card className="bg-white">
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">改正情報が見つかりません</h3>
            <p className="text-gray-600">指定された改正情報が存在しないか、削除された可能性があります。</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setLocation(`/standard-regulations/${versionId}`)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {getVersionName(versionId || '')}一覧に戻る
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Share className="h-4 w-4 mr-2" />
            共有
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            出力
          </Button>
        </div>
      </div>

      {/* Header Card */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-start gap-4">
            {getCategoryIcon(revision.category)}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <CardTitle className="text-2xl">{revision.title}</CardTitle>
                <Badge className={getCategoryColor(revision.category)}>
                  {revision.category}
                </Badge>
                <Badge variant="outline">
                  {revision.change_type}
                </Badge>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">
                {revision.change_description}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Metadata */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg">改正情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {revision.article_number && (
              <div>
                <h4 className="font-medium text-gray-900 mb-1">条文番号</h4>
                <p className="text-gray-600">{revision.article_number}</p>
              </div>
            )}
            {revision.reference_section && (
              <div>
                <h4 className="font-medium text-gray-900 mb-1">参照箇所</h4>
                <p className="text-gray-600">{revision.reference_section}</p>
              </div>
            )}
            <div>
              <h4 className="font-medium text-gray-900 mb-1">改正種別</h4>
              <p className="text-gray-600">{revision.change_type}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">登録日時</h4>
              <p className="text-gray-600">
                {new Date(revision.creation_date).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Content Comparison */}
        <div className="lg:col-span-2 space-y-6">
          {revision.before_text && revision.before_text !== '（新設）' && (
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg text-red-700">改正前</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-200">
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {revision.before_text}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {revision.after_text && (
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg text-green-700">
                  {revision.before_text === '（新設）' ? '新設内容' : '改正後'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-200">
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {revision.after_text}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {revision.before_text === '（新設）' && (
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg text-blue-700">新設の背景</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-200">
                  <p className="text-gray-800">
                    この規定は令和6年改正において新たに追加された項目です。
                    {revision.category === '充電設備' && 
                      '電気自動車の普及に伴い、マンションにおける充電設備の設置需要の増加を受けて新設されました。'
                    }
                    {revision.category === '外部専門家活用' && 
                      'マンション管理の専門性向上と適正化を図るため、外部の専門家を活用できる制度が導入されました。'
                    }
                    {revision.category === '組合員名簿管理' && 
                      '管理組合の透明性向上と適切な管理業務の実施を目的として新設されました。'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}