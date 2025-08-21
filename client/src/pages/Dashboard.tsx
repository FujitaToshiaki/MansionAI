import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { 
  Building, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Search, 
  Upload,
  CloudUpload,
  FileText
} from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  console.log("Dashboard component is rendering");
  
  const { data: stats } = useQuery<any>({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: activities } = useQuery<any[]>({
    queryKey: ['/api/dashboard/activities'],
  });

  const { data: condominiums } = useQuery<any[]>({
    queryKey: ['/api/condominiums'],
  });

  console.log("Dashboard data:", { stats, activities, condominiums });

  return (
    <div className="space-y-8">

      {/* Header Section with Image, Name and Buttons */}
      <div className="flex items-center justify-between bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex items-center space-x-6">
          {/* Condominium Image */}
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
            <img 
              src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&w=80&h=80&fit=crop" 
              alt="メゾンドオプテージ" 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Condominium Info */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">メゾンドオプテージ</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>東京都・・・区×××丁目</span>
              <span>総戸数 / 103戸 / 管理開始日：2020/4/1</span>
            </div>
          </div>
        </div>
        
        {/* Right-aligned Button Group */}
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            議事録アップロード
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            規約改訂履歴
          </Button>
          <Button variant="outline" size="sm">
            <Search className="w-4 h-4 mr-2" />
            決議取り扱い
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">管理マンション数</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalCondominiums || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building className="text-blue-600" size={24} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-gray-500">総戸数: {stats?.totalUnits || 0}戸</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">法改正対応完了</p>
                <p className="text-2xl font-bold text-green-600">{stats?.completed || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-600">完了率: {stats?.completionRate || 0}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">対応進行中</p>
                <p className="text-2xl font-bold text-orange-600">{stats?.inProgress || 0}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="text-orange-600" size={24} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-orange-600">進行率: {stats?.progressRate || 0}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">未着手</p>
                <p className="text-2xl font-bold text-red-600">{stats?.pending || 0}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-red-600">要対応: {stats?.pendingRate || 0}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revision Management Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            年度別改訂管理
          </CardTitle>
          <p className="text-gray-600 text-sm">法改正に対応した年度単位での管理規約改訂状況</p>
        </CardHeader>
        <CardContent>
          <Link to="/revision-years">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <FileText className="h-4 w-4 mr-2" />
              年度別改訂一覧を表示
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Condominium List */}
      <Card className="bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>マンション一覧</CardTitle>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={16} />
              <Input type="text" placeholder="検索..." className="bg-gray-100 border-0 pl-10 w-64" />
            </div>
            <Select>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="すべて" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="completed">完了</SelectItem>
                <SelectItem value="in_progress">進行中</SelectItem>
                <SelectItem value="pending">未着手</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-purple-600 hover:bg-purple-700">
              新規登録
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>マンション名</TableHead>
                <TableHead>所在地</TableHead>
                <TableHead>戸数</TableHead>
                <TableHead>管理開始日</TableHead>
                <TableHead>法改正対応</TableHead>
                <TableHead>アクション</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {condominiums?.map((condo: any) => (
                <TableRow key={condo.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center">
                      <img 
                        src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&w=40&h=40&fit=crop" 
                        alt={condo.name} 
                        className="w-10 h-10 rounded-lg mr-3"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{condo.name}</div>
                        <div className="text-sm text-gray-500">築{new Date().getFullYear() - condo.buildYear}年</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">{condo.address}</TableCell>
                  <TableCell className="text-sm text-gray-500">{condo.units}戸</TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(condo.managementStartDate).toLocaleDateString('ja-JP')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      condo.lawRevisionStatus === 'completed' ? 'default' :
                      condo.lawRevisionStatus === 'in_progress' ? 'secondary' :
                      condo.lawRevisionStatus === 'pending' ? 'destructive' : 'outline'
                    }>
                      {condo.lawRevisionStatus === 'completed' && <CheckCircle className="mr-1" size={12} />}
                      {condo.lawRevisionStatus === 'in_progress' && <Clock className="mr-1" size={12} />}
                      {condo.lawRevisionStatus === 'pending' && <AlertTriangle className="mr-1" size={12} />}
                      {condo.lawRevisionStatus === 'completed' ? '完了' :
                       condo.lawRevisionStatus === 'in_progress' ? '進行中' :
                       condo.lawRevisionStatus === 'pending' ? '未着手' : '対応不要'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Link href={`/condominiums/${condo.id}`}>
                        <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-900">
                          詳細
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-900">
                        編集
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )) || (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    マンションデータがありません
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Upload Interface */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>議事録アップロード</CardTitle>
          <p className="text-sm text-gray-600">紙資料をOCR処理してデジタル化します</p>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <CloudUpload className="mx-auto text-4xl text-gray-400 mb-4" size={48} />
            <p className="text-lg font-medium text-gray-700 mb-2">ファイルをドラッグ&ドロップ</p>
            <p className="text-sm text-gray-500 mb-4">または</p>
            <Button className="bg-purple-600 hover:bg-purple-700">
              ファイルを選択
            </Button>
            <p className="text-xs text-gray-500 mt-4">対応形式: PDF, JPG, PNG, TIFF (最大10MB)</p>
          </div>
        </CardContent>
      </Card>

      {/* AI Analysis Preview */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>AI規約改訂分析</CardTitle>
          <p className="text-sm text-gray-600">法改正内容と現行規約の差分を自動分析します</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="bg-gray-50">
                <CardTitle className="text-base">現行規約</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2 text-sm text-gray-700">
                  <p><strong>第3条 ペット飼育について</strong></p>
                  <p>専有部分において、犬、猫その他のペットを飼育してはならない。</p>
                  <div className="text-red-600 bg-red-50 p-2 rounded text-xs">
                    ⚠️ 改訂必要箇所
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-purple-50">
                <CardTitle className="text-base">AI改訂案</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2 text-sm text-gray-700">
                  <p><strong>第3条 ペット飼育について</strong></p>
                  <p className="text-green-600">専有部分において、理事会の承認を得た場合に限り、小型犬・猫に限定してペットを飼育することができる。</p>
                  <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
                    💡 根拠: 2025年改正で飼育制限の緩和が推奨
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-green-50">
                <CardTitle className="text-base">標準規約</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2 text-sm text-gray-700">
                  <p><strong>第3条 ペット飼育について</strong></p>
                  <p>専有部分におけるペット飼育は、管理組合が定める飼育細則に従い、届出制とする。</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">分析進捗:</span>
              <Progress value={75} className="w-64" />
              <span className="text-sm font-medium text-purple-600">75%</span>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline">
                分析レポート出力
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700">
                改訂案を承認
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity and Progress at Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>最近の活動</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities?.map((activity: any, index: number) => (
                <div key={activity.id || index} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.status === 'success' ? 'bg-green-500' : 
                    activity.status === 'in_progress' ? 'bg-blue-500' : 
                    activity.status === 'error' ? 'bg-red-500' : 'bg-gray-400'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.timeAgo}</p>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-gray-500">
                  <p>アクティビティがありません</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Progress Chart */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>法改正対応進捗</CardTitle>
          </CardHeader>
          <CardContent>
            <img 
              src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&w=400&h=200&fit=crop" 
              alt="Progress Chart" 
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">完了</span>
                <span className="text-sm font-semibold text-green-600">{stats?.completionRate || 0}%</span>
              </div>
              <Progress value={stats?.completionRate || 0} className="h-2" />
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">進行中</span>
                <span className="text-sm font-semibold text-orange-600">{stats?.progressRate || 0}%</span>
              </div>
              <Progress value={stats?.progressRate || 0} className="h-2" />
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">未着手</span>
                <span className="text-sm font-semibold text-red-600">{stats?.pendingRate || 0}%</span>
              </div>
              <Progress value={stats?.pendingRate || 0} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
