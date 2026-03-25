import { useState, useEffect } from "react";
import { useSearch, Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Save, ArrowRight, Loader2, FileText, Mic, CheckSquare } from "lucide-react";
import { SubNav } from "@/components/SubNav";
import { useToast } from "@/hooks/use-toast";

const mockGeneratedMinutes = `【第12回理事会議事録】

■日時：2025年3月15日 19:00〜20:30
■場所：マンション集会室
■出席者：理事長、副理事長、理事3名、監事1名、管理会社担当者

■議題：
1. 大規模修繕工事の進捗報告
2. 駐車場空き区画の募集について
3. 植栽剪定の実施計画

■審議内容：
・大規模修繕については、予定通り足場架設が完了し、現在は外壁調査を実施中。
・駐車場の空きが3区画発生しているため、4月号の広報にて再募集を行うことを承認。
・植栽剪定は、例年通り5月の大型連休明けに実施することで業者と調整済み。

■決定事項：
1. 駐車場空き区画の募集要項を承認。
2. 植栽剪定費用（概算15万円）を予備費より支出することを決定。
3. 次回理事会を4月12日に開催することを決定。

■次回予定：
2025年4月12日（土） 19:00〜
`;

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

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState("");

  const handleGenerate = () => {
    setIsGenerating(true);
    setGeneratedText("");
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedText(mockGeneratedMinutes);
    }, 2000);
  };

  const handleSave = () => {
    toast({
      title: "保存完了",
      description: "議事録を保存しました。",
    });
  };

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
            <CardTitle className="text-sm font-medium">入力テキストプレビュー</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-4 text-sm text-gray-600 leading-relaxed">
            <p>
              3月15日の理事会。参加者は理事長、副理事長、理事3名、監事1名、管理会社の田中さん。集会室で開催。
              大規模修繕は足場終わって外壁調査中。順調。
              駐車場3台空いてる。4月のニュースで募集かけることに決定。
              植栽は5月連休明け。15万くらい予備費から出す。
              次回は4月12日19時。
            </p>
          </CardContent>
          <div className="p-4 border-t bg-gray-50 flex justify-end">
            <Button 
              className="bg-orange-600 hover:bg-orange-700" 
              onClick={handleGenerate}
              disabled={isGenerating}
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
              <pre className="whitespace-pre-wrap font-sans text-sm text-gray-900 leading-relaxed">
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
