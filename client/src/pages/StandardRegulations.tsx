import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  ArrowLeft,
  Languages
} from "lucide-react";
import { useState, useEffect } from "react";

const languages = {
  ja: { name: '日本語', flag: '🇯🇵' },
  en: { name: 'English', flag: '🇺🇸' },
  zh: { name: '中文', flag: '🇨🇳' },
  ko: { name: '한국어', flag: '🇰🇷' },
  vi: { name: 'Tiếng Việt', flag: '🇻🇳' },
  fil: { name: 'Filipino', flag: '🇵🇭' }
};

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
  const [currentLanguage, setCurrentLanguage] = useState<keyof typeof languages>('ja');
  const [translatedContent, setTranslatedContent] = useState<Record<string, string>>({});

  const { data: revisions = [], isLoading } = useQuery<RegulationRevision[]>({
    queryKey: ['/api/regulation-revisions', versionId],
    queryFn: async () => {
      const response = await fetch('/api/regulation-revisions');
      if (!response.ok) throw new Error('改正情報の取得に失敗しました');
      return response.json();
    }
  });

  // Translation function
  const translateText = async (text: string, targetLanguage: string): Promise<string> => {
    if (targetLanguage === 'ja') return text;
    
    const translations: Record<string, Record<string, string>> = {
      en: {
        '標準管理規約': 'Standard Management Regulations',
        '改正項目一覧': 'List of Amendment Items',
        '専有部分等の範囲': 'Scope of Exclusive Portions',
        '充電設備': 'Charging Equipment',
        '宅配ボックス設置': 'Package Delivery Box Installation',
        '外部専門家活用': 'Utilization of External Experts',
        '監事機能強化': 'Strengthening Audit Functions',
        '電磁的方法活用': 'Utilization of Electronic Methods',
        '管理情報提供': 'Provision of Management Information',
        '組合員名簿管理': 'Management of Member Registry'
      },
      zh: {
        '標準管理規約': '标准管理规约',
        '改正項目一覧': '修正项目清单',
        '専有部分等の範囲': '专有部分等的范围',
        '充電設備': '充电设备',
        '宅配ボックス設置': '快递箱安装',
        '外部専門家活用': '利用外部专家',
        '監事機能強化': '强化监事功能',
        '電磁的方法活用': '利用电磁方法',
        '管理情報提供': '管理信息提供',
        '組合員名簿管理': '会员名册管理'
      },
      ko: {
        '標準管理規約': '표준 관리규약',
        '改正項目一覧': '개정 항목 목록',
        '専有部分等の範囲': '전유부분 등의 범위',
        '充電設備': '충전설비',
        '宅配ボックス設置': '택배함 설치',
        '外部専門家活用': '외부 전문가 활용',
        '監事機能強化': '감사 기능 강화',
        '電磁的方法活用': '전자적 방법 활용',
        '管理情報提供': '관리정보 제공',
        '組合員名簿管理': '조합원 명부 관리'
      },
      vi: {
        '標準管理規約': 'Quy ước Quản lý Tiêu chuẩn',
        '改正項目一覧': 'Danh sách các Mục Sửa đổi',
        '専有部分等の範囲': 'Phạm vi Phần Sở hữu Riêng',
        '充電設備': 'Thiết bị Sạc',
        '宅配ボックス設置': 'Lắp đặt Hộp Giao hàng',
        '外部専門家活用': 'Sử dụng Chuyên gia Bên ngoài',
        '監事機能強化': 'Tăng cường Chức năng Kiểm toán',
        '電磁的方法活用': 'Sử dụng Phương pháp Điện từ',
        '管理情報提供': 'Cung cấp Thông tin Quản lý',
        '組合員名簿管理': 'Quản lý Danh sách Thành viên'
      },
      fil: {
        '標準管理規約': 'Standard na Regulasyon sa Pamamahala',
        '改正項目一覧': 'Listahan ng mga Amendment Items',
        '専有部分等の範囲': 'Saklaw ng mga Eksklusibong Bahagi',
        '充電設備': 'Charging Equipment',
        '宅配ボックス設置': 'Package Delivery Box Installation',
        '外部専門家活用': 'Paggamit ng External Experts',
        '監事機能強化': 'Pagpapalakas ng Audit Functions',
        '電磁的方法活用': 'Paggamit ng Electronic Methods',
        '管理情報提供': 'Pagbibigay ng Management Information',
        '組合員名簿管理': 'Pamamahala ng Member Registry'
      }
    };
    
    return translations[targetLanguage]?.[text] || text;
  };

  // Helper function to get translated text
  const getTranslatedText = (text: string): string => {
    if (currentLanguage === 'ja') return text;
    return translatedContent[text] || text;
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

  // Update translations when language changes
  useEffect(() => {
    if (currentLanguage === 'ja') return;

    const textsToTranslate = [
      '標準管理規約',
      '改正項目一覧',
      '専有部分等の範囲',
      '充電設備',
      '宅配ボックス設置',
      '外部専門家活用',
      '監事機能強化',
      '電磁的方法活用',
      '管理情報提供',
      '組合員名簿管理'
    ];

    Promise.all(
      textsToTranslate.map(async (text) => ({
        original: text,
        translated: await translateText(text, currentLanguage)
      }))
    ).then(results => {
      const newTranslations: Record<string, string> = {};
      results.forEach(({ original, translated }) => {
        newTranslations[original] = translated;
      });
      setTranslatedContent(newTranslations);
    });
  }, [currentLanguage]);

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
      case '役員資格要件':
      case '本人確認':
        return <Shield className="h-5 w-5 text-red-600" />;
      case '電磁的方法活用':
      case '管理情報提供':
      case '組合員名簿管理':
        return <Monitor className="h-5 w-5 text-orange-600" />;
      case '修繕積立金管理':
      case '損害賠償請求権代理':
        return <FileText className="h-5 w-5 text-emerald-600" />;
      case '防災業務':
      case '防火管理者':
        return <AlertCircle className="h-5 w-5 text-amber-600" />;
      case '喫煙ルール':
        return <Shield className="h-5 w-5 text-indigo-600" />;
      case '総会決議要件':
      case '総会招集通知':
        return <Users className="h-5 w-5 text-teal-600" />;
      case '国内管理人':
      case '所在不明区分所有者':
      case '専有部分管理制度':
        return <Users className="h-5 w-5 text-slate-600" />;
      case '立入り・保存権限':
      case '専有部分管理':
      case '区分所有者責務':
        return <FileText className="h-5 w-5 text-cyan-600" />;
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
      case '役員資格要件':
      case '本人確認':
        return 'bg-red-100 text-red-800';
      case '電磁的方法活用':
      case '管理情報提供':
      case '組合員名簿管理':
        return 'bg-orange-100 text-orange-800';
      case '修繕積立金管理':
      case '損害賠償請求権代理':
        return 'bg-emerald-100 text-emerald-800';
      case '防災業務':
      case '防火管理者':
        return 'bg-amber-100 text-amber-800';
      case '喫煙ルール':
        return 'bg-indigo-100 text-indigo-800';
      case '総会決議要件':
      case '総会招集通知':
        return 'bg-teal-100 text-teal-800';
      case '国内管理人':
      case '所在不明区分所有者':
      case '専有部分管理制度':
        return 'bg-slate-100 text-slate-800';
      case '立入り・保存権限':
      case '専有部分管理':
      case '区分所有者責務':
        return 'bg-cyan-100 text-cyan-800';
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
          <h1 className="text-3xl font-bold text-gray-900">{getVersionName(versionId || '')} - {getTranslatedText('改正項目一覧')}</h1>
          <p className="text-gray-600 mt-2">この改正版における全ての変更項目と新設規定</p>
        </div>
        
        {/* Language Selector and Export Button */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Languages className="w-4 h-4 text-gray-500" />
            <Select value={currentLanguage} onValueChange={(value: keyof typeof languages) => setCurrentLanguage(value)}>
              <SelectTrigger className="w-32">
                <SelectValue>
                  {languages[currentLanguage].flag} {languages[currentLanguage].name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(languages).map(([code, lang]) => (
                  <SelectItem key={code} value={code}>
                    {lang.flag} {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            改正項目をエクスポート
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {revisions.map((revision) => (
          <Card key={revision.id} className="bg-white hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getCategoryIcon(revision.category)}
                    <CardTitle className="text-lg">{getTranslatedText(revision.title)}</CardTitle>
                    <Badge className={getCategoryColor(revision.category)}>
                      {getTranslatedText(revision.category)}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getChangeTypeIcon(revision.change_type)}
                      {revision.change_type}
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm">{getTranslatedText(revision.change_description)}</p>
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

              {/* 規約の変更内容 - 横並びレイアウト */}
              {(revision.before_text || revision.after_text) && (
                <div className="space-y-4">
                  <h5 className="font-medium text-gray-900">規約の変更内容</h5>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium mr-2">改訂案</span>
                        <h6 className="text-sm font-medium text-gray-700">新しい規約条文</h6>
                      </div>
                      <div className="border border-blue-200 rounded-lg p-3 bg-blue-50">
                        <pre className="text-xs leading-relaxed whitespace-pre-wrap font-sans">
                          {formatRegulationText(revision.after_text || '（新設）')}
                        </pre>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center mb-2">
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium mr-2">現行</span>
                        <h6 className="text-sm font-medium text-gray-700">現在の規約条文</h6>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-3">
                        <pre className="text-xs leading-relaxed whitespace-pre-wrap font-sans">
                          {formatRegulationText(revision.before_text || '（規定なし）')}
                        </pre>
                      </div>
                    </div>
                  </div>

                  {/* 改訂理由 - 横並び下に配置 */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h6 className="text-sm font-medium text-gray-900 mb-2">改訂理由</h6>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <pre className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">
                        {formatRegulationText(getTranslatedText(revision.change_description))}
                      </pre>
                    </div>
                  </div>
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