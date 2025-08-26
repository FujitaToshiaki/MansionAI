import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, ArrowLeft, Languages, AlertCircle, Eye, CheckCircle } from 'lucide-react';
import { useState, useMemo } from 'react';

// 多言語対応のテキスト辞書
const languages = {
  ja: { flag: '🇯🇵', name: '日本語' },
  en: { flag: '🇺🇸', name: 'English' },
  ko: { flag: '🇰🇷', name: '한국어' },
  zh: { flag: '🇨🇳', name: '中文' }
};

const translations = {
  ja: {
    '改正項目一覧': '改正項目一覧',
    '年別改正管理': '年別改正管理',
    '条文番号別管理': '条文番号別管理',
    '標準管理規約': '標準管理規約',
    '役員欠格条項': '役員欠格条項',
    '監事機能強化': '監事機能強化',
    '電磁的方法活用': '電磁的方法活用',
    '修繕積立金管理': '修繕積立金管理',
    '防災業務': '防災業務',
    '喫煙ルール': '喫煙ルール',
    '総会決議要件': '総会決議要件',
    '国内管理人': '国内管理人',
    '立入り・保存権限': '立入り・保存権限'
  },
  en: {
    '改正項目一覧': 'Amendment Items List',
    '年別改正管理': 'Yearly Amendment Management',
    '条文番号別管理': 'Article Number Management',
    '標準管理規約': 'Standard Management Regulations',
    '役員欠格条項': 'Officer Disqualification Clause',
    '監事機能強化': 'Auditor Function Enhancement',
    '電磁的方法活用': 'Electronic Method Utilization',
    '修繕積立金管理': 'Repair Reserve Fund Management',
    '防災業務': 'Disaster Prevention Operations',
    '喫煙ルール': 'Smoking Rules',
    '総会決議要件': 'General Assembly Resolution Requirements',
    '国内管理人': 'Domestic Administrator',
    '立入り・保存権限': 'Entry and Preservation Authority'
  },
  ko: {
    '改正項目一覧': '개정 항목 목록',
    '年別改正管理': '연도별 개정 관리',
    '条文番号別管理': '조문 번호별 관리',
    '標準管理規約': '표준 관리 규약',
    '役員欠格条項': '임원 결격 조항',
    '監事機能強化': '감사 기능 강화',
    '電磁的方法活用': '전자적 방법 활용',
    '修繕積立金管理': '수선 적립금 관리',
    '防災業務': '재해 방지 업무',
    '喫煙ルール': '흡연 규칙',
    '総会決議要件': '총회 의결 요건',
    '国内管理人': '국내 관리인',
    '立入り・保存権限': '출입 및 보존 권한'
  },
  zh: {
    '改正項目一覧': '修订项目列表',
    '年別改正管理': '年度修订管理',
    '条文番号別管理': '条文编号管理',
    '標準管理規約': '标准管理规约',
    '役員欠格条項': '管理人员资格条款',
    '監事機能強化': '监事功能强化',
    '電磁的方法活用': '电子方法应用',
    '修繕積立金管理': '修缮基金管理',
    '防災業務': '防灾业务',
    '喫煙ルール': '吸烟规则',
    '総会決議要件': '大会决议要求',
    '国内管理人': '国内管理人',
    '立入り・保存権限': '进入和保存权限'
  }
};

export default function StandardRegulations() {
  const [location, setLocation] = useLocation();
  const [currentLanguage, setCurrentLanguage] = useState<keyof typeof languages>('ja');
  const [showIndex, setShowIndex] = useState(false);

  // URLからバージョンIDを取得
  const pathParts = location.split('/');
  const versionId = pathParts.length >= 3 ? pathParts[2] : null;

  const { data: standardRegulations = [], isLoading: isLoadingStandard } = useQuery({
    queryKey: ['/api/standard-regulations'],
    enabled: true
  });

  const { data: revisions = [], isLoading } = useQuery({
    queryKey: ['/api/revisions', versionId],
    enabled: !!versionId
  });

  const getTranslatedText = (key: string): string => {
    const translation = translations[currentLanguage]?.[key];
    return translation || key;
  };

  const getVersionName = (version: string): string => {
    switch (version) {
      case '2022': return 'R4年改正版';
      case '2025': return 'R7年改正版';
      case '2021': return 'R3年改正版';
      case '2020': return 'R2年改正版';
      default: return `${version}年改正版`;
    }
  };

  // 通常の改正項目と別添項目を分離
  const regularRevisions = revisions.filter(r => !r.title.includes('別添'));
  const annexRevisions = revisions.filter(r => r.title.includes('別添'));

  // 条番号でグループ化した改正項目のインデックス作成
  const articleIndex = useMemo(() => {
    const grouped = regularRevisions.reduce((acc, revision) => {
      if (revision.article_number) {
        if (!acc[revision.article_number]) {
          acc[revision.article_number] = [];
        }
        acc[revision.article_number].push(revision);
      }
      return acc;
    }, {} as Record<string, typeof revisions>);
    
    return Object.entries(grouped).sort(([a], [b]) => {
      const numA = parseInt(a.replace(/[^0-9]/g, '') || '0');
      const numB = parseInt(b.replace(/[^0-9]/g, '') || '0');
      return numA - numB;
    });
  }, [regularRevisions]);

  // テキストフォーマット関数
  const formatRegulationText = (text: string): string => {
    if (!text) return '';
    return text
      .replace(/\\n/g, '\n')
      .replace(/^\s+/gm, '')
      .replace(/\n+/g, '\n')
      .trim();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '役員欠格条項':
      case '監事機能強化':
      case '役員資格要件':
      case '本人確認':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case '電磁的方法活用':
      case '管理情報提供':
      case '組合員名簿管理':
        return <FileText className="h-5 w-5 text-orange-600" />;
      case '修繕積立金管理':
      case '損害賠償請求権代理':
        return <CheckCircle className="h-5 w-5 text-emerald-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
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

  if (isLoading || isLoadingStandard) {
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
          <h1 className="text-3xl font-bold text-gray-900">
            {versionId ? `${getVersionName(versionId)} - ${getTranslatedText('改正項目一覧')}` : '標準管理規約・改正項目'}
          </h1>
          <p className="text-gray-600 mt-2">
            {versionId ? 'この改正版における全ての変更項目と新設規定' : '標準管理規約と個別改正項目の一覧'}
          </p>
        </div>
        
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
          <Button 
            variant="outline" 
            onClick={() => setShowIndex(!showIndex)}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            目次
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            改正項目をエクスポート
          </Button>
        </div>
      </div>

      {/* 標準管理規約一覧 */}
      {standardRegulations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg font-semibold">
              標準管理規約
            </div>
            <div className="flex-1 border-t border-gray-300"></div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {standardRegulations.length}項目
            </Badge>
          </div>
          
          <div className="grid gap-4">
            {standardRegulations.map((regulation) => (
              <Card key={regulation.id} className="bg-white hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">{regulation.title}</CardTitle>
                        <Badge className={getCategoryColor(regulation.category)}>
                          {regulation.category}
                        </Badge>
                        <Badge variant="outline" className={regulation.status === '改正済' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {regulation.status}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm">{regulation.description}</p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">条文: {regulation.article_number}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">改正年: {regulation.revision_year}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 個別改正項目 */}
      {revisions.length > 0 && (
        <div className={standardRegulations.length > 0 ? "mt-12 pt-8 border-t border-gray-300" : ""}>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-semibold">
              個別改正項目
            </div>
            <div className="flex-1 border-t border-gray-300"></div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {revisions.length}項目
            </Badge>
          </div>
          
          <div className="grid gap-4">
            {regularRevisions.map((revision, index) => {
              const isNewArticle = index === 0 || revision.article_number !== regularRevisions[index - 1]?.article_number;
              const articleId = revision.article_number ? `article-${revision.article_number.replace(/[^0-9]/g, '')}` : undefined;
              
              return (
                <div key={revision.id}>
                  {isNewArticle && revision.article_number && (
                    <div id={articleId} className="scroll-mt-20">
                      <div className="flex items-center gap-3 mb-4 pt-6">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-semibold">
                          {revision.article_number}
                        </div>
                        <div className="flex-1 border-t border-gray-300"></div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {articleIndex.find(([articleNum]) => articleNum === revision.article_number)?.[1].length || 1}項目の改正
                        </Badge>
                      </div>
                    </div>
                  )}
                  
                  <Card className="bg-white hover:shadow-lg transition-shadow">
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

                      <div className="flex gap-3 pt-4 border-t">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setLocation(`/standard-regulations/${versionId}/${revision.id}`)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          詳細を表示
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 別添項目 */}
      {annexRevisions.length > 0 && (
        <div className="mt-12 pt-8 border-t border-gray-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-slate-600 to-gray-700 text-white px-4 py-2 rounded-lg font-semibold">
              別添
            </div>
            <div className="flex-1 border-t border-gray-300"></div>
            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
              {annexRevisions.length}項目
            </Badge>
          </div>

          <div className="grid gap-4">
            {annexRevisions.map((revision) => (
              <Card key={revision.id} className="bg-white hover:shadow-lg transition-shadow border-l-4 border-l-gray-400">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">{getTranslatedText(revision.title)}</CardTitle>
                        <Badge className={getCategoryColor(revision.category)}>
                          {getTranslatedText(revision.category)}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm">{getTranslatedText(revision.change_description)}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setLocation(`/standard-regulations/${versionId}/${revision.id}`)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    詳細を表示
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}