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
  BarChart3,
  BookOpen
} from "lucide-react";
import { Link } from "wouter";

import { MinutesTab } from "@/components/MinutesTab";

export default function CondominiumDetail() {
  console.log("CondominiumDetail component is rendering");
  const { id } = useParams();
  
  const { data: condominium, isLoading } = useQuery<any>({
    queryKey: ['/api/condominiums', id],
  });

  const { data: documents } = useQuery<any[]>({
    queryKey: ['/api/condominiums', id, 'documents'],
  });

  const { data: decisions } = useQuery<any[]>({
    queryKey: ['/api/condominiums', id, 'decisions'],
  });

  const { data: knowledgeDocuments } = useQuery<any[]>({
    queryKey: ['/api/condominiums', id, 'knowledge'],
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
                <div className="flex justify-center items-center gap-6 mt-2">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">前回</p>
                    <p className="text-sm font-semibold text-gray-900">2025年3月</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">次回</p>
                    <p className="text-sm font-semibold text-gray-900">2025年8月</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600">法改正対応状況</p>
                <Badge variant={
                  condominium.lawRevisionStatus === 'completed' ? 'default' :
                  condominium.lawRevisionStatus === 'in_progress' ? 'secondary' :
                  'destructive'
                }>
                  {condominium.lawRevisionStatus === 'completed' ? '完了' :
                   condominium.lawRevisionStatus === 'in_progress' ? '進行中' : '未着手'}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-2">期限: 2025年3月</p>
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
              <CardTitle>議事録</CardTitle>
            </CardHeader>
            <CardContent>
              <MinutesTab condominiumId={id || ''} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="decisions">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>決議履歴</CardTitle>
            </CardHeader>
            <CardContent>
              {decisions && decisions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-3 font-medium text-gray-700 w-20">開催日</th>
                        <th className="text-left p-3 font-medium text-gray-700 w-32">会議種別</th>
                        <th className="text-left p-3 font-medium text-gray-700 w-24">カテゴリ</th>
                        <th className="text-left p-3 font-medium text-gray-700 min-w-[250px]">議題</th>
                        <th className="text-left p-3 font-medium text-gray-700 w-40">関連条文</th>
                      </tr>
                    </thead>
                    <tbody>
                      {decisions.map((decision: any) => (
                        <tr key={decision.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 text-sm text-gray-900 align-top">
                            <div className="whitespace-nowrap">{decision.meetingDate}</div>
                          </td>
                          <td className="p-3 text-sm text-gray-600 align-top">
                            <div className="whitespace-nowrap">{decision.meetingType}</div>
                          </td>
                          <td className="p-3 text-sm align-top">
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 whitespace-nowrap">
                              {decision.category || '-'}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm text-gray-900 align-top">
                            <div className="leading-relaxed">{decision.agenda}</div>
                          </td>
                          <td className="p-3 text-xs text-gray-600 align-top">
                            <div className="leading-relaxed">{decision.relatedArticle || '-'}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
              <div className="flex items-center justify-between">
                <CardTitle>規約管理</CardTitle>
                <div className="flex items-center space-x-2">
                  {knowledgeDocuments && knowledgeDocuments.filter((doc: any) => doc.type === 'current_regulation').length > 0 && (
                    <Link href={`/condominiums/${id}/regulations/wiki`}>
                      <Button size="sm">
                        <BookOpen className="mr-2" size={16} />
                        Wiki形式で表示
                      </Button>
                    </Link>
                  )}
                  <Link href={`/condominiums/${id}/knowledge`}>
                    <Button variant="outline" size="sm">
                      <Search className="mr-2" size={16} />
                      ナレッジベース
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {knowledgeDocuments && knowledgeDocuments.filter((doc: any) => doc.type === 'current_regulation').length > 0 ? (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 mb-4">
                    規約文書: {knowledgeDocuments.filter((doc: any) => doc.type === 'current_regulation').length}件
                  </div>
                  {knowledgeDocuments
                    .filter((doc: any) => doc.type === 'current_regulation')
                    .map((doc: any) => (
                    <div key={doc.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <FileText className="text-blue-500" size={20} />
                            <Link href={`/condominiums/${id}/regulations/wiki`}>
                              <h4 className="font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors">
                                {doc.title.includes('全期間議事録データ') || doc.title.includes('議事録') ? 
                                  'メゾンドオプテージ管理規約 現行規約 最新' : doc.title}
                              </h4>
                            </Link>
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              {doc.type === 'current_regulation' ? '現行規約' : 
                               doc.type === 'standard_regulation' ? '標準規約' : 
                               doc.type === 'decision_history' ? '決議履歴' : '文書'}
                            </Badge>
                            <Badge variant="default" className="text-xs bg-blue-100 text-blue-800">
                              最新
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>アップロード: {new Date(doc.uploadedAt).toLocaleDateString('ja-JP')}</span>
                            <span>ファイルサイズ: {Math.round(doc.metadata?.fileSize / 1024 || 0)}KB</span>
                            <span>チャンク数: {doc.chunkCount || 0}個</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="default" className="mb-2">
                            処理完了
                          </Badge>
                          <div className="text-xs text-gray-500">
                            検索可能
                          </div>
                        </div>
                      </div>
                      {doc.originalFileName && (
                        <div className="mt-2 text-xs text-gray-500">
                          元ファイル: {doc.originalFileName}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* 追加の規約バージョン */}
                  <div className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <FileText className="text-blue-500" size={20} />
                          <h4 className="font-medium text-gray-900">メゾンドオプテージ管理規約（第2版）</h4>
                          <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-200">
                            過去版
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">2023年法改正前の管理規約</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>作成: 2023/3/15</span>
                          <span>ファイルサイズ: 420KB</span>
                          <span>チャンク数: 156個</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="mb-2">
                          アーカイブ済
                        </Badge>
                        <div className="text-xs text-gray-500">
                          参照のみ
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      元ファイル: 管理規約_第2版.pdf
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <FileText className="text-blue-500" size={20} />
                          <h4 className="font-medium text-gray-900">メゾンドオプテージ管理規約（第1版）</h4>
                          <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-200">
                            過去版
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">初版管理規約（2020年制定）</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>作成: 2020/4/1</span>
                          <span>ファイルサイズ: 380KB</span>
                          <span>チャンク数: 142個</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="mb-2">
                          アーカイブ済
                        </Badge>
                        <div className="text-xs text-gray-500">
                          参照のみ
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      元ファイル: 管理規約_第1版.pdf
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <FileText className="text-blue-500" size={20} />
                          <h4 className="font-medium text-gray-900">メゾンドオプテージ管理規約（第4版案）</h4>
                          <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                            改正案
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">2025年法改正対応案（検討中）</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>作成: 2025/1/15</span>
                          <span>ファイルサイズ: 465KB</span>
                          <span>チャンク数: 189個</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-2">
                          検討中
                        </Badge>
                        <div className="text-xs text-gray-500">
                          未確定
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      元ファイル: 管理規約_第4版案.pdf
                    </div>
                  </div>

                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="mx-auto mb-4" size={48} />
                  <p>規約文書がアップロードされていません</p>
                  <Link href={`/condominiums/${id}/knowledge`}>
                    <Button className="mt-4" variant="outline">
                      <Upload className="mr-2" size={16} />
                      規約文書をアップロード
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>ファイル管理</CardTitle>
            </CardHeader>
            <CardContent>
              {documents && documents.length > 0 ? (
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
