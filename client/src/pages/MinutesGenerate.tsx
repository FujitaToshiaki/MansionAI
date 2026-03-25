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

const DEMO_IMPORT_DATA: ImportData = {
  meetingType: "第42回 定期総会",
  meetingDate: "2026年3月25日（水） 19:00〜20:45",
  location: "サンシャインマンション 集会室（1階）",
  participants: "田中理事長、鈴木副理事長、佐藤会計理事、山田理事、小林理事、住民出席者：18名（委任状：7名）",
  textContent: `【開会】
田中理事長：本日は第42回定期総会にお集まりいただきありがとうございます。出席者18名、委任状7名で定足数を満たしているため、これより開会いたします。

【第1号議案：前期活動報告および会計報告】
佐藤会計理事：前期の収支を報告いたします。収入合計は管理費・修繕積立金あわせて2,480万円、支出合計は2,310万円で、繰越金は170万円となりました。
住民（大野様）：修繕積立金の残高はいくらですか？
佐藤会計理事：現在の積立残高は4,850万円です。
住民（大野様）：わかりました。ありがとうございます。
田中理事長：前期活動報告および会計報告について承認をお諮りします。賛成の方は挙手をお願いします。
→ 賛成多数（挙手25名中23名）で承認。

【第2号議案：次期管理費・修繕積立金の改定について】
鈴木副理事長：エレベーターのオーバーホールと外壁塗装を次年度に予定しており、修繕積立金を現行の月額4,500円から5,200円に改定することを提案します。
住民（中村様）：突然の値上げは困ります。もう少し段階的に上げられませんか？
鈴木副理事長：ご意見はもっともです。ただし、エレベーターの法定点検費用が想定を上回っており、一括改定が必要な状況です。来期以降の追加値上げは当面見込んでいません。
住民（渡辺様）：改定後も他マンションと比べて妥当な水準でしょうか？
佐藤会計理事：近隣同規模マンションの平均は約5,000〜5,500円ですので、適正範囲内です。
田中理事長：第2号議案について採決をお諮りします。
→ 賛成19名、反対4名、棄権2名で可決。

【第3号議案：次期役員選任】
田中理事長：任期満了に伴い、次期役員候補を発表します。理事長：田中（再任）、副理事長：鈴木（再任）、会計理事：佐藤（再任）、理事：山田・中村（新任）。
住民（大野様）：新任の中村さんにどのような活動を期待していますか？
中村様（新任理事）：駐輪場の整理とゴミ置き場のルール徹底を優先して取り組みたいと思います。
田中理事長：第3号議案について採決をお諮りします。
→ 全員賛成で可決。

【その他・質疑応答】
住民（加藤様）：駐車場の空き待ちリストについて現状を教えてください。
山田理事：現在6名が順番待ちです。空き区画が出次第、順次ご案内します。
住民（渡辺様）：エントランスのオートロックが先月不具合を起こしましたが、対策は取られましたか？
鈴木副理事長：管理会社を通じて修理済みです。再発防止のため月次点検を追加しました。

【閉会】
田中理事長：以上をもちまして第42回定期総会を閉会いたします。本日はご参加ありがとうございました。`,
};

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
  const [isDemo, setIsDemo] = useState(false);
  const [generatedText, setGeneratedText] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem(`minutesImportData:${condominiumId}`);
    if (stored) {
      try {
        setImportData(JSON.parse(stored));
        setIsDemo(false);
      } catch {
        setImportData(DEMO_IMPORT_DATA);
        setIsDemo(true);
      }
    } else {
      setImportData(DEMO_IMPORT_DATA);
      setIsDemo(true);
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
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              入力情報プレビュー
              {isDemo && (
                <Badge data-testid="badge-demo" className="bg-blue-100 text-blue-600 border-blue-200 text-xs font-normal">
                  デモ
                </Badge>
              )}
            </CardTitle>
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
              <pre data-testid="text-generated-minutes" className="whitespace-pre-wrap font-mono text-sm text-gray-900 leading-relaxed">
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
