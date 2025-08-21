import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ChevronRight,
  BarChart3
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
  created_at: string;
  updated_at: string;
}

export default function RevisionGroups() {
  const [, setLocation] = useLocation();

  const { data: revisionGroups = [], isLoading } = useQuery<RevisionGroup[]>({
    queryKey: ['/api/revision-groups'],
    queryFn: async () => {
      const response = await fetch('/api/revision-groups');
      if (!response.ok) throw new Error('改訂グループの取得に失敗しました');
      return response.json();
    }
  });

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">完了</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">進行中</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800">下書き</Badge>;
      case 'approved':
        return <Badge className="bg-purple-100 text-purple-800">承認済み</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const calculateProgress = (completed: number, total: number): number => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getVersionName = (version: string): string => {
    switch (version) {
      case 'r7':
        return '令和7年度改訂';
      case 'r6':
        return '令和6年度改訂';
      case 'r3':
        return '令和3年度改訂';
      case 'h29':
        return '平成29年度改訂';
      default:
        return version;
    }
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">改訂必要箇所一覧</h1>
          <p className="text-gray-600 mt-2">標準管理規約の改訂対応を一括管理</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <BarChart3 className="h-4 w-4 mr-2" />
            進捗レポート
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {revisionGroups.map((group) => {
          const progress = calculateProgress(group.completed_items, group.total_items);
          
          return (
            <Card 
              key={group.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-blue-500"
              onClick={() => setLocation(`/revision-groups/${group.id}`)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(group.status)}
                      <CardTitle className="text-xl">{group.title}</CardTitle>
                      {getStatusBadge(group.status)}
                      <Badge variant="outline" className="bg-gray-50">
                        {getVersionName(group.version)}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm">{group.description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* 進捗情報 */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">改訂進捗</span>
                    <span className="font-medium">
                      {group.completed_items} / {group.total_items} 項目完了 ({progress}%)
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {/* 統計情報 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-gray-600">総項目数</span>
                    <span className="font-semibold">{group.total_items}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-gray-600">完了</span>
                    <span className="font-semibold text-green-600">{group.completed_items}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span className="text-gray-600">残り</span>
                    <span className="font-semibold text-orange-600">
                      {group.total_items - group.completed_items}
                    </span>
                  </div>
                  {group.effective_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      <span className="text-gray-600">施行日</span>
                      <span className="font-semibold text-purple-600">
                        {new Date(group.effective_date).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                  )}
                </div>

                {/* 最終更新日 */}
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>作成日: {new Date(group.created_at).toLocaleDateString('ja-JP')}</span>
                    <span>最終更新: {new Date(group.updated_at).toLocaleDateString('ja-JP')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {revisionGroups.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">改訂グループがありません</h3>
            <p className="text-gray-600 mb-4">まだ改訂対応グループが作成されていません。</p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              新しい改訂グループを作成
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}