import { useState, useRef } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Eye, FileText, CheckCircle, AlertTriangle, RefreshCw, X, Image } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface UploadedFile {
  file: File;
  preview: string;
  pageNumber: number;
}

interface OCRResult {
  pageNumber: number;
  text: string;
  accuracy: number;
  lowConfidenceRegions: Array<{
    text: string;
    confidence: number;
    coordinates: { x: number; y: number; width: number; height: number };
  }>;
}

export default function OCRProcessing() {
  const { id } = useParams();
  const [step, setStep] = useState<'upload' | 'preview' | 'processing' | 'review' | 'save'>('upload');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [ocrResults, setOcrResults] = useState<OCRResult[]>([]);
  const [selectedCondominium, setSelectedCondominium] = useState<string>('');
  const [documentTitle, setDocumentTitle] = useState<string>('');
  const [meetingDate, setMeetingDate] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Check if this is a standalone OCR processing page (from menu)
  const isStandalone = !id || id === 'ocr-processing';

  const { data: condominiums } = useQuery({
    queryKey: ['/api/condominiums'],
    enabled: true, // Always fetch condominiums list for selection
  });

  const processOCRMutation = useMutation({
    mutationFn: async (files: UploadedFile[]) => {
      console.log('Starting OCR processing for', files.length, 'files');
      
      // Real AI-powered OCR processing using OpenAI
      const formData = new FormData();
      files.forEach((fileData, index) => {
        console.log(`Adding file ${index + 1}:`, fileData.file.name, fileData.file.type, fileData.file.size, 'bytes');
        formData.append('files', fileData.file);
      });

      console.log('Sending OCR request to API...');
      const response = await apiRequest('/api/documents/process-ocr', {
        method: 'POST',
        body: formData,
      });

      console.log('OCR API response:', response);

      if (!response.success) {
        throw new Error(response.error || 'OCR処理に失敗しました');
      }

      return response.results as OCRResult[];
    },
    onSuccess: (results) => {
      console.log('OCR processing successful:', results);
      setOcrResults(results);
      setStep('review');
    },
    onError: (error) => {
      console.error('OCR processing error:', error);
      alert(`OCR処理エラー: ${error.message}`);
      setStep('preview'); // Go back to preview step
    }
  });

  const saveDocumentMutation = useMutation({
    mutationFn: async (data: {
      condominiumId: string;
      title: string;
      meetingDate: string;
      ocrResults: OCRResult[];
      files: UploadedFile[];
    }) => {
      // ここでファイルをアップロードしてOCR結果を保存
      const formData = new FormData();
      formData.append('condominiumId', data.condominiumId);
      formData.append('title', data.title);
      formData.append('meetingDate', data.meetingDate);
      formData.append('ocrResults', JSON.stringify(data.ocrResults));
      
      data.files.forEach((fileData, index) => {
        formData.append(`files[${index}]`, fileData.file);
        formData.append(`pageNumbers[${index}]`, fileData.pageNumber.toString());
      });

      const response = await fetch('/api/documents/ocr-upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('保存に失敗しました');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/condominiums', selectedCondominium, 'documents'] });
      setStep('save');
    }
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      alert('画像ファイルを選択してください');
      return;
    }

    const newFiles: UploadedFile[] = imageFiles.map((file, index) => ({
      file,
      preview: URL.createObjectURL(file),
      pageNumber: index + 1
    }));

    setUploadedFiles(newFiles);
    setStep('preview');
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles.map((file, i) => ({ ...file, pageNumber: i + 1 })));
    
    if (newFiles.length === 0) {
      setStep('upload');
    }
  };

  const startOCRProcessing = () => {
    setStep('processing');
    processOCRMutation.mutate(uploadedFiles);
  };

  const saveDocument = () => {
    if (!selectedCondominium || !documentTitle || !meetingDate) {
      alert('すべての必須項目を入力してください');
      return;
    }

    saveDocumentMutation.mutate({
      condominiumId: selectedCondominium,
      title: documentTitle,
      meetingDate,
      ocrResults,
      files: uploadedFiles
    });
  };

  const generateMockOCRText = (pageNumber: number): string => {
    const mockTexts = [
      "理事会議事録\n令和6年4月17日 10:00～11:45\n\n1. 開会の辞\n理事長より、令和6年度第5回理事会の開会が宣言された。\n\n2. 承認事項\n(1) 日時：令和6年4月17日（水）\n(2) 場所：管理組合事務所\n(3) 議題：第5回理事会\n\n3. 主な決議\n理事会の各議題について以下の通り決議した。",
      
      "（承認議題）\n○号　承認事項　○○の要望について\n承認となった。○○区分所有者より提案があり、\n4階住戸にて工事の許可を求める内容であった。\n昨年○月に引き続き3年（令和○年）の回数となった。\n\n○号　承認事項　○○の重要事項について\n承認となった。○○区分所有者より管理費の滞納について\n改善のための措置を講じることとした。",
      
      "（承認議題）\n○号　承認事項について\n○○氏より承認の申し出があり、承認することとした。\n4階住戸にて工事を実施する件について\n承認に引き続き対応を行うこととした。\n\n○号　承認事項\n○○の改善事項について承認されることとなった。\n水回りの修繕工事の件について承認を得た。\n○○（○○）より申請があり、承認を得ることができた。\n\n（１）明会の件　　承認を得た"
    ];
    
    return mockTexts[pageNumber - 1] || mockTexts[0];
  };

  const generateMockLowConfidenceRegions = () => {
    return [
      {
        text: "承認",
        confidence: 72,
        coordinates: { x: 150, y: 200, width: 40, height: 20 }
      },
      {
        text: "令和6年",
        confidence: 68,
        coordinates: { x: 300, y: 150, width: 60, height: 18 }
      }
    ];
  };

  const loadDemoFiles = async () => {
    // Use the actual attached demo images
    const demoImagePaths = [
      '/attached_assets/メゾンドオプテージ議事録_1_1755783927139.jpg',
      '/attached_assets/メゾンドオプテージ議事録_2_1755783927141.jpg',
      '/attached_assets/メゾンドオプテージ議事録_3_1755783927141.jpg'
    ];

    const mockFiles: UploadedFile[] = [];
    
    for (let i = 0; i < demoImagePaths.length; i++) {
      try {
        console.log('Loading demo file:', demoImagePaths[i]);
        const response = await fetch(demoImagePaths[i]);
        if (!response.ok) {
          console.error('Failed to fetch demo image:', response.status, response.statusText);
          continue;
        }
        
        const blob = await response.blob();
        const file = new File([blob], `メゾンドオプテージ議事録_${i + 1}.jpg`, { type: 'image/jpeg' });
        
        mockFiles.push({
          file,
          preview: demoImagePaths[i],
          pageNumber: i + 1
        });
        
        console.log('Successfully loaded demo file:', file.name, file.size, 'bytes');
      } catch (error) {
        console.error('Failed to load demo image:', demoImagePaths[i], error);
      }
    }
    
    if (mockFiles.length === 0) {
      alert('デモ用議事録画像の読み込みに失敗しました');
      return;
    }
    
    setUploadedFiles(mockFiles);
    setSelectedCondominium('a7af9126-67ff-47d9-9c24-cf4054aeb63c'); // メゾンドオプテージのID
    setDocumentTitle('令和6年度第5回理事会議事録');
    setMeetingDate('2024-04-17');
    setStep('preview');
    
    console.log('Demo files loaded:', mockFiles.length, 'files');
  };

  if (step === 'upload') {
    return (
      <div className="space-y-6">
        <nav className="text-sm text-gray-500">
          {isStandalone ? (
            <>
              <Link href="/" className="hover:text-gray-700">ダッシュボード</Link>
              <span className="mx-2">{'>'}</span>
              <span>データ取込</span>
            </>
          ) : (
            <>
              <Link href="/condominiums" className="hover:text-gray-700">マンション一覧</Link>
              <span className="mx-2">{'>'}</span>
              <span>データ取込</span>
            </>
          )}
        </nav>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              議事録ファイルアップロード
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium mb-2">議事録画像をアップロードしてください</p>
              <p className="text-gray-500 mb-4">JPG、PNG形式の画像ファイルをサポートしています（複数ページ対応）</p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => fileInputRef.current?.click()}>
                  ファイルを選択
                </Button>
                <Button variant="outline" onClick={loadDemoFiles}>
                  デモ用議事録を読み込み
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'preview') {
    return (
      <div className="space-y-6">
        <nav className="text-sm text-gray-500">
          {isStandalone ? (
            <>
              <Link href="/" className="hover:text-gray-700">ダッシュボード</Link>
              <span className="mx-2">{'>'}</span>
              <span>データ取込</span>
              <span className="mx-2">{'>'}</span>
              <span>プレビュー確認</span>
            </>
          ) : (
            <>
              <Link href="/condominiums" className="hover:text-gray-700">マンション一覧</Link>
              <span className="mx-2">{'>'}</span>
              <span>データ取込</span>
              <span className="mx-2">{'>'}</span>
              <span>プレビュー確認</span>
            </>
          )}
        </nav>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              アップロードファイル プレビュー
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadedFiles.map((fileData, index) => (
                <div key={index} className="relative border rounded-lg p-4">
                  <div className="absolute top-2 right-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeFile(index)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="mb-2">
                    <Badge variant="outline">ページ {fileData.pageNumber}</Badge>
                  </div>
                  <img
                    src={fileData.preview}
                    alt={`プレビュー ${fileData.pageNumber}`}
                    className="w-full h-48 object-cover rounded border"
                  />
                  <p className="text-sm text-gray-500 mt-2 truncate">
                    {fileData.file.name}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setUploadedFiles([]);
                  setStep('upload');
                }}
              >
                ファイルを変更
              </Button>
              <Button onClick={startOCRProcessing}>
                OCR処理を開始
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'processing') {
    return (
      <div className="space-y-6">
        <nav className="text-sm text-gray-500">
          {isStandalone ? (
            <>
              <Link href="/" className="hover:text-gray-700">ダッシュボード</Link>
              <span className="mx-2">{'>'}</span>
              <span>データ取込</span>
              <span className="mx-2">{'>'}</span>
              <span>OCR処理中</span>
            </>
          ) : (
            <>
              <Link href="/condominiums" className="hover:text-gray-700">マンション一覧</Link>
              <span className="mx-2">{'>'}</span>
              <span>データ取込</span>
              <span className="mx-2">{'>'}</span>
              <span>OCR処理中</span>
            </>
          )}
        </nav>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin" />
              OCR処理中
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg font-medium mb-2">議事録を解析しています...</p>
              <p className="text-gray-500">
                アップロードされた {uploadedFiles.length} ページの画像からテキストを抽出しています
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'review') {
    return (
      <div className="space-y-6">
        <nav className="text-sm text-gray-500">
          {isStandalone ? (
            <>
              <Link href="/" className="hover:text-gray-700">ダッシュボード</Link>
              <span className="mx-2">{'>'}</span>
              <span>データ取込</span>
              <span className="mx-2">{'>'}</span>
              <span>OCR結果確認</span>
            </>
          ) : (
            <>
              <Link href="/condominiums" className="hover:text-gray-700">マンション一覧</Link>
              <span className="mx-2">{'>'}</span>
              <span>データ取込</span>
              <span className="mx-2">{'>'}</span>
              <span>OCR結果確認</span>
            </>
          )}
        </nav>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              OCR処理結果確認
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {ocrResults.map((result, index) => {
              const fileData = uploadedFiles.find(f => f.pageNumber === result.pageNumber);
              return (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">ページ {result.pageNumber}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant={result.accuracy >= 80 ? "default" : "destructive"}>
                        精度: {Math.round(result.accuracy)}%
                      </Badge>
                      {result.accuracy < 80 && (
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">原本画像</Label>
                      {fileData && (
                        <img
                          src={fileData.preview}
                          alt={`原本 ${result.pageNumber}`}
                          className="w-full border rounded"
                        />
                      )}
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium mb-2 block">抽出テキスト</Label>
                      <Textarea
                        value={result.text}
                        onChange={(e) => {
                          const newResults = [...ocrResults];
                          newResults[index].text = e.target.value;
                          setOcrResults(newResults);
                        }}
                        className="min-h-[300px] font-mono text-sm"
                      />
                      
                      {result.lowConfidenceRegions.length > 0 && (
                        <div className="mt-4">
                          <Label className="text-sm font-medium mb-2 block text-yellow-600">
                            <AlertTriangle className="w-4 h-4 inline mr-1" />
                            精度が低い箇所
                          </Label>
                          <div className="space-y-2">
                            {result.lowConfidenceRegions.map((region, regionIndex) => (
                              <div key={regionIndex} className="flex items-center gap-2 text-sm bg-yellow-50 p-2 rounded">
                                <Badge variant="outline" className="text-yellow-700">
                                  {region.confidence}%
                                </Badge>
                                <span className="bg-yellow-200 px-1 rounded">{region.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">議事録情報の入力</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="condominium">マンション名</Label>
                  <Select value={selectedCondominium} onValueChange={setSelectedCondominium}>
                    <SelectTrigger>
                      <SelectValue placeholder="マンションを選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      {(condominiums as any[])?.map((condo: any) => (
                        <SelectItem key={condo.id} value={condo.id}>
                          {condo.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="title">議事録タイトル</Label>
                  <Input
                    id="title"
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                    placeholder="例: 令和6年度第5回理事会議事録"
                  />
                </div>
                
                <div>
                  <Label htmlFor="meetingDate">開催日</Label>
                  <Input
                    id="meetingDate"
                    type="date"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                onClick={() => setStep('preview')}
              >
                戻る
              </Button>
              <Button
                onClick={saveDocument}
                disabled={saveDocumentMutation.isPending || !selectedCondominium || !documentTitle || !meetingDate}
              >
                {saveDocumentMutation.isPending ? '保存中...' : '議事録を登録'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'save') {
    return (
      <div className="space-y-6">
        <nav className="text-sm text-gray-500">
          {isStandalone ? (
            <>
              <Link href="/" className="hover:text-gray-700">ダッシュボード</Link>
              <span className="mx-2">{'>'}</span>
              <span>データ取込</span>
              <span className="mx-2">{'>'}</span>
              <span>登録完了</span>
            </>
          ) : (
            <>
              <Link href="/condominiums" className="hover:text-gray-700">マンション一覧</Link>
              <span className="mx-2">{'>'}</span>
              <span>データ取込</span>
              <span className="mx-2">{'>'}</span>
              <span>登録完了</span>
            </>
          )}
        </nav>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              議事録登録完了
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-8">
              <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-4" />
              <p className="text-lg font-medium mb-2">議事録の登録が完了しました</p>
              <p className="text-gray-500 mb-6">
                {uploadedFiles.length}ページの議事録が正常に処理され、データベースに保存されました
              </p>
              
              <div className="flex gap-4 justify-center">
                {isStandalone ? (
                  <>
                    <Link href="/">
                      <Button variant="outline">
                        ダッシュボードに戻る
                      </Button>
                    </Link>
                    <Link href="/minutes">
                      <Button>
                        議事録管理を確認
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/condominiums">
                      <Button variant="outline">
                        マンション一覧に戻る
                      </Button>
                    </Link>
                    <Link href={`/condominiums/${selectedCondominium}`}>
                      <Button>
                        マンション詳細を確認
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}