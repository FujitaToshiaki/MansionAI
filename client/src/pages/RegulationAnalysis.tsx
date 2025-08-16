import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle, Clock, FileText, Bot, Gavel, RotateCcw, Settings, Filter, Mic, MicOff, Play, Pause } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function RegulationAnalysis() {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for analysis settings
  const [analysisSettings, setAnalysisSettings] = useState({
    period: 'past_6_months',
    checkLawRevision: true,
    checkStandardRegulation: true,
    checkPastDecisions: true,
    priorities: ['high', 'medium', 'low'],
    strictness: 'standard',
    mergeSimular: true,
    additionalInstructions: ''
  });

  // Voice input states
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Analysis execution states
  const [isExecuting, setIsExecuting] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [analysisSteps, setAnalysisSteps] = useState([
    { id: 1, name: '文書解析開始', status: 'pending', description: 'アップロードされた議事録を解析しています' },
    { id: 2, name: '決議事項抽出', status: 'pending', description: 'AI が決議内容を識別・分類しています' },
    { id: 3, name: '法改正チェック', status: 'pending', description: '最新の法改正との適合性を確認しています' },
    { id: 4, name: '標準規約比較', status: 'pending', description: '標準管理規約との差分を分析しています' },
    { id: 5, name: '改訂案生成', status: 'pending', description: '規約改訂案を自動生成しています' },
    { id: 6, name: '分析完了', status: 'pending', description: '結果をまとめています' }
  ]);

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

  // Voice recognition setup
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'ja-JP';

      recognitionRef.current.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setVoiceText(transcript);
        setAnalysisSettings(prev => ({...prev, additionalInstructions: transcript}));
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Simulate analysis execution flow
  const simulateAnalysisFlow = async () => {
    setIsExecuting(true);
    setAnalysisProgress(0);
    setCurrentStep('分析を開始しています...');

    // Reset all steps to pending
    setAnalysisSteps(prev => prev.map(step => ({ ...step, status: 'pending' })));

    for (let i = 0; i < analysisSteps.length; i++) {
      setAnalysisSteps(prev => prev.map((step, index) => 
        index === i ? { ...step, status: 'running' } : step
      ));
      setCurrentStep(analysisSteps[i].name);
      setAnalysisProgress((i + 1) / analysisSteps.length * 100);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setAnalysisSteps(prev => prev.map((step, index) => 
        index === i ? { ...step, status: 'completed' } : step
      ));
    }

    setCurrentStep('分析が完了しました');
    
    // Wait 2 seconds then reset
    setTimeout(() => {
      setIsExecuting(false);
      setAnalysisProgress(0);
      setCurrentStep('');
      setAnalysisSteps(prev => prev.map(step => ({ ...step, status: 'pending' })));
      toast({
        title: "分析完了",
        description: "規約改定分析が完了しました。結果を確認してください。",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/condominiums', id, 'regulation-analysis'] });
    }, 2000);
  };

  // Mutation for starting analysis
  const startAnalysisMutation = useMutation({
    mutationFn: () => {
      // Start the simulation instead of real API call
      simulateAnalysisFlow();
      return Promise.resolve();
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "分析の開始に失敗しました。",
        variant: "destructive",
      });
    }
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
      <Card className="bg-white">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>規約改訂分析結果</CardTitle>
            <div className="flex space-x-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button disabled={startAnalysisMutation.isPending}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    改訂分析実行
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {isExecuting ? '🤖 AI分析実行中' : '🤖 AI規約改定分析の実行'}
                    </DialogTitle>
                  </DialogHeader>
                  
                  {!isExecuting ? (
                    <div className="space-y-6">
                      {/* Current Settings Summary */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium mb-3">📋 設定条件</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">分析期間:</span>
                            <p className="font-medium">
                              {analysisSettings.period === 'past_6_months' ? '過去6ヶ月' :
                               analysisSettings.period === 'past_1_year' ? '過去1年' : '全期間'}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">分析厳格度:</span>
                            <p className="font-medium">
                              {analysisSettings.strictness === 'strict' ? '厳格' :
                               analysisSettings.strictness === 'standard' ? '標準' : '緩和'}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">法改正チェック:</span>
                            <p className="font-medium">{analysisSettings.checkLawRevision ? '有効' : '無効'}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">標準規約チェック:</span>
                            <p className="font-medium">{analysisSettings.checkStandardRegulation ? '有効' : '無効'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Voice Input for Additional Instructions */}
                      <div>
                        <Label className="text-sm font-medium flex items-center mb-3">
                          <Mic className="w-4 h-4 mr-2" />
                          AI分析への追加指示（音声入力対応）
                        </Label>
                        <div className="space-y-3">
                          <div className="flex space-x-2">
                            <Textarea
                              placeholder="例: 個人情報保護法の対応を重点的に分析してください。ペット飼育規定についても確認をお願いします。"
                              value={analysisSettings.additionalInstructions}
                              onChange={(e) => setAnalysisSettings(prev => ({...prev, additionalInstructions: e.target.value}))}
                              className="flex-1"
                              rows={3}
                            />
                            <Button
                              variant={isListening ? "destructive" : "outline"}
                              onClick={toggleVoiceInput}
                              className="px-3"
                            >
                              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                            </Button>
                          </div>
                          {isListening && (
                            <div className="text-sm text-red-600 flex items-center">
                              <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                              音声を認識中...
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Analysis Flow Preview */}
                      <div>
                        <h4 className="font-medium mb-3">🔄 実行されるAI分析フロー</h4>
                        <div className="space-y-2">
                          {analysisSteps.map((step, index) => (
                            <div key={step.id} className="flex items-center space-x-3 p-2 bg-blue-50 rounded text-sm">
                              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                                {index + 1}
                              </span>
                              <div>
                                <p className="font-medium">{step.name}</p>
                                <p className="text-gray-600 text-xs">{step.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2 pt-4">
                        <DialogTrigger asChild>
                          <Button variant="outline">キャンセル</Button>
                        </DialogTrigger>
                        <Button onClick={() => startAnalysisMutation.mutate()}>
                          <Bot className="w-4 h-4 mr-2" />
                          AI分析開始
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Execution Progress View */
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{Math.round(analysisProgress)}%</div>
                        <Progress value={analysisProgress} className="mt-2" />
                        <p className="text-sm text-gray-600 mt-2">{currentStep}</p>
                      </div>
                      
                      <div className="space-y-3">
                        {analysisSteps.map((step) => (
                          <div key={step.id} className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              step.status === 'completed' ? 'bg-green-500' :
                              step.status === 'running' ? 'bg-blue-500 animate-pulse' :
                              'bg-gray-300'
                            }`}></div>
                            <span className={`text-sm ${
                              step.status === 'completed' ? 'text-green-700' :
                              step.status === 'running' ? 'text-blue-700 font-medium' :
                              'text-gray-500'
                            }`}>
                              {step.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    分析設定
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>⚙️ 規約改定分析設定</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    {/* 分析対象期間 */}
                    <div>
                      <Label className="text-sm font-medium">📅 分析対象期間</Label>
                      <RadioGroup 
                        value={analysisSettings.period} 
                        onValueChange={(value) => setAnalysisSettings(prev => ({...prev, period: value}))}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="past_6_months" id="past_6_months" />
                          <Label htmlFor="past_6_months">過去6ヶ月</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="past_1_year" id="past_1_year" />
                          <Label htmlFor="past_1_year">過去1年</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="all_period" id="all_period" />
                          <Label htmlFor="all_period">全期間</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* 分析範囲 */}
                    <div>
                      <Label className="text-sm font-medium">🎯 分析範囲</Label>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="law_revision"
                            checked={analysisSettings.checkLawRevision}
                            onCheckedChange={(checked) => setAnalysisSettings(prev => ({...prev, checkLawRevision: checked as boolean}))}
                          />
                          <Label htmlFor="law_revision">法改正チェック</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="standard_regulation"
                            checked={analysisSettings.checkStandardRegulation}
                            onCheckedChange={(checked) => setAnalysisSettings(prev => ({...prev, checkStandardRegulation: checked as boolean}))}
                          />
                          <Label htmlFor="standard_regulation">標準管理規約チェック</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="past_decisions"
                            checked={analysisSettings.checkPastDecisions}
                            onCheckedChange={(checked) => setAnalysisSettings(prev => ({...prev, checkPastDecisions: checked as boolean}))}
                          />
                          <Label htmlFor="past_decisions">過去決議事項チェック</Label>
                        </div>
                      </div>
                    </div>

                    {/* 詳細設定 */}
                    <div>
                      <Label className="text-sm font-medium">🔍 詳細設定</Label>
                      <div className="mt-2 space-y-3">
                        <div>
                          <Label className="text-xs text-gray-600">影響度評価</Label>
                          <RadioGroup 
                            value={analysisSettings.strictness} 
                            onValueChange={(value) => setAnalysisSettings(prev => ({...prev, strictness: value}))}
                            className="mt-1"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="strict" id="strict" />
                              <Label htmlFor="strict">厳格</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="standard" id="standard" />
                              <Label htmlFor="standard">標準</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="relaxed" id="relaxed" />
                              <Label htmlFor="relaxed">緩和</Label>
                            </div>
                          </RadioGroup>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="merge_similar"
                            checked={analysisSettings.mergeSimular}
                            onCheckedChange={(checked) => setAnalysisSettings(prev => ({...prev, mergeSimular: checked as boolean}))}
                          />
                          <Label htmlFor="merge_similar">類似条項統合</Label>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <DialogTrigger asChild>
                        <Button variant="outline">キャンセル</Button>
                      </DialogTrigger>
                      <Button onClick={() => {}}>設定保存</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">分析対象:</span>
              <p className="font-medium">{condominium?.name || 'ローディング中...'} 管理規約</p>
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
              <p className="font-medium">{(analysisResults as any)?.totalIssues || 0}箇所</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results Table */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>改訂必要箇所一覧</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                フィルタ
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {(analysisResults as any)?.issues?.length > 0 ? (
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
                {((analysisResults as any)?.issues || []).map((issue: any, index: number) => (
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
                      <Link href={`/condominiums/${id}/regulation-analysis/${issue.id || index}`}>
                        <Button variant="ghost" size="sm">
                          詳細
                        </Button>
                      </Link>
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





      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Link href={`/condominiums/${id}/ai-agent-history`}>
          <Button variant="outline" size="lg" className="px-8">
            <Clock className="mr-2" size={20} />
            AI実行履歴
          </Button>
        </Link>
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
