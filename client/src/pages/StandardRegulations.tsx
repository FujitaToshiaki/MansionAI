import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Calendar, 
  Download, 
  Eye, 
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter
} from "lucide-react";

interface RegulationRevision {
  id: string;
  version: string;
  title: string;
  revisionDate: string;
  effectiveDate: string;
  status: 'current' | 'upcoming' | 'archived';
  majorChanges: string[];
  changedArticles: number;
  description: string;
}

const mockRevisions: RegulationRevision[] = [
  {
    id: "r6-revision",
    version: "令和6年改正版",
    title: "マンション標準管理規約（単棟型）令和6年改正",
    revisionDate: "2024-03-01",
    effectiveDate: "2024-04-01",
    status: "current",
    majorChanges: [
      "外部専門家の活用に関する規定整備",
      "住宅宿泊事業に関する条項の明確化",
      "管理組合運営の適正化措置",
      "決議要件の見直し"
    ],
    changedArticles: 15,
    description: "マンション管理の適正化を図るため、外部専門家の活用や住宅宿泊事業への対応等について規定を整備"
  },
  {
    id: "h30-revision",
    version: "平成30年改正版",
    title: "マンション標準管理規約（単棟型）平成30年改正",
    revisionDate: "2018-03-01",
    effectiveDate: "2018-04-01",
    status: "archived",
    majorChanges: [
      "コミュニティ条項の削除",
      "外部専門家活用の基本的考え方",
      "暴力団排除条項の追加"
    ],
    changedArticles: 8,
    description: "コミュニティ形成に関する条項の見直しと、外部専門家活用に関する基本的な考え方を整理"
  }
];

const comparisonData = {
  article12: {
    title: "第12条（専有部分の用途）",
    before: "区分所有者は、その専有部分を専ら住宅として使用するものとし、他の用途に供してはならない。",
    after: "区分所有者は、その専有部分を専ら住宅として使用するものとし、他の用途に供してはならない。\n２ 区分所有者は、その専有部分を住宅宿泊事業法（平成２９年法律第６５号）第３条第１項の届出を行って営む同法第２条第３項の住宅宿泊事業に使用することができる。",
    changeType: "addition",
    rationale: "住宅宿泊事業（民泊）に関する取り扱いを明確化するため、新たに第2項を追加"
  },
  article35: {
    title: "第35条（役員）",
    before: "理事及び監事は、組合員のうちから、総会で選任する。",
    after: "理事及び監事は、組合員のうちから、総会で選任する。\n２ 前項の規定にかかわらず、理事及び監事は、組合員以外の者のうちから選任することができる。",
    changeType: "addition",
    rationale: "外部専門家の活用を可能とするため、組合員以外からの役員選任を認める規定を追加"
  }
};

export default function StandardRegulations() {
  const [selectedRevision, setSelectedRevision] = useState<string>("r6-revision");
  const [comparisonMode, setComparisonMode] = useState<'side-by-side' | 'unified'>('side-by-side');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current': return 'bg-green-100 text-green-800 border-green-200';
      case 'upcoming': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'current': return <CheckCircle size={14} />;
      case 'upcoming': return <Clock size={14} />;
      case 'archived': return <FileText size={14} />;
      default: return <FileText size={14} />;
    }
  };

  const currentRevision = mockRevisions.find(r => r.id === selectedRevision);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500">
        <span>規約管理</span>
        <span className="mx-2">{'>'}</span>
        <span>標準規約改訂版管理</span>
      </nav>

      {/* Header */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2" size={24} />
            標準規約改訂版管理
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            国土交通省が公表するマンション標準管理規約の改訂版を管理し、各改正点の詳細な比較確認を行えます。
          </p>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <CheckCircle size={16} className="text-green-600" />
              <span>現行版: 令和6年改正版</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar size={16} className="text-gray-600" />
              <span>最終更新: 2024年3月1日</span>
            </div>
            <div className="flex items-center space-x-1">
              <AlertCircle size={16} className="text-orange-600" />
              <span>改正箇所: 15条文</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revision List */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>改訂版一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockRevisions.map((revision) => (
              <Card 
                key={revision.id} 
                className={`cursor-pointer transition-all ${
                  selectedRevision === revision.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedRevision(revision.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-medium text-lg">{revision.version}</h3>
                        <Badge className={`${getStatusColor(revision.status)} flex items-center space-x-1`}>
                          {getStatusIcon(revision.status)}
                          <span>
                            {revision.status === 'current' ? '現行版' :
                             revision.status === 'upcoming' ? '予定' : 'アーカイブ'}
                          </span>
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{revision.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">改正日:</span>
                          <p className="font-medium">{new Date(revision.revisionDate).toLocaleDateString('ja-JP')}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">施行日:</span>
                          <p className="font-medium">{new Date(revision.effectiveDate).toLocaleDateString('ja-JP')}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">変更条文数:</span>
                          <p className="font-medium">{revision.changedArticles}箇所</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <span className="text-gray-500 text-sm">主な改正点:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {revision.majorChanges.slice(0, 3).map((change, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {change}
                            </Badge>
                          ))}
                          {revision.majorChanges.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{revision.majorChanges.length - 3}件
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 ml-4">
                      <Button size="sm" variant="outline">
                        <Eye className="mr-1" size={14} />
                        詳細
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="mr-1" size={14} />
                        DL
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Details */}
      {currentRevision && (
        <Card className="bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{currentRevision.version} - 改正内容詳細</CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant={comparisonMode === 'side-by-side' ? 'default' : 'outline'}
                  onClick={() => setComparisonMode('side-by-side')}
                >
                  左右比較
                </Button>
                <Button
                  size="sm"
                  variant={comparisonMode === 'unified' ? 'default' : 'outline'}
                  onClick={() => setComparisonMode('unified')}
                >
                  統合表示
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="article12" className="space-y-4">
              <TabsList>
                <TabsTrigger value="article12">第12条</TabsTrigger>
                <TabsTrigger value="article35">第35条</TabsTrigger>
              </TabsList>
              
              <TabsContent value="article12" className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4 mb-4">
                  <h3 className="font-medium text-lg mb-2">{comparisonData.article12.title}</h3>
                  <p className="text-sm text-gray-600">{comparisonData.article12.rationale}</p>
                </div>
                
                {comparisonMode === 'side-by-side' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-white">
                      <CardHeader className="bg-red-50">
                        <CardTitle className="text-base text-red-900">改正前</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                          {comparisonData.article12.before}
                        </pre>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-white">
                      <CardHeader className="bg-green-50">
                        <CardTitle className="text-base text-green-900">改正後</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                          {comparisonData.article12.after}
                        </pre>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card className="bg-white">
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="bg-red-50 p-3 rounded border-l-4 border-red-500">
                          <p className="text-sm font-medium text-red-900 mb-2">削除・変更部分</p>
                          <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed text-red-800">
                            {comparisonData.article12.before}
                          </pre>
                        </div>
                        <div className="flex items-center justify-center">
                          <ArrowRight className="text-gray-400" size={20} />
                        </div>
                        <div className="bg-green-50 p-3 rounded border-l-4 border-green-500">
                          <p className="text-sm font-medium text-green-900 mb-2">追加・修正部分</p>
                          <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed text-green-800">
                            {comparisonData.article12.after}
                          </pre>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="article35" className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4 mb-4">
                  <h3 className="font-medium text-lg mb-2">{comparisonData.article35.title}</h3>
                  <p className="text-sm text-gray-600">{comparisonData.article35.rationale}</p>
                </div>
                
                {comparisonMode === 'side-by-side' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-white">
                      <CardHeader className="bg-red-50">
                        <CardTitle className="text-base text-red-900">改正前</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                          {comparisonData.article35.before}
                        </pre>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-white">
                      <CardHeader className="bg-green-50">
                        <CardTitle className="text-base text-green-900">改正後</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                          {comparisonData.article35.after}
                        </pre>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card className="bg-white">
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="bg-red-50 p-3 rounded border-l-4 border-red-500">
                          <p className="text-sm font-medium text-red-900 mb-2">削除・変更部分</p>
                          <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed text-red-800">
                            {comparisonData.article35.before}
                          </pre>
                        </div>
                        <div className="flex items-center justify-center">
                          <ArrowRight className="text-gray-400" size={20} />
                        </div>
                        <div className="bg-green-50 p-3 rounded border-l-4 border-green-500">
                          <p className="text-sm font-medium text-green-900 mb-2">追加・修正部分</p>
                          <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed text-green-800">
                            {comparisonData.article35.after}
                          </pre>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}