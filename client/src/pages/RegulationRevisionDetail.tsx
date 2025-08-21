import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  FileText, 
  Calendar, 
  User, 
  AlertCircle, 
  Edit, 
  Save, 
  X, 
  CheckCircle, 
  Clock, 
  BookOpen,
  ArrowRightLeft,
  Download,
  Share,
  History,
  ExternalLink,
  Tag
} from 'lucide-react';

interface RegulationRevision {
  id: number;
  category: string;
  title: string;
  change_description: string;
  before_text?: string;
  after_text?: string;
  article_number?: string;
  reference_section?: string;
  change_type: string;
  creation_date?: string;
  group_id?: string;
  group_title?: string;
  group_version?: string;
}

export default function RegulationRevisionDetail() {
  const [, params] = useRoute('/regulation-revisions/:id');
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<RegulationRevision>>({});
  
  const revisionId = params?.id;
  const queryClient = useQueryClient();

  // 改訂項目詳細データの取得
  const { data: revision, isLoading } = useQuery<RegulationRevision>({
    queryKey: ['/api/regulation-revisions', revisionId],
    queryFn: async () => {
      const response = await fetch(`/api/regulation-revisions/${revisionId}`);
      if (!response.ok) throw new Error('改訂項目の取得に失敗しました');
      return response.json();
    },
    enabled: !!revisionId
  });

  // 編集用のミューテーション（将来の機能拡張用）
  const updateRevision = useMutation({
    mutationFn: async (data: Partial<RegulationRevision>) => {
      const response = await fetch(`/api/regulation-revisions/${revisionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('更新に失敗しました');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/regulation-revisions', revisionId] });
      setIsEditing(false);
    }
  });

  const getChangeTypeColor = (changeType: string) => {
    switch (changeType) {
      case '新設':
        return 'bg-green-100 text-green-800 border-green-200';
      case '追加':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case '義務化':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case '改正':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case '廃止':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getChangeTypeIcon = (changeType: string) => {
    switch (changeType) {
      case '新設':
        return <CheckCircle className="h-4 w-4" />;
      case '追加':
        return <FileText className="h-4 w-4" />;
      case '義務化':
        return <AlertCircle className="h-4 w-4" />;
      case '改正':
        return <ArrowRightLeft className="h-4 w-4" />;
      case '廃止':
        return <X className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const handleStartEdit = () => {
    setEditData({
      title: revision?.title || '',
      change_description: revision?.change_description || '',
      before_text: revision?.before_text || '',
      after_text: revision?.after_text || '',
      article_number: revision?.article_number || '',
      reference_section: revision?.reference_section || ''
    });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    updateRevision.mutate(editData);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({});
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-40 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!revision) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">改訂項目が見つかりません</h3>
        <Button onClick={() => setLocation('/revision-groups')}>
          改訂グループ一覧に戻る
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => revision.group_id ? setLocation(`/revision-groups/${revision.group_id}`) : setLocation('/revision-groups')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            戻る
          </Button>
          
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getChangeTypeColor(revision.change_type)}`}>
                {getChangeTypeIcon(revision.change_type)}
                <span className="text-sm font-medium">{revision.change_type}</span>
              </div>
              
              <Badge variant="outline" className="bg-gray-50">
                {revision.category}
              </Badge>
              
              {revision.article_number && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  第{revision.article_number}条
                </Badge>
              )}
              
              {revision.group_title && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700">
                  {revision.group_title}
                </Badge>
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900">{revision.title}</h1>
            
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              {revision.creation_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(revision.creation_date).toLocaleDateString('ja-JP')}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Tag className="h-4 w-4" />
                <span>改訂ID: {revision.id}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            PDF出力
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Share className="h-4 w-4" />
            共有
          </Button>
          <Button 
            onClick={isEditing ? handleSaveEdit : handleStartEdit}
            disabled={updateRevision.isPending}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            {isEditing ? (
              <>
                <Save className="h-4 w-4" />
                保存
              </>
            ) : (
              <>
                <Edit className="h-4 w-4" />
                編集
              </>
            )}
          </Button>
          {isEditing && (
            <Button 
              variant="outline" 
              onClick={handleCancelEdit}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              キャンセル
            </Button>
          )}
        </div>
      </div>

      {/* 変更内容詳細 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            変更内容詳細
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">タイトル</Label>
                <Input
                  id="title"
                  value={editData.title || ''}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="description">変更概要</Label>
                <Textarea
                  id="description"
                  value={editData.change_description || ''}
                  onChange={(e) => setEditData({ ...editData, change_description: e.target.value })}
                  rows={4}
                  className="mt-1"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="article">条文番号</Label>
                  <Input
                    id="article"
                    value={editData.article_number || ''}
                    onChange={(e) => setEditData({ ...editData, article_number: e.target.value })}
                    placeholder="例: 18"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="reference">参照箇所</Label>
                  <Input
                    id="reference"
                    value={editData.reference_section || ''}
                    onChange={(e) => setEditData({ ...editData, reference_section: e.target.value })}
                    placeholder="例: 第18条第1項"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {revision.change_description}
              </p>
              
              {revision.reference_section && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800 mb-1 font-medium">参照箇所</p>
                  <p className="text-blue-700">{revision.reference_section}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 変更前後比較 */}
      {(revision.before_text || revision.after_text) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5" />
              変更前後比較
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 変更前 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <h4 className="font-semibold text-gray-900">変更前</h4>
                </div>
                {isEditing ? (
                  <Textarea
                    value={editData.before_text || ''}
                    onChange={(e) => setEditData({ ...editData, before_text: e.target.value })}
                    rows={8}
                    placeholder="変更前の条文内容"
                    className="w-full"
                  />
                ) : (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                      {revision.before_text || '変更前の内容は記録されていません'}
                    </p>
                  </div>
                )}
              </div>

              {/* 変更後 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h4 className="font-semibold text-gray-900">変更後</h4>
                </div>
                {isEditing ? (
                  <Textarea
                    value={editData.after_text || ''}
                    onChange={(e) => setEditData({ ...editData, after_text: e.target.value })}
                    rows={8}
                    placeholder="変更後の条文内容"
                    className="w-full"
                  />
                ) : (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                      {revision.after_text || '変更後の内容は記録されていません'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 関連情報・履歴 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 変更履歴 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              変更履歴
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 pb-3 border-b border-gray-200">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">改訂項目作成</p>
                  <p className="text-xs text-gray-600">
                    {revision.creation_date ? new Date(revision.creation_date).toLocaleString('ja-JP') : '不明'}
                  </p>
                </div>
              </div>
              
              <div className="text-center py-4 text-gray-500 text-sm">
                他の変更履歴はありません
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 関連リンク */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              関連情報
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {revision.group_id && (
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setLocation(`/revision-groups/${revision.group_id}`)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  改訂グループ詳細を見る
                </Button>
              )}
              
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="h-4 w-4 mr-2" />
                標準管理規約を確認
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                関連会議録を確認
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ステータス情報 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            ステータス情報
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">実装待ち</div>
              <div className="text-sm text-gray-600">現在のステータス</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">-</div>
              <div className="text-sm text-gray-600">実施予定日</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">-</div>
              <div className="text-sm text-gray-600">担当者</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}