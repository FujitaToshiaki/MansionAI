import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
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
  Eye
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

export default function RegulationWiki() {
  const { id } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChunk, setSelectedChunk] = useState<RegulationChunk | null>(null);

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

  const handleSearch = () => {
    // Trigger search by updating the query key
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  const currentDocument = knowledgeDocuments?.[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href={`/condominiums/${id}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2" size={16} />
                  戻る
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <Building size={20} className="text-blue-600" />
                <span className="font-medium text-gray-900">{condominium?.name}</span>
                <ChevronRight size={16} className="text-gray-400" />
                <span className="text-gray-600">管理規約</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Document Navigation */}
          <div className="lg:col-span-1">
            <Card className="h-fit">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg">
                  <BookOpen className="mr-2" size={18} />
                  規約ナビゲーション
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="規約を検索..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button size="sm" onClick={handleSearch}>
                      <Search size={16} />
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Document List */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-900">登録文書</h4>
                  {knowledgeDocuments?.map((doc: any) => (
                    <div key={doc.id} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-start space-x-2">
                        <FileText size={16} className="text-blue-500 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {doc.title}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {doc.type === 'current_regulation' ? '現行規約' : 
                               doc.type === 'standard_regulation' ? '標準規約' : '文書'}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {doc.chunkCount}章節
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Search Results */}
                {searchResults && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-gray-900">
                        検索結果 ({searchResults.chunks?.length || 0}件)
                      </h4>
                      <ScrollArea className="h-40">
                        <div className="space-y-1">
                          {searchResults.chunks?.slice(0, 10).map((chunk: RegulationChunk) => (
                            <div 
                              key={chunk.id}
                              className="p-2 text-xs border rounded cursor-pointer hover:bg-blue-50"
                              onClick={() => setSelectedChunk(chunk)}
                            >
                              <div className="flex items-center space-x-1 mb-1">
                                <Hash size={12} />
                                <span className="font-medium">第{chunk.chunkIndex + 1}節</span>
                              </div>
                              <p className="text-gray-600 line-clamp-2">
                                {chunk.content.substring(0, 100)}...
                              </p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Document Viewer */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2" size={20} />
                    {selectedChunk ? `第${selectedChunk.chunkIndex + 1}節` : currentDocument?.title || '管理規約'}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    {currentDocument && (
                      <>
                        <Badge variant="outline">
                          <Calendar className="mr-1" size={12} />
                          {new Date(currentDocument.uploadedAt).toLocaleDateString('ja-JP')}
                        </Badge>
                        <Badge variant="outline">
                          <Database className="mr-1" size={12} />
                          {currentDocument.chunkCount}章節
                        </Badge>
                        <Badge variant="outline">
                          <Eye className="mr-1" size={12} />
                          {Math.round(currentDocument.metadata?.fileSize / 1024 || 0)}KB
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[calc(100vh-300px)] overflow-auto">
                  {selectedChunk ? (
                    // Selected chunk view
                    <div className="p-6">
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-blue-900">
                            第{selectedChunk.chunkIndex + 1}節
                          </span>
                          <span className="text-blue-700">
                            文字位置: {selectedChunk.metadata.startChar} - {selectedChunk.metadata.endChar}
                          </span>
                        </div>
                      </div>
                      <div className="prose max-w-none">
                        <div className="whitespace-pre-wrap text-gray-900 leading-relaxed">
                          {selectedChunk.content}
                        </div>
                      </div>
                    </div>
                  ) : currentDocument ? (
                    // Full document view
                    <div className="p-6">
                      <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                          {currentDocument.title}
                        </h1>
                        <p className="text-gray-600 mb-4">
                          {currentDocument.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="default">
                            {currentDocument.type === 'current_regulation' ? '現行規約' : 
                             currentDocument.type === 'standard_regulation' ? '標準規約' : '文書'}
                          </Badge>
                          <Badge variant="outline">
                            ファイルサイズ: {Math.round(currentDocument.metadata?.fileSize / 1024 || 0)}KB
                          </Badge>
                          <Badge variant="outline">
                            チャンク数: {currentDocument.chunkCount}
                          </Badge>
                        </div>
                      </div>

                      <Separator className="mb-6" />

                      <div className="prose max-w-none">
                        <div className="whitespace-pre-wrap text-gray-900 leading-relaxed">
                          {currentDocument.content?.substring(0, 5000)}
                          {currentDocument.content?.length > 5000 && '...'}
                        </div>
                      </div>

                      {currentDocument.content?.length > 5000 && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
                          <p className="text-gray-600 mb-2">
                            文書が長いため、一部のみ表示しています。
                          </p>
                          <p className="text-sm text-gray-500">
                            左側の検索機能を使用して特定の条文を検索できます。
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    // No document state
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-gray-500">
                        <FileText className="mx-auto mb-4" size={48} />
                        <p>表示する規約文書がありません</p>
                        <Link href={`/condominiums/${id}/knowledge`}>
                          <Button className="mt-4" variant="outline">
                            文書をアップロード
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}