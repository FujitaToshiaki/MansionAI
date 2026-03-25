import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { CheckSquare, User, Calendar, ArrowLeft, Circle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { ActionItem } from "@shared/schema";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  todo: { label: "未着手", color: "bg-gray-100 text-gray-700" },
  in_progress: { label: "対応中", color: "bg-blue-100 text-blue-700" },
  done: { label: "完了", color: "bg-green-100 text-green-700" },
};

export default function MinutesActions() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: items, isLoading } = useQuery<ActionItem[]>({
    queryKey: ["/api/condominiums", id, "action-items"],
    queryFn: async () => {
      const res = await fetch(`/api/condominiums/${id}/action-items`);
      if (!res.ok) throw new Error("Failed to fetch action items");
      return res.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ itemId, updates }: { itemId: string; updates: Partial<ActionItem> }) => {
      return apiRequest("PATCH", `/api/condominiums/${id}/action-items/${itemId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/condominiums", id, "action-items"] });
      toast({ title: "更新しました" });
    },
    onError: () => {
      toast({ title: "更新失敗", variant: "destructive" });
    },
  });

  const filtered = items?.filter((item) => filterStatus === "all" || item.status === filterStatus) ?? [];

  const statusCounts = {
    all: items?.length ?? 0,
    todo: items?.filter((i) => i.status === "todo").length ?? 0,
    in_progress: items?.filter((i) => i.status === "in_progress").length ?? 0,
    done: items?.filter((i) => i.status === "done").length ?? 0,
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
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
          議事録一覧へ
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CheckSquare size={24} />
          決定事項・アクションアイテム
        </h1>
        <p className="text-sm text-gray-500 mt-1">議事録から抽出された決定事項とアクションアイテムの管理</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        {(["all", "todo", "in_progress", "done"] as const).map((s) => (
          <button
            key={s}
            data-testid={`filter-${s}`}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filterStatus === s
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s === "all" ? "すべて" : STATUS_CONFIG[s].label}
            <span className="ml-1 text-xs opacity-75">({statusCounts[s]})</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <CheckSquare size={48} className="text-gray-300 mb-4" />
            <p className="text-gray-500">アクションアイテムがありません</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.todo;
            return (
              <Card key={item.id} data-testid={`card-action-item-${item.id}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Circle size={8} className="text-gray-400 flex-shrink-0" />
                        <p
                          data-testid={`text-action-title-${item.id}`}
                          className="font-semibold text-gray-900 truncate"
                        >
                          {item.title}
                        </p>
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-500 ml-4 mb-2">{item.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 ml-4">
                        {item.assignee && (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <User size={12} />
                            <span data-testid={`text-assignee-${item.id}`}>{item.assignee}</span>
                          </span>
                        )}
                        {item.dueDate && (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar size={12} />
                            <span data-testid={`text-due-date-${item.id}`}>
                              {new Date(item.dueDate).toLocaleDateString("ja-JP")}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <Select
                        value={item.status}
                        onValueChange={(val) =>
                          updateMutation.mutate({ itemId: item.id, updates: { status: val } })
                        }
                      >
                        <SelectTrigger
                          data-testid={`select-status-${item.id}`}
                          className={`w-28 text-xs border-0 ${cfg.color} rounded-full px-3 h-7`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">未着手</SelectItem>
                          <SelectItem value="in_progress">対応中</SelectItem>
                          <SelectItem value="done">完了</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4 ml-4">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">担当者</label>
                      <Input
                        data-testid={`input-assignee-${item.id}`}
                        defaultValue={item.assignee ?? ""}
                        className="h-7 text-xs"
                        placeholder="担当者名"
                        onBlur={(e) => {
                          if (e.target.value !== (item.assignee ?? "")) {
                            updateMutation.mutate({ itemId: item.id, updates: { assignee: e.target.value } });
                          }
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">期限</label>
                      <Input
                        data-testid={`input-due-date-${item.id}`}
                        type="date"
                        defaultValue={item.dueDate ? new Date(item.dueDate).toISOString().split("T")[0] : ""}
                        className="h-7 text-xs"
                        onBlur={(e) => {
                          const newDate = e.target.value ? new Date(e.target.value) : null;
                          const oldDate = item.dueDate ? new Date(item.dueDate).toISOString().split("T")[0] : "";
                          if (e.target.value !== oldDate) {
                            updateMutation.mutate({ itemId: item.id, updates: { dueDate: newDate ?? undefined } });
                          }
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
