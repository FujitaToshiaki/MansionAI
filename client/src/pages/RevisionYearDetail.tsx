import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Calendar,
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  FileText,
  ArrowLeft,
  Edit,
  Eye,
  Target,
  User,
  Plus
} from "lucide-react";

interface RevisionHeader {
  id: string;
  year: number;
  title: string;
  description: string;
  status: 'planning' | 'in_progress' | 'completed' | 'cancelled';
  total_items: number;
  completed_items: number;
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

interface RegulationRevision {
  id: number;
  category: string;
  title: string;
  change_description: string;
  before_text: string;
  after_text: string;
  article_number: string;
  reference_section: string;
  change_type: 'addition' | 'modification' | 'deletion';
  creation_date: string;
  group_id: string;
  revision_header_id: string;
}

const getChangeTypeInfo = (type: RegulationRevision['change_type']) => {
  switch (type) {
    case 'addition':
      return { label: '新設', color: 'bg-green-100 text-green-800' };
    case 'modification':
      return { label: '改訂', color: 'bg-blue-100 text-blue-800' };
    case 'deletion':
      return { label: '削除', color: 'bg-red-100 text-red-800' };
    default:
      return { label: '不明', color: 'bg-gray-100 text-gray-800' };
  }
};

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

export default function RevisionYearDetail() {
  const params = useParams<{ id: string }>();

  const { data, isLoading } = useQuery<{
    header: RevisionHeader;
    revisions: RegulationRevision[];
  }>({
    queryKey: ['/api/revision-headers', params.id],
    queryFn: async () => {
      const response = await fetch(`/api/revision-headers/${params.id}`);
      if (!response.ok) throw new Error('改訂詳細の取得に失敗しました');
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

  const calculateProgress = (revisions: RegulationRevision[]) => {
    if (!revisions || revisions.length === 0) return 0;
    // For demonstration, let's count first 6 items as completed
    const completedCount = Math.min(6, revisions.length);
    return Math.round((completedCount / revisions.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-96"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          改訂年度が見つかりません
        </h3>
      </div>
    );
  }

  const { header, revisions } = data;
  const statusInfo = getStatusInfo(header.status);
  const StatusIcon = statusInfo.icon;
  const progress = calculateProgress(revisions);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/revision-years">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              年度一覧へ戻る
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              令和{header.year}年度改訂 - {header.title}
            </h1>
            <p className="text-gray-600 mt-2">{header.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={statusInfo.color}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusInfo.label}
          </Badge>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            新規項目追加
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            改訂概要
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">進捗状況</span>
              <span className="text-sm font-semibold text-gray-900">
                6 / {revisions.length} 項目完了
              </span>
            </div>
            <Progress value={progress} className="h-2 mb-2" />
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>完了率: {progress}%</span>
              <span>残り: {revisions.length - 6} 項目</span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
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
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <div>
                <span className="text-gray-600">総項目数: </span>
                <span className="font-medium">{revisions.length} 項目</span>
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
        </CardContent>
      </Card>

      {/* Revisions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>改訂項目一覧</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">全 {revisions.length} 項目</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">No.</TableHead>
                <TableHead className="w-24">カテゴリ</TableHead>
                <TableHead>タイトル</TableHead>
                <TableHead className="w-20">条文</TableHead>
                <TableHead className="w-24">変更種別</TableHead>
                <TableHead className="w-20">状態</TableHead>
                <TableHead className="w-32">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {revisions.map((revision, index) => {
                const changeTypeInfo = getChangeTypeInfo(revision.change_type);
                const isCompleted = index < 6; // First 6 items are completed for demo
                
                return (
                  <TableRow key={revision.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {revision.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{revision.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-md">
                          {revision.change_description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">第{revision.article_number}条</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={changeTypeInfo.color}>
                        {changeTypeInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {isCompleted ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          完了
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Clock className="h-3 w-3 mr-1" />
                          進行中
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {revisions.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                改訂項目が登録されていません
              </h3>
              <p className="text-gray-600 mb-4">
                新規改訂項目を追加して管理を開始してください
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                新規項目追加
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}