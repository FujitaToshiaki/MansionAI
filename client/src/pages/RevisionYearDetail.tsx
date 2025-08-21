import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, FileText, CheckCircle, Clock, AlertTriangle, Calendar, User, BarChart3, BookOpen, ExternalLink, Package, Monitor, Users, Shield, Car, AlertCircle, Edit3, Save, X, Download } from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  const [editingRevisions, setEditingRevisions] = useState<{[key: number]: boolean}>({});
  const [editedTexts, setEditedTexts] = useState<{[key: number]: string}>({});
  const [showProposalModal, setShowProposalModal] = useState(false);
  const queryClient = useQueryClient();

  // Function to generate PDF download
  const handlePDFDownload = () => {
    // Create a new window with the proposal content for printing/PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>第1号議案 管理規約変更の件【特別決議】</title>
          <style>
            body { font-family: 'Noto Sans JP', sans-serif; margin: 20px; line-height: 1.6; }
            .header { text-align: center; border: 2px solid #000; padding: 10px; margin-bottom: 20px; }
            .content { margin: 20px 0; }
            .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .table th, .table td { border: 1px solid #000; padding: 8px; text-align: left; }
            .table th { background-color: #f5f5f5; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>第1号議案 管理規約変更の件【特別決議】</h2>
          </div>
          
          <div class="content">
            <p>現在、1階店舗兼事務所(A)の売却について、管理組合と後継会社にて協議を行っております。協議を行う中で、管理規約上「しきり相互銀行」の名称が残っており、現況との乖離があることを改編する必要があると判断しました。なお、これまでの経緯で、「東日本銀行」へ読み替える旨は決議されておりますが、今後も区分所有者の変更の可能性があることを鑑みて、名称自体を削除することとしております。</p>
            
            <p>本来であれば、全文見直しを行い、現況に即した内容に改編する必要があるものの、1階店舗兼事務所(A)については、売却を行う必要があるため、先んじて変更することとしました。</p>
            
            <p>上記を受けて、以下の規約部分を変更することを提案申し上げます。</p>
            
            <p>主旨ご理解の上、ご承認の程宜しくお願いいたします。</p>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th style="width: 50%;">変更前</th>
                <th style="width: 50%;">変更後</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>(駐車場の専用使用権と専用使用)</strong><br>
                  <strong>第15条</strong> 区分所有者は別添の図に示す駐車場施設(台数14台)について、1階店舗兼事務所(A)区分所有者である「しきり相互銀行」が4台分(指定位置No.1～No.4)について確定的に専用使用権を有し、又、残余については他の特定の区分所有者が、管理組合と駐車場使用契約締結のうえ、夫々、専用使用することを承認する。<br>
                  (以下略)
                </td>
                <td>
                  <strong>(駐車場の専用使用権と専用使用)</strong><br>
                  <strong>第15条</strong> 区分所有者は別添の図に示す駐車場施設(台数14台)について、1階店舗兼事務所(A)区分所有者が4台分(指定位置No.1～No.4)について確定的に専用使用権を有し、又、残余については他の特定の区分所有者が、管理組合と駐車場使用契約締結のうえ、夫々、専用使用することを承認する。<br>
                  (以下略)
                </td>
              </tr>
              <tr>
                <td>
                  <strong>(自転車置場の専用使用権と専用使用)</strong><br>
                  <strong>第16条</strong> 区分所有者は別添の図に示す自転車置場(台数146台)について1階店舗兼事務所(A)の区分所有者である「しきり相互銀行」が18台分(本マンション建物の北側非常階段寄りの18台収容部分)<br>
                  について、確定的に専用使用権を有し、残余
                </td>
                <td>
                  <strong>(自転車置場の専用使用権と専用使用)</strong><br>
                  <strong>第16条</strong> 区分所有者は別添の図に示す自転車置場(台数146台)について1階店舗兼事務所(A)の区分所有者が18台分(本マンション建物の北側非常階段寄りの18台収容部分)<br>
                  について、確定的に専用使用権を有し、残余
                </td>
              </tr>
            </tbody>
          </table>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const { data, isLoading, error } = useQuery<RevisionYearDetailData>({
    queryKey: ['/api/revision-headers', id],
    enabled: !!id
  });

  const updateRevisionMutation = useMutation({
    mutationFn: async ({ revisionId, proposedText }: { revisionId: number, proposedText: string }) => {
      const response = await apiRequest(
        'PATCH',
        `/api/regulation-revisions/${revisionId}`,
        { proposed_text: proposedText }
      );
      return response.json();
    },
    onSuccess: (data, variables) => {
      console.log('Successfully saved revision:', data);
      
      // Remove from editing mode
      setEditingRevisions(prev => ({ ...prev, [variables.revisionId]: false }));
      
      // Invalidate and refetch the data
      queryClient.invalidateQueries({ queryKey: ['/api/revision-headers', id] });
    },
    onError: (error) => {
      console.error('Failed to save revision:', error);
    }
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
  
  // Sort revisions by article number, with 別添 items at the end
  const sortedRevisions = [...revisions].sort((a, b) => {
    // Check if items contain 別添 (appendix) - these should come last
    const aIsAppendix = a.article_number.includes('別添');
    const bIsAppendix = b.article_number.includes('別添');
    
    if (aIsAppendix && !bIsAppendix) return 1; // a comes after b
    if (!aIsAppendix && bIsAppendix) return -1; // a comes before b
    if (aIsAppendix && bIsAppendix) return 0; // both appendix, keep original order
    
    // Extract numeric part from article number for sorting
    const getArticleNumber = (articleStr: string) => {
      const match = articleStr.match(/\d+/);
      return match ? parseInt(match[0]) : 0;
    };
    
    const aNum = getArticleNumber(a.article_number);
    const bNum = getArticleNumber(b.article_number);
    
    return aNum - bNum;
  });

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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'IT・デジタル化':
        return <Monitor className="w-4 h-4 text-blue-600" />;
      case '住宅宿泊事業':
        return <Package className="w-4 h-4 text-purple-600" />;
      case '総会関連':
        return <Users className="w-4 h-4 text-green-600" />;
      case '駐車場関連':
        return <Car className="w-4 h-4 text-orange-600" />;
      case '電子システム':
        return <Monitor className="w-4 h-4 text-blue-600" />;
      case '議事録管理':
        return <FileText className="w-4 h-4 text-gray-600" />;
      case '建替え関連':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case '反社会的勢力排除':
        return <Shield className="w-4 h-4 text-red-600" />;
      case '区分所有者関連':
        return <Users className="w-4 h-4 text-indigo-600" />;
      case '損害保険':
        return <Shield className="w-4 h-4 text-blue-600" />;
      case '修繕積立金':
        return <Package className="w-4 h-4 text-green-600" />;
      case '管理人制度':
        return <Users className="w-4 h-4 text-purple-600" />;
      case 'AI・自動化':
        return <Monitor className="w-4 h-4 text-cyan-600" />;
      case '防火・防災':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'データ管理':
        return <FileText className="w-4 h-4 text-gray-600" />;
      case '外部専門家活用詳細':
        return <Users className="w-4 h-4 text-purple-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default' as const;
      case 'in_progress':
        return 'secondary' as const;
      case 'pending':
        return 'outline' as const;
      default:
        return 'outline' as const;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '完了';
      case 'in_progress':
        return '進行中';
      case 'pending':
        return '保留';
      default:
        return '未設定';
    }
  };

  const progressPercentage = header.total_items > 0 ? (header.completed_items / header.total_items) * 100 : 0;

  // Group sorted revisions by category for table of contents
  const groupedRevisions = sortedRevisions.reduce((acc, revision) => {
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

  const startEditing = (revisionId: number, currentText: string) => {
    setEditingRevisions(prev => ({ ...prev, [revisionId]: true }));
    setEditedTexts(prev => ({ ...prev, [revisionId]: currentText }));
  };

  const saveEdit = async (revisionId: number) => {
    const newText = editedTexts[revisionId];
    if (!newText) return;

    updateRevisionMutation.mutate({
      revisionId,
      proposedText: newText
    });
  };

  const cancelEdit = (revisionId: number) => {
    setEditingRevisions(prev => ({ ...prev, [revisionId]: false }));
    setEditedTexts(prev => {
      const newTexts = { ...prev };
      delete newTexts[revisionId];
      return newTexts;
    });
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
            <div className="p-4 space-y-1">
              {sortedRevisions.map((revision) => (
                <button
                  key={revision.id}
                  onClick={() => scrollToSection(`revision-${revision.id}`)}
                  className={`w-full text-left p-3 rounded transition-all duration-200 hover:bg-gray-100 ${
                    activeSection === `revision-${revision.id}` 
                      ? 'bg-blue-50 text-blue-900' 
                      : 'text-gray-700'
                  }`}
                >
                  {/* First Line: Article Number + Category */}
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                      {getCategoryIcon(revision.category)}
                    </div>
                    <span className="font-medium text-sm text-blue-600">
                      {revision.article_number}
                    </span>
                    <span className="text-xs text-gray-500">
                      {revision.category}
                    </span>
                    <Badge 
                      variant={getStatusVariant(revision.status)}
                      className="text-xs ml-auto"
                    >
                      {getStatusText(revision.status)}
                    </Badge>
                  </div>
                  
                  {/* Second Line: Item Title */}
                  <div className="text-sm text-gray-900 ml-6">
                    {revision.title}
                  </div>
                </button>
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
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowProposalModal(true)}
                  className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  議案書作成
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
              {sortedRevisions.length > 0 ? (
                sortedRevisions.map((revision) => (
                  <Card 
                    key={revision.id} 
                    id={`revision-${revision.id}`}
                    className="bg-white hover:shadow-lg transition-all duration-200"
                  >
                    <CardHeader className="bg-white rounded-t-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{revision.title}</h3>
                            <Badge className="bg-red-100 text-red-800">緊急度：高</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">改訂詳細 - {revision.article_number}</p>
                          
                          <div className="flex items-center space-x-4">
                            <Badge variant="outline" className="bg-white">
                              {revision.article_number}
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
                            {/* Proposed Text - Left Side */}
                            {revision.proposed_text && (
                              <div>
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center space-x-2">
                                    <Badge className="bg-blue-100 text-blue-800">改訂案</Badge>
                                    <span className="text-sm font-medium">新しい規約条文</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {editingRevisions[revision.id] ? (
                                      <>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => saveEdit(revision.id)}
                                          disabled={updateRevisionMutation.isPending}
                                          className="h-7 w-7 p-0"
                                        >
                                          {updateRevisionMutation.isPending ? (
                                            <div className="w-3 h-3 border border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                                          ) : (
                                            <Save className="w-3 h-3" />
                                          )}
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => cancelEdit(revision.id)}
                                          className="h-7 w-7 p-0"
                                        >
                                          <X className="w-3 h-3" />
                                        </Button>
                                      </>
                                    ) : (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => startEditing(revision.id, revision.proposed_text || '')}
                                        className="h-7 w-7 p-0 hover:bg-blue-100"
                                      >
                                        <Edit3 className="w-3 h-3" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                                  {editingRevisions[revision.id] ? (
                                    <Textarea
                                      value={editedTexts[revision.id] || revision.proposed_text || ''}
                                      onChange={(e) => setEditedTexts(prev => ({ 
                                        ...prev, 
                                        [revision.id]: e.target.value 
                                      }))}
                                      className="text-sm leading-relaxed min-h-[100px] resize-none bg-white border-blue-200 focus:border-blue-400"
                                      placeholder="改訂案の内容を入力してください..."
                                    />
                                  ) : (
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                      {revision.proposed_text}
                                    </p>
                                  )}
                                  <div className="mt-3 flex items-center space-x-2">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <span className="text-xs text-green-700 font-medium">法的要件を完全満足</span>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* Current Text - Right Side */}
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

      {/* Proposal Creation Modal */}
      <Dialog open={showProposalModal} onOpenChange={setShowProposalModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-xl font-bold">第1号議案 管理規約変更の件【特別決議】</DialogTitle>
            <div className="flex gap-2">
              <Button 
                onClick={handlePDFDownload}
                className="bg-red-600 hover:bg-red-700 text-white"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                PDF出力
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowProposalModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-[calc(90vh-120px)] pr-4">
            <div className="space-y-6 text-sm leading-relaxed">
              {/* Header Section */}
              <div className="text-center border-2 border-black p-4 bg-gray-50">
                <h2 className="text-lg font-bold">第1号議案 管理規約変更の件【特別決議】</h2>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <p>
                  現在、1階店舗兼事務所(A)の売却について、管理組合と後継会社にて協議を行っております。協議を行う中で、管理規約上「しきり相互銀行」の名称が残っており、現況との乖離があることを改編する必要があると判断しました。なお、これまでの経緯で、「東日本銀行」へ読み替える旨は決議されておりますが、今後も区分所有者の変更の可能性があることを鑑みて、名称自体を削除することとしております。
                </p>
                
                <p>
                  本来であれば、全文見直しを行い、現況に即した内容に改編する必要があるものの、1階店舗兼事務所(A)については、売却を行う必要があるため、先んじて変更することとしました。
                </p>
                
                <p>
                  上記を受けて、以下の規約部分を変更することを提案申し上げます。
                </p>
                
                <p>
                  主旨ご理解の上、ご承認の程宜しくお願いいたします。
                </p>
              </div>

              {/* Comparison Table */}
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-3 text-left font-bold w-1/2">変更前</th>
                      <th className="border border-gray-300 p-3 text-left font-bold w-1/2">変更後</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-3 align-top">
                        <div className="space-y-2">
                          <div>
                            <strong>(駐車場の専用使用権と専用使用)</strong>
                          </div>
                          <div>
                            <strong>第15条</strong> 区分所有者は別添の図に示す駐車場施設(台数14台)について、1階店舗兼事務所(A)区分所有者である「<span className="bg-red-200">しきり相互銀行</span>」が4台分(指定位置No.1～No.4)について確定的に専用使用権を有し、又、残余については他の特定の区分所有者が、管理組合と駐車場使用契約締結のうえ、夫々、専用使用することを承認する。
                          </div>
                          <div className="text-gray-600">(以下略)</div>
                        </div>
                      </td>
                      <td className="border border-gray-300 p-3 align-top">
                        <div className="space-y-2">
                          <div>
                            <strong>(駐車場の専用使用権と専用使用)</strong>
                          </div>
                          <div>
                            <strong>第15条</strong> 区分所有者は別添の図に示す駐車場施設(台数14台)について、1階店舗兼事務所(A)区分所有者が4台分(指定位置No.1～No.4)について確定的に専用使用権を有し、又、残余については他の特定の区分所有者が、管理組合と駐車場使用契約締結のうえ、夫々、専用使用することを承認する。
                          </div>
                          <div className="text-gray-600">(以下略)</div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 align-top">
                        <div className="space-y-2">
                          <div>
                            <strong>(自転車置場の専用使用権と専用使用)</strong>
                          </div>
                          <div>
                            <strong>第16条</strong> 区分所有者は別添の図に示す自転車置場(台数146台)について1階店舗兼事務所(A)の区分所有者である「<span className="bg-red-200">しきり相互銀行</span>」が18台分(本マンション建物の北側非常階段寄りの18台収容部分)について、確定的に専用使用権を有し、残余
                          </div>
                        </div>
                      </td>
                      <td className="border border-gray-300 p-3 align-top">
                        <div className="space-y-2">
                          <div>
                            <strong>(自転車置場の専用使用権と専用使用)</strong>
                          </div>
                          <div>
                            <strong>第16条</strong> 区分所有者は別添の図に示す自転車置場(台数146台)について1階店舗兼事務所(A)の区分所有者が18台分(本マンション建物の北側非常階段寄りの18台収容部分)について、確定的に専用使用権を有し、残余
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}