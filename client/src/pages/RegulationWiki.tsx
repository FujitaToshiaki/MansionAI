import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Building, 
  Search, 
  FileText, 
  ChevronRight,
  ArrowLeft,
  BookOpen,
  Hash,
  Calendar,
  Database,
  Eye,
  Menu,
  Filter,
  Home,
  ChevronDown,
  ChevronUp,
  Copy,
  Share2,
  Download
} from "lucide-react";

interface RegulationChunk {
  id: string;
  content: string;
  chunkIndex: number;
  metadata: {
    startChar: number;
    endChar: number;
    type: string;
  };
}

interface TableOfContent {
  id: string;
  title: string;
  level: number;
  startPosition: number;
  content?: string;
  children?: TableOfContent[];
  expanded?: boolean;
}

export default function RegulationWiki() {
  const { id } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChunk, setSelectedChunk] = useState<RegulationChunk | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tableOfContents, setTableOfContents] = useState<TableOfContent[]>([]);
  const [activeSection, setActiveSection] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<TableOfContent | null>(null);

  const { data: condominium } = useQuery({
    queryKey: ['/api/condominiums', id],
  });

  const { data: knowledgeDocuments, isLoading } = useQuery({
    queryKey: ['/api/condominiums', id, 'knowledge'],
  });

  const { data: searchResults } = useQuery({
    queryKey: ['/api/condominiums', id, 'knowledge/search'],
    queryFn: async () => {
      if (!searchQuery.trim()) return null;
      const response = await fetch(`/api/condominiums/${id}/knowledge/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });
      return response.json();
    },
    enabled: !!searchQuery.trim()
  });

  // Generate table of contents from document content
  useEffect(() => {
    if (knowledgeDocuments?.[0]?.content) {
      const content = knowledgeDocuments[0].content;
      const toc = generateTableOfContents(content);
      setTableOfContents(toc);
    }
  }, [knowledgeDocuments]);

  const generateTableOfContents = (content: string): TableOfContent[] => {
    const lines = content.split('\n');
    const toc: TableOfContent[] = [];
    let currentId = 0;
    let currentSection: TableOfContent | null = null;

    lines.forEach((line, index) => {
      // Match main headers like **第X条** 
      const mainHeaderMatch = line.match(/\*\*第(\d+)条[^*]*\*\*/);
      // Match sub headers like **（条文名）**
      const subHeaderMatch = line.match(/\*\*（(.+?)）\*\*/);
      
      if (mainHeaderMatch) {
        // Extract content for this section
        const sectionContent = extractSectionContent(content, index);
        currentSection = {
          id: `section-${currentId++}`,
          title: `第${mainHeaderMatch[1]}条`,
          level: 1,
          startPosition: index,
          content: sectionContent,
          children: [],
          expanded: false
        };
        toc.push(currentSection);
      } else if (subHeaderMatch && currentSection) {
        const subsectionContent = extractSubsectionContent(content, index);
        currentSection.children?.push({
          id: `subsection-${currentId++}`,
          title: subHeaderMatch[1].trim(),
          level: 2,
          startPosition: index,
          content: subsectionContent,
          children: [],
          expanded: false
        });
      }
    });

    return toc;
  };

  const extractSectionContent = (content: string, startIndex: number): string => {
    const lines = content.split('\n');
    let endIndex = lines.length;
    
    // Find the next main section
    for (let i = startIndex + 1; i < lines.length; i++) {
      if (lines[i].match(/\*\*第\d+条[^*]*\*\*/)) {
        endIndex = i;
        break;
      }
    }
    
    return lines.slice(startIndex, endIndex).join('\n').trim();
  };

  const extractSubsectionContent = (content: string, startIndex: number): string => {
    const lines = content.split('\n');
    let endIndex = lines.length;
    
    // Find the next subsection or main section
    for (let i = startIndex + 1; i < lines.length; i++) {
      if (lines[i].match(/\*\*（.+?）\*\*/) || lines[i].match(/\*\*第\d+条[^*]*\*\*/)) {
        endIndex = i;
        break;
      }
    }
    
    return lines.slice(startIndex, endIndex).join('\n').trim();
  };

  const handleSearch = () => {
    // Trigger search by updating the query key
  };

  const toggleSection = (sectionId: string) => {
    setTableOfContents(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, expanded: !section.expanded }
        : section
    ));
  };

  const selectSection = (section: TableOfContent) => {
    setSelectedSection(section);
    setActiveSection(section.id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  const currentDocument = knowledgeDocuments?.[0];

  const renderRegulationContent = (content: string) => {
    if (!content) return null;
    
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;
      
      // Main headers (第X条)
      if (trimmedLine.match(/\*\*第\d+条[^*]*\*\*/)) {
        const headerText = trimmedLine.replace(/\*\*/g, '');
        elements.push(
          <h1 key={index} className="text-2xl font-bold text-gray-900 mb-4 mt-8 pb-2 border-b border-gray-200">
            {headerText}
          </h1>
        );
      }
      // Sub headers (（条文名）)
      else if (trimmedLine.match(/\*\*（.+?）\*\*/)) {
        const headerText = trimmedLine.replace(/\*\*/g, '').replace(/[（）]/g, '');
        elements.push(
          <h2 key={index} className="text-xl font-semibold text-gray-800 mb-3 mt-6">
            {headerText}
          </h2>
        );
      }
      // Numbered items (1. 2. etc.)
      else if (trimmedLine.match(/^\d+\./)) {
        elements.push(
          <div key={index} className="mb-3 pl-4">
            <p className="text-gray-900 leading-relaxed">{trimmedLine}</p>
          </div>
        );
      }
      // Regular paragraphs
      else if (trimmedLine.length > 0) {
        elements.push(
          <p key={index} className="text-gray-800 leading-relaxed mb-4">
            {trimmedLine}
          </p>
        );
      }
    });
    
    return elements;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="lg:hidden"
              >
                <Menu size={18} />
              </Button>
              <Link href={`/condominiums/${id}`}>
                <Button variant="ghost" size="sm">
                  <Home className="mr-2" size={16} />
                  ホーム
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <nav className="flex items-center space-x-2 text-sm">
                <Link href="/" className="text-blue-600 hover:text-blue-800">ホーム</Link>
                <ChevronRight size={14} className="text-gray-400" />
                <Link href={`/condominiums/${id}`} className="text-blue-600 hover:text-blue-800">
                  {condominium?.name}
                </Link>
                <ChevronRight size={14} className="text-gray-400" />
                <span className="text-gray-900 font-medium">管理規約</span>
              </nav>
            </div>
            
            {/* Right side */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Input
                  placeholder="規約を検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-80 pr-10"
                />
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={handleSearch}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                >
                  <Search size={16} />
                </Button>
              </div>
              <Button variant="outline" size="sm">
                <Share2 className="mr-2" size={16} />
                共有
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2" size={16} />
                ダウンロード
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar - Table of Contents */}
        <aside className={`${sidebarCollapsed ? 'w-0' : 'w-80'} transition-all duration-300 overflow-hidden bg-white border-r border-gray-200`}>
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">コンテンツ</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Filter size={14} />
                <span>規約文書の目次</span>
              </div>
            </div>
            
            {/* Table of Contents */}
            <ScrollArea className="h-[calc(100vh-200px)]">
              <nav className="space-y-1">
                {tableOfContents.map((section) => (
                  <div key={section.id}>
                    {/* Main Section */}
                    <div className="flex">
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="p-2 hover:bg-gray-100 transition-colors"
                      >
                        {section.children && section.children.length > 0 ? (
                          section.expanded ? 
                            <ChevronDown size={14} className="text-gray-400" /> : 
                            <ChevronRight size={14} className="text-gray-400" />
                        ) : (
                          <div className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => selectSection(section)}
                        className={`flex-1 text-left p-2 rounded-md text-sm hover:bg-gray-100 transition-colors ${
                          activeSection === section.id ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' : 'text-gray-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Hash size={12} className="text-gray-400" />
                          <span className="truncate font-medium">{section.title}</span>
                        </div>
                      </button>
                    </div>
                    
                    {/* Subsections */}
                    {section.expanded && section.children && (
                      <div className="ml-6 space-y-1">
                        {section.children.map((subsection) => (
                          <button
                            key={subsection.id}
                            onClick={() => selectSection(subsection)}
                            className={`w-full text-left p-2 rounded-md text-sm hover:bg-gray-100 transition-colors ${
                              activeSection === subsection.id ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-600' : 'text-gray-600'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-gray-300 rounded-full" />
                              <span className="truncate text-xs">{subsection.title}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </ScrollArea>

            {/* Document Info */}
            {knowledgeDocuments?.[0] && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-sm text-gray-900 mb-2">文書情報</h4>
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>ファイルサイズ:</span>
                    <span>{Math.round(knowledgeDocuments[0].metadata?.fileSize / 1024 || 0)}KB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>チャンク数:</span>
                    <span>{knowledgeDocuments[0].chunkCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>アップロード日:</span>
                    <span>{new Date(knowledgeDocuments[0].uploadedAt).toLocaleDateString('ja-JP')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Search Results */}
            {searchResults && searchResults.chunks?.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium text-sm text-gray-900 mb-2">
                  検索結果 ({searchResults.chunks.length}件)
                </h4>
                <div className="space-y-1">
                  {searchResults.chunks.slice(0, 5).map((chunk: RegulationChunk) => (
                    <button 
                      key={chunk.id}
                      className="w-full p-2 text-left border rounded cursor-pointer hover:bg-blue-50 text-xs"
                      onClick={() => setSelectedChunk(chunk)}
                    >
                      <div className="flex items-center space-x-1 mb-1">
                        <Hash size={10} />
                        <span className="font-medium">第{chunk.chunkIndex + 1}節</span>
                      </div>
                      <p className="text-gray-600 line-clamp-2">
                        {chunk.content.substring(0, 80)}...
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-white">
          {selectedSection ? (
            <div className="p-8">
              {/* Section Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {selectedSection.title}
                    </h1>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{condominium?.name} 管理規約</span>
                      <span>•</span>
                      <span>レベル {selectedSection.level}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Copy className="mr-2" size={14} />
                      コピー
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="mr-2" size={14} />
                      共有
                    </Button>
                  </div>
                </div>
              </div>

              {/* Section Content */}
              <div className="prose max-w-none">
                <article className="regulation-content">
                  {renderRegulationContent(selectedSection.content || '')}
                </article>
              </div>

              {/* Navigation */}
              <div className="mt-8 flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedSection(null)}
                >
                  <ArrowLeft className="mr-2" size={14} />
                  目次に戻る
                </Button>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Search className="mr-2" size={14} />
                    この条文で検索
                  </Button>
                </div>
              </div>
            </div>
          ) : knowledgeDocuments?.[0] ? (
            <div className="p-8">
              {/* Welcome Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {knowledgeDocuments[0].title}
                  </h1>
                  <div className="flex items-center space-x-2">
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      {knowledgeDocuments[0].type === 'current_regulation' ? '現行規約' : 
                       knowledgeDocuments[0].type === 'standard_regulation' ? '標準規約' : '文書'}
                    </Badge>
                    <Badge variant="outline">
                      バージョン: {knowledgeDocuments[0].version || '1.0'}
                    </Badge>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mb-4">
                  最終更新: {new Date(knowledgeDocuments[0].uploadedAt).toLocaleDateString('ja-JP')} | 
                  全{knowledgeDocuments[0].chunkCount}章節 | 
                  {Math.round(knowledgeDocuments[0].metadata?.fileSize / 1024 || 0)}KB
                </div>

                <p className="text-gray-700 leading-relaxed">
                  この文書は{condominium?.name}の管理規約文書です。左側の目次から特定の条文を選択してください。
                </p>
              </div>

              {/* Getting Started */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-blue-900 mb-3">はじめに</h2>
                <p className="text-blue-800 mb-4">
                  左側の目次から閲覧したい条文を選択してください。各条文は構造化されて表示され、読みやすくフォーマットされています。
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg">
                    <Hash className="mx-auto mb-2 text-blue-600" size={24} />
                    <h3 className="font-medium text-gray-900 mb-1">条文を選択</h3>
                    <p className="text-sm text-gray-600">左メニューから条文をクリック</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <Search className="mx-auto mb-2 text-blue-600" size={24} />
                    <h3 className="font-medium text-gray-900 mb-1">検索機能</h3>
                    <p className="text-sm text-gray-600">上部の検索バーで内容を検索</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <Share2 className="mx-auto mb-2 text-blue-600" size={24} />
                    <h3 className="font-medium text-gray-900 mb-1">共有・コピー</h3>
                    <p className="text-sm text-gray-600">条文を共有やコピー</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500 p-8">
                <FileText className="mx-auto mb-4" size={64} />
                <h2 className="text-xl font-medium mb-2">表示する規約文書がありません</h2>
                <p className="mb-4 text-gray-400">
                  管理規約文書をアップロードして、Wiki形式での参照を開始してください
                </p>
                <Link href={`/condominiums/${id}/knowledge`}>
                  <Button>
                    <Upload className="mr-2" size={16} />
                    文書をアップロード
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}