import { useState, useEffect } from "react";
import { useParams, useLocation, useSearch } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Save, ArrowLeft, FileText } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { MeetingRecording } from "@shared/schema";

function SimpleMarkdownPreview({ markdown }: { markdown: string }) {
  const lines = markdown.split("\n");
  return (
    <div className="prose prose-sm max-w-none space-y-1 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words text-gray-800">
      {lines.map((line, i) => {
        if (line.startsWith("# ")) return <h1 key={i} className="text-xl font-bold text-gray-900 mt-4 mb-2">{line.slice(2)}</h1>;
        if (line.startsWith("## ")) return <h2 key={i} className="text-lg font-semibold text-gray-800 mt-3 mb-1 border-b pb-1">{line.slice(3)}</h2>;
        if (line.startsWith("### ")) return <h3 key={i} className="text-base font-semibold text-gray-700 mt-2 mb-1">{line.slice(4)}</h3>;
        if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="font-bold">{line.slice(2, -2)}</p>;
        if (line.startsWith("- ")) return <li key={i} className="ml-4 list-disc">{line.slice(2)}</li>;
        if (line === "---") return <hr key={i} className="my-3 border-gray-200" />;
        if (line === "") return <br key={i} />;
        return <p key={i}>{line}</p>;
      })}
    </div>
  );
}

export default function MinutesGenerate() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const search = useSearch();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const params = new URLSearchParams(search);
  const recordingId = params.get("recordingId");

  const [editableMarkdown, setEditableMarkdown] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [generatedMarkdown, setGeneratedMarkdown] = useState("");

  const { data: recording, isLoading } = useQuery<MeetingRecording>({
    queryKey: ["/api/condominiums", id, "recordings", recordingId],
    queryFn: async () => {
      const res = await fetch(`/api/condominiums/${id}/minutes/recordings`);
      if (!res.ok) throw new Error("Failed to fetch");
      const all: MeetingRecording[] = await res.json();
      const found = all.find((r) => r.id === recordingId);
      if (!found) throw new Error("Recording not found");
      return found;
    },
    enabled: !!recordingId,
  });

  useEffect(() => {
    if (recording?.generatedMinutesMarkdown) {
      setGeneratedMarkdown(recording.generatedMinutesMarkdown);
      setEditableMarkdown(recording.generatedMinutesMarkdown);
    }
  }, [recording]);

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!recording) throw new Error("No recording");
      return apiRequest("POST", `/api/condominiums/${id}/minutes/generate`, {
        recordingId: recording.id,
        memoText: recording.memoText,
        meetingType: recording.meetingType,
        meetingDate: recording.meetingDate,
        title: recording.title,
      });
    },
    onSuccess: async (res: Response) => {
      const data = await res.json();
      setGeneratedMarkdown(data.markdown);
      setEditableMarkdown(data.markdown);
      queryClient.invalidateQueries({ queryKey: ["/api/condominiums", id, "minutes/recordings"] });
      toast({ title: "生成完了", description: "AI議事録草案が生成されました。" });
    },
    onError: (err: Error) => {
      toast({ title: "生成失敗", description: err.message, variant: "destructive" });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!recordingId) throw new Error("No recordingId");
      return apiRequest("POST", `/api/condominiums/${id}/minutes/recordings`, {
        condominiumId: id,
        meetingType: recording?.meetingType,
        meetingDate: recording?.meetingDate,
        title: `[確定] ${recording?.title}`,
        memoText: editableMarkdown,
        generationStatus: "completed",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/condominiums", id, "minutes/recordings"] });
      toast({ title: "保存完了", description: "議事録を確定保存しました。" });
      navigate(`/condominiums/${id}/minutes/list`);
    },
    onError: () => {
      toast({ title: "保存失敗", description: "保存に失敗しました", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!recording && recordingId) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">録音・メモが見つかりません</p>
        <Button className="mt-4" onClick={() => navigate(`/condominiums/${id}/minutes/list`)}>
          一覧へ戻る
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
        <h1 className="text-2xl font-bold text-gray-900">AI議事録生成</h1>
        {recording && (
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-gray-500">{recording.title}</p>
            <Badge variant="outline" className="text-xs">{recording.meetingType}</Badge>
            <Badge variant="outline" className="text-xs">
              {new Date(recording.meetingDate).toLocaleDateString("ja-JP")}
            </Badge>
          </div>
        )}
      </div>

      {recording && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText size={16} />
              元メモ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre
              data-testid="text-memo-content"
              className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded p-3 border"
            >
              {recording.memoText || "メモなし"}
            </pre>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles size={16} className="text-blue-500" />
              AI生成 議事録草案
            </CardTitle>
            <div className="flex gap-2">
              {generatedMarkdown && (
                <Button
                  data-testid="button-toggle-edit"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? "プレビュー" : "編集"}
                </Button>
              )}
              <Button
                data-testid="button-generate"
                size="sm"
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending || !recording?.memoText}
                className="flex items-center gap-1"
              >
                <Sparkles size={14} />
                {generateMutation.isPending ? "生成中..." : generatedMarkdown ? "再生成" : "AI文字起こし＆議事録生成"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {generateMutation.isPending ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : generatedMarkdown ? (
            isEditing ? (
              <Textarea
                data-testid="input-edit-markdown"
                value={editableMarkdown}
                onChange={(e) => setEditableMarkdown(e.target.value)}
                rows={20}
                className="font-mono text-sm"
              />
            ) : (
              <div
                data-testid="text-generated-minutes"
                className="border rounded-lg p-4 bg-white min-h-[300px]"
              >
                <SimpleMarkdownPreview markdown={editableMarkdown} />
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
              <Sparkles size={40} className="mb-3 opacity-30" />
              <p>「AI文字起こし＆議事録生成」ボタンを押すと、メモから議事録草案が生成されます</p>
            </div>
          )}
        </CardContent>
      </Card>

      {generatedMarkdown && (
        <div className="flex justify-end gap-3">
          <Button
            data-testid="button-save-minutes"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="flex items-center gap-2"
          >
            <Save size={16} />
            {saveMutation.isPending ? "保存中..." : "確定保存"}
          </Button>
        </div>
      )}
    </div>
  );
}
