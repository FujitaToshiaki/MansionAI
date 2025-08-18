import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Upload, Search, Download, Trash2, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface KnowledgeDocument {
  id: string;
  title: string;
  type: string;
  content: string;
  metadata: any;
  originalFileName: string;
  uploadedAt: string;
}

interface KnowledgeBaseProps {
  condominiumId: string;
}

export function KnowledgeBase({ condominiumId }: KnowledgeBaseProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<string>("all");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState("");
  const [uploadTitle, setUploadTitle] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch knowledge documents
  const { data: documents, isLoading: documentsLoading } = useQuery({
    queryKey: [`/api/condominiums/${condominiumId}/knowledge`],
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (data: { file: File; type: string; title: string }) => {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('type', data.type);
      formData.append('title', data.title);

      const response = await fetch(`/api/condominiums/${condominiumId}/knowledge/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({ title: "アップロード完了", description: "ナレッジドキュメントがアップロードされました" });
      queryClient.invalidateQueries({ queryKey: [`/api/condominiums/${condominiumId}/knowledge`] });
      setSelectedFile(null);
      setUploadTitle("");
      setUploadType("");
    },
    onError: (error: Error) => {
      toast({ title: "アップロードエラー", description: error.message, variant: "destructive" });
    },
  });

  // Search mutation
  const searchMutation = useMutation({
    mutationFn: async (data: { query: string; type?: string }) => {
      return apiRequest(`/api/condominiums/${condominiumId}/knowledge/search`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (documentId: string) => {
      return apiRequest(`/api/knowledge/${documentId}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      toast({ title: "削除完了", description: "ドキュメントが削除されました" });
      queryClient.invalidateQueries({ queryKey: [`/api/condominiums/${condominiumId}/knowledge`] });
    },
    onError: () => {
      toast({ title: "削除エラー", description: "ドキュメントの削除に失敗しました", variant: "destructive" });
    },
  });

  const handleUpload = () => {
    if (!selectedFile || !uploadType || !uploadTitle) {
      toast({ title: "入力エラー", description: "ファイル、種別、タイトルを入力してください", variant: "destructive" });
      return;
    }

    uploadMutation.mutate({ file: selectedFile, type: uploadType, title: uploadTitle });
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({ title: "検索エラー", description: "検索キーワードを入力してください", variant: "destructive" });
      return;
    }

    const type = searchType === "all" ? undefined : searchType;
    searchMutation.mutate({ query: searchQuery, type });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'current_regulation': return '現在の管理規約';
      case 'meeting_minutes': return '決議・議事履歴';
      case 'standard_regulation': return '標準規約';
      default: return type;
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'current_regulation': return 'default';
      case 'meeting_minutes': return 'secondary';
      case 'standard_regulation': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="text-orange-600" size={32} />
        <h1 className="text-3xl font-bold text-gray-900">ナレッジベース管理</h1>
      </div>

      <Tabs defaultValue="documents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="documents">ドキュメント一覧</TabsTrigger>
          <TabsTrigger value="upload">アップロード</TabsTrigger>
          <TabsTrigger value="search">検索</TabsTrigger>
        </TabsList>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>ナレッジドキュメント</CardTitle>
            </CardHeader>
            <CardContent>
              {documentsLoading ? (
                <div className="text-center py-8">読み込み中...</div>
              ) : documents?.length > 0 ? (
                <div className="space-y-4">
                  {documents.map((doc: KnowledgeDocument) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-start space-x-3">
                        <FileText className="text-blue-500 mt-1" size={20} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{doc.title}</h3>
                            <Badge variant={getTypeBadgeVariant(doc.type)}>
                              {getTypeLabel(doc.type)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 mb-2">
                            ファイル名: {doc.originalFileName}
                          </p>
                          <p className="text-sm text-gray-500">
                            アップロード日: {new Date(doc.uploadedAt).toLocaleDateString('ja-JP')}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMutation.mutate(doc.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="mx-auto mb-4" size={48} />
                  <p>ナレッジドキュメントがありません</p>
                  <p className="text-sm">「アップロード」タブからドキュメントを追加してください</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>ナレッジドキュメントのアップロード</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">ドキュメントタイトル</Label>
                <Input
                  id="title"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="例: メゾンドオプテージ管理規約第5版"
                />
              </div>

              <div>
                <Label htmlFor="type">ドキュメント種別</Label>
                <Select value={uploadType} onValueChange={setUploadType}>
                  <SelectTrigger>
                    <SelectValue placeholder="種別を選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current_regulation">現在の管理規約</SelectItem>
                    <SelectItem value="meeting_minutes">決議・議事履歴</SelectItem>
                    <SelectItem value="standard_regulation">標準規約</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="file">ファイル選択</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".txt,.doc,.docx,.pdf"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                <p className="text-sm text-gray-500 mt-1">
                  対応形式: .txt, .doc, .docx, .pdf (最大10MB)
                </p>
              </div>

              <Button
                onClick={handleUpload}
                disabled={uploadMutation.isPending || !selectedFile || !uploadType || !uploadTitle}
                className="w-full"
              >
                <Upload className="mr-2" size={16} />
                {uploadMutation.isPending ? "アップロード中..." : "アップロード"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle>ナレッジベース検索</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="検索キーワードを入力..."
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Select value={searchType} onValueChange={setSearchType}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    <SelectItem value="current_regulation">現在の管理規約</SelectItem>
                    <SelectItem value="meeting_minutes">決議・議事履歴</SelectItem>
                    <SelectItem value="standard_regulation">標準規約</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleSearch} disabled={searchMutation.isPending}>
                  <Search className="mr-2" size={16} />
                  検索
                </Button>
              </div>

              {searchMutation.data && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">検索結果</h3>
                  
                  {searchMutation.data.documents?.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-medium mb-3">関連ドキュメント</h4>
                      <div className="space-y-2">
                        {searchMutation.data.documents.map((doc: KnowledgeDocument) => (
                          <div key={doc.id} className="p-3 border rounded flex items-center justify-between">
                            <div>
                              <span className="font-medium">{doc.title}</span>
                              <Badge variant={getTypeBadgeVariant(doc.type)} className="ml-2">
                                {getTypeLabel(doc.type)}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchMutation.data.chunks?.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">関連箇所</h4>
                      <div className="space-y-3">
                        {searchMutation.data.chunks.map((chunk: any) => (
                          <div key={chunk.id} className="p-3 border rounded">
                            <p className="text-sm text-gray-700">{chunk.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(!searchMutation.data.documents || searchMutation.data.documents.length === 0) &&
                   (!searchMutation.data.chunks || searchMutation.data.chunks.length === 0) && (
                    <p className="text-gray-500">検索結果が見つかりませんでした。</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}