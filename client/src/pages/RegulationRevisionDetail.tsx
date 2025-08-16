import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Calendar, Target, Database, Lightbulb } from "lucide-react";
import { Link } from "wouter";

export default function RegulationRevisionDetail() {
  const { id, revisionId } = useParams();

  const { data: condominium } = useQuery({
    queryKey: ['/api/condominiums', id],
  });

  const { data: revisionDetail } = useQuery({
    queryKey: ['/api/condominiums', id, 'regulation-analysis', revisionId],
  });

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
            <div className="flex items-center space-x-4">
              <Link href={`/condominiums/${id}/regulation-analysis`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  一覧に戻る
                </Button>
              </Link>
              <div>
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <h1 className="text-xl font-bold">{revisionDetail.title}</h1>
                </div>
                <p className="text-gray-600 mt-1">改訂詳細 - {revisionDetail.article}</p>
              </div>
            </div>
            
            {/* Status Badges */}
            <div className="flex space-x-2">
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
          </div>
          
          {/* Reason Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-medium mb-3">改訂理由</h3>
            <p className="text-gray-700 leading-relaxed">
              {revisionDetail.reason || '改正個人情報保護法に対応するため、個人情報の取り扱いに関する規定を強化する必要があります。現行の規約では法律が求める基準を満たしていないため、総会での承認を得て改訂を行います。'}
            </p>
          </div>

          {/* 規約の変更内容 */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-medium mb-6">規約の変更内容</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="flex items-center mb-3">
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm font-medium mr-3">現行</span>
                  <h4 className="font-medium text-gray-700">現在の規約条文</h4>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm leading-relaxed mb-3">
                    {revisionDetail.currentText || `第15条 管理組合は、区分所有者および居住者の個人情報を適切に管理し、必要な場合にのみ利用するものとする。`}
                  </p>
                  <div className="text-sm text-red-600">
                    ⚠️ 法的根拠が不明確
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center mb-3">
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm font-medium mr-3">改訂案</span>
                  <h4 className="font-medium text-gray-700">新しい規約条文</h4>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm leading-relaxed mb-3">
                    {revisionDetail.proposedText || `第15条 管理組合は、個人情報の保護に関する法律（平成15年法律第57号）に基づき、区分所有者および居住者の個人情報を適正に取り扱い、本人の同意を得た場合または法令に基づく場合を除き、目的外利用を行ってはならない。`}
                  </p>
                  <div className="text-sm text-green-600">
                    ✅ 法的要件を完全満足
                  </div>
                </div>
              </div>
            </div>

            {/* 変更のポイント - 最下段に配置 */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium mb-3">変更のポイント</h4>
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
              実施スケジュール
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
            <CardTitle>実施手順（4ステップ）</CardTitle>
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