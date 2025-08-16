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

      {/* Header */}
      <Card className="bg-white">
        <CardHeader>
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
        </CardHeader>
      </Card>

      {/* 改訂の必要性 */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center">
            📋 なぜこの改訂が必要なのか
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">改訂理由</h3>
              <p className="text-sm text-blue-800">
                {revisionDetail.reason || '改正個人情報保護法に対応するため、個人情報の取り扱いに関する規定を強化する必要があります。現行の規約では法律が求める基準を満たしていないため、総会での承認を得て改訂を行います。'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <h4 className="font-medium text-red-900 text-sm mb-1">緊急度</h4>
                <Badge variant={
                  revisionDetail.impact === 'high' ? 'destructive' :
                  revisionDetail.impact === 'medium' ? 'secondary' : 'outline'
                }>
                  {revisionDetail.impact === 'high' ? '高（法的義務のため必須）' :
                   revisionDetail.impact === 'medium' ? '中（推奨対応）' : '低（任意対応）'}
                </Badge>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <h4 className="font-medium text-yellow-900 text-sm mb-1">法的対応</h4>
                <span className="text-sm">
                  {revisionDetail.lawRevisionRequired ? '法改正対応が必要' : '組合内改善事項'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 規約の変更内容 */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>📝 規約の変更内容</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 変更点の説明 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">📌 変更のポイント</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>個人情報保護法の法律名と条文番号を明記し、法的根拠を明確化</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>「適切な管理」から「適正な取り扱い」へ表現を法律用語に統一</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>個人情報の利用条件を「本人同意」または「法令根拠」に限定して強化</span>
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center mb-3">
                  <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium mr-2">現行</span>
                  <h3 className="font-medium text-gray-700">現在の規約条文</h3>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm leading-relaxed">
                    {revisionDetail.currentText || `第15条 管理組合は、区分所有者および居住者の個人情報を適切に管理し、必要な場合にのみ利用するものとする。`}
                  </p>
                  <div className="mt-3 text-xs text-red-600">
                    ⚠️ 法的根拠が不明確で、個人情報保護法の要件を満たしていません
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center mb-3">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium mr-2">改訂案</span>
                  <h3 className="font-medium text-gray-700">新しい規約条文</h3>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm leading-relaxed">
                    {revisionDetail.proposedText || `第15条 管理組合は、個人情報の保護に関する法律（平成15年法律第57号）に基づき、区分所有者および居住者の個人情報を適正に取り扱い、本人の同意を得た場合または法令に基づく場合を除き、目的外利用を行ってはならない。`}
                  </p>
                  <div className="mt-3 text-xs text-green-600">
                    ✅ 法的根拠が明確で、個人情報保護法の要件を完全に満たします
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 実施手順とスケジュール */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            改訂の実施手順とスケジュール
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-medium text-yellow-900 mb-2">⏰ 実施予定</h3>
              <p className="text-sm text-yellow-800">
                この改訂は法改正対応のため、<strong>3ヶ月以内</strong>に実施することが推奨されます。
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-gray-800">📋 実施手順</h3>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">1</div>
                  <div>
                    <h4 className="font-medium text-sm">理事会での議案準備</h4>
                    <p className="text-xs text-gray-600 mt-1">改訂案の最終確認と総会議案書の作成（所要期間：1-2週間）</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">2</div>
                  <div>
                    <h4 className="font-medium text-sm">組合員への事前通知</h4>
                    <p className="text-xs text-gray-600 mt-1">改訂内容の説明と総会開催通知の発送（総会の2週間前までに必須）</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">3</div>
                  <div>
                    <h4 className="font-medium text-sm">臨時総会での決議</h4>
                    <p className="text-xs text-gray-600 mt-1">組合員の4分の3以上の賛成で可決（区分所有法第31条）</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">4</div>
                  <div>
                    <h4 className="font-medium text-sm">改訂規約の施行</h4>
                    <p className="text-xs text-gray-600 mt-1">決議後すぐに効力発生、組合員への新規約配布</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* よくある質問 */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center">
            💡 よくある質問
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">Q. この改訂をしないとどうなりますか？</h4>
              <p className="text-sm text-gray-600">
                個人情報保護法に準拠していない規約のままでは、万が一個人情報の漏洩事故が発生した場合に、法的責任を問われる可能性があります。また、行政指導の対象になることもあります。
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">Q. 総会での決議要件は？</h4>
              <p className="text-sm text-gray-600">
                規約改正は区分所有法第31条により、区分所有者及び議決権の各4分の3以上の賛成が必要です。重要な決議のため、事前の説明と理解促進が重要です。
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">Q. 費用はかかりますか？</h4>
              <p className="text-sm text-gray-600">
                規約改訂自体に直接の費用はかかりませんが、臨時総会の開催費用（会場費、資料印刷費など）や司法書士等への相談費用が発生する場合があります。
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">Q. 他のマンションでも同様の改訂を行っていますか？</h4>
              <p className="text-sm text-gray-600">
                はい。個人情報保護法の改正に伴い、多くのマンション管理組合で同様の規約改訂が行われています。国土交通省も標準管理規約を改正して対応を推奨しています。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 準備すべき資料と注意点 */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="w-5 h-5 mr-2" />
            準備すべき資料と注意点
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-800 mb-3">📂 準備すべき資料</h3>
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">現行規約と改訂案の対照表（組合員への説明用）</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">個人情報保護法改正の説明資料（国交省資料等）</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">臨時総会の議事次第と議案書</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">委任状（欠席者用）</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-800 mb-3">⚠️ 実施時の注意点</h3>
              <div className="space-y-3">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <h4 className="font-medium text-yellow-900 text-sm mb-1">管理会社との調整</h4>
                  <p className="text-xs text-yellow-800">
                    管理委託契約書の個人情報取扱条項も同時に見直しが必要な場合があります
                  </p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <h4 className="font-medium text-yellow-900 text-sm mb-1">組合員への説明</h4>
                  <p className="text-xs text-yellow-800">
                    法改正の必要性を分かりやすく説明し、理解と協力を得ることが重要です
                  </p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <h4 className="font-medium text-yellow-900 text-sm mb-1">決議要件の確保</h4>
                  <p className="text-xs text-yellow-800">
                    4分の3以上の賛成が必要なため、事前の意見調整を十分に行いましょう
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}