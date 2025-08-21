import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ChevronRight,
  Calendar,
  Filter,
  Download,
  Edit
} from 'lucide-react';

interface RevisionGroup {
  id: string;
  title: string;
  version: string;
  description: string;
  total_items: number;
  completed_items: number;
  status: string;
  effective_date: string | null;
  revision_count: number;
}

interface RegulationRevision {
  id: number;
  category: string;
  title: string;
  change_description: string;
  article_number?: string;
  reference_section?: string;
  change_type: string;
  creation_date?: string;
  group_id?: string;
}

export default function RevisionGroupDetail() {
  const [, params] = useRoute('/revision-groups/:id');
  const [, setLocation] = useLocation();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const groupId = params?.id;

  // 改訂グループ情報の取得
  const { data: revisionGroup, isLoading: groupLoading } = useQuery<RevisionGroup>({
    queryKey: ['/api/revision-groups', groupId],
    queryFn: async () => {
      const response = await fetch(`/api/revision-groups/${groupId}`);
      if (!response.ok) throw new Error('改訂グループの取得に失敗しました');
      return response.json();
    },
    enabled: !!groupId
  });

  // 改訂項目一覧の取得
  const { data: revisions = [], isLoading: revisionsLoading } = useQuery<RegulationRevision[]>({
    queryKey: ['/api/revision-groups', groupId, 'revisions'],
    queryFn: async () => {
      const response = await fetch(`/api/revision-groups/${groupId}/revisions`);
      if (!response.ok) throw new Error('改訂項目の取得に失敗しました');
      return response.json();
    },
    enabled: !!groupId
  });

  const getChangeTypeColor = (changeType: string) => {
    switch (changeType) {
      case '新設':
        return 'bg-green-100 text-green-800';
      case '追加':
        return 'bg-blue-100 text-blue-800';
      case '義務化':
        return 'bg-purple-100 text-purple-800';
      case '改正':
        return 'bg-orange-100 text-orange-800';
      case '廃止':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'draft':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  // フィルタリング機能
  const categories = Array.from(new Set(revisions.map(r => r.category)));
  const changeTypes = Array.from(new Set(revisions.map(r => r.change_type)));
  
  const filteredRevisions = revisions.filter(revision => {
    const categoryMatch = filterCategory === 'all' || revision.category === filterCategory;
    const typeMatch = filterType === 'all' || revision.change_type === filterType;
    return categoryMatch && typeMatch;
  });

  if (groupLoading || revisionsLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!revisionGroup) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">改訂グループが見つかりません</h3>
        <Button onClick={() => setLocation('/revision-groups')}>
          改訂グループ一覧に戻る
        </Button>
      </div>
    );
  }

  const progress = revisionGroup.total_items > 0 
    ? Math.round((revisionGroup.completed_items / revisionGroup.total_items) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => setLocation('/revision-groups')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            戻る
          </Button>
          
          <div>
            <div className="flex items-center gap-3 mb-2">
              {getStatusIcon(revisionGroup.status)}
              <h1 className="text-3xl font-bold text-gray-900">{revisionGroup.title}</h1>
              <Badge className="bg-blue-100 text-blue-800">
                {revisionGroup.revision_count || revisions.length} 項目
              </Badge>
            </div>
            <p className="text-gray-600">{revisionGroup.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => {
              const element = document.getElementById('table-of-contents');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <Filter className="h-4 w-4" />
            目次へ
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            一括出力
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            <Edit className="h-4 w-4" />
            一括編集
          </Button>
        </div>
      </div>

      {/* 進捗カード */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            改訂進捗概要
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{revisions.length}</div>
              <div className="text-sm text-gray-600">総項目数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{revisionGroup.completed_items}</div>
              <div className="text-sm text-gray-600">完了項目</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {revisions.length - revisionGroup.completed_items}
              </div>
              <div className="text-sm text-gray-600">残り項目</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{progress}%</div>
              <div className="text-sm text-gray-600">進捗率</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>全体進捗</span>
              <span>{revisionGroup.completed_items} / {revisions.length} 完了</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* フィルター */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            フィルター
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">カテゴリー</label>
              <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">全て</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">変更種別</label>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">全て</option>
                {changeTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 目次 */}
      <Card id="table-of-contents">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            改訂項目目次 ({filteredRevisions.length} 件)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {filteredRevisions.map((revision, index) => (
              <button
                key={revision.id}
                onClick={() => {
                  const element = document.getElementById(`revision-${revision.id}`);
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-left p-2 hover:bg-gray-100 rounded text-sm flex items-center gap-2"
              >
                <span className="text-gray-500 font-mono">第{index + 1}条</span>
                <span className="text-blue-600 hover:text-blue-800 truncate">
                  {revision.title}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 改訂項目詳細一覧 */}
      <div className="space-y-8">
        {filteredRevisions.map((revision, index) => (
          <Card 
            key={revision.id} 
            id={`revision-${revision.id}`}
            className="scroll-mt-6"
          >
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                      第{index + 1}条
                    </div>
                    <Badge className={getChangeTypeColor(revision.change_type)}>
                      {revision.change_type}
                    </Badge>
                    <Badge variant="outline">{revision.category}</Badge>
                    {revision.article_number && (
                      <Badge variant="outline" className="bg-gray-50">
                        第{revision.article_number}条
                      </Badge>
                    )}
                  </div>
                  
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {revision.title}
                  </CardTitle>
                  
                  {revision.reference_section && (
                    <p className="text-sm text-gray-600 mt-1">
                      参照: {revision.reference_section}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {revision.creation_date && (
                    <span>{new Date(revision.creation_date).toLocaleDateString('ja-JP')}</span>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-6">
              {/* 変更理由 */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">改訂理由</h4>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-3 rounded">
                  {revision.change_description}
                </p>
              </div>

              {/* 変更前後比較 */}
              {(revision.before_text || revision.after_text) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 変更前 */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <h4 className="font-semibold text-gray-900">改訂前</h4>
                    </div>
                    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                        {revision.before_text || '改訂前の内容は記録されていません'}
                      </p>
                    </div>
                  </div>

                  {/* 変更後 */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <h4 className="font-semibold text-gray-900">現在の条文</h4>
                    </div>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                        {revision.after_text || '改訂後の内容は記録されていません'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* アクションボタン */}
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                <Button variant="outline" size="sm">
                  詳細を表示
                </Button>
                <Button variant="outline" size="sm">
                  履歴を確認
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRevisions.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              条件に一致する改訂項目がありません
            </h3>
            <p className="text-gray-600">
              フィルター条件を変更して再度お試しください。
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}