import { useParams } from "wouter";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Bot, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Edit,
  Save,
  Download,
  Sparkles
} from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AIRevisionGeneration() {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOption, setSelectedOption] = useState<string>("option1");
  const [customEdit, setCustomEdit] = useState<string>("");
  const [generationProgress, setGenerationProgress] = useState(0);
  const [activeArticle, setActiveArticle] = useState("article3");

  const { data: condominium } = useQuery({
    queryKey: ['/api/condominiums', id],
  });

  const { data: revisionOptions } = useQuery({
    queryKey: ['/api/condominiums', id, 'ai-revision-options'],
  });

  const { data: generationStatus } = useQuery({
    queryKey: ['/api/condominiums', id, 'ai-generation-status'],
    refetchInterval: generationProgress > 0 && generationProgress < 100 ? 1000 : false,
  });

  const generateRevisionMutation = useMutation({
    mutationFn: async (article: string) => {
      return apiRequest('POST', `/api/condominiums/${id}/generate-ai-revision`, {
        article
      });
    },
    onSuccess: () => {
      toast({
        title: "AI改訂案生成開始",
        description: "改訂案の生成を開始しました。",
      });
      setGenerationProgress(0);
      queryClient.invalidateQueries({ queryKey: ['/api/condominiums', id, 'ai-revision-options'] });
    },
  });

  const confirmRevisionMutation = useMutation({
    mutationFn: async (revisionData: any) => {
      return apiRequest('POST', `/api/condominiums/${id}/confirm-revision`, revisionData);
    },
    onSuccess: () => {
      toast({
        title: "改訂案確定完了",
        description: "選択された改訂案が確定されました。",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/condominiums', id, 'regulations'] });
    },
  });

  const mockRevisionOptions = [
    {
      id: "option1",
      type: "decision_based",
      title: "決議内容重視型",
      content: "専有部分における動物の飼育は、理事会の承認を得た場合に限り認める。ただし、小型犬・猫に限定し、1戸につき1匹までとする。",
      rationale: "2024年3月理事会決議",
      reason: "過去決議との整合性確保",
      confidence: 95
    },
    {
      id: "option2", 
      type: "standard_based",
      title: "標準規約準拠型",
      content: "専有部分における動物の飼育は、理事会の承認を得た場合に限り認める。",
      rationale: "標準管理規約第3条",
      reason: "標準的な規定で将来の変更が容易",
      confidence: 88
    },
    {
      id: "option3",
      type: "custom_maintained", 
      title: "独自規定維持型",
      content: "動物の飼育は原則として禁止する。ただし、理事会が特に認めた場合はこの限りでない。",
      rationale: "現行規約の基本方針維持",
      reason: "従来の厳格な方針を一部緩和",
      confidence: 78
    }
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500">
        <Link href="/condominiums" className="hover:text-gray-700">マンション一覧</Link>
        <span className="mx-2">{'>'}</span>
        <Link href={`/condominiums/${id}`} className="hover:text-gray-700">{condominium?.name}</Link>
        <span className="mx-2">{'>'}</span>
        <Link href={`/condominiums/${id}/analysis`} className="hover:text-gray-700">規約改訂分析</Link>
        <span className="mx-2">{'>'}</span>
        <span>AI改訂案生成</span>
      </nav>

      {/* Header */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bot className="mr-2" size={24} />
            AI改訂案生成
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">生成対象:</span>
              <p className="font-medium">第3条（動物の飼育規定）</p>
            </div>
            <div>
              <span className="text-gray-600">生成完了:</span>
              <p className="font-medium">{new Date().toLocaleDateString('ja-JP')} {new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div>
              <span className="text-gray-600">生成状況:</span>
              <Badge variant="default" className="ml-1">
                <CheckCircle className="mr-1" size={12} />
                完了
              </Badge>
            </div>
          </div>

          {/* Generation Progress */}
          {generationProgress > 0 && generationProgress < 100 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">AI処理中...</span>
                <span className="text-sm text-gray-600">{generationProgress}%</span>
              </div>
              <Progress value={generationProgress} className="h-2" />
              <div className="mt-2 flex items-center text-sm text-blue-600">
                <Sparkles className="mr-1" size={14} />
                <span>条文の整合性をチェック中...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revision Options */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>改訂案選択</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
            <div className="space-y-6">
              {mockRevisionOptions.map((option) => (
                <div key={option.id} className="relative">
                  <div className="flex items-start space-x-4">
                    <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                    <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                      <Card className={`bg-white transition-colors ${selectedOption === option.id ? 'border-purple-200' : 'hover:bg-gray-50'}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{option.title}</CardTitle>
                            <div className="flex items-center space-x-2">
                              <Badge variant={option.confidence >= 90 ? 'default' : 'secondary'}>
                                信頼度 {option.confidence}%
                              </Badge>
                              {option.confidence >= 90 && <CheckCircle className="text-green-600" size={16} />}
                              {option.confidence < 90 && option.confidence >= 80 && <Clock className="text-orange-600" size={16} />}
                              {option.confidence < 80 && <AlertTriangle className="text-red-600" size={16} />}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            <div className="bg-white rounded-lg p-4 border">
                              <p className="font-medium text-gray-900 mb-2">第3条（動物の飼育）</p>
                              <p className="text-sm text-gray-700 leading-relaxed">{option.content}</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              <div className="bg-blue-50 p-3 rounded">
                                <p className="font-medium text-blue-900">根拠</p>
                                <p className="text-blue-700">{option.rationale}</p>
                              </div>
                              <div className="bg-green-50 p-3 rounded">
                                <p className="font-medium text-green-900">採用理由</p>
                                <p className="text-green-700">{option.reason}</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Label>
                  </div>
                </div>
              ))}
              
              {/* Manual Edit Option */}
              <div className="relative">
                <div className="flex items-start space-x-4">
                  <RadioGroupItem value="manual" id="manual" className="mt-1" />
                  <Label htmlFor="manual" className="flex-1 cursor-pointer">
                    <Card className={`transition-colors ${selectedOption === 'manual' ? 'bg-purple-50 border-purple-200' : 'hover:bg-gray-50'}`}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center">
                          <Edit className="mr-2" size={16} />
                          手動編集
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <Textarea 
                          placeholder="独自の改訂案を入力してください..."
                          value={customEdit}
                          onChange={(e) => setCustomEdit(e.target.value)}
                          className="h-24"
                          disabled={selectedOption !== 'manual'}
                        />
                        {selectedOption === 'manual' && (
                          <div className="mt-2 text-sm text-gray-600">
                            <p>• AI提案をベースに手動で調整可能</p>
                            <p>• 法的要件との整合性は自動チェックされます</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Label>
                </div>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Preview and Comparison */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>改訂内容プレビュー</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="comparison" className="space-y-4">
            <TabsList>
              <TabsTrigger value="comparison">新旧対照</TabsTrigger>
              <TabsTrigger value="impact">影響分析</TabsTrigger>
              <TabsTrigger value="legal">法的検証</TabsTrigger>
            </TabsList>
            
            <TabsContent value="comparison">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white">
                  <CardHeader className="bg-white">
                    <CardTitle className="text-base text-red-900">改訂前（現行）</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <p className="font-medium">第3条（動物の飼育）</p>
                      <p className="text-sm text-gray-700">
                        動物の飼育は原則として禁止する。
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white">
                  <CardHeader className="bg-white">
                    <CardTitle className="text-base text-green-900">改訂後（提案）</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <p className="font-medium">第3条（動物の飼育）</p>
                      <p className="text-sm text-gray-700">
                        {selectedOption === 'manual' ? customEdit : 
                         mockRevisionOptions.find(opt => opt.id === selectedOption)?.content || '改訂案を選択してください'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="impact">
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">管理組合への影響</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• 理事会での承認プロセスが必要</li>
                    <li>• ペット飼育に関する細則の策定が推奨</li>
                    <li>• 近隣トラブル対応体制の整備</li>
                  </ul>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-medium text-orange-900 mb-2">住民への影響</h4>
                  <ul className="text-sm text-orange-800 space-y-1">
                    <li>• 既存飼育者の届出手続きが必要</li>
                    <li>• 新規飼育希望者の申請プロセス</li>
                    <li>• ペット保険加入の推奨</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="legal">
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="text-green-600 mr-2" size={16} />
                    <h4 className="font-medium text-green-900">法的適合性</h4>
                  </div>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>✓ 区分所有法第30条との整合性確認</li>
                    <li>✓ 標準管理規約との適合性確認</li>
                    <li>✓ 過去判例との整合性確認</li>
                  </ul>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="text-yellow-600 mr-2" size={16} />
                    <h4 className="font-medium text-yellow-900">注意事項</h4>
                  </div>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• 総会での承認が必要（普通決議）</li>
                    <li>• 施行日は総会での決定が必要</li>
                    <li>• 周知期間を十分に設ける必要がある</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-3">
          <Button 
            variant="outline"
            onClick={() => generateRevisionMutation.mutate(activeArticle)}
            disabled={generateRevisionMutation.isPending}
          >
            <Bot className="mr-2" size={16} />
            {generateRevisionMutation.isPending ? '再生成中...' : '再生成'}
          </Button>
          <Button variant="outline">
            <Download className="mr-2" size={16} />
            プレビュー出力
          </Button>
        </div>
        
        <div className="flex space-x-3">
          <Button 
            onClick={() => confirmRevisionMutation.mutate({
              selectedOption,
              customEdit: selectedOption === 'manual' ? customEdit : '',
              article: 'article3'
            })}
            disabled={confirmRevisionMutation.isPending || (!selectedOption || (selectedOption === 'manual' && !customEdit.trim()))}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Save className="mr-2" size={16} />
            {confirmRevisionMutation.isPending ? '確定中...' : '選択確定'}
          </Button>
          <Button 
            size="lg" 
            className="bg-green-600 hover:bg-green-700"
          >
            全条文生成継続
          </Button>
        </div>
      </div>

      {/* Generation Status */}
      {generationStatus?.isProcessing && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="animate-spin">
                <Bot size={20} />
              </div>
              <div>
                <p className="font-medium">AI処理中...</p>
                <p className="text-sm text-gray-600">{generationStatus.currentTask}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
