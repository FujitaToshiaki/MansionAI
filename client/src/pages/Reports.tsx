import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Building, FileText, Bot, Clock, TrendingUp, AlertTriangle, CheckCircle, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Color palette for charts
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

interface ReportData {
  condominiumStats: {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
  };
  regulationStats: {
    totalRevisions: number;
    approvedRevisions: number;
    pendingRevisions: number;
    rejectedRevisions: number;
  };
  ocrStats: {
    totalDocuments: number;
    processedDocuments: number;
    averageAccuracy: number;
    highAccuracyDocs: number;
  };
  aiAnalysisStats: {
    totalAnalyses: number;
    completedAnalyses: number;
    averageProcessingTime: number;
    successRate: number;
  };
  monthlyActivity: Array<{
    month: string;
    documents: number;
    analyses: number;
    revisions: number;
  }>;
  categoryBreakdown: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  complianceStatus: Array<{
    condominium: string;
    compliance: number;
    issues: number;
    status: 'excellent' | 'good' | 'warning' | 'critical';
  }>;
}

export default function Reports() {
  const { data: reportData, isLoading } = useQuery<ReportData>({
    queryKey: ["/api/reports"],
    queryFn: async () => {
      // Mock data for demonstration
      return {
        condominiumStats: {
          total: 4,
          completed: 1,
          inProgress: 2,
          pending: 1,
        },
        regulationStats: {
          totalRevisions: 47,
          approvedRevisions: 32,
          pendingRevisions: 12,
          rejectedRevisions: 3,
        },
        ocrStats: {
          totalDocuments: 156,
          processedDocuments: 142,
          averageAccuracy: 94.2,
          highAccuracyDocs: 128,
        },
        aiAnalysisStats: {
          totalAnalyses: 89,
          completedAnalyses: 76,
          averageProcessingTime: 2.4,
          successRate: 96.8,
        },
        monthlyActivity: [
          { month: '7月', documents: 24, analyses: 18, revisions: 12 },
          { month: '8月', documents: 32, analyses: 28, revisions: 15 },
          { month: '9月', documents: 28, analyses: 22, revisions: 10 },
          { month: '10月', documents: 35, analyses: 31, revisions: 18 },
          { month: '11月', documents: 37, analyses: 29, revisions: 14 },
        ],
        categoryBreakdown: [
          { name: '建替え関連', value: 23, color: COLORS[0] },
          { name: 'IT・デジタル化', value: 18, color: COLORS[1] },
          { name: '防火・防災', value: 15, color: COLORS[2] },
          { name: '管理費・修繕積立金', value: 12, color: COLORS[3] },
          { name: 'その他', value: 9, color: COLORS[4] },
        ],
        complianceStatus: [
          { condominium: 'メゾンドオプテージ', compliance: 92, issues: 2, status: 'excellent' },
          { condominium: 'グランマンションB', compliance: 78, issues: 5, status: 'good' },
          { condominium: 'サンライズC', compliance: 65, issues: 8, status: 'warning' },
          { condominium: 'パークサイドD', compliance: 45, issues: 12, status: 'critical' },
        ],
      };
    },
  });

  if (isLoading || !reportData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">レポート</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'excellent': return 'default';
      case 'good': return 'secondary';
      case 'warning': return 'outline';
      case 'critical': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'good': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6" data-testid="reports-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">レポート</h1>
        <div className="flex items-center space-x-4">
          <Select defaultValue="monthly">
            <SelectTrigger className="w-32" data-testid="period-selector">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">週次</SelectItem>
              <SelectItem value="monthly">月次</SelectItem>
              <SelectItem value="quarterly">四半期</SelectItem>
              <SelectItem value="yearly">年次</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" data-testid="export-button">
            レポート出力
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card data-testid="card-condominiums">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">管理マンション数</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.condominiumStats.total}</p>
                <p className="text-sm text-green-600">完了: {reportData.condominiumStats.completed}</p>
              </div>
              <Building className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-regulations">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">規約改正数</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.regulationStats.totalRevisions}</p>
                <p className="text-sm text-green-600">承認: {reportData.regulationStats.approvedRevisions}</p>
              </div>
              <FileText className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-ocr">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">OCR処理精度</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.ocrStats.averageAccuracy}%</p>
                <p className="text-sm text-blue-600">処理済: {reportData.ocrStats.processedDocuments}</p>
              </div>
              <Bot className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-ai-analysis">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI分析成功率</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.aiAnalysisStats.successRate}%</p>
                <p className="text-sm text-orange-600">完了: {reportData.aiAnalysisStats.completedAnalyses}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Activity Chart */}
        <Card data-testid="chart-monthly-activity">
          <CardHeader>
            <CardTitle>月次活動状況</CardTitle>
            <CardDescription>文書処理、AI分析、規約改正の推移</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.monthlyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="documents" fill={COLORS[0]} name="文書処理" />
                <Bar dataKey="analyses" fill={COLORS[1]} name="AI分析" />
                <Bar dataKey="revisions" fill={COLORS[2]} name="規約改正" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card data-testid="chart-category-breakdown">
          <CardHeader>
            <CardTitle>改正カテゴリ別分布</CardTitle>
            <CardDescription>規約改正項目の分類別件数</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reportData.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {reportData.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Status */}
      <Card data-testid="compliance-status">
        <CardHeader>
          <CardTitle>コンプライアンス状況</CardTitle>
          <CardDescription>各マンションの法令適合状況</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData.complianceStatus.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(item.status)}
                  <div>
                    <p className="font-medium text-gray-900">{item.condominium}</p>
                    <p className="text-sm text-gray-600">課題: {item.issues}件</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-32">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>適合率</span>
                      <span>{item.compliance}%</span>
                    </div>
                    <Progress value={item.compliance} className="h-2" />
                  </div>
                  <Badge variant={getStatusBadgeVariant(item.status)}>
                    {item.status === 'excellent' ? '優良' : 
                     item.status === 'good' ? '良好' :
                     item.status === 'warning' ? '注意' : '要改善'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card data-testid="stats-processing">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              処理時間統計
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">平均OCR処理時間</span>
              <span className="font-medium">1.8分</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">平均AI分析時間</span>
              <span className="font-medium">{reportData.aiAnalysisStats.averageProcessingTime}分</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">平均規約作成時間</span>
              <span className="font-medium">12.5分</span>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="stats-accuracy">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bot className="h-5 w-5 mr-2" />
              精度統計
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">高精度文書率</span>
              <span className="font-medium">{Math.round((reportData.ocrStats.highAccuracyDocs / reportData.ocrStats.totalDocuments) * 100)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">AI分析精度</span>
              <span className="font-medium">{reportData.aiAnalysisStats.successRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">規約適合率</span>
              <span className="font-medium">89.3%</span>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="stats-utilization">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              利用統計
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">月間アクティブユーザー</span>
              <span className="font-medium">23人</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">月間処理文書数</span>
              <span className="font-medium">156件</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">月間AI分析数</span>
              <span className="font-medium">89件</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}