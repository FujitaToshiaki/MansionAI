import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Building, 
  Calendar, 
  Users, 
  FileText, 
  Upload, 
  Bot, 
  CheckCircle,
  Clock,
  AlertTriangle,
  FileOutput,
  Search,
  BarChart3
} from "lucide-react";
import { Link } from "wouter";

export default function CondominiumDetail() {
  console.log("CondominiumDetail component is rendering");
  const { id } = useParams();
  
  const { data: condominium, isLoading } = useQuery({
    queryKey: ['/api/condominiums', id],
  });

  const { data: documents } = useQuery({
    queryKey: ['/api/condominiums', id, 'documents'],
  });

  const { data: decisions } = useQuery({
    queryKey: ['/api/condominiums', id, 'decisions'],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  if (!condominium) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">マンション情報が見つかりません</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500">
        <Link href="/condominiums" className="hover:text-gray-700">マンション一覧</Link>
        <span className="mx-2">{'>'}</span>
        <span>{condominium.name}</span>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-6">
            <img 
              src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&w=80&h=80&fit=crop" 
              alt={condominium.name} 
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{condominium.name}</h1>
              <p className="text-gray-600 mt-1">{condominium.address}</p>
              <p className="text-sm text-gray-500 mt-1">
                築{new Date().getFullYear() - condominium.buildYear}年 / {condominium.units}戸 / 
                管理開始：{new Date(condominium.managementStartDate).toLocaleDateString('ja-JP')}
              </p>
            </div>
          </div>
          
          {/* Button Group - 3x2 Grid Layout */}
          <div className="grid grid-cols-3 gap-3">
            {/* First Row */}
            <Link href={`/condominiums/${id}/analysis`}>
              <Button variant="outline" size="sm" className="bg-orange-50 hover:bg-orange-100 border-orange-200 hover:border-orange-400 text-orange-700 hover:text-orange-800 w-full">
                <FileText className="w-4 h-4 mr-2" />
                規約改定
              </Button>
            </Link>
            <Link href={`/condominiums/${id}/decisions`}>
              <Button variant="outline" size="sm" className="bg-orange-50 hover:bg-orange-100 border-orange-200 hover:border-orange-400 text-orange-700 hover:text-orange-800 w-full">
                <Search className="w-4 h-4 mr-2" />
                議案管理
              </Button>
            </Link>
            <Link href={`/condominiums/${id}/issues`}>
              <Button variant="outline" size="sm" className="bg-orange-50 hover:bg-orange-100 border-orange-200 hover:border-orange-400 text-orange-700 hover:text-orange-800 w-full">
                <AlertTriangle className="w-4 h-4 mr-2" />
                案件管理
              </Button>
            </Link>
            {/* Second Row */}
            <Link href={`/condominiums/${id}/decision-history`}>
              <Button variant="outline" size="sm" className="bg-orange-50 hover:bg-orange-100 border-orange-200 hover:border-orange-400 text-orange-700 hover:text-orange-800 w-full">
                <BarChart3 className="w-4 h-4 mr-2" />
                決議履歴検索
              </Button>
            </Link>
            <Link href={`/condominiums/${id}/document-search`}>
              <Button variant="outline" size="sm" className="bg-orange-50 hover:bg-orange-100 border-orange-200 hover:border-orange-400 text-orange-700 hover:text-orange-800 w-full">
                <FileOutput className="w-4 h-4 mr-2" />
                議事録検索
              </Button>
            </Link>
            <Link href={`/condominiums/${id}/upload`}>
              <Button variant="outline" size="sm" className="bg-orange-50 hover:bg-orange-100 border-orange-200 hover:border-orange-400 text-orange-700 hover:text-orange-800 w-full">
                <Upload className="w-4 h-4 mr-2" />
                議事録アップロード
              </Button>
            </Link>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">管理組合理事長</p>
                <p className="text-lg font-semibold text-gray-900">田中 一郎様</p>
                <p className="text-sm text-gray-500">連絡先: xxx-xxx-xxxx</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">次回会議・総会</p>
                <p className="text-sm text-gray-500 mt-1">前回: 2025年3月</p>
                <p className="text-lg font-semibold text-gray-900">次回: 2025年8月</p>
                <p className="text-sm text-gray-500">議事録更新</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">法改正対応状況</p>
                <div className="mt-2">
                  <Badge variant={
                    condominium.lawRevisionStatus === 'completed' ? 'default' :
                    condominium.lawRevisionStatus === 'in_progress' ? 'secondary' :
                    'destructive'
                  }>
                    {condominium.lawRevisionStatus === 'completed' ? '完了' :
                     condominium.lawRevisionStatus === 'in_progress' ? '進行中' : '未着手'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 mt-1">期限: 2025年3月</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">最近の活動</p>
                <p className="text-lg font-semibold text-gray-900">
                  {condominium.lastActivity ? new Date(condominium.lastActivity).toLocaleDateString('ja-JP') : '未記録'}
                </p>
                <p className="text-sm text-gray-500">議事録更新</p>
              </div>
            </CardContent>
          </Card>
        </div>


      </div>

      {/* Tabs */}
      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic">基本情報</TabsTrigger>
          <TabsTrigger value="regulations">管理規約</TabsTrigger>
          <TabsTrigger value="decisions">決議履歴</TabsTrigger>
          <TabsTrigger value="minutes">議事録</TabsTrigger>
          <TabsTrigger value="files">その他ファイル</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">マンション名</label>
                  <p className="text-gray-900">{condominium.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">所在地</label>
                  <p className="text-gray-900">{condominium.address}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">総戸数</label>
                  <p className="text-gray-900">{condominium.units}戸</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">築年数</label>
                  <p className="text-gray-900">築{new Date().getFullYear() - condominium.buildYear}年（{condominium.buildYear}年建築）</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">管理開始日</label>
                  <p className="text-gray-900">{new Date(condominium.managementStartDate).toLocaleDateString('ja-JP')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">現行規約版数</label>
                  <p className="text-gray-900">第{condominium.currentRegulationVersion}版</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="minutes">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>議事録管理</CardTitle>
            </CardHeader>
            <CardContent>
              {documents?.filter((doc: any) => doc.type === 'minutes').length > 0 ? (
                <div className="space-y-3">
                  {documents.filter((doc: any) => doc.type === 'minutes').map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="text-blue-500" size={20} />
                        <div>
                          <p className="font-medium">{doc.title}</p>
                          <p className="text-sm text-gray-500">
                            {doc.fileSize && `${Math.round(doc.fileSize / 1024)}KB`} • 
                            {new Date(doc.uploadedAt).toLocaleDateString('ja-JP')}
                          </p>
                        </div>
                      </div>
                      <Badge variant={
                        doc.ocrStatus === 'completed' ? 'default' :
                        doc.ocrStatus === 'processing' ? 'secondary' :
                        doc.ocrStatus === 'failed' ? 'destructive' : 'outline'
                      }>
                        {doc.ocrStatus === 'completed' ? 'OCR完了' :
                         doc.ocrStatus === 'processing' ? 'OCR処理中' :
                         doc.ocrStatus === 'failed' ? 'OCR失敗' : 'OCR待機'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="mx-auto mb-4" size={48} />
                  <p>議事録がアップロードされていません</p>
                  <Link href={`/condominiums/${id}/upload`}>
                    <Button className="mt-4" variant="outline">
                      議事録をアップロード
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="decisions">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>決議履歴</CardTitle>
            </CardHeader>
            <CardContent>
              {decisions?.length > 0 ? (
                <div className="space-y-4">
                  {decisions.map((decision: any) => (
                    <div key={decision.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{decision.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{decision.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>開催日: {new Date(decision.meetingDate).toLocaleDateString('ja-JP')}</span>
                            <span>カテゴリ: {decision.category}</span>
                            {decision.relatedRegulationArticle && (
                              <span>関連条文: {decision.relatedRegulationArticle}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={
                            decision.result === 'approved' ? 'default' :
                            decision.result === 'rejected' ? 'destructive' : 'secondary'
                          }>
                            {decision.result === 'approved' ? '可決' :
                             decision.result === 'rejected' ? '否決' : '保留'}
                          </Badge>
                          {decision.votingResults && (
                            <div className="text-xs text-gray-500 mt-1">
                              賛成{decision.votingResults.favor} 反対{decision.votingResults.against} 棄権{decision.votingResults.abstain}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="mx-auto mb-4" size={48} />
                  <p>決議履歴がありません</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regulations">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>規約管理</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <FileText className="mx-auto mb-4" size={48} />
                <p>規約データが準備中です</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>ファイル管理</CardTitle>
            </CardHeader>
            <CardContent>
              {documents?.length > 0 ? (
                <div className="space-y-3">
                  {documents.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="text-blue-500" size={20} />
                        <div>
                          <p className="font-medium">{doc.title}</p>
                          <p className="text-sm text-gray-500">
                            {doc.type} • {doc.fileSize && `${Math.round(doc.fileSize / 1024)}KB`} • 
                            {new Date(doc.uploadedAt).toLocaleDateString('ja-JP')}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        ダウンロード
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="mx-auto mb-4" size={48} />
                  <p>ファイルがアップロードされていません</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
