import { useState } from "react";
import { useSearch, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Mic, Upload, ChevronRight, ArrowLeft, Users, Sparkles, CheckSquare } from "lucide-react";
import { SubNav } from "@/components/SubNav";

export default function MinutesImport() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const condominiumId = params.get("condominiumId") ?? "";
  const [, navigate] = useLocation();

  const [meetingType, setMeetingType] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [participants, setParticipants] = useState("");
  const [textContent, setTextContent] = useState("");
  const [importTab, setImportTab] = useState("text");
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const handleProceed = () => {
    const q = new URLSearchParams({ condominiumId, meetingType, meetingDate });
    navigate(`/minutes/generate?${q.toString()}`);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setUploadedFile(file.name);
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
                defaultValue="メゾンドオプテージ 集会室"
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
                  <p className="text-xs text-gray-500">会議中に取ったメモや議題をテキストで入力してください。AIが整形された議事録を生成します。</p>
                  <Textarea
                    data-testid="textarea-meeting-notes"
                    className="min-h-[220px] border-gray-200 text-sm resize-none"
                    placeholder={`例：\n■ 第1号議案 管理費収支報告\n　→ 3月度収支：収入 1,560,000円 / 支出 1,320,000円\n　→ 承認：全会一致\n\n■ 第2号議案 大規模修繕委員会報告\n　→ 外壁補修の見積 3社比較\n　→ A社 2,800万円 採用予定`}
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
                  <div
                    data-testid="dropzone-audio"
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                      isDragOver ? "border-orange-400 bg-orange-50" : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/30"
                    }`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                  >
                    {uploadedFile ? (
                      <div className="space-y-2">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                          <Mic className="w-5 h-5 text-orange-500" />
                        </div>
                        <p className="text-sm font-medium text-gray-700">{uploadedFile}</p>
                        <Badge className="bg-green-100 text-green-700 border-green-200">アップロード完了</Badge>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                          <Upload className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">ドラッグ&ドロップまたはクリックしてアップロード</p>
                          <p className="text-xs text-gray-400 mt-1">対応形式: MP3, WAV, M4A（最大500MB）</p>
                        </div>
                        <Badge variant="outline" className="text-xs text-gray-500">OpenAI Whisper で文字起こし</Badge>
                      </div>
                    )}
                  </div>
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
          disabled={!meetingType || !meetingDate}
        >
          AI議事録生成へ進む
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
