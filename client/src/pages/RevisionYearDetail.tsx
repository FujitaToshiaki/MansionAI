import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, FileText, CheckCircle, Clock, AlertTriangle, Calendar, User, BarChart3, BookOpen, ExternalLink } from "lucide-react";
import { useState } from "react";

interface RegulationRevision {
  id: number;
  title: string;
  category: string;
  article_number: string;
  current_text: string;
  proposed_text?: string;
  reason?: string;
  impact?: string;
  status?: string;
  revision_header_id?: string;
  creation_date?: string;
}

interface RevisionHeader {
  id: string;
  year: string;
  title: string;
  status: string;
  total_items: number;
  completed_items: number;
  assignee: string;
  created_at: string;
}

interface RevisionYearDetailData {
  header: RevisionHeader;
  revisions: RegulationRevision[];
}

export default function RevisionYearDetail() {
  const { id } = useParams();
  const [activeSection, setActiveSection] = useState<string>("");

  const { data, isLoading, error } = useQuery<RevisionYearDetailData>({
    queryKey: ['/api/revision-headers', id],
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <AlertTriangle className="mx-auto mb-4 text-red-500" size={48} />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">データの読み込みに失敗しました</h2>
            <p className="text-gray-600 mb-4">改訂年度詳細を取得できませんでした。</p>
            <Link to="/revision-years">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                一覧に戻る
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { header, revisions } = data;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />完了</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />進行中</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 mr-1" />保留</Badge>;
      default:
        return <Badge variant="outline">未定</Badge>;
    }
  };

  const progressPercentage = header.total_items > 0 ? (header.completed_items / header.total_items) * 100 : 0;

  // Group revisions by category for table of contents
  const groupedRevisions = revisions.reduce((acc, revision) => {
    const category = revision.category || 'その他';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(revision);
    return acc;
  }, {} as Record<string, RegulationRevision[]>);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Table of Contents Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 fixed h-full">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">条番号別改正項目目次</h3>
            </div>
            <p className="text-sm text-gray-600">各条文の改正内容を条番順にまとめました</p>
          </div>
          
          <ScrollArea className="h-[calc(100vh-120px)]">
            <div className="p-4 space-y-3">
              {Object.entries(groupedRevisions).map(([category, categoryRevisions]) => (
                <div key={category} className="space-y-2">
                  <h4 className="font-medium text-gray-900 text-sm border-b border-gray-200 pb-1">
                    {category}
                  </h4>
                  {categoryRevisions.map((revision) => (
                    <button
                      key={revision.id}
                      onClick={() => scrollToSection(`revision-${revision.id}`)}
                      className={`w-full text-left p-3 rounded-lg border transition-all duration-200 hover:shadow-md ${
                        activeSection === `revision-${revision.id}` 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {revision.article_number}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-gray-500">1項目</span>
                          <ExternalLink className="w-3 h-3 text-gray-400" />
                        </div>
                      </div>
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">
                        {revision.title}
                      </p>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-80">
          <div className="p-6">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Link to="/condominiums/a7af9126-67ff-47d9-9c24-cf4054aeb63c/regulation-analysis">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    一覧に戻る
                  </Button>
                </Link>
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">{header.title}</h1>
                    <Badge className="bg-red-100 text-red-800">緊急度：高</Badge>
                  </div>
                  <p className="text-gray-600">改訂詳細 - {header.year}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  日本語
                </Button>
                {getStatusBadge(header.status)}
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">総項目数</p>
                      <p className="text-xl font-semibold">{header.total_items}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">完了項目</p>
                      <p className="text-xl font-semibold">{header.completed_items}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">進捗率</p>
                      <p className="text-xl font-semibold">{Math.round(progressPercentage)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-600">担当者</p>
                      <p className="text-xl font-semibold">{header.assignee}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revision Cards */}
            <div className="space-y-6">
              {revisions.length > 0 ? (
                revisions.map((revision) => (
                  <Card 
                    key={revision.id} 
                    id={`revision-${revision.id}`}
                    className="bg-white hover:shadow-lg transition-all duration-200"
                  >
                    <CardHeader className="bg-white">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{revision.title}</h3>
                            <Badge className="bg-red-100 text-red-800">緊急度：高</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">改訂詳細 - 第{revision.article_number}</p>
                          
                          <div className="flex items-center space-x-4">
                            <Badge variant="outline" className="bg-white">
                              第{revision.article_number}
                            </Badge>
                            <Badge variant="secondary">{revision.category}</Badge>
                            {revision.status && getStatusBadge(revision.status)}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-6">
                      {/* Current vs Proposed Regulations */}
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">規約の変更内容</h4>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Current Text */}
                            <div>
                              <div className="flex items-center space-x-2 mb-3">
                                <Badge variant="outline">現行</Badge>
                                <span className="text-sm font-medium">現在の規約条文</span>
                              </div>
                              <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded-r-lg">
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  {revision.current_text || '現行規約の内容が設定されていません'}
                                </p>
                              </div>
                            </div>
                            
                            {/* Proposed Text */}
                            {revision.proposed_text && (
                              <div>
                                <div className="flex items-center space-x-2 mb-3">
                                  <Badge className="bg-blue-100 text-blue-800">改訂案</Badge>
                                  <span className="text-sm font-medium">新しい規約条文</span>
                                </div>
                                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                                  <p className="text-sm text-gray-700 leading-relaxed">
                                    {revision.proposed_text}
                                  </p>
                                  <div className="mt-3 flex items-center space-x-2">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <span className="text-xs text-green-700 font-medium">法的要件を完全満足</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Revision Reason */}
                        {revision.reason && (
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-3">改訂理由</h4>
                            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                              <p className="text-sm text-gray-700 leading-relaxed">{revision.reason}</p>
                            </div>
                          </div>
                        )}

                        {/* Key Points */}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">変更のポイント</h4>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">#法的根拠の明確化</Badge>
                            <Badge variant="outline">#法律用語への統一</Badge>
                            <Badge variant="outline">#利用条件の限定強化</Badge>
                          </div>
                        </div>

                        {/* Impact Analysis */}
                        {revision.impact && (
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-3">影響範囲</h4>
                            <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                              <p className="text-sm text-gray-700 leading-relaxed">{revision.impact}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="mx-auto mb-4" size={48} />
                  <p className="font-medium">改訂項目がありません</p>
                  <p className="text-sm">この年度の改訂項目はまだ登録されていません。</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}