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
import { AlertTriangle, CheckCircle, Clock, FileText, Bot, Gavel, RotateCcw, Settings, Filter, Mic, MicOff, Play, Pause, Brain, CircuitBoard } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function RegulationAnalysis() {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 条文テキストを箇条書き形式にフォーマットする関数
  const formatRegulationText = (text: string): string => {
    if (!text) return text;
    
    return text
      // 条文番号の後に改行を追加
      .replace(/(第\d+条(?:の\d+)?)\s+/g, '$1\n')
      // 項目番号（一、二、三...）の前に改行と適切なインデントを追加
      .replace(/([。\n])\s*(一|二|三|四|五|六|七|八|九|十)\s+/g, '$1\n　$2 ')
      // アラビア数字項目（1、2、3...）の前に改行とインデントを追加
      .replace(/([。\n])\s*([1-9]\d*)\s+/g, '$1\n　$2 ')
      // サブ項目（①、②、③...）の前に改行とさらなるインデントを追加
      .replace(/([。\n])\s*(①|②|③|④|⑤|⑥|⑦|⑧|⑨|⑩)\s+/g, '$1\n　　$2 ')
      // 「ただし」を新しい行に
      .replace(/。\s*ただし/g, '。\nただし')
      // 「また」を新しい行に
      .replace(/。\s*また/g, '。\nまた')
      // 【コメント】セクションの前に改行を追加
      .replace(/\s*【コメント】/g, '\n\n【コメント】')
      // 連続する改行を整理
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  // Utility functions
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-3 h-3 mr-1" />;
      case 'medium': return <Clock className="w-3 h-3 mr-1" />;
      case 'low': return <CheckCircle className="w-3 h-3 mr-1" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300">
            改訂済み
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-300">
            改訂中
          </Badge>
        );
      case 'under_review':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            検討中
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800 border-gray-300">
            未着手
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800 border-gray-300">
            不明
          </Badge>
        );
    }
  };
  
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
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  // Filter states
  const [statusFilter, setStatusFilter] = useState('not_completed');
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [analysisSteps, setAnalysisSteps] = useState([
    { id: 1, name: '文書解析開始', status: 'pending', description: 'アップロードされた議事録を解析しています', details: '議事録テキストから決議項目を特定中...' },
    { id: 2, name: '決議事項抽出', status: 'pending', description: 'AI が決議内容を識別・分類しています', details: '個人情報保護法対応、ペット飼育規定等を評価中...' },
    { id: 3, name: '法改正チェック', status: 'pending', description: '最新の法改正との適合性を確認しています', details: '令和6年改正区分所有法との整合性を確認中...' },
    { id: 4, name: '標準規約比較', status: 'pending', description: '標準管理規約との差分を分析しています', details: '第15条 管理組合の権限について差分を確認中...' },
    { id: 5, name: '改訂案生成', status: 'pending', description: '規約改訂案を自動生成しています', details: '改訂提案書と新旧対照表を作成中...' },
    { id: 6, name: '分析完了', status: 'pending', description: '結果をまとめています', details: '最終レポートを生成しています...' }
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
    
    // Wait 2 seconds then reset and close modal
    setTimeout(() => {
      setIsExecuting(false);
      setAnalysisProgress(0);
      setCurrentStep('');
      setAnalysisSteps(prev => prev.map(step => ({ ...step, status: 'pending' })));
      setShowAnalysisModal(false);
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
      // Just return a promise, actual simulation starts separately
      return Promise.resolve();
    },
    onSuccess: () => {
      // Start the simulation after successful mutation
      simulateAnalysisFlow();
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "分析の開始に失敗しました。",
        variant: "destructive",
      });
    }
  });



  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500">
        <Link href="/condominiums" className="hover:text-gray-700">マンション一覧</Link>
        <span className="mx-2">{'>'}</span>
        <Link href={`/condominiums/${id}`} className="hover:text-gray-700">{(condominium as any)?.name || 'マンション詳細'}</Link>
        <span className="mx-2">{'>'}</span>
        <span>規約改訂分析</span>
      </nav>

      {/* Header */}
      <Card className="bg-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
        <CardHeader className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative flex justify-between items-center">
            <CardTitle className="flex items-center group">
              <Bot className="w-5 h-5 mr-2 text-blue-600 group-hover:animate-pulse" />
              規約改訂分析結果
            </CardTitle>
            <div className="flex space-x-2">
              <Dialog open={showAnalysisModal} onOpenChange={setShowAnalysisModal}>
                <DialogTrigger asChild>
                  <Button 
                    disabled={startAnalysisMutation.isPending}
                    className="group hover:scale-105 transition-all duration-200 hover:shadow-md"
                    onClick={() => setShowAnalysisModal(true)}
                  >
                    <RotateCcw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                    改訂分析実行
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {isExecuting ? '🤖 規約改定分析実行中' : '🤖 AI規約改定分析の実行'}
                    </DialogTitle>
                  </DialogHeader>
                  
                  {!isExecuting ? (
                    <div className="space-y-4">


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
                              className={`px-3 transition-all duration-300 ${isListening ? 'animate-pulse scale-105' : 'hover:scale-105'}`}
                            >
                              {isListening ? <MicOff className="w-4 h-4 animate-bounce" /> : <Mic className="w-4 h-4" />}
                            </Button>
                          </div>
                          {isListening && (
                            <div className="text-sm text-blue-600 flex items-center animate-fadeIn">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                              <Brain className="w-3 h-3 mr-1 animate-bounce" />
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
                            <div key={step.id} className="flex items-center space-x-3 p-2 rounded border bg-gray-50 border-gray-200">
                              <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-xs text-white font-medium">{index + 1}</span>
                              </div>
                              <div>
                                <span className="text-sm text-gray-500 font-medium">{step.name}</span>
                                <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2 pt-4">
                        <Button 
                          variant="outline"
                          onClick={() => setShowAnalysisModal(false)}
                        >
                          キャンセル
                        </Button>
                        <Button 
                          onClick={() => startAnalysisMutation.mutate()}
                          className="group hover:scale-105 transition-all duration-200 hover:shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          <Bot className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                          AI分析開始
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Execution Progress View */
                    <div className="space-y-4 animate-slideIn">
                      <div className="text-center bg-gray-50 rounded-lg p-4 border">
                        <div className="flex items-center justify-center space-x-3 mb-3">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">規約改定分析実行中</h3>
                            <div className="text-xl font-bold text-blue-600">
                              {Math.round((analysisSteps.filter(s => s.status === 'completed').length / analysisSteps.length) * 100)}%
                            </div>
                          </div>
                        </div>
                        
                        {/* タイル状プログレスバー */}
                        <div className="grid grid-cols-6 gap-1 mb-3">
                          {analysisSteps.map((step, index) => (
                            <div 
                              key={step.id}
                              className={`h-2 rounded-sm transition-all duration-300 ${
                                step.status === 'completed' ? 'bg-green-500' :
                                step.status === 'running' ? 'bg-blue-500' :
                                'bg-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        
                        <p className="text-sm text-gray-700 font-medium">
                          {analysisSteps.find(step => step.status === 'running')?.name || '規約改定分析'}を実行しています
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900 mb-2">🔄 実行中のAI分析フロー</h4>
                        {analysisSteps.map((step, index) => (
                          <div 
                            key={step.id} 
                            className={`flex items-center space-x-3 p-2 rounded border transition-all duration-300 ${
                              step.status === 'running' ? 'bg-blue-50 border-blue-200' : 
                              step.status === 'completed' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-full transition-all duration-300 flex items-center justify-center ${
                              step.status === 'completed' ? 'bg-green-500' :
                              step.status === 'running' ? 'bg-blue-500' :
                              'bg-gray-300'
                            }`}>
                              {step.status === 'completed' && (
                                <CheckCircle className="w-2.5 h-2.5 text-white" />
                              )}
                              {step.status === 'running' && (
                                <div className="animate-spin rounded-full h-2.5 w-2.5 border border-white border-t-transparent"></div>
                              )}
                            </div>
                            <div className="flex-1">
                              <span className={`text-sm transition-all duration-300 ${
                                step.status === 'completed' ? 'text-green-700 font-semibold' :
                                step.status === 'running' ? 'text-blue-700 font-medium' :
                                'text-gray-500'
                              }`}>
                                {step.name}
                              </span>
                              <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                              {step.status === 'running' && step.details && (
                                <p className="text-xs text-blue-600 mt-1 animate-pulse">{step.details}</p>
                              )}
                            </div>
                            {step.status === 'running' && (
                              <div className="flex items-center space-x-1 text-blue-600">
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                            )}
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
              <p className="font-medium">{(condominium as any)?.name || 'ローディング中...'} 管理規約</p>
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
      <Card className="bg-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-slideIn">
        <CardHeader className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-blue-50 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative flex justify-between items-center">
            <CardTitle className="flex items-center group">
              <FileText className="w-5 h-5 mr-2 text-green-600 group-hover:animate-pulse" />
              改訂必要箇所一覧
            </CardTitle>
            <div className="flex space-x-2">
              <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="group hover:scale-105 transition-all duration-200 hover:shadow-md"
                  >
                    <Filter className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                    フィルタ
                    {statusFilter !== 'all' && statusFilter !== 'not_completed' && (
                      <Badge className="ml-2 bg-blue-100 text-blue-800">1</Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>フィルタ設定</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="status-filter" className="text-right">
                        ステータス
                      </Label>
                      <div className="col-span-3">
                        <RadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="all" id="all" />
                            <Label htmlFor="all">すべて</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="not_completed" id="not_completed" />
                            <Label htmlFor="not_completed">改訂済み以外</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="completed" id="completed" />
                            <Label htmlFor="completed">改訂済み</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="in_progress" id="in_progress" />
                            <Label htmlFor="in_progress">改訂中</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="under_review" id="under_review" />
                            <Label htmlFor="under_review">検討中</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="pending" id="pending" />
                            <Label htmlFor="pending">未着手</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setStatusFilter('not_completed')}>
                      リセット
                    </Button>
                    <Button onClick={() => setShowFilterDialog(false)}>
                      適用
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
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
                  <TableHead>改訂タイトル</TableHead>
                  <TableHead>改定理由</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>改定年度</TableHead>
                  <TableHead>関連決議</TableHead>
                  <TableHead>法改正</TableHead>
                  <TableHead>影響度</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {((analysisResults as any)?.issues || [])
                  .filter((issue: any) => {
                    if (statusFilter === 'all') return true;
                    if (statusFilter === 'not_completed') return issue.status !== 'completed';
                    return issue.status === statusFilter;
                  })
                  .map((issue: any, index: number) => (
                  <TableRow 
                    key={index} 
                    className="hover:bg-gray-50 transition-colors duration-200 animate-fadeIn"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <TableCell>
                      <Badge className={`${getPriorityColor(issue.priority)} hover:scale-105 transition-transform duration-200`}>
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
                    <TableCell className="font-medium max-w-xs">
                      <p className="truncate">{issue.title}</p>
                    </TableCell>
                    <TableCell className="max-w-sm">
                      <p className="text-sm text-gray-600 line-clamp-2">{issue.reason}</p>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(issue.status)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-gray-700">
                        {issue.revision_year || '2024年'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {issue.legal_basis?.includes('決議') || issue.legal_basis?.includes('総会') ? (
                        <button className="text-blue-600 hover:text-blue-800 underline text-sm">
                          {issue.legal_basis?.match(/\d{4}年\d{1,2}月/) ? issue.legal_basis.match(/\d{4}年\d{1,2}月/)[0] + '決議' : '関連決議'}
                        </button>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {issue.law_revision_required ? (
                        <button className="text-blue-600 hover:text-blue-800 underline text-sm">
                          {issue.legal_basis?.includes('2025年') ? '2025年改正法' : 
                           issue.legal_basis?.includes('区分所有法') ? '区分所有法' : '法改正対応'}
                        </button>
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
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="group hover:scale-105 transition-all duration-200 hover:shadow-md hover:bg-blue-50"
                        >
                          <FileText className="w-3 h-3 mr-1 group-hover:animate-pulse" />
                          詳細
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500 animate-fadeIn">
              <div className="group">
                <Bot className="mx-auto mb-4 group-hover:animate-bounce transition-transform duration-200" size={48} />
                <p className="font-medium">分析結果がありません</p>
                <p className="text-sm animate-pulse">決議事項の抽出と分類を先に実行してください</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>





      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Link href={`/condominiums/${id}/ai-agent-history`}>
          <Button 
            variant="outline" 
            size="lg" 
            className="px-8 group hover:scale-105 transition-all duration-200 hover:shadow-lg hover:border-blue-400"
          >
            <Clock className="mr-2 group-hover:animate-spin" size={20} />
            AI実行履歴
          </Button>
        </Link>
        <Link href={`/condominiums/${id}/ai-revision`}>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8 group hover:scale-105 transition-all duration-200 hover:shadow-lg"
          >
            <Bot className="mr-2 group-hover:animate-bounce" size={20} />
            AI改訂案生成開始
          </Button>
        </Link>
      </div>
    </div>
  );
}
