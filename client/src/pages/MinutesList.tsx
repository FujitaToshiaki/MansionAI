import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Plus, CheckCircle, Clock, AlertCircle, ChevronRight } from "lucide-react";
import type { MeetingRecording } from "@shared/schema";

const MEETING_TYPE_LABELS: Record<string, string> = {
  理事会: "理事会",
  総会: "総会",
  委員会: "委員会",
};

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "outline"; icon: typeof CheckCircle }> = {
  completed: { label: "生成済み", variant: "default", icon: CheckCircle },
  generating: { label: "生成中", variant: "secondary", icon: Clock },
  pending: { label: "未生成", variant: "outline", icon: AlertCircle },
  failed: { label: "失敗", variant: "secondary", icon: AlertCircle },
};

export default function MinutesList() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();

  const { data: recordings, isLoading } = useQuery<MeetingRecording[]>({
    queryKey: ["/api/condominiums", id, "minutes/recordings"],
    queryFn: async () => {
      const res = await fetch(`/api/condominiums/${id}/minutes/recordings`);
      if (!res.ok) throw new Error("Failed to fetch recordings");
      return res.json();
    },
  });

  const { data: condominium } = useQuery<{ name: string }>({
    queryKey: ["/api/condominiums", id],
    queryFn: async () => {
      const res = await fetch(`/api/condominiums/${id}`);
      if (!res.ok) throw new Error("Failed to fetch condominium");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">議事録一覧</h1>
          {condominium && (
            <p className="text-sm text-gray-500 mt-1">{condominium.name}</p>
          )}
        </div>
        <Button
          data-testid="button-new-import"
          onClick={() => navigate(`/condominiums/${id}/minutes/import`)}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          音声・メモ取込
        </Button>
      </div>

      {!recordings || recordings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText size={48} className="text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg font-medium">議事録がまだありません</p>
            <p className="text-gray-400 text-sm mt-1">
              「音声・メモ取込」から会議メモを取り込んでAI議事録を生成しましょう
            </p>
            <Button
              data-testid="button-start-import"
              className="mt-4"
              onClick={() => navigate(`/condominiums/${id}/minutes/import`)}
            >
              取込を開始する
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {recordings.map((rec) => {
            const statusCfg = STATUS_CONFIG[rec.generationStatus] ?? STATUS_CONFIG.pending;
            const StatusIcon = statusCfg.icon;
            return (
              <Card
                key={rec.id}
                data-testid={`card-recording-${rec.id}`}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/condominiums/${id}/minutes/generate?recordingId=${rec.id}`)}
              >
                <CardContent className="flex items-center justify-between p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <FileText size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p
                        data-testid={`text-recording-title-${rec.id}`}
                        className="font-semibold text-gray-900"
                      >
                        {rec.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-gray-500">
                          {new Date(rec.meetingDate).toLocaleDateString("ja-JP")}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {MEETING_TYPE_LABELS[rec.meetingType] ?? rec.meetingType}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      data-testid={`status-recording-${rec.id}`}
                      variant={statusCfg.variant}
                      className="flex items-center gap-1"
                    >
                      <StatusIcon size={12} />
                      {statusCfg.label}
                    </Badge>
                    <ChevronRight size={18} className="text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button
          data-testid="button-nav-actions"
          variant="outline"
          onClick={() => navigate(`/condominiums/${id}/minutes/actions`)}
        >
          決定事項・アクションアイテム管理
        </Button>
      </div>
    </div>
  );
}
