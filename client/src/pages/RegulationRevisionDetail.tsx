import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, FileText, Calendar, Target, Database, Lightbulb, Languages } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";

const languages = {
  ja: { name: '日本語', flag: '🇯🇵' },
  en: { name: 'English', flag: '🇺🇸' },
  zh: { name: '中文', flag: '🇨🇳' },
  ko: { name: '한국어', flag: '🇰🇷' },
  vi: { name: 'Tiếng Việt', flag: '🇻🇳' },
  fil: { name: 'Filipino', flag: '🇵🇭' }
};

export default function RegulationRevisionDetail() {
  const { id, revisionId } = useParams();
  const [currentLanguage, setCurrentLanguage] = useState<keyof typeof languages>('ja');

  const { data: condominium } = useQuery({
    queryKey: ['/api/condominiums', id],
  });

  const { data: revisionDetail } = useQuery({
    queryKey: ['/api/condominiums', id, 'regulation-analysis', revisionId],
  });

  // Translation function
  const translateText = async (text: string, targetLanguage: string): Promise<string> => {
    if (targetLanguage === 'ja') return text;
    
    // Mock translation for demo purposes - in real implementation, use translation API
    const translations: Record<string, Record<string, string>> = {
      en: {
        '看板、広告等の設置、表示等の承認': 'Approval of Installation and Display of Signs and Advertisements',
        '第18条又は付属書類をマンションにおける看板、広告等の設置・表示等について特定の区分所有者又は、その他付属有者が次の各号下の定めに従って敷地、並びに建物の共用部分又は、第1号を除き第2条第5項により専用使用することを承認するものとする。': 'Article 18 or attached documents regarding the installation and display of signs and advertisements in condominiums, specific unit owners or other related parties shall be approved to use the land and common areas of the building according to the provisions listed below, excluding item 1 but including item 2, section 5.',
        '改訂詳細': 'Revision Details'
      },
      zh: {
        '看板、広告等の設置、表示等の承認': '招牌、广告等的设置、显示等的批准',
        '第18条又は付属書類をマンションにおける看板、広告等の設置・表示等について特定の区分所有者又は、その他付属有者が次の各号下の定めに従って敷地、並びに建物の共用部分又は、第1号を除き第2条第5項により専用使用することを承認するものとする。': '第18条或附属文件中关于公寓招牌、广告等的设置、显示等，特定区分所有者或其他附属拥有者按照以下各项规定，对土地以及建筑物的共用部分（除第1项外，按第2条第5项）进行专用使用予以批准。',
        '改訂詳細': '修订详情'
      },
      ko: {
        '看板、広告等の設置、表示等の承認': '간판, 광고 등의 설치, 표시 등의 승인',
        '第18条又は付属書類をマンションにおける看板、広告等の設置・表示等について特定の区分所有者又は、その他付属有者が次の各号下の定めに従って敷地、並びに建物の共用部分又は、第1号を除き第2条第5項により専用使用することを承認するものとする。': '제18조 또는 첨부서류에서 맨션의 간판, 광고 등의 설치·표시 등에 대해 특정 구분소유자 또는 기타 부속 소유자가 다음 각호의 규정에 따라 부지 및 건물의 공용부분 또는 제1호를 제외하고 제2조 제5항에 의해 전용사용하는 것을 승인한다.',
        '改訂詳細': '개정 상세'
      },
      vi: {
        '看板、広告等の設置、表示等の承認': 'Phê duyệt việc lắp đặt, hiển thị biển báo, quảng cáo, v.v.',
        '第18条又は付属書類をマンションにおける看板、広告等の設置・表示等について特定の区分所有者又は、その他付属有者が次の各号下の定めに従って敷地、並びに建物の共用部分又は、第1号を除き第2条第5項により専用使用することを承認するものとする。': 'Điều 18 hoặc tài liệu đính kèm về việc lắp đặt và hiển thị biển báo, quảng cáo tại chung cư, chủ sở hữu phân khu cụ thể hoặc các chủ sở hữu phụ thuộc khác được phê duyệt sử dụng khu đất và các khu vực chung của tòa nhà theo các quy định dưới đây, ngoại trừ khoản 1, theo khoản 5 Điều 2.',
        '改訂詳細': 'Chi tiết sửa đổi'
      },
      fil: {
        '看板、広告等の設置、表示等の承認': 'Pag-apruba sa pag-install at pagpapakita ng mga signboard, advertising, atbp.',
        '第18条又は付属書類をマンションにおける看板、広告等の設置・表示等について特定の区分所有者又は、その他付属有者が次の各号下の定めに従って敷地、並びに建物の共用部分又は、第1号を除き第2条第5項により専用使用することを承認するものとする。': 'Artikulo 18 o mga kasamang dokumento tungkol sa pag-install at pagpapakita ng mga signboard at advertising sa condominium, ang mga specific na unit owner o iba pang kaugnay na may-ari ay aprubado na gamitin ang lupa at mga common area ng gusali ayon sa mga sumusunod na probisyon, maliban sa item 1, sa pamamagitan ng seksyon 5 ng Artikulo 2.',
        '改訂詳細': 'Mga Detalye ng Rebisyon'
      }
    };
    
    return translations[targetLanguage]?.[text] || text;
  };

  const [translatedContent, setTranslatedContent] = useState<Record<string, string>>({});

  // Helper function to get translated text
  const getTranslatedText = (text: string): string => {
    if (currentLanguage === 'ja') return text;
    return translatedContent[text] || text;
  };

  // Update translations when language changes
  useEffect(() => {
    if (currentLanguage === 'ja' || !revisionDetail) return;

    const textsToTranslate = [
      revisionDetail.title,
      '改訂詳細',
      '改訂理由',
      '規約の変更内容',
      '現在の規約条文',
      '新しい規約条文',
      '変更のポイント',
      '実施スケジュール',
      '実施手順',
      revisionDetail.reason || '改正個人情報保護法に対応するため、個人情報の取り扱いに関する規定を強化する必要があります。',
      revisionDetail.currentText || '第15条 管理組合は、区分所有者および居住者の個人情報を適切に管理し、必要な場合にのみ利用するものとする。',
      revisionDetail.proposedText || '第15条 管理組合は、個人情報の保護に関する法律に基づき、区分所有者および居住者の個人情報を適正に取り扱い、本人の同意を得た場合または法令に基づく場合を除き、目的外利用を行ってはならない。'
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
  }, [currentLanguage, revisionDetail]);

  if (!revisionDetail) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">詳細情報を読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500">
        <Link href="/condominiums" className="hover:text-gray-700">マンション一覧</Link>
        <span className="mx-2">{'>'}</span>
        <Link href={`/condominiums/${id}`} className="hover:text-gray-700">{condominium?.name}</Link>
        <span className="mx-2">{'>'}</span>
        <Link href={`/condominiums/${id}/regulation-analysis`} className="hover:text-gray-700">規約改訂分析</Link>
        <span className="mx-2">{'>'}</span>
        <span>改訂詳細</span>
      </nav>

      {/* Header with All Content - Single Unified Card */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5" />
                <h1 className="text-xl font-bold">{revisionDetail.title}</h1>
                <Badge variant={
                  revisionDetail.impact === 'high' ? 'destructive' :
                  revisionDetail.impact === 'medium' ? 'secondary' : 'outline'
                }>
                  {revisionDetail.impact === 'high' ? '緊急度：高' :
                   revisionDetail.impact === 'medium' ? '緊急度：中' : '緊急度：低'}
                </Badge>
                {revisionDetail.lawRevisionRequired && (
                  <Badge variant="outline">法改正対応</Badge>
                )}
              </div>
              <p className="text-gray-600 mt-1">{getTranslatedText('改訂詳細')} - {revisionDetail.article}</p>
            </div>
            
            {/* Language Selector and Back Button */}
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
              <Link href={`/condominiums/${id}/regulation-analysis`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  一覧に戻る
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Reason Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-medium mb-3">{getTranslatedText('改訂理由')}</h3>
            <p className="text-gray-700 leading-relaxed">
              {getTranslatedText(revisionDetail.reason || '改正個人情報保護法に対応するため、個人情報の取り扱いに関する規定を強化する必要があります。現行の規約では法律が求める基準を満たしていないため、総会での承認を得て改訂を行います。')}
            </p>
          </div>

          {/* 規約の変更内容 */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-medium mb-6">{getTranslatedText('規約の変更内容')}</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="flex items-center mb-3">
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm font-medium mr-3">現行</span>
                  <h4 className="font-medium text-gray-700">{getTranslatedText('現在の規約条文')}</h4>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm leading-relaxed mb-3">
                    {getTranslatedText(revisionDetail.currentText || `第15条 管理組合は、区分所有者および居住者の個人情報を適切に管理し、必要な場合にのみ利用するものとする。`)}
                  </p>
                  <div className="text-sm text-red-600">
                    ⚠️ 法的根拠が不明確
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center mb-3">
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm font-medium mr-3">改訂案</span>
                  <h4 className="font-medium text-gray-700">{getTranslatedText('新しい規約条文')}</h4>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm leading-relaxed mb-3">
                    {getTranslatedText(revisionDetail.proposedText || `第15条 管理組合は、個人情報の保護に関する法律（平成15年法律第57号）に基づき、区分所有者および居住者の個人情報を適正に取り扱い、本人の同意を得た場合または法令に基づく場合を除き、目的外利用を行ってはならない。`)}
                  </p>
                  <div className="text-sm text-green-600">
                    ✅ 法的要件を完全満足
                  </div>
                </div>
              </div>
            </div>

            {/* 変更のポイント - 最下段に配置 */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium mb-3">{getTranslatedText('変更のポイント')}</h4>
              <div className="flex flex-wrap gap-2">
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">#法的根拠の明確化</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">#法律用語への統一</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">#利用条件の限定強化</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 実施手順とスケジュール */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              {getTranslatedText('実施スケジュール')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium mb-2">実施期限</h3>
              <p className="text-gray-700">
                法改正対応のため<br/><strong>3ヶ月以内</strong>に実施推奨
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white lg:col-span-2">
          <CardHeader>
            <CardTitle>{getTranslatedText('実施手順')}（4ステップ）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                <div className="w-6 h-6 bg-gray-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">1</div>
                <div>
                  <h4 className="font-medium">理事会での議案準備</h4>
                  <p className="text-sm text-gray-600 mt-1">改訂案確認・議案書作成（1-2週間）</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                <div className="w-6 h-6 bg-gray-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">2</div>
                <div>
                  <h4 className="font-medium">組合員への事前通知</h4>
                  <p className="text-sm text-gray-600 mt-1">総会開催通知発送（2週間前必須）</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                <div className="w-6 h-6 bg-gray-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">3</div>
                <div>
                  <h4 className="font-medium">臨時総会での決議</h4>
                  <p className="text-sm text-gray-600 mt-1">4分の3以上の賛成で可決</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                <div className="w-6 h-6 bg-gray-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">4</div>
                <div>
                  <h4 className="font-medium">改訂規約の施行</h4>
                  <p className="text-sm text-gray-600 mt-1">決議後即座に効力発生</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* よくある質問と準備事項 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>よくある質問</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">Q. 改訂しないとどうなる？</h4>
                <p className="text-sm text-gray-600">
                  個人情報漏洩時の法的責任や行政指導の対象となる可能性があります。
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">Q. 決議要件は？</h4>
                <p className="text-sm text-gray-600">
                  区分所有者及び議決権の各4分の3以上の賛成が必要です。
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">Q. 費用はかかる？</h4>
                <p className="text-sm text-gray-600">
                  総会開催費用や司法書士相談費用が発生する場合があります。
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">Q. 他のマンションでも実施？</h4>
                <p className="text-sm text-gray-600">
                  多くの管理組合で同様の改訂が行われています。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="w-5 h-5 mr-2" />
              準備事項と注意点
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-800 mb-3">準備すべき資料</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mr-3 flex-shrink-0" />
                    <span>現行規約と改訂案の対照表</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mr-3 flex-shrink-0" />
                    <span>法改正説明資料（国交省資料等）</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mr-3 flex-shrink-0" />
                    <span>総会議事次第と議案書</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mr-3 flex-shrink-0" />
                    <span>委任状（欠席者用）</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-800 mb-3">注意点</h3>
                <div className="space-y-3">
                  <div className="border border-gray-200 rounded-lg p-3">
                    <h4 className="font-medium text-gray-800 mb-1">管理会社との調整</h4>
                    <p className="text-sm text-gray-600">
                      管理委託契約の見直しも必要
                    </p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-3">
                    <h4 className="font-medium text-gray-800 mb-1">事前説明の徹底</h4>
                    <p className="text-sm text-gray-600">
                      組合員の理解と協力が重要
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}