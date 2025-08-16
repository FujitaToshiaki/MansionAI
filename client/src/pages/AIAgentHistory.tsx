import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bot, Clock, CheckCircle, AlertTriangle, ArrowLeft, Eye } from "lucide-react";
import { Link } from "wouter";

export default function AIAgentHistory() {
  const { id } = useParams();

  // Check if we're in global view (no condominium ID) or condominium-specific view
  const isGlobalView = !id;

  // Mock data for AI agent execution history
  const aiHistory = [
    {
      id: 1,
      executionId: 'exec_20250816_001',
      timestamp: '2025-08-16T06:30:00Z',
      status: 'completed',
      duration: '4分32秒',
      settings: {
        period: 'past_6_months',
        strictness: 'standard',
        lawRevision: true,
        standardRegulation: true,
        additionalInstructions: '個人情報保護法の対応を重点的に分析してください'
      },
      results: {
        issuesFound: 3,
        highPriority: 1,
        mediumPriority: 1,
        lowPriority: 1
      }
    },
    {
      id: 2,
      executionId: 'exec_20250815_002',
      timestamp: '2025-08-15T14:20:00Z',
      status: 'completed',
      duration: '3分18秒',
      settings: {
        period: 'past_1_year',
        strictness: 'strict',
        lawRevision: true,
        standardRegulation: false,
        additionalInstructions: ''
      },
      results: {
        issuesFound: 5,
        highPriority: 2,
        mediumPriority: 2,
        lowPriority: 1
      }
    },
    {
      id: 3,
      executionId: 'exec_20250814_001',
      timestamp: '2025-08-14T10:15:00Z',
      status: 'failed',
      duration: '1分45秒',
      settings: {
        period: 'all_period',
        strictness: 'relaxed',
        lawRevision: false,
        standardRegulation: true,
        additionalInstructions: 'ペット飼育規定についても確認をお願いします'
      },
      results: null,
      error: 'データ処理中にエラーが発生しました'
    }
  ];

  const { data: condominium } = useQuery({
    queryKey: ['/api/condominiums', id],
    enabled: !!id,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />完了</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />失敗</Badge>;
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />実行中</Badge>;
      default:
        return <Badge variant="outline">不明</Badge>;
    }
  };

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('ja-JP'),
      time: date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500">
        {isGlobalView ? (
          <>
            <Link href="/" className="hover:text-gray-700">ダッシュボード</Link>
            <span className="mx-2">{'>'}</span>
            <span>AI履歴</span>
          </>
        ) : (
          <>
            <Link href="/condominiums" className="hover:text-gray-700">マンション一覧</Link>
            <span className="mx-2">{'>'}</span>
            <Link href={`/condominiums/${id}`} className="hover:text-gray-700">{condominium?.name || 'ローディング中...'}</Link>
            <span className="mx-2">{'>'}</span>
            <Link href={`/condominiums/${id}/regulation-analysis`} className="hover:text-gray-700">規約改訂分析</Link>
            <span className="mx-2">{'>'}</span>
            <span>AIエージェント実行履歴</span>
          </>
        )}
      </nav>

      {/* Header */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5" />
                <h1 className="text-xl font-bold">{isGlobalView ? 'AI履歴' : 'AIエージェント実行履歴'}</h1>
              </div>
              <p className="text-gray-600 mt-1">{isGlobalView ? '全マンションのAI分析実行記録' : 'AI分析の実行記録と処理詳細'}</p>
            </div>
            
            {!isGlobalView && (
              <Link href={`/condominiums/${id}/regulation-analysis`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  分析結果に戻る
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {!isGlobalView && (
              <div>
                <span className="text-gray-600">対象マンション:</span>
                <p className="font-medium">{condominium?.name || 'ローディング中...'}</p>
              </div>
            )}
            <div>
              <span className="text-gray-600">総実行回数:</span>
              <p className="font-medium">{aiHistory.length}回</p>
            </div>
            <div>
              <span className="text-gray-600">最終実行:</span>
              <p className="font-medium">{formatDateTime(aiHistory[0].timestamp).date} {formatDateTime(aiHistory[0].timestamp).time}</p>
            </div>
            {isGlobalView && (
              <div>
                <span className="text-gray-600">対象範囲:</span>
                <p className="font-medium">全マンション</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Execution History Table */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>実行履歴一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>実行ID</TableHead>
                <TableHead>実行日時</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>実行時間</TableHead>
                <TableHead>検出項目数</TableHead>
                <TableHead>設定条件</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aiHistory.map((execution) => {
                const { date, time } = formatDateTime(execution.timestamp);
                return (
                  <TableRow key={execution.id}>
                    <TableCell className="font-mono text-sm">{execution.executionId}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{date}</p>
                        <p className="text-sm text-gray-600">{time}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(execution.status)}</TableCell>
                    <TableCell>{execution.duration}</TableCell>
                    <TableCell>
                      {execution.results ? (
                        <div className="space-y-1">
                          <p className="font-medium">{execution.results.issuesFound}件</p>
                          <div className="text-xs space-x-2">
                            <span className="text-red-600">高:{execution.results.highPriority}</span>
                            <span className="text-orange-600">中:{execution.results.mediumPriority}</span>
                            <span className="text-yellow-600">低:{execution.results.lowPriority}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-xs">
                        <p>期間: {
                          execution.settings.period === 'past_6_months' ? '過去6ヶ月' :
                          execution.settings.period === 'past_1_year' ? '過去1年' : '全期間'
                        }</p>
                        <p>厳格度: {
                          execution.settings.strictness === 'strict' ? '厳格' :
                          execution.settings.strictness === 'standard' ? '標準' : '緩和'
                        }</p>
                        <div className="flex space-x-1">
                          {execution.settings.lawRevision && <Badge variant="outline" className="text-xs px-1 py-0">法改正</Badge>}
                          {execution.settings.standardRegulation && <Badge variant="outline" className="text-xs px-1 py-0">標準規約</Badge>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link href={`/condominiums/${id}/ai-agent-history/${execution.executionId}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          詳細
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}