import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, AlertTriangle, FileText, Bot, Settings } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function DecisionExtraction() {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: condominium } = useQuery({
    queryKey: ['/api/condominiums', id],
  });

  const { data: decisions } = useQuery({
    queryKey: ['/api/condominiums', id, 'decisions'],
  });

  const { data: extractionResults } = useQuery({
    queryKey: ['/api/condominiums', id, 'extraction-results'],
  });

  const confirmExtractionMutation = useMutation({
    mutationFn: async (confirmedDecisions: any[]) => {
      return apiRequest('POST', `/api/condominiums/${id}/confirm-decisions`, {
        decisions: confirmedDecisions
      });
    },
    onSuccess: () => {
      toast({
        title: "分類確定完了",
        description: "決議事項の分類が確定されました。",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/condominiums', id, 'decisions'] });
    },
  });

  const getStatusColor = (confidence: number) => {
    if (confidence >= 95) return "text-green-600";
    if (confidence >= 80) return "text-orange-600";
    return "text-red-600";
  };

  const getStatusIcon = (confidence: number) => {
    if (confidence >= 95) return <CheckCircle className="inline w-4 h-4" />;
    return <AlertTriangle className="inline w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500">
        <Link href="/condominiums" className="hover:text-gray-700">マンション一覧</Link>
        <span className="mx-2">{'>'}</span>
        <Link href={`/condominiums/${id}`} className="hover:text-gray-700">{condominium?.name}</Link>
        <span className="mx-2">{'>'}</span>
        <span>決議事項抽出・分類</span>
      </nav>

      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>決議事項抽出結果</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800">
              <Bot className="inline mr-2" size={16} />
              抽出完了: 理事会議事録から<strong>{extractionResults?.totalDecisions || 0}件</strong>の決議事項を検出しました
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Extracted Decisions Table */}
      <Card>
        <CardHeader>
          <CardTitle>抽出された決議事項一覧</CardTitle>
        </CardHeader>
        <CardContent>
          {decisions?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No</TableHead>
                  <TableHead>決議事項</TableHead>
                  <TableHead>結果</TableHead>
                  <TableHead>票数</TableHead>
                  <TableHead>関連規約条文</TableHead>
                  <TableHead>分類</TableHead>
                  <TableHead>自動判定</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {decisions.map((decision: any, index: number) => (
                  <TableRow key={decision.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{decision.title}</p>
                        {decision.description && (
                          <p className="text-sm text-gray-600 mt-1">{decision.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        decision.result === 'approved' ? 'default' :
                        decision.result === 'rejected' ? 'destructive' : 'secondary'
                      }>
                        {decision.result === 'approved' ? '可決' :
                         decision.result === 'rejected' ? '否決' : '保留'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {decision.votingResults && (
                        <div className="text-sm">
                          <div>賛成{decision.votingResults.favor}</div>
                          <div>反対{decision.votingResults.against}</div>
                          <div>棄権{decision.votingResults.abstain}</div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-blue-600">
                        {decision.relatedRegulationArticle || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Select defaultValue={decision.category}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="regulation_management">規約管理</SelectItem>
                          <SelectItem value="financial">財務・会計</SelectItem>
                          <SelectItem value="facilities">設備・修繕</SelectItem>
                          <SelectItem value="operations">運営・管理</SelectItem>
                          <SelectItem value="other">その他</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className={`flex items-center space-x-1 ${getStatusColor(decision.confidence || 0)}`}>
                        {getStatusIcon(decision.confidence || 0)}
                        <span className="text-sm">
                          {decision.confidence >= 95 ? '◯' : decision.confidence >= 80 ? '△' : '×'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        編集
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="mx-auto mb-4" size={48} />
              <p>抽出された決議事項がありません</p>
              <p className="text-sm">議事録をアップロードして OCR 処理を実行してください</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Classification Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2" size={20} />
              分類設定
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <Checkbox defaultChecked />
                <span>規約管理</span>
              </label>
              <label className="flex items-center space-x-2">
                <Checkbox defaultChecked />
                <span>財務・会計</span>
              </label>
              <label className="flex items-center space-x-2">
                <Checkbox defaultChecked />
                <span>設備・修繕</span>
              </label>
              <label className="flex items-center space-x-2">
                <Checkbox defaultChecked />
                <span>運営・管理</span>
              </label>
              <label className="flex items-center space-x-2">
                <Checkbox />
                <span>その他</span>
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>関連条文自動検索</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-900 mb-2">現在の規約第3条:</p>
              <p className="text-sm text-gray-700 mb-3">
                「動物の飼育は原則として禁止する」
              </p>
              <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
                → 改正が必要な可能性があります
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <Button variant="outline">
          手動補正
        </Button>
        
        <div className="flex space-x-3">
          <Button 
            onClick={() => confirmExtractionMutation.mutate(decisions || [])}
            disabled={confirmExtractionMutation.isPending}
            variant="outline"
          >
            分類確定
          </Button>
          <Link href={`/condominiums/${id}/analysis`}>
            <Button className="bg-purple-600 hover:bg-purple-700">
              次のステップへ - 規約分析
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
