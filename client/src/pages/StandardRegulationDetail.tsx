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
      case 'r7':
        return '令和7年度改訂';
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

  // 条文テキストを箇条書き形式にフォーマットする関数
  const formatRegulationText = (text: string): string => {
    if (!text) return text;
    
    return text
      // 条文番号の後に改行を追加
      .replace(/(第\d+条(?:の\d+)?)\s+/g, '$1\n')
      // 項目番号（一、二、三...）の前に改行と適切なインデントを追加
      .replace(/([。\n])\s*(一|二|三|四|五|六|七|八|九|十)\s+/g, '$1\n　$2 ')
      // アラビア数字項目（1、2、3...）の前に改行とインデントを追加
      .replace(/([。\n])\s*([1-9]\d*)\s+/g, '$1\n　$2 ')
      // サブ項目（①、②、③...）の前に改行とさらなるインデントを追加
      .replace(/([。\n])\s*(①|②|③|④|⑤|⑥|⑦|⑧|⑨|⑩)\s+/g, '$1\n　　$2 ')
      // 【コメント】セクションの前に改行を追加
      .replace(/\s*【コメント】/g, '\n\n【コメント】')
      // 連続する改行を整理
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  // 差分をハイライトする関数（改訂案中心の表示）
  const highlightDifferences = (beforeText: string, afterText: string, isAfter: boolean = false) => {
    // 改訂前テキストが存在しない場合は、改訂案をそのまま表示（新設項目）
    if (!beforeText && afterText) {
      if (isAfter) {
        return `<span style="color: #dc2626; font-weight: 600;">${formatRegulationText(afterText)}</span>`;
      } else {
        return '（規定なし）';
      }
    }

    // 改訂案が存在しない場合は、現行をそのまま表示
    if (beforeText && !afterText) {
      if (isAfter) {
        return '（削除）';
      } else {
        return formatRegulationText(beforeText);
      }
    }

    // 両方存在する場合の差分表示
    if (beforeText && afterText) {
      if (isAfter) {
        // 改訂案では変更箇所のみを赤字で強調
        const before = formatRegulationText(beforeText);
        const after = formatRegulationText(afterText);
        
        // 単語レベルでの差分検出（より精密な比較）
        const beforeWords = before.split(/(\s+|。|、|「|」|（|）)/);
        const afterWords = after.split(/(\s+|。|、|「|」|（|）)/);
        
        // シンプルな差分検出
        const result: string[] = [];
        let i = 0, j = 0;
        
        while (j < afterWords.length) {
          if (i < beforeWords.length && beforeWords[i] === afterWords[j]) {
            result.push(afterWords[j]);
            i++; j++;
          } else {
            // 変更または追加された部分を赤字に
            result.push(`<span style="color: #dc2626; font-weight: 600;">${afterWords[j]}</span>`);
            j++;
            // 対応する原文の単語をスキップ
            if (i < beforeWords.length) i++;
          }
        }
        
        return result.join('');
      } else {
        // 現行は正確な原文をそのまま表示
        return formatRegulationText(beforeText);
      }
    }

    return formatRegulationText(isAfter ? afterText : beforeText);
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
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              {getCategoryIcon(revision.category)}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <CardTitle className="text-xl">{revision.title}</CardTitle>
                  <Badge className={getCategoryColor(revision.category)}>
                    {revision.category}
                  </Badge>
                  <Badge variant="outline">
                    {revision.change_type}
                  </Badge>
                  {revision.article_number && (
                    <Badge variant="outline">
                      {revision.article_number}
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600 mt-1">
                  改正詳細 - {revision.reference_section || ''}
                </p>
              </div>
            </div>
          </div>
          
          {/* 規約の変更内容 */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-medium mb-6">規約の変更内容</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="flex items-center mb-3">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-medium mr-3">改訂案</span>
                  <h4 className="font-medium text-gray-700">新しい規約条文</h4>
                </div>
                <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                  <div 
                    className="text-sm leading-relaxed whitespace-pre-wrap font-sans"
                    dangerouslySetInnerHTML={{
                      __html: highlightDifferences(revision.before_text || '', revision.after_text || '（新設）', true)
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center mb-3">
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm font-medium mr-3">現行</span>
                  <h4 className="font-medium text-gray-700">現在の規約条文</h4>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div 
                    className="text-sm leading-relaxed whitespace-pre-wrap font-sans"
                    dangerouslySetInnerHTML={{
                      __html: highlightDifferences(revision.before_text || '（規定なし）', revision.after_text || '', false)
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 改訂理由セクション - 改訂案・現行の下に配置 */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium mb-3">改訂理由</h4>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <pre className="text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">
                  {formatRegulationText(revision.change_description)}
                </pre>
              </div>
            </div>

            {/* 改正情報 - 最下段に配置 */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="font-medium mb-3">改正情報</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">改正種別：</span>
                  <span className="text-gray-600">{revision.change_type}</span>
                </div>
                {revision.reference_section && (
                  <div>
                    <span className="font-medium text-gray-700">参照箇所：</span>
                    <span className="text-gray-600">{revision.reference_section}</span>
                  </div>
                )}
                <div>
                  <span className="font-medium text-gray-700">登録日時：</span>
                  <span className="text-gray-600">
                    {new Date(revision.creation_date).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}