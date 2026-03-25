import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mic, Upload, Sparkles, ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const importSchema = z.object({
  meetingType: z.string().min(1, "会議種別を選択してください"),
  meetingDate: z.string().min(1, "開催日を入力してください"),
  title: z.string().min(1, "件名を入力してください"),
  memoText: z.string().optional(),
});

type ImportForm = z.infer<typeof importSchema>;

export default function MinutesImport() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [audioFileName, setAudioFileName] = useState<string | null>(null);

  const form = useForm<ImportForm>({
    resolver: zodResolver(importSchema),
    defaultValues: {
      meetingType: "",
      meetingDate: new Date().toISOString().split("T")[0],
      title: "",
      memoText: "",
    },
  });

  const createRecordingMutation = useMutation({
    mutationFn: async (data: ImportForm) => {
      return apiRequest("POST", `/api/condominiums/${id}/minutes/recordings`, data);
    },
    onSuccess: async (res: Response) => {
      const recording = await res.json();
      queryClient.invalidateQueries({ queryKey: ["/api/condominiums", id, "minutes/recordings"] });
      toast({ title: "取込完了", description: "メモを保存しました。AI議事録生成に進みます。" });
      navigate(`/condominiums/${id}/minutes/generate?recordingId=${recording.id}`);
    },
    onError: () => {
      toast({ title: "エラー", description: "保存に失敗しました", variant: "destructive" });
    },
  });

  function onSubmit(data: ImportForm) {
    createRecordingMutation.mutate(data);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button
          data-testid="button-back"
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/condominiums/${id}/minutes/list`)}
          className="flex items-center gap-1"
        >
          <ArrowLeft size={16} />
          一覧へ戻る
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">音声・メモ取込</h1>
        <p className="text-sm text-gray-500 mt-1">会議メモを入力してAI議事録生成の準備をします</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Mic size={18} />
            音声ファイルアップロード（UIのみ）
          </CardTitle>
        </CardHeader>
        <CardContent>
          <label
            data-testid="input-audio-upload"
            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg p-8 cursor-pointer hover:border-blue-300 transition-colors"
          >
            <Upload size={32} className="text-gray-300 mb-2" />
            <span className="text-sm text-gray-500">
              {audioFileName ?? "音声ファイルをドラッグ＆ドロップ、またはクリックして選択"}
            </span>
            <span className="text-xs text-gray-400 mt-1">MP3, WAV, M4A（実際の変換は省略）</span>
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => setAudioFileName(e.target.files?.[0]?.name ?? null)}
            />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">会議情報・テキストメモ</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="meetingType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>会議種別</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-meeting-type">
                          <SelectValue placeholder="会議種別を選択" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="理事会">理事会</SelectItem>
                        <SelectItem value="総会">総会</SelectItem>
                        <SelectItem value="委員会">委員会</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="meetingDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>開催日</FormLabel>
                    <FormControl>
                      <Input data-testid="input-meeting-date" type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>件名</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="input-title"
                        placeholder="例：第41期 第3回理事会"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="memoText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>テキストメモ</FormLabel>
                    <FormControl>
                      <Textarea
                        data-testid="input-memo-text"
                        placeholder="会議のメモをここに貼り付けてください。出席者、議題、決定事項などを記載するとより良い議事録が生成されます。"
                        rows={10}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                data-testid="button-submit-import"
                type="submit"
                className="w-full flex items-center gap-2"
                disabled={createRecordingMutation.isPending}
              >
                <Sparkles size={16} />
                {createRecordingMutation.isPending ? "保存中..." : "AI文字起こし＆議事録生成へ進む"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
