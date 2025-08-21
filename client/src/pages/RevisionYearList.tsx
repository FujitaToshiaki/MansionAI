import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar,
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  FileText,
  ArrowRight,
  TrendingUp,
  Target,
  User
} from "lucide-react";
import { Link, useLocation } from "wouter";

interface RevisionHeader {
  id: string;
  year: number;
  title: string;
  description: string;
  status: 'planning' | 'in_progress' | 'completed' | 'cancelled';
  total_items: number;
  completed_items: number;
  actual_total_items: number;
  actual_completed_items: number;
  start_date: string;
  target_completion_date: string;
  actual_completion_date: string;
  revision_type: 'law_compliance' | 'internal_improvement' | 'emergency';
  priority_level: 'high' | 'medium' | 'low';
  assigned_manager: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

const getStatusInfo = (status: RevisionHeader['status']) => {
  switch (status) {
    case 'completed':
      return { 
        label: '完了', 
        color: 'bg-green-100 text-green-800', 
        icon: CheckCircle 
      };
    case 'in_progress':
      return { 
        label: '進行中', 
        color: 'bg-blue-100 text-blue-800', 
        icon: Clock 
      };
    case 'planning':
      return { 
        label: '計画中', 
        color: 'bg-yellow-100 text-yellow-800', 
        icon: Target 
      };
    case 'cancelled':
      return { 
        label: '中止', 
        color: 'bg-gray-100 text-gray-800', 
        icon: AlertTriangle 
      };
    default:
      return { 
        label: '不明', 
        color: 'bg-gray-100 text-gray-800', 
        icon: AlertTriangle 
      };
  }
};

const getRevisionTypeInfo = (type: RevisionHeader['revision_type']) => {
  switch (type) {
    case 'law_compliance':
      return { label: '法改正対応', color: 'bg-red-100 text-red-800' };
    case 'internal_improvement':
      return { label: '内部改善', color: 'bg-blue-100 text-blue-800' };
    case 'emergency':
      return { label: '緊急対応', color: 'bg-orange-100 text-orange-800' };
    default:
      return { label: '不明', color: 'bg-gray-100 text-gray-800' };
  }
};

const getPriorityInfo = (priority: RevisionHeader['priority_level']) => {
  switch (priority) {
    case 'high':
      return { label: '高', color: 'bg-red-100 text-red-800' };
    case 'medium':
      return { label: '中', color: 'bg-yellow-100 text-yellow-800' };
    case 'low':
      return { label: '低', color: 'bg-green-100 text-green-800' };
    default:
      return { label: '不明', color: 'bg-gray-100 text-gray-800' };
  }
};

export default function RevisionYearList() {
  const [, setLocation] = useLocation();

  const { data: revisionHeaders = [], isLoading } = useQuery<RevisionHeader[]>({
    queryKey: ['/api/revision-headers'],
    queryFn: async () => {
      const response = await fetch('/api/revision-headers');
      if (!response.ok) throw new Error('改訂ヘッダの取得に失敗しました');
      return response.json();
    }
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateProgress = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">年度別改訂管理</h1>
        </div>
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">年度別改訂管理</h1>
          <p className="text-gray-600 mt-2">法改正に対応した年度単位での管理規約改訂状況</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <FileText className="h-4 w-4 mr-2" />
          新規改訂年度追加
        </Button>
      </div>

      {/* Revision Headers Grid */}
      <div className="grid gap-6">
        {revisionHeaders.map((header) => {
          const statusInfo = getStatusInfo(header.status);
          const typeInfo = getRevisionTypeInfo(header.revision_type);
          const priorityInfo = getPriorityInfo(header.priority_level);
          const StatusIcon = statusInfo.icon;
          const progress = calculateProgress(
            header.actual_completed_items || header.completed_items, 
            header.actual_total_items || header.total_items
          );

          return (
            <Card key={header.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-xl font-bold">
                        令和{header.year}年度改訂 - {header.title}
                      </CardTitle>
                      <Badge className={statusInfo.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                      <Badge className={typeInfo.color}>
                        {typeInfo.label}
                      </Badge>
                      <Badge variant="outline" className={priorityInfo.color}>
                        優先度: {priorityInfo.label}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm">{header.description}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Progress Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">進捗状況</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {header.actual_completed_items || header.completed_items} / {header.actual_total_items || header.total_items} 項目
                    </span>
                  </div>
                  <Progress value={progress} className="h-2 mb-2" />
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>完了率: {progress}%</span>
                    <span>残り: {(header.actual_total_items || header.total_items) - (header.actual_completed_items || header.completed_items)} 項目</span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <span className="text-gray-600">開始日: </span>
                      <span className="font-medium">{formatDate(header.start_date)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-gray-500" />
                    <div>
                      <span className="text-gray-600">目標完了: </span>
                      <span className="font-medium">{formatDate(header.target_completion_date)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <span className="text-gray-600">担当者: </span>
                      <span className="font-medium">{header.assigned_manager || '未割当'}</span>
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                {header.notes && (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <h6 className="text-sm font-medium text-blue-900 mb-1">備考</h6>
                    <p className="text-sm text-blue-800">{header.notes}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setLocation(`/revision-years/${header.id}`)}
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    改訂項目一覧
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <TrendingUp className="h-4 w-4" />
                    進捗詳細
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <ArrowRight className="h-4 w-4" />
                    詳細設定
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {revisionHeaders.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              改訂年度が登録されていません
            </h3>
            <p className="text-gray-600 mb-4">
              新規改訂年度を追加して管理を開始してください
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <FileText className="h-4 w-4 mr-2" />
              新規改訂年度追加
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}