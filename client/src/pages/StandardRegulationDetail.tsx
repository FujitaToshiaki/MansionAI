import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Calendar, 
  Download, 
  ArrowLeft, 
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Search,
  Filter
} from "lucide-react";
import { Link } from "wouter";

interface RevisionComparison {
  articleNumber: string;
  title: string;
  before: string;
  after: string;
  changeType: 'addition' | 'modification' | 'deletion';
  rationale: string;
  category: string;
}

// アップロードされた改訂内容をRAG化したデータ
const revisionData: Record<string, RevisionComparison[]> = {
  "r6-revision": [
    {
      articleNumber: "第12条",
      title: "専有部分の用途",
      before: "区分所有者は、その専有部分を専ら住宅として使用するものとし、他の用途に供してはならない。",
      after: "区分所有者は、その専有部分を専ら住宅として使用するものとし、他の用途に供してはならない。\n２ 区分所有者は、その専有部分を住宅宿泊事業法（平成２９年法律第６５号）第３条第１項の届出を行って営む同法第２条第３項の住宅宿泊事業に使用することができる。",
      changeType: "addition",
      rationale: "住宅宿泊事業（民泊）に関する取り扱いを明確化するため、新たに第2項を追加。住宅宿泊事業法に基づく適正な届出を前提とした民泊事業を可能とする。",
      category: "住宅宿泊事業"
    },
    {
      articleNumber: "第35条",
      title: "役員",
      before: "理事及び監事は、組合員のうちから、総会で選任する。",
      after: "理事及び監事は、組合員のうちから、総会で選任する。\n２ 前項の規定にかかわらず、理事及び監事は、組合員以外の者のうちから選任することができる。",
      changeType: "addition",
      rationale: "外部専門家の活用を可能とするため、組合員以外からの役員選任を認める規定を追加。マンション管理士等の専門知識を有する外部専門家の活用により、管理組合運営の適正化を図る。",
      category: "外部専門家活用"
    },
    {
      articleNumber: "第46条",
      title: "議決権",
      before: "各組合員の議決権は、第14条に定める議決権の割合による。",
      after: "各組合員の議決権は、第14条に定める議決権の割合による。\n２ 組合員以外の理事は、議決権を有しない。",
      changeType: "addition",
      rationale: "外部専門家が理事に就任した場合の議決権の取り扱いを明確化。組合員以外の理事は議決権を有しないことを明示し、組合員の権利保護を図る。",
      category: "外部専門家活用"
    },
    {
      articleNumber: "第54条",
      title: "決議事項",
      before: "次の各号に掲げる事項については、総会の決議を経なければならない。\n(1) 収支予算及び事業計画並びにこれらの変更\n(2) 収支決算\n(3) 管理費等及び使用料の額並びに賦課徴収方法\n(4) 役員の選任及び解任\n(5) 規約及び使用細則等の制定、変更及び廃止\n(6) 専有部分等の変更\n(7) 建物の建替え\n(8) その他管理組合の業務に関する重要事項",
      after: "次の各号に掲げる事項については、総会の決議を経なければならない。\n(1) 収支予算及び事業計画並びにこれらの変更\n(2) 収支決算\n(3) 管理費等及び使用料の額並びに賦課徴収方法\n(4) 役員の選任及び解任\n(5) 規約及び使用細則等の制定、変更及び廃止\n(6) 専有部分等の変更\n(7) 建物の建替え\n(8) 長期修繕計画の作成又は変更\n(9) その他管理組合の業務に関する重要事項",
      changeType: "addition",
      rationale: "長期修繕計画の重要性に鑑み、その作成又は変更について総会決議事項として明確化。適切な修繕計画により建物の維持保全を図る。",
      category: "修繕・維持管理"
    },
    {
      articleNumber: "第18条",
      title: "専有部分の修繕等",
      before: "区分所有者は、その専有部分について、修繕、模様替え又は建具の取替えを行おうとするときは、あらかじめ、理事長にその旨を申請し、書面による承認を受けなければならない。",
      after: "区分所有者は、その専有部分について、修繕、模様替え又は建具の取替えを行おうとするときは、あらかじめ、理事長にその旨を申請し、書面による承認を受けなければならない。\n２ 前項の規定にかかわらず、専有部分の模様替え等であって、建物の構造に影響を与えず、かつ、他の区分所有者の利害に関係しないと認められるものについては、理事長への報告をもって足りる。",
      changeType: "addition",
      rationale: "軽微な模様替え等については手続きを簡素化し、区分所有者の利便性向上を図る。建物の構造や他の区分所有者への影響がない場合は報告のみで足りることとする。",
      category: "手続き簡素化"
    }
  ]
};

const revisionInfo = {
  "r6-revision": {
    version: "令和6年改正版",
    title: "マンション標準管理規約（単棟型）令和6年改正",
    revisionDate: "2024-03-01",
    effectiveDate: "2024-04-01",
    description: "マンション管理の適正化を図るため、外部専門家の活用や住宅宿泊事業への対応等について規定を整備"
  }
};

export default function StandardRegulationDetail() {
  const [match, params] = useRoute("/standard-regulations/:id");
  const [comparisonMode, setComparisonMode] = useState<'side-by-side' | 'unified'>('side-by-side');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const revisionId = params?.id || "";
  const revision = revisionInfo[revisionId as keyof typeof revisionInfo];
  const comparisons = revisionData[revisionId as keyof typeof revisionData] || [];

  const filteredComparisons = comparisons.filter(comparison => {
    const matchesSearch = searchTerm === "" || 
      comparison.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comparison.articleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comparison.rationale.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || comparison.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(comparisons.map(c => c.category)));

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case 'addition': return 'bg-green-100 text-green-800 border-green-200';
      case 'modification': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'deletion': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getChangeTypeLabel = (type: string) => {
    switch (type) {
      case 'addition': return '追加';
      case 'modification': return '修正';
      case 'deletion': return '削除';
      default: return '変更';
    }
  };

  if (!revision) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-500">指定された改訂版が見つかりません</p>
          <Link href="/standard-regulations">
            <Button className="mt-4">一覧に戻る</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500">
        <Link href="/standard-regulations" className="hover:text-gray-700">標準規約改訂版管理</Link>
        <span className="mx-2">{'>'}</span>
        <span>{revision.version}</span>
      </nav>

      {/* Header */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Link href="/standard-regulations">
                  <Button variant="ghost" size="sm" className="mr-2">
                    <ArrowLeft size={16} />
                  </Button>
                </Link>
                <FileText className="mr-2" size={24} />
                {revision.version}
              </CardTitle>
              <p className="text-gray-600 mt-2">{revision.description}</p>
            </div>
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
              <Button size="sm" variant="outline">
                <Download className="mr-1" size={14} />
                DL
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">改正日:</span>
              <p className="font-medium">{new Date(revision.revisionDate).toLocaleDateString('ja-JP')}</p>
            </div>
            <div>
              <span className="text-gray-600">施行日:</span>
              <p className="font-medium">{new Date(revision.effectiveDate).toLocaleDateString('ja-JP')}</p>
            </div>
            <div>
              <span className="text-gray-600">変更条文数:</span>
              <p className="font-medium">{comparisons.length}箇所</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="bg-white">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder="条文番号、タイトル、改正理由で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-gray-600" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border rounded px-3 py-2 text-sm"
              >
                <option value="all">全カテゴリ</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison List */}
      <div className="space-y-6">
        {filteredComparisons.map((comparison, index) => (
          <Card key={index} className="bg-white">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-3">
                    <span>{comparison.articleNumber}</span>
                    <span>（{comparison.title}）</span>
                    <Badge className={getChangeTypeColor(comparison.changeType)}>
                      {getChangeTypeLabel(comparison.changeType)}
                    </Badge>
                    <Badge variant="outline">{comparison.category}</Badge>
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-2">{comparison.rationale}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {comparisonMode === 'side-by-side' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-white border">
                    <CardHeader className="bg-red-50 py-3">
                      <CardTitle className="text-base text-red-900">改正前</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                        {comparison.before}
                      </pre>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white border">
                    <CardHeader className="bg-green-50 py-3">
                      <CardTitle className="text-base text-green-900">改正後</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                        {comparison.after}
                      </pre>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-red-50 p-4 rounded border-l-4 border-red-500">
                    <p className="text-sm font-medium text-red-900 mb-2">改正前</p>
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed text-red-800 font-sans">
                      {comparison.before}
                    </pre>
                  </div>
                  <div className="flex items-center justify-center">
                    <ArrowRight className="text-gray-400" size={20} />
                  </div>
                  <div className="bg-green-50 p-4 rounded border-l-4 border-green-500">
                    <p className="text-sm font-medium text-green-900 mb-2">改正後</p>
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed text-green-800 font-sans">
                      {comparison.after}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredComparisons.length === 0 && (
        <Card className="bg-white">
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-500">検索条件に該当する改正内容が見つかりません</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}