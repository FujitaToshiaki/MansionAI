import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { FileText, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { Link } from "wouter";

export default function OCRProcessing() {
  const { id } = useParams();
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1]);
  const documentId = searchParams.get('documentId');

  const { data: condominium } = useQuery({
    queryKey: ['/api/condominiums', id],
  });

  const { data: document } = useQuery({
    queryKey: ['/api/documents', documentId],
    enabled: !!documentId,
  });

  const { data: ocrResult } = useQuery({
    queryKey: ['/api/documents', documentId, 'ocr'],
    enabled: !!documentId,
  });

  if (!documentId || !document) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">文書が指定されていません</p>
        <Link href={`/condominiums/${id}/upload`}>
          <Button className="mt-4" variant="outline">
            アップロード画面に戻る
          </Button>
        </Link>
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
        <Link href={`/condominiums/${id}/upload`} className="hover:text-gray-700">議事録アップロード</Link>
        <span className="mx-2">{'>'}</span>
        <span>OCR処理結果確認</span>
      </nav>

      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>OCR処理結果確認</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">処理ファイル:</span>
                <p className="font-medium">{document.originalFileName || document.title}</p>
              </div>
              <div>
                <span className="text-gray-600">処理完了時刻:</span>
                <p className="font-medium">
                  {document.processedAt ? new Date(document.processedAt).toLocaleString('ja-JP') : '-'}
                </p>
              </div>
              <div>
                <span className="text-gray-600">認識精度:</span>
                <p className="font-medium">
                  {document.ocrAccuracy ? `${document.ocrAccuracy}%` : '-'}
                  {document.ocrAccuracy && (
                    <span className={`ml-2 text-xs ${
                      document.ocrAccuracy >= 95 ? 'text-green-600' :
                      document.ocrAccuracy >= 90 ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      ({document.ocrAccuracy >= 95 ? '優秀' : 
                        document.ocrAccuracy >= 90 ? '良好' : '要改善'})
                    </span>
                  )}
                </p>
              </div>
              <div>
                <span className="text-gray-600">処理状況:</span>
                <div className="mt-1">
                  <Badge variant={
                    document.ocrStatus === 'completed' ? 'default' :
                    document.ocrStatus === 'processing' ? 'secondary' :
                    document.ocrStatus === 'failed' ? 'destructive' : 'outline'
                  }>
                    {document.ocrStatus === 'completed' && <CheckCircle className="mr-1" size={12} />}
                    {document.ocrStatus === 'failed' && <AlertTriangle className="mr-1" size={12} />}
                    {document.ocrStatus === 'completed' ? '完了' :
                     document.ocrStatus === 'processing' ? '処理中' :
                     document.ocrStatus === 'failed' ? '失敗' : '待機中'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* OCR Result Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original Document Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2" size={20} />
              原本表示
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 rounded-lg p-4 h-96 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <FileText size={48} className="mx-auto mb-2" />
                <p>PDF/画像プレビュー</p>
                <p className="text-sm">{document.originalFileName}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* OCR Text Result */}
        <Card>
          <CardHeader>
            <CardTitle>OCR結果テキスト</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                value={document.ocrText || "OCRテキストの読み込み中..."}
                readOnly
                className="h-80 text-sm"
                placeholder="OCR処理結果がここに表示されます"
              />
              
              {/* Confidence Indicators */}
              {document.ocrAccuracy && (
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="font-medium text-green-700">95%以上</div>
                    <div className="text-green-600">高精度（緑色）</div>
                  </div>
                  <div className="text-center p-2 bg-orange-50 rounded">
                    <div className="font-medium text-orange-700">90-95%</div>
                    <div className="text-orange-600">中精度（黄色）</div>
                  </div>
                  <div className="text-center p-2 bg-red-50 rounded">
                    <div className="font-medium text-red-700">90%未満</div>
                    <div className="text-red-600">低精度（赤色）</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manual Correction Area */}
      <Card>
        <CardHeader>
          <CardTitle>手動補正エリア</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="OCR結果の手動補正を行う場合はこちらに入力してください"
            className="h-32"
          />
          <div className="mt-4 text-sm text-gray-600">
            <p>• 認識精度の低い部分を手動で修正できます</p>
            <p>• 修正内容は自動で学習データに反映されます</p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <Button variant="outline">
          <RefreshCw className="mr-2" size={16} />
          再処理
        </Button>
        
        <div className="flex space-x-3">
          <Button variant="outline">
            手動補正継続
          </Button>
          <Link href={`/condominiums/${id}/decisions`}>
            <Button className="bg-purple-600 hover:bg-purple-700">
              確認完了 - 決議抽出へ
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
