import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CheckCircle, Clock, FileText, Bot, Gavel } from "lucide-react";
import { Link } from "wouter";

export default function RegulationAnalysis() {
  const { id } = useParams();

  const { data: condominium } = useQuery({
    queryKey: ['/api/condominiums', id],
  });

  const { data: analysisResults } = useQuery({
    queryKey: ['/api/condominiums', id, 'regulation-analysis'],
  });

  const { data: currentRegulations } = useQuery({
    queryKey: ['/api/condominiums', id, 'regulations'],
  });

  const { data: standardRegulations } = useQuery({
    queryKey: ['/api/standard-regulations'],
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500">
        <Link href="/condominiums" className="hover:text-gray-700">マンション一覧</Link>
        <span className="mx-2">{'>'}</span>
        <Link href={`/condominiums/${id}`} className="hover:text-gray-700">{condominium?.name}</Link>
        <span className="mx-2">{'>'}</span>
        <span>規約改訂分析</span>
      </nav>

      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>規約改訂分析結果</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">分析対象:</span>
              <p className="font-medium">{condominium?.name} 管理規約</p>
            </div>
            <div>
              <span className="text-gray-600">分析基準:</span>
              <p className="font-medium">2025年区分所有法改正 + 過去決議履歴</p>
            </div>
            <div>
              <span className="text-gray-600">分析完了:</span>
              <p className="font-medium">{new Date().toLocaleDateString('ja-JP')} {new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div>
              <span className="text-gray-600">検出項目:</span>
              <p className="font-medium">{analysisResults?.totalIssues || 0}箇所</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>改訂必要箇所一覧</CardTitle>
        </CardHeader>
        <CardContent>
          {analysisResults?.issues?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>優先度</TableHead>
                  <TableHead>条文</TableHead>
                  <TableHead>改訂理由</TableHead>
                  <TableHead>関連決議</TableHead>
                  <TableHead>法改正</TableHead>
                  <TableHead>影響度</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analysisResults.issues.map((issue: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Badge className={getPriorityColor(issue.priority)}>
                        <div className="flex items-center space-x-1">
                          {getPriorityIcon(issue.priority)}
                          <span>
                            {issue.priority === 'high' ? '高' :
                             issue.priority === 'medium' ? '中' : '低'}
                          </span>
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{issue.article}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{issue.title}</p>
                        <p className="text-sm text-gray-600">{issue.reason}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {issue.relatedDecision ? (
                        <div className="text-sm">
                          <p>{issue.relatedDecision.date}</p>
                          <p className="text-gray-600">{issue.relatedDecision.type}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {issue.lawRevision ? (
                        <Badge variant={issue.lawRevision.required ? 'destructive' : 'secondary'}>
                          {issue.lawRevision.required ? '◯対応必須' : '△推奨'}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        issue.impact === 'high' ? 'destructive' :
                        issue.impact === 'medium' ? 'secondary' : 'outline'
                      }>
                        {issue.impact === 'high' ? '高' :
                         issue.impact === 'medium' ? '中' : '低'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        詳細
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Bot className="mx-auto mb-4" size={48} />
              <p>分析結果がありません</p>
              <p className="text-sm">決議事項の抽出と分類を先に実行してください</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Regulation Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="bg-gray-50">
            <CardTitle className="flex items-center">
              <FileText className="mr-2" size={20} />
              現行条文表示
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <Tabs defaultValue="article3" className="space-y-4">
              <TabsList>
                <TabsTrigger value="article3">第3条</TabsTrigger>
                <TabsTrigger value="article15">第15条</TabsTrigger>
                <TabsTrigger value="article25">第25条</TabsTrigger>
              </TabsList>
              
              <TabsContent value="article3" className="space-y-3">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">第3条（動物の飼育）</h4>
                  <p className="text-sm text-gray-700">
                    動物の飼育は原則として禁止する。
                  </p>
                  <div className="mt-3 p-2 bg-red-50 rounded text-xs text-red-700">
                    ⚠️ 2024年3月理事会決議との不整合
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="article15" className="space-y-3">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">第15条（決議要件）</h4>
                  <p className="text-sm text-gray-700">
                    重要事項の決議は組合員の5分の4以上の賛成を必要とする。
                  </p>
                  <div className="mt-3 p-2 bg-red-50 rounded text-xs text-red-700">
                    ⚠️ 法改正により4分の3に変更が必要
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="article25" className="space-y-3">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">第25条（修繕積立金）</h4>
                  <p className="text-sm text-gray-700">
                    修繕積立金は月額○○円とする。
                  </p>
                  <div className="mt-3 p-2 bg-orange-50 rounded text-xs text-orange-700">
                    ⚠️ 2024年3月理事会決議で値上げ決定
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-green-50">
            <CardTitle className="flex items-center">
              <Gavel className="mr-2" size={20} />
              標準規約条文
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <Tabs defaultValue="standard3" className="space-y-4">
              <TabsList>
                <TabsTrigger value="standard3">第3条</TabsTrigger>
                <TabsTrigger value="standard15">第15条</TabsTrigger>
                <TabsTrigger value="standard25">第25条</TabsTrigger>
              </TabsList>
              
              <TabsContent value="standard3" className="space-y-3">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">第3条（動物の飼育）</h4>
                  <p className="text-sm text-gray-700">
                    専有部分での動物の飼育は、理事会の承認を得た場合に限り認める。
                  </p>
                  <div className="mt-3 p-2 bg-green-50 rounded text-xs text-green-700">
                    💡 2025年標準規約改正版
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="standard15" className="space-y-3">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">第15条（決議要件）</h4>
                  <p className="text-sm text-gray-700">
                    重要事項の決議は組合員の4分の3以上の賛成を必要とする。
                  </p>
                  <div className="mt-3 p-2 bg-green-50 rounded text-xs text-green-700">
                    💡 2025年法改正対応済み
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="standard25" className="space-y-3">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">第25条（修繕積立金）</h4>
                  <p className="text-sm text-gray-700">
                    修繕積立金は管理組合が定める額とし、理事会で決定する。
                  </p>
                  <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
                    💡 柔軟な金額設定が可能
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Action Button */}
      <div className="flex justify-center">
        <Link href={`/condominiums/${id}/ai-revision`}>
          <Button size="lg" className="bg-purple-600 hover:bg-purple-700 px-8">
            <Bot className="mr-2" size={20} />
            AI改訂案生成開始
          </Button>
        </Link>
      </div>
    </div>
  );
}
