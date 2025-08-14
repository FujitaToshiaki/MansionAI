import { useParams } from "wouter";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CloudUpload, FileText, Upload, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function DocumentUpload() {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);

  const { data: condominium } = useQuery({
    queryKey: ['/api/condominiums', id],
  });

  const { data: uploadedFiles } = useQuery({
    queryKey: ['/api/condominiums', id, 'documents'],
  });

  const uploadMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });
      formData.append('condominiumId', id!);
      
      return apiRequest('POST', `/api/condominiums/${id}/upload`, formData);
    },
    onSuccess: () => {
      toast({
        title: "アップロード完了",
        description: "ファイルが正常にアップロードされました。",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/condominiums', id, 'documents'] });
      setUploadProgress(0);
    },
    onError: (error) => {
      toast({
        title: "アップロードエラー",
        description: "ファイルのアップロードに失敗しました。",
        variant: "destructive",
      });
      setUploadProgress(0);
    },
  });

  const startOCRMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', `/api/condominiums/${id}/start-ocr`, {});
    },
    onSuccess: () => {
      toast({
        title: "OCR処理開始",
        description: "OCR処理を開始しました。",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/condominiums', id, 'documents'] });
    },
  });

  const handleFileUpload = (files: FileList) => {
    if (files.length > 0) {
      setUploadProgress(0);
      uploadMutation.mutate(files);
      
      // Simulate progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500">
        <Link href="/condominiums" className="hover:text-gray-700">マンション一覧</Link>
        <span className="mx-2">{'>'}</span>
        <Link href={`/condominiums/${id}`} className="hover:text-gray-700">{condominium?.name}</Link>
        <span className="mx-2">{'>'}</span>
        <span>議事録アップロード</span>
      </nav>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          議事録アップロード - {condominium?.name}
        </h1>
      </div>

      {/* Upload Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle>アップロード方法選択</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input type="radio" name="uploadMethod" defaultChecked />
              <span>ファイルアップロード（PDF、画像）</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="radio" name="uploadMethod" />
              <span>スキャナー連携</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="radio" name="uploadMethod" />
              <span>既存電子ファイル選択</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* File Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>ファイル選択エリア</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <CloudUpload className="mx-auto text-4xl text-gray-400 mb-4" size={48} />
            <p className="text-lg font-medium text-gray-700 mb-2">ファイルをドラッグ&ドロップ</p>
            <p className="text-sm text-gray-500 mb-4">または</p>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.tiff"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button className="bg-purple-600 hover:bg-purple-700" asChild>
                <span>
                  <Upload className="mr-2" size={16} />
                  ファイルを選択
                </span>
              </Button>
            </label>
            <div className="mt-4">
              <p className="text-xs text-gray-500">対応形式: PDF, JPG, PNG, TIFF</p>
              <p className="text-xs text-gray-500">最大サイズ: 10MB/ファイル</p>
            </div>
          </div>

          {uploadProgress > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">アップロード中...</span>
                <span className="text-sm text-gray-600">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Uploaded Files List */}
      <Card>
        <CardHeader>
          <CardTitle>アップロード済みファイル一覧</CardTitle>
        </CardHeader>
        <CardContent>
          {uploadedFiles?.length > 0 ? (
            <div className="space-y-3">
              <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-500 border-b pb-2">
                <div>ファイル名</div>
                <div>サイズ</div>
                <div>アップロード日時</div>
                <div>OCR状況</div>
                <div>精度</div>
                <div>操作</div>
              </div>
              {uploadedFiles.map((file: any) => (
                <div key={file.id} className="grid grid-cols-6 gap-4 text-sm py-3 border-b">
                  <div className="flex items-center space-x-2">
                    <FileText className="text-red-500" size={16} />
                    <span className="font-medium">{file.originalFileName || file.title}</span>
                  </div>
                  <div className="text-gray-500">
                    {file.fileSize ? `${Math.round(file.fileSize / 1024)}KB` : '-'}
                  </div>
                  <div className="text-gray-500">
                    {new Date(file.uploadedAt).toLocaleDateString('ja-JP')} {new Date(file.uploadedAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div>
                    <Badge variant={
                      file.ocrStatus === 'completed' ? 'default' :
                      file.ocrStatus === 'processing' ? 'secondary' :
                      file.ocrStatus === 'failed' ? 'destructive' : 'outline'
                    }>
                      {file.ocrStatus === 'completed' && <CheckCircle className="mr-1" size={12} />}
                      {file.ocrStatus === 'processing' && <Clock className="mr-1" size={12} />}
                      {file.ocrStatus === 'failed' && <AlertTriangle className="mr-1" size={12} />}
                      {file.ocrStatus === 'completed' ? '完了' :
                       file.ocrStatus === 'processing' ? '処理中' :
                       file.ocrStatus === 'failed' ? '失敗' : '待機中'}
                    </Badge>
                  </div>
                  <div className="text-gray-500">
                    {file.ocrAccuracy ? `${file.ocrAccuracy}%` : '-'}
                  </div>
                  <div>
                    {file.ocrStatus === 'completed' ? (
                      <Link href={`/condominiums/${id}/ocr?documentId=${file.id}`}>
                        <Button variant="ghost" size="sm">確認</Button>
                      </Link>
                    ) : (
                      <Button variant="ghost" size="sm" disabled>-</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="mx-auto mb-4" size={48} />
              <p>アップロード済みファイルはありません</p>
            </div>
          )}

          {uploadedFiles?.length > 0 && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-500">
                {uploadedFiles.filter((f: any) => f.ocrStatus === 'pending').length}件のファイルがOCR処理待機中
              </div>
              <div className="flex space-x-3">
                <Button 
                  onClick={() => startOCRMutation.mutate()}
                  disabled={startOCRMutation.isPending || !uploadedFiles.some((f: any) => f.ocrStatus === 'pending')}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {startOCRMutation.isPending ? 'OCR処理中...' : 'OCR処理開始'}
                </Button>
                <Button variant="outline">
                  キャンセル
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
