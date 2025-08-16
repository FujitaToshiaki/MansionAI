import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Bot, Clock, CheckCircle, AlertTriangle, ArrowLeft, FileText, Settings, Zap } from "lucide-react";
import { Link } from "wouter";

export default function AIAgentExecutionDetail() {
  const { id, executionId } = useParams();

  // Mock detailed execution data
  const executionDetail = {
    id: 'exec_20250816_001',
    timestamp: '2025-08-16T06:30:00Z',
    status: 'completed',
    duration: '4分32秒',
    settings: {
      period: 'past_6_months',
      strictness: 'standard',
      lawRevision: true,
      standardRegulation: true,
      pastDecisions: true,
      additionalInstructions: '個人情報保護法の対応を重点的に分析してください。ペット飼育規定についても確認をお願いします。'
    },
    executionFlow: [
      {
        step: 1,
        name: '文書解析開始',
        status: 'completed',
        startTime: '06:30:02',
        endTime: '06:30:45',
        duration: '43秒',
        description: 'アップロードされた議事録を解析しています',
        details: '3件の議事録ファイルを処理。OCR精度97.2%で文字認識完了。',
        logs: [
          '議事録ファイル1: 2024年3月理事会議事録.pdf - 処理完了',
          '議事録ファイル2: 2024年6月総会議事録.pdf - 処理完了', 
          '議事録ファイル3: 2024年9月理事会議事録.pdf - 処理完了',
          'OCR処理完了: 総文字数 4,521文字'
        ]
      },
      {
        step: 2,
        name: '決議事項抽出',
        status: 'completed',
        startTime: '06:30:45',
        endTime: '06:31:28',
        duration: '43秒',
        description: 'AI が決議内容を識別・分類しています',
        details: '15件の決議事項を抽出。うち規約改定に関連する項目7件を特定。',
        logs: [
          '決議事項抽出開始: 自然言語処理による内容分析',
          '抽出完了: 15件の決議事項を特定',
          '規約関連決議: 7件 (個人情報2件、ペット飼育1件、修繕積立金2件、その他2件)',
          'AI信頼度: 92.4%'
        ]
      },
      {
        step: 3,
        name: '法改正チェック',
        status: 'completed',
        startTime: '06:31:28',
        endTime: '06:32:15',
        duration: '47秒',
        description: '最新の法改正との適合性を確認しています',
        details: '2025年区分所有法改正、個人情報保護法改正との適合性を検証。3件の不適合項目を発見。',
        logs: [
          '法改正データベース照合開始',
          '2025年区分所有法改正: 決議要件変更への対応要',
          '個人情報保護法改正: 第15条の改定が必要',
          '適合性チェック完了: 3件の不適合項目を特定'
        ]
      },
      {
        step: 4,
        name: '標準規約比較',
        status: 'completed',
        startTime: '06:32:15',
        endTime: '06:33:02',
        duration: '47秒',
        description: '標準管理規約との差分を分析しています',
        details: '令和6年改正標準管理規約との比較分析。2件の改善推奨項目を発見。',
        logs: [
          '標準管理規約データ読み込み完了',
          '条文単位での比較分析実行',
          '差分検出: 動物飼育規定、修繕積立金規定で改善余地あり',
          '推奨改定項目: 2件を特定'
        ]
      },
      {
        step: 5,
        name: '改訂案生成',
        status: 'completed',
        startTime: '06:33:02',
        endTime: '06:34:01',
        duration: '59秒',
        description: '規約改訂案を自動生成しています',
        details: '法的要件と決議内容を統合し、3件の改訂案を生成。各案に法的根拠と実装手順を付与。',
        logs: [
          '改訂案生成開始: 法的要件と決議内容の統合',
          '個人情報保護規定の追加 - 改訂案生成完了',
          'ペット飼育規定の緩和 - 改訂案生成完了',
          '決議要件の法改正対応 - 改訂案生成完了',
          '各改訂案に実装ガイドを付与'
        ]
      },
      {
        step: 6,
        name: '分析完了',
        status: 'completed',
        startTime: '06:34:01',
        endTime: '06:34:32',
        duration: '31秒',
        description: '結果をまとめています',
        details: '分析結果のレポート生成とデータベース保存が完了。',
        logs: [
          '分析結果レポート生成開始',
          '改訂項目優先度付け完了',
          'データベース保存完了',
          '実行ログ保存完了'
        ]
      }
    ],
    results: {
      totalIssues: 3,
      highPriority: 1,
      mediumPriority: 1,
      lowPriority: 1,
      summary: '個人情報保護法改正への対応が最優先。ペット飼育規定の緩和は決議に基づく改定として中優先度。決議要件の変更は法改正対応として低優先度だが確実な実装が必要。'
    }
  };

  const { data: condominium } = useQuery({
    queryKey: ['/api/condominiums', id],
  });

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'running':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-gray-300"></div>;
    }
  };

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('ja-JP'),
      time: date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const { date, time } = formatDateTime(executionDetail.timestamp);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500">
        <Link href="/condominiums" className="hover:text-gray-700">マンション一覧</Link>
        <span className="mx-2">{'>'}</span>
        <Link href={`/condominiums/${id}`} className="hover:text-gray-700">{condominium?.name || 'ローディング中...'}</Link>
        <span className="mx-2">{'>'}</span>
        <Link href={`/condominiums/${id}/regulation-analysis`} className="hover:text-gray-700">規約改訂分析</Link>
        <span className="mx-2">{'>'}</span>
        <Link href={`/condominiums/${id}/ai-agent-history`} className="hover:text-gray-700">AI実行履歴</Link>
        <span className="mx-2">{'>'}</span>
        <span>実行詳細</span>
      </nav>

      {/* Header */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <Bot className="w-5 h-5" />
                <h1 className="text-xl font-bold">AI分析実行詳細</h1>
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  実行完了
                </Badge>
              </div>
              <p className="text-gray-600 mt-1">実行ID: {executionDetail.id}</p>
            </div>
            
            <Link href={`/condominiums/${id}/ai-agent-history`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                履歴一覧に戻る
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <span className="text-gray-600">実行日時:</span>
              <p className="font-medium">{date} {time}</p>
            </div>
            <div>
              <span className="text-gray-600">実行時間:</span>
              <p className="font-medium">{executionDetail.duration}</p>
            </div>
            <div>
              <span className="text-gray-600">検出項目:</span>
              <p className="font-medium">{executionDetail.results.totalIssues}件</p>
            </div>
            <div>
              <span className="text-gray-600">処理ステップ:</span>
              <p className="font-medium">{executionDetail.executionFlow.length}段階</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Execution Settings */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              実行設定
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-sm text-gray-600">分析期間</span>
              <p className="font-medium">
                {executionDetail.settings.period === 'past_6_months' ? '過去6ヶ月' :
                 executionDetail.settings.period === 'past_1_year' ? '過去1年' : '全期間'}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">分析厳格度</span>
              <p className="font-medium">
                {executionDetail.settings.strictness === 'strict' ? '厳格' :
                 executionDetail.settings.strictness === 'standard' ? '標準' : '緩和'}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">チェック項目</span>
              <div className="space-y-1">
                {executionDetail.settings.lawRevision && <Badge variant="outline" className="mr-1">法改正チェック</Badge>}
                {executionDetail.settings.standardRegulation && <Badge variant="outline" className="mr-1">標準規約チェック</Badge>}
                {executionDetail.settings.pastDecisions && <Badge variant="outline" className="mr-1">過去決議チェック</Badge>}
              </div>
            </div>
            {executionDetail.settings.additionalInstructions && (
              <div>
                <span className="text-sm text-gray-600">追加指示</span>
                <p className="text-sm bg-gray-50 p-3 rounded border">
                  {executionDetail.settings.additionalInstructions}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Execution Results Summary */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              実行結果サマリー
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-sm text-gray-600">総検出項目数</span>
              <p className="text-2xl font-bold">{executionDetail.results.totalIssues}件</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">緊急度：高</span>
                <Badge className="bg-red-100 text-red-800">{executionDetail.results.highPriority}件</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">緊急度：中</span>
                <Badge className="bg-orange-100 text-orange-800">{executionDetail.results.mediumPriority}件</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">緊急度：低</span>
                <Badge className="bg-yellow-100 text-yellow-800">{executionDetail.results.lowPriority}件</Badge>
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-600">分析サマリー</span>
              <p className="text-sm bg-blue-50 p-3 rounded border">
                {executionDetail.results.summary}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Processing Progress */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              処理進捗状況
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">100%</div>
                <Progress value={100} className="mt-2" />
                <p className="text-sm text-gray-600 mt-2">全ステップ完了</p>
              </div>
              <div className="space-y-3">
                {executionDetail.executionFlow.map((step) => (
                  <div key={step.step} className="flex items-center space-x-3">
                    {getStepStatusIcon(step.status)}
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{step.name}</span>
                        <span className="text-xs text-gray-500">{step.duration}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Execution Flow */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>詳細実行フロー</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {executionDetail.executionFlow.map((step, index) => (
              <div key={step.step} className="border-l-4 border-blue-200 pl-6 pb-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{step.name}</h3>
                      <div className="flex items-center space-x-2">
                        {getStepStatusIcon(step.status)}
                        <span className="text-sm text-gray-500">{step.startTime} - {step.endTime}</span>
                        <Badge variant="outline">{step.duration}</Badge>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-3">{step.description}</p>
                    <div className="bg-gray-50 rounded-lg p-4 mb-3">
                      <h4 className="font-medium mb-2">処理詳細</h4>
                      <p className="text-sm">{step.details}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium mb-2">実行ログ</h4>
                      <div className="space-y-1">
                        {step.logs.map((log, logIndex) => (
                          <p key={logIndex} className="text-sm font-mono text-gray-700">
                            • {log}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}