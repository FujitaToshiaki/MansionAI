import { useState, useRef } from "react";
import { useSearch, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Mic, Upload, ChevronRight, Users, Sparkles, CheckSquare, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { SubNav } from "@/components/SubNav";

const DEMO_SAMPLE_TEXT = `田中理事長：それでは第1回理事会を開始いたします。本日は理事7名全員が出席しております。

【第1号議案】令和6年度管理費収支報告

田中理事長：まず管理費の収支についてご報告します。

鈴木副理事長：3月度の収支ですが、収入が管理費1,420,000円、駐車場使用料140,000円の合計1,560,000円でした。支出は管理委託費900,000円、清掃費120,000円、光熱費180,000円、その他120,000円の合計1,320,000円です。収支差額は240,000円のプラスとなっております。

田中理事長：修繕積立金の状況はいかがですか？

佐藤会計理事：修繕積立金は現在3月末時点で残高42,800,000円です。今年度の積み立て目標額4,800,000円に対して、3月末で1,200,000円の積み立てが完了しています。計画通り進捗しています。

田中理事長：ありがとうございます。特にご質問はありますか？では承認とさせていただきます。

採決：全会一致で承認

【第2号議案】大規模修繕委員会からの報告

大規模修繕委員長（山田理事）：現在、外壁補修工事の見積もりを3社から取得しました。A社：28,500,000円、B社：31,200,000円、C社：26,800,000円です。C社が最安値ですが、施工実績と品質を考慮するとA社が最も信頼性が高いと判断しています。

田中理事長：今後のスケジュールはどうなりますか？

山田理事：4月に業者選定、5月に契約締結、7月から工事着工を予定しています。工事期間は約3ヶ月を見込んでいます。

高橋理事：駐車場の使用制限はどの程度になりますか？

山田理事：工事期間中、1階部分の駐車スペース8台分が使用できなくなります。代替駐車場として近隣のコインパーキングを案内する予定です。

採決：A社を採用予定業者として承認。全会一致。

【第3号議案】エレベーター定期点検結果報告

鈴木副理事長：先月実施したエレベーター定期点検の結果をご報告します。2基とも安全基準を満たしており、異常は検出されませんでした。ただし、1号機のドア開閉センサーに軽微な摩耗が確認されたため、次回点検時（6月予定）に交換を推奨されています。交換費用は概算で85,000円です。

田中理事長：修繕積立金から支出することでよろしいですか？

採決：承認。全会一致。

【その他事項】

田中理事長：次回理事会は5月15日（水）午後7時から集会室で開催予定です。議題は大規模修繕業者との契約内容確認を予定しています。以上をもちまして第1回理事会を終了いたします。`;

const DEMO_MEETING_TYPE = "理事会";
const DEMO_MEETING_DATE = "2026-03-25";
const DEMO_PARTICIPANTS = "田中理事長, 鈴木副理事長, 佐藤会計理事, 山田理事, 高橋理事, 伊藤理事, 渡辺理事";
const DEMO_LOCATION = "サンプルレジデンス青楓 集会室";

export default function MinutesImport() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const condominiumId = params.get("condominiumId") ?? "";
  const [, navigate] = useLocation();

  const [meetingType, setMeetingType] = useState(DEMO_MEETING_TYPE);
  const [meetingDate, setMeetingDate] = useState(DEMO_MEETING_DATE);
  const [participants, setParticipants] = useState(DEMO_PARTICIPANTS);
  const [location, setLocation] = useState(DEMO_LOCATION);
  const [textContent, setTextContent] = useState(DEMO_SAMPLE_TEXT);
  const [importTab, setImportTab] = useState("text");
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribeError, setTranscribeError] = useState<string | null>(null);
  const [isTranscribed, setIsTranscribed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProceed = () => {
    sessionStorage.setItem(`minutesImportData:${condominiumId}`, JSON.stringify({
      meetingType,
      meetingDate,
      participants,
      location,
      textContent,
    }));
    const q = new URLSearchParams({ condominiumId });
    navigate(`/minutes/generate?${q.toString()}`);
  };

  const handleAudioFile = async (file: File) => {
    const allowed = /\.(mp3|wav|m4a)$/i;
    if (!allowed.test(file.name)) {
      setTranscribeError("MP3/WAV/M4A形式のファイルのみアップロード可能です");
      return;
    }
    setUploadedFile(file.name);
    setTranscribeError(null);
    setIsTranscribing(true);
    setTextContent("");

    try {
      const formData = new FormData();
      formData.append("audio", file);
      const res = await fetch("/api/minutes/transcribe", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "文字起こしに失敗しました");
      }
      const data = await res.json();
      setTextContent(data.text ?? "");
      setIsTranscribed(true);
      setImportTab("text");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "文字起こし中にエラーが発生しました";
      setTranscribeError(msg);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleAudioFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleAudioFile(file);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span
          className="cursor-pointer hover:text-orange-600"
          onClick={() => navigate(`/condominiums/${condominiumId}`)}
        >
          マンション詳細
        </span>
        <ChevronRight className="w-3 h-3" />
        <span
          className="cursor-pointer hover:text-orange-600"
          onClick={() => navigate(`/minutes/list?condominiumId=${condominiumId}`)}
        >
          議事録管理
        </span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-800 font-medium">音声・メモ取込</span>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">音声・メモ取込</h1>
        <SubNav items={[
          { label: "議事録一覧", path: `/minutes/list?condominiumId=${condominiumId}`, icon: FileText },
          { label: "音声・メモ取込", path: `/minutes/import?condominiumId=${condominiumId}`, icon: Mic },
          { label: "AI議事録生成", path: `/minutes/generate?condominiumId=${condominiumId}`, icon: Sparkles },
          { label: "決定事項管理", path: `/minutes/actions?condominiumId=${condominiumId}`, icon: CheckSquare },
        ]} />
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-0">
        {["会議情報入力", "素材取込", "AI生成・確認"].map((step, i) => (
          <div key={step} className="flex items-center">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
              i < 2 ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-400"
            }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                i < 2 ? "bg-orange-500 text-white" : "bg-gray-300 text-gray-500"
              }`}>{i + 1}</span>
              {step}
            </div>
            {i < 2 && <ChevronRight className="w-4 h-4 text-gray-300 mx-1" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meeting Info Form */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50">
            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-500" />
              会議基本情報
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">会議種別 <span className="text-red-500">*</span></Label>
              <Select value={meetingType} onValueChange={setMeetingType}>
                <SelectTrigger data-testid="select-meeting-type" className="border-gray-200">
                  <SelectValue placeholder="会議種別を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="理事会">理事会</SelectItem>
                  <SelectItem value="定期総会">定期総会</SelectItem>
                  <SelectItem value="臨時総会">臨時総会</SelectItem>
                  <SelectItem value="専門委員会">専門委員会</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">開催日 <span className="text-red-500">*</span></Label>
              <Input
                data-testid="input-meeting-date"
                type="date"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                className="border-gray-200"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">出席者（カンマ区切り）</Label>
              <Input
                data-testid="input-participants"
                placeholder="例: 田中理事長, 鈴木副理事長, 佐藤理事"
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
                className="border-gray-200"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">開催場所</Label>
              <Input
                data-testid="input-location"
                placeholder="例: マンション集会室"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="border-gray-200"
              />
            </div>
          </CardContent>
        </Card>

        {/* Content Import */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50">
            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <Upload className="w-4 h-4 text-orange-500" />
              素材取込
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs value={importTab} onValueChange={setImportTab}>
              <TabsList className="w-full mb-4 bg-gray-100">
                <TabsTrigger value="text" className="flex-1 gap-2 data-[state=active]:bg-white data-[state=active]:text-orange-600">
                  <FileText className="w-4 h-4" />
                  テキストメモ
                </TabsTrigger>
                <TabsTrigger value="audio" className="flex-1 gap-2 data-[state=active]:bg-white data-[state=active]:text-orange-600">
                  <Mic className="w-4 h-4" />
                  音声ファイル
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">会議中に取ったメモや議題をテキストで入力してください。AIが整形された議事録を生成します。</p>
                    {!isTranscribed && textContent === DEMO_SAMPLE_TEXT && (
                      <Badge className="bg-blue-50 text-blue-600 border-blue-200 text-xs shrink-0 ml-2">デモサンプル表示中</Badge>
                    )}
                    {isTranscribed && (
                      <Badge className="bg-green-50 text-green-600 border-green-200 text-xs shrink-0 ml-2">文字起こし済み</Badge>
                    )}
                  </div>
                  <Textarea
                    data-testid="textarea-meeting-notes"
                    className="min-h-[220px] border-gray-200 text-sm resize-none"
                    placeholder={`例：\n■ 第1号議案 管理費収支報告\n　→ 3月度収支：収入 1,560,000円 / 支出 1,320,000円\n　→ 承認：全会一致`}
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>入力文字数: {textContent.length}文字</span>
                    <span>推奨: 200文字以上</span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="audio">
                <div className="space-y-3">
                  <p className="text-xs text-gray-500">会議の録音ファイル（MP3/WAV/M4A）をアップロードしてください。AIが音声を文字起こしして議事録を生成します。</p>

                  {isTranscribing ? (
                    <div className="border-2 border-dashed border-orange-300 rounded-lg p-8 text-center bg-orange-50/30">
                      <div className="space-y-3">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                          <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                        </div>
                        <p className="text-sm font-medium text-orange-700">文字起こし中...</p>
                        <p className="text-xs text-gray-500">{uploadedFile}</p>
                        <p className="text-xs text-gray-400">OpenAI Whisper で処理中です。しばらくお待ちください。</p>
                      </div>
                    </div>
                  ) : (
                    <div
                      data-testid="dropzone-audio"
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                        isDragOver ? "border-orange-400 bg-orange-50" : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/30"
                      }`}
                      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".mp3,.wav,.m4a,audio/mpeg,audio/wav,audio/x-wav,audio/mp4,audio/m4a"
                        className="hidden"
                        onChange={handleFileInput}
                        data-testid="input-audio-file"
                      />
                      {uploadedFile && !transcribeError ? (
                        <div className="space-y-2">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          </div>
                          <p className="text-sm font-medium text-gray-700">{uploadedFile}</p>
                          <Badge className="bg-green-100 text-green-700 border-green-200">文字起こし完了</Badge>
                          <p className="text-xs text-gray-400 mt-1">「テキストメモ」タブで結果を確認できます</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                            <Upload className="w-6 h-6 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">ドラッグ&ドロップまたはクリックしてアップロード</p>
                            <p className="text-xs text-gray-400 mt-1">対応形式: MP3, WAV, M4A（最大25MB）</p>
                          </div>
                          <Badge variant="outline" className="text-xs text-gray-500">OpenAI Whisper で文字起こし</Badge>
                        </div>
                      )}
                    </div>
                  )}

                  {transcribeError && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-red-700" data-testid="text-transcribe-error">{transcribeError}</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Proceed Button */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => navigate(`/minutes/list?condominiumId=${condominiumId}`)}
        >
          キャンセル
        </Button>
        <Button
          data-testid="button-proceed-generate"
          className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
          onClick={handleProceed}
          disabled={!meetingType || !meetingDate || isTranscribing}
        >
          AI議事録生成へ進む
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
