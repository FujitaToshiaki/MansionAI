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

      {/* 改訂根拠サマリ */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2" />
            改訂根拠サマリ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-600">法的根拠:</span>
                <p className="font-medium">{revisionDetail.legalBasis || '改正個人情報保護法(2024年)'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">標準規約:</span>
                <p className="font-medium">{revisionDetail.standardRegulationRef || '第15条改定内容との整合性'}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-600">過去決議:</span>
                <p className="font-medium">{revisionDetail.relatedDecision || '2023年度総会方針決定'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">影響度:</span>
                <Badge variant={
                  revisionDetail.impact === 'high' ? 'destructive' :
                  revisionDetail.impact === 'medium' ? 'secondary' : 'outline'
                }>
                  {revisionDetail.impact === 'high' ? '高（法的義務）' :
                   revisionDetail.impact === 'medium' ? '中（推奨対応）' : '低（任意対応）'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Before / After 比較 */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>📊 Before / After 比較</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-700 mb-3">Before (現行)</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm whitespace-pre-line">
                  {revisionDetail.currentText || `第15条 管理組合は、区分所有者および居住者の個人情報を適切に管理し、必要な場合にのみ利用するものとする。`}
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-3">After (改訂案)</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm whitespace-pre-line">
                  {revisionDetail.proposedText || `第15条 管理組合は、個人情報の保護に関する法律（平成15年法律第57号）に基づき、区分所有者および居住者の個人情報を適正に取り扱い、本人の同意を得た場合または法令に基づく場合を除き、目的外利用を行ってはならない。`}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 条項変更履歴・時系列 */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            条項変更履歴・時系列
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {revisionDetail.changeHistory?.map((history: any, index: number) => (
              <div key={index} className="flex items-start space-x-4 border-l-2 border-gray-200 pl-4 pb-4">
                <div className="flex-shrink-0">
                  <div className={`w-3 h-3 rounded-full mt-1 ${
                    history.type === 'required' ? 'bg-red-500' :
                    history.type === 'approved' ? 'bg-green-500' :
                    history.type === 'modified' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">{history.date}</span>
                    <Badge variant="outline" className="text-xs">
                      {history.type === 'required' ? '改訂必要' :
                       history.type === 'approved' ? '方針決定' :
                       history.type === 'modified' ? '一部修正' : '初回制定'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{history.description}</p>
                  {history.details && (
                    <p className="text-xs text-gray-500 mt-1">{history.details}</p>
                  )}
                </div>
              </div>
            )) || (
              <div className="space-y-4">
                <div className="flex items-start space-x-4 border-l-2 border-gray-200 pl-4 pb-4">
                  <div className="flex-shrink-0">
                    <div className="w-3 h-3 rounded-full mt-1 bg-red-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">2024-12-15</span>
                      <Badge variant="outline" className="text-xs">改訂必要</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">法改正による必要性判定</p>
                    <p className="text-xs text-gray-500 mt-1">根拠: 個人情報保護法改正</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 border-l-2 border-gray-200 pl-4 pb-4">
                  <div className="flex-shrink-0">
                    <div className="w-3 h-3 rounded-full mt-1 bg-green-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">2023-03-15</span>
                      <Badge variant="outline" className="text-xs">方針決定</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">定期総会にて個人情報保護強化を決議</p>
                    <p className="text-xs text-gray-500 mt-1">決議内容: プライバシー方針策定</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 border-l-2 border-gray-200 pl-4 pb-4">
                  <div className="flex-shrink-0">
                    <div className="w-3 h-3 rounded-full mt-1 bg-yellow-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">2022-06-10</span>
                      <Badge variant="outline" className="text-xs">一部修正</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">個人情報の定義を明確化</p>
                    <p className="text-xs text-gray-500 mt-1">変更箇所: 第15条第2項追加</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 border-l-2 border-gray-200 pl-4">
                  <div className="flex-shrink-0">
                    <div className="w-3 h-3 rounded-full mt-1 bg-blue-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">2020-04-01</span>
                      <Badge variant="outline" className="text-xs">初回制定</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">管理規約制定時の原文</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* データソース */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="w-5 h-5 mr-2" />
            データソース
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {revisionDetail.dataSources?.map((source: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-sm">{source}</span>
              </div>
            )) || (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-sm">標準管理規約 第15条 (2024年改定版)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-sm">2023年度定期総会議事録 第3号議案</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-sm">個人情報保護法改正資料（国交省）</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-sm">類似管理組合事例（3件）</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 実装時の注意事項 */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="w-5 h-5 mr-2" />
            実装時の注意事項
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {revisionDetail.implementationNotes?.split('\n').map((note: string, index: number) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                <span className="text-sm">{note}</span>
              </div>
            )) || (
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">既存の個人情報取扱規程との整合性確認</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">区分所有者への事前周知期間の確保</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">管理会社との契約書見直しの必要性</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}