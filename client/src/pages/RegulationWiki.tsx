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

interface Chapter {
  id: string;
  number: number;
  title: string;
  articles: Article[];
  expanded: boolean;
}

interface Article {
  id: string;
  number: number;
  title: string;
  content: string;
}

export default function RegulationWiki() {
  const { id } = useParams();
  const [searchQuery, setSearchQuery] = useState("");

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [activeChapter, setActiveChapter] = useState<string>("");

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

  // Parse regulation content into chapters and articles
  useEffect(() => {
    if (knowledgeDocuments?.[0]?.content) {
      console.log('Parsing regulation content...');
      const content = knowledgeDocuments[0].content;
      console.log('Content preview (first 1000 chars):', content.substring(0, 1000));
      console.log('Content length:', content.length);
      
      // Look for patterns in content
      const lines = content.split('\n');
      console.log('Total lines:', lines.length);
      
      // Check first 20 lines for patterns
      lines.slice(0, 20).forEach((line, i) => {
        if (line.trim()) console.log(`Line ${i}: "${line.trim()}"`);
      });
      
      const parsedChapters = parseRegulationContent(content);
      console.log('Parsed chapters:', parsedChapters.length);
      parsedChapters.forEach(c => console.log(`- Chapter ${c.number}: ${c.title} (${c.articles.length} articles)`));
      setChapters(parsedChapters);
    }
  }, [knowledgeDocuments]);

  const parseRegulationContent = (content: string): Chapter[] => {
    const lines = content.split('\n');
    const chapters: Chapter[] = [];
    let currentChapter: Chapter | null = null;

    console.log('Starting to parse regulation content with new structure');

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Match chapter pattern: #### 第X章 タイトル
      const chapterMatch = trimmedLine.match(/^####\s*第(\d+)章\s*(.+)$/) ||
                          trimmedLine.match(/\*\*第(\d+)章\s*(.+?)\*\*/) ||
                          trimmedLine.match(/^第(\d+)章\s*(.+)$/);
      
      if (chapterMatch) {
        console.log('Found chapter:', chapterMatch[0]);
        
        const chapterId = `chapter-${chapterMatch[1]}-${chapters.length}`;
        currentChapter = {
          id: chapterId,
          number: parseInt(chapterMatch[1]),
          title: chapterMatch[2].trim().replace(/\*\*/g, ''),
          articles: [],
          expanded: false
        };
        chapters.push(currentChapter);
        return;
      }

      // Match article pattern: **（タイトル）**
      const articleMatch = trimmedLine.match(/^\*\*（(.+?)）\*\*$/);
      
      if (articleMatch && currentChapter) {
        console.log('Found article title:', articleMatch[1]);
        
        // Extract content for this article by looking ahead until next article or chapter
        const articleContent = extractArticleContent(lines, index + 1);
        
        const articleId = `article-${currentChapter.articles.length}-${Date.now()}-${Math.random()}`;
        const article: Article = {
          id: articleId,
          number: currentChapter.articles.length + 1, // Sequential numbering within chapter
          title: articleMatch[1].trim(),
          content: articleContent
        };
        
        currentChapter.articles.push(article);
        console.log(`Added article "${article.title}" with ${article.content.length} chars`);
        return;
      }
    });

    console.log('Final parsed chapters:', chapters.map(c => ({ 
      id: c.id, 
      title: c.title, 
      articlesCount: c.articles.length
    })));

    return chapters;
  };

  // Helper function to extract content for an article
  const extractArticleContent = (lines: string[], startIndex: number): string => {
    const contentLines: string[] = [];
    
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // Stop at next chapter
      if (trimmedLine.match(/^####\s*第\d+章/) || 
          trimmedLine.match(/\*\*第\d+章\s*(.+?)\*\*/) || 
          trimmedLine.match(/^第\d+章\s*(.+)$/)) {
        break;
      }
      
      // Stop at next article title
      if (trimmedLine.match(/^\*\*（(.+?)）\*\*$/)) {
        break;
      }
      
      contentLines.push(line);
    }
    
    return contentLines.join('\n').trim();
  };

  const renderArticleContent = (content: string) => {
    if (!content) {
      console.log('No content to render');
      return <div className="text-gray-500 italic">内容が見つかりません</div>;
    }
    
    console.log('Rendering content:', content.substring(0, 200) + '...');
    
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Article headers (第X条)
      if (trimmedLine.match(/\*\*第\d+条[^*]*\*\*/) || trimmedLine.match(/^第\d+条/)) {
        const headerText = trimmedLine.replace(/\*\*/g, '');
        elements.push(
          <h1 key={index} className="text-2xl font-bold text-gray-900 mb-6 mt-8 pb-3 border-b-2 border-gray-200 font-serif">
            {headerText}
          </h1>
        );
      }
      // Sub headers (（条文名）)
      else if (trimmedLine.match(/\*\*（.+?）\*\*/) || trimmedLine.match(/^（.+?）$/)) {
        const headerText = trimmedLine.replace(/\*\*/g, '').replace(/[（）]/g, '');
        elements.push(
          <h2 key={index} className="text-xl font-semibold text-gray-800 mb-4 mt-8 font-serif">
            {headerText}
          </h2>
        );
      }
      // Numbered items (1. 2. etc.)
      else if (trimmedLine.match(/^\d+[\.\)]/)) {
        elements.push(
          <div key={index} className="mb-4 pl-6 border-l-3 border-blue-200 bg-blue-50/30 py-2 rounded-r-md">
            <p className="text-gray-800 leading-relaxed font-medium">{trimmedLine}</p>
          </div>
        );
      }
      // Bullet points or special formatting
      else if (trimmedLine.match(/^[・•\-\*]/)) {
        elements.push(
          <div key={index} className="mb-3 pl-8">
            <p className="text-gray-700 leading-relaxed">{trimmedLine}</p>
          </div>
        );
      }
      // Regular paragraphs (non-empty lines)
      else if (trimmedLine.length > 0) {
        elements.push(
          <p key={index} className="text-gray-700 leading-relaxed mb-4 text-base">
            {trimmedLine}
          </p>
        );
      }
      // Empty lines for spacing
      else if (line === '' && elements.length > 0) {
        elements.push(
          <div key={index} className="mb-3" />
        );
      }
    });
    
    console.log('Rendered elements:', elements.length);
    return elements.length > 0 ? elements : <div className="text-gray-500 italic">解析可能な内容が見つかりません</div>;
  };

  const handleSearch = () => {
    // Trigger search by updating the query key
  };

  const toggleChapter = (chapterId: string) => {
    setChapters(prev => prev.map(chapter => 
      chapter.id === chapterId 
        ? { ...chapter, expanded: !chapter.expanded }
        : chapter
    ));
    setActiveChapter(chapterId);
  };

  const selectArticle = (article: Article) => {
    console.log('Selected article:', article.number, article.title, 'Content length:', article.content.length);
    console.log('Article content preview:', article.content.substring(0, 500));
    setSelectedArticle(article);
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

      <div className="flex">
        {/* Sidebar - Table of Contents */}
        <aside className={`${sidebarCollapsed ? 'w-0' : 'w-80'} transition-all duration-300 overflow-hidden bg-white border-r border-gray-200 sticky top-0 h-screen`}>
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
              <nav className="space-y-2">
                {chapters.map((chapter) => (
                  <div key={chapter.id}>
                    {/* Chapter Header */}
                    <button
                      onClick={() => toggleChapter(chapter.id)}
                      className={`flex items-center w-full p-3 rounded-md text-base cursor-pointer hover:bg-gray-100 transition-all duration-200 ${
                        activeChapter === chapter.id ? 'bg-gray-50 text-gray-900' : 'text-gray-700'
                      }`}
                    >
                      <div className="mr-3 flex-shrink-0">
                        {chapter.articles.length > 0 ? (
                          chapter.expanded ? 
                            <ChevronDown size={14} className="text-gray-400 transition-transform duration-200" /> : 
                            <ChevronRight size={14} className="text-gray-400 transition-transform duration-200" />
                        ) : (
                          <div className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="flex items-center space-x-3 flex-1">
                        <BookOpen size={14} className="text-gray-400 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="font-semibold text-base">第{chapter.number}章</div>
                          <div className="text-sm text-gray-500 mt-0.5">{chapter.title}</div>
                        </div>
                      </div>
                    </button>
                    
                    {/* Articles under Chapter */}
                    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                      chapter.expanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      <div className="ml-6 space-y-1 pb-2">
                        {chapter.articles.map((article) => (
                          <button
                            key={article.id}
                            onClick={() => selectArticle(article)}
                            className={`w-full text-left p-2 rounded-md text-sm hover:bg-gray-100 transition-all duration-200 ${
                              selectedArticle?.id === article.id ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-400 text-xs">●</span>
                              <div>
                                <div className="text-sm">（{article.title}）</div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
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
                    <span>章数:</span>
                    <span>{chapters.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>条文数:</span>
                    <span>{chapters.reduce((total, chapter) => total + chapter.articles.length, 0)}</span>
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
                      onClick={() => {}}
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
        <main className={`flex-1 bg-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`}>
          {selectedArticle ? (
            <div className="p-8">
              {/* Article Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      （{selectedArticle.title}）
                    </h1>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{condominium?.name} 管理規約</span>
                      <span>•</span>
                      <span>規約項目</span>
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

              {/* Article Content */}
              <div className="max-w-none">
                <article className="regulation-content bg-white border rounded-lg p-8">
                  <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed">
                    {renderArticleContent(selectedArticle.content)}
                  </div>
                </article>
              </div>

              {/* Navigation */}
              <div className="mt-8 flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedArticle(null)}
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
                  全{chapters.length}章 {chapters.reduce((total, chapter) => total + chapter.articles.length, 0)}条 | 
                  {Math.round(knowledgeDocuments[0].metadata?.fileSize / 1024 || 0)}KB
                </div>

                <p className="text-gray-700 leading-relaxed">
                  この文書は{condominium?.name}の管理規約文書です。左側の目次から章を展開し、特定の条文を選択してください。
                </p>
              </div>

              {/* Getting Started */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-blue-900 mb-3">はじめに</h2>
                <p className="text-blue-800 mb-4">
                  左側の目次から章を展開し、閲覧したい条文を選択してください。各条文は構造化されて表示され、読みやすくフォーマットされています。
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg">
                    <BookOpen className="mx-auto mb-2 text-blue-600" size={24} />
                    <h3 className="font-medium text-gray-900 mb-1">章を展開</h3>
                    <p className="text-sm text-gray-600">左メニューの章をクリックして展開</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <Hash className="mx-auto mb-2 text-blue-600" size={24} />
                    <h3 className="font-medium text-gray-900 mb-1">条文を選択</h3>
                    <p className="text-sm text-gray-600">展開された条文をクリック</p>
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
                    <FileText className="mr-2" size={16} />
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