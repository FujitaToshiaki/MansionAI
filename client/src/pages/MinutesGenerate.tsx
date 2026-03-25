import { useState, useEffect } from "react";
import { useSearch, Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Save, ArrowRight, Loader2, FileText, Mic, CheckSquare, Calendar, MapPin, Users } from "lucide-react";
import { SubNav } from "@/components/SubNav";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ImportData {
  meetingType: string;
  meetingDate: string;
  location: string;
  participants: string;
  textContent: string;
}

export default function MinutesGenerate() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const condominiumId = params.get("condominiumId") ?? "";
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: condominium } = useQuery<any>({
    queryKey: ["/api/condominiums", condominiumId],
    enabled: !!condominiumId,
  });

  const [importData, setImportData] = useState<ImportData | null>(null);
  const [generatedText, setGeneratedText] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem(`minutesImportData:${condominiumId}`);
    if (stored) {
      try {
        setImportData(JSON.parse(stored));
      } catch {
        setImportData(null);
      }
    }
  }, [condominiumId]);

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!importData) throw new Error("入力データがありません");
      const res = await apiRequest("POST", "/api/minutes/generate", {
        meetingType: importData.meetingType,
        meetingDate: importData.meetingDate,
        location: importData.location,
        participants: importData.participants,
        notes: importData.textContent,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setGeneratedText(data.minutes ?? "");
      sessionStorage.removeItem(`minutesImportData:${condominiumId}`);
    },
    onError: (error: any) => {
      toast({
        title: "生成エラー",
        description: error.message ?? "議事録の生成中にエラーが発生しました。",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    setGeneratedText("");
    generateMutation.mutate();
  };

  const handleSave = () => {
    toast({
      title: "保存完了",
      description: "議事録を保存しました。",
    });
  };

  const isGenerating = generateMutation.isPending;

  return (
    <div className="space-y-6">
      <nav className="text-sm text-gray-500">
        <Link href={`/condominiums/${condominiumId}`} className="hover:text-gray-700">
          {condominium?.name ?? "マンション詳細"}
        </Link>
        <span className="mx-2">{">"}</span>
        <Link href={`/minutes/list?condominiumId=${condominiumId}`} className="hover:text-gray-700">
          議事録管理
        </Link>
        <span className="mx-2">{">"}</span>
        <span>AI議事録生成</span>
      </nav>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">AI議事録生成</h1>
        <SubNav items={[
          { label: "議事録一覧", path: `/minutes/list?condominiumId=${condominiumId}`, icon: FileText },
          { label: "音声・メモ取込", path: `/minutes/import?condominiumId=${condominiumId}`, icon: Mic },
          { label: "AI議事録生成", path: `/minutes/generate?condominiumId=${condominiumId}`, icon: Sparkles },
          { label: "決定事項管理", path: `/minutes/actions?condominiumId=${condominiumId}`, icon: CheckSquare },
        ]} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-250px)]">
        {/* Left Panel: Input Preview */}
        <Card className="flex flex-col">
          <CardHeader className="py-3 bg-gray-50 border-b">
            <CardTitle className="text-sm font-medium">入力情報プレビュー</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-4 space-y-4">
            {importData ? (
              <>
                <div className="space-y-3">
                  {importData.meetingType && (
                    <div className="flex items-start gap-2">
                      <Badge className="bg-orange-100 text-orange-700 border-orange-200 shrink-0">
                        会議種別
                      </Badge>
                      <span data-testid="text-meeting-type" className="text-sm text-gray-800">{importData.meetingType}</span>
                    </div>
                  )}
                  {importData.meetingDate && (
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                      <span data-testid="text-meeting-date" className="text-sm text-gray-700">{importData.meetingDate}</span>
                    </div>
                  )}
                  {importData.location && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                      <span data-testid="text-meeting-location" className="text-sm text-gray-700">{importData.location}</span>
                    </div>
                  )}
                  {importData.participants && (
                    <div className="flex items-start gap-2">
                      <Users className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                      <span data-testid="text-meeting-participants" className="text-sm text-gray-700">{importData.participants}</span>
                    </div>
                  )}
                </div>

                {importData.textContent ? (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium">会議メモ</p>
                    <p data-testid="text-meeting-notes" className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap border border-gray-100 rounded-md p-3 bg-gray-50">
                      {importData.textContent}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">メモが入力されていません</p>
                )}
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
                <FileText className="w-10 h-10 text-gray-200" />
                <p className="text-sm text-center">
                  「音声・メモ取込」画面で入力した情報がここに表示されます。
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation(`/minutes/import?condominiumId=${condominiumId}`)}
                >
                  取込画面へ戻る
                </Button>
              </div>
            )}
          </CardContent>
          <div className="p-4 border-t bg-gray-50 flex justify-end">
            <Button
              className="bg-orange-600 hover:bg-orange-700"
              onClick={handleGenerate}
              disabled={isGenerating || !importData}
              data-testid="button-generate-minutes"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI議事録を生成
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Right Panel: Generated Output */}
        <Card className="flex flex-col">
          <CardHeader className="py-3 bg-orange-50 border-b">
            <CardTitle className="text-sm font-medium text-orange-800">生成された議事録</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-4 bg-white">
            {isGenerating ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : generatedText ? (
              <pre data-testid="text-generated-minutes" className="whitespace-pre-wrap font-sans text-sm text-gray-900 leading-relaxed">
                {generatedText}
              </pre>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                左カード下部のボタンを押して生成を開始してください
              </div>
            )}
          </CardContent>
          {generatedText && (
            <div className="p-4 border-t bg-gray-50 flex justify-end space-x-3">
              <Button variant="outline" onClick={handleSave} data-testid="button-save-minutes">
                <Save className="w-4 h-4 mr-2" />
                保存
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setLocation(`/minutes/actions?condominiumId=${condominiumId}`)}
                data-testid="button-go-actions"
              >
                決定事項管理へ
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
