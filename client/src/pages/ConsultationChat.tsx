import { useEffect, useRef, useState } from "react";
import { useSearch } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MessageSquare, Send, User, Bot, HelpCircle, History, Mic, Square, Loader2, FileText } from "lucide-react";
import { SubNav } from "@/components/SubNav";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

interface ReportDraft {
  category: string;
  title: string;
  facts: string;
  reportedCause: string;
  unknowns: string;
  request: string;
  action: string;
  priority: "high" | "medium" | "low";
}

const FAQ_ITEMS = [
  "理事会の議事録作成のコツを教えてください",
  "修繕積立金の改定に必要な手続きは何ですか？",
  "区分所有法における「重大な変更」の定義を教えてください",
];

const TRANSCRIPTION_DRAIN_TIMEOUT_MS = 8_000;
const CONNECTION_TIMEOUT_MS = 15_000;

export default function ConsultationChat() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const condominiumId = params.get("condominiumId") ?? "";

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isStartingRecording, setIsStartingRecording] = useState(false);
  const [isStoppingRecording, setIsStoppingRecording] = useState(false);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [partialTranscript, setPartialTranscript] = useState("");
  const [reportDraft, setReportDraft] = useState<ReportDraft | null>(null);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isRegisteringReport, setIsRegisteringReport] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);
  const conversationRef = useRef<Message[]>([]);
  const transcriptOrderRef = useRef<string[]>([]);
  const transcriptByItemRef = useRef<Map<string, string>>(new Map());
  const partialByItemRef = useRef<Map<string, string>>(new Map());
  const aiTranscriptByItemRef = useRef<Map<string, string>>(new Map());
  const completedTranscriptionItemsRef = useRef<Set<string>>(new Set());
  const committedAudioItemsRef = useRef<Set<string>>(new Set());
  const activeResponseIdsRef = useRef<Set<string>>(new Set());
  const hasUncommittedAudioRef = useRef(false);
  const speechStoppedAtRef = useRef(0);
  const commitRequestedRef = useRef(false);
  const realtimeErrorRef = useRef<string | null>(null);
  const intentionalCloseRef = useRef(false);
  const endingConversationRef = useRef(false);
  const connectionReadyRef = useRef(false);
  const chatResponseTimerRef = useRef<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, partialTranscript]);

  useEffect(() => {
    return () => {
      intentionalCloseRef.current = true;
      if (chatResponseTimerRef.current !== null) {
        window.clearTimeout(chatResponseTimerRef.current);
      }
      closeRealtimeConnection();
    };
  }, []);

  const closeRealtimeConnection = () => {
    connectionReadyRef.current = false;
    microphoneStreamRef.current?.getTracks().forEach((track) => track.stop());
    microphoneStreamRef.current = null;
    dataChannelRef.current?.close();
    dataChannelRef.current = null;
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
    if (remoteAudioRef.current) {
      remoteAudioRef.current.pause();
      remoteAudioRef.current.srcObject = null;
    }
    setIsRecording(false);
  };

  const resetVoiceState = () => {
    if (chatResponseTimerRef.current !== null) {
      window.clearTimeout(chatResponseTimerRef.current);
      chatResponseTimerRef.current = null;
    }
    setPartialTranscript("");
    transcriptOrderRef.current = [];
    transcriptByItemRef.current.clear();
    partialByItemRef.current.clear();
    aiTranscriptByItemRef.current.clear();
    completedTranscriptionItemsRef.current.clear();
    committedAudioItemsRef.current.clear();
    activeResponseIdsRef.current.clear();
    hasUncommittedAudioRef.current = false;
    speechStoppedAtRef.current = 0;
    commitRequestedRef.current = false;
    realtimeErrorRef.current = null;
    conversationRef.current = [];
    setMessages([]);
  };

  const updateConversationMessage = (id: string, role: Message["role"], content: string) => {
    const trimmedContent = content.trim();
    if (!trimmedContent) return;
    const current = conversationRef.current;
    const index = current.findIndex((message) => message.id === id);
    const nextMessage: Message = {
      id,
      role,
      content: trimmedContent,
      timestamp: index >= 0 ? current[index].timestamp : new Date(),
    };
    const next = index >= 0
      ? current.map((message, messageIndex) => messageIndex === index ? nextMessage : message)
      : [...current, nextMessage];
    conversationRef.current = next;
    setMessages(next);
  };

  const sendRealtimeEvent = (payload: Record<string, unknown>) => {
    const channel = dataChannelRef.current;
    if (!channel || channel.readyState !== "open") {
      throw new Error("音声接続が利用できません");
    }
    channel.send(JSON.stringify(payload));
  };

  const rememberTranscriptItem = (itemId: string, previousItemId?: string) => {
    if (!itemId || transcriptOrderRef.current.includes(itemId)) return;
    const previousIndex = previousItemId ? transcriptOrderRef.current.indexOf(previousItemId) : -1;
    if (previousIndex >= 0) {
      transcriptOrderRef.current.splice(previousIndex + 1, 0, itemId);
    } else {
      transcriptOrderRef.current.push(itemId);
    }
  };

  const rebuildUserTranscript = () => {
    const partial = transcriptOrderRef.current
      .map((itemId) => partialByItemRef.current.get(itemId))
      .filter((text): text is string => Boolean(text))
      .join("");
    setPartialTranscript(partial);
  };

  const handleRealtimeEvent = (event: MessageEvent<string>) => {
    if (typeof event.data !== "string") return;
    try {
      const payload = JSON.parse(event.data) as {
        type?: string;
        item_id?: string;
        previous_item_id?: string;
        delta?: string;
        transcript?: string;
        error?: { message?: string; code?: string };
        response_id?: string;
        response?: { id?: string };
      };
      const type = payload.type ?? "";
      const itemId = String(payload.item_id ?? "");
      const responseId = payload.response_id ?? payload.response?.id ?? "";

      if (type === "response.created" && responseId) {
        activeResponseIdsRef.current.add(responseId);
      }
      if (type === "response.done" && responseId) {
        activeResponseIdsRef.current.delete(responseId);
      }

      if (type === "input_audio_buffer.speech_started") {
        hasUncommittedAudioRef.current = true;
        speechStoppedAtRef.current = 0;
      }

      if (type === "input_audio_buffer.speech_stopped") {
        speechStoppedAtRef.current = Date.now();
      }

      if (type === "input_audio_buffer.committed") {
        if (itemId) {
          committedAudioItemsRef.current.add(itemId);
          rememberTranscriptItem(itemId, payload.previous_item_id);
        }
        hasUncommittedAudioRef.current = false;
        commitRequestedRef.current = false;
      }

      if (type === "conversation.item.input_audio_transcription.delta") {
        rememberTranscriptItem(itemId, payload.previous_item_id);
        const text = (partialByItemRef.current.get(itemId) ?? "") + (payload.delta ?? "");
        partialByItemRef.current.set(itemId, text);
        updateConversationMessage(`user-${itemId}`, "user", text);
        rebuildUserTranscript();
      }

      if (type === "conversation.item.input_audio_transcription.completed" ||
        type === "conversation.item.input_audio_transcription.done") {
        rememberTranscriptItem(itemId, payload.previous_item_id);
        const transcript = (payload.transcript ?? partialByItemRef.current.get(itemId) ?? "").trim();
        if (transcript) {
          transcriptByItemRef.current.set(itemId, transcript);
          updateConversationMessage(`user-${itemId}`, "user", transcript);
        }
        partialByItemRef.current.delete(itemId);
        completedTranscriptionItemsRef.current.add(itemId);
        rebuildUserTranscript();
      }

      if (type === "conversation.item.input_audio_transcription.failed") {
        realtimeErrorRef.current = payload.error?.message ?? "音声の文字起こしに失敗しました";
      }

      const isAiTranscriptDelta = type === "response.output_audio_transcript.delta" ||
        type === "response.audio_transcript.delta" ||
        type === "response.output_text.delta" ||
        type === "response.text.delta";
      const isAiTranscriptDone = type === "response.output_audio_transcript.done" ||
        type === "response.audio_transcript.done" ||
        type === "response.output_text.done" ||
        type === "response.text.done";
      if (isAiTranscriptDelta) {
        const text = (aiTranscriptByItemRef.current.get(itemId) ?? "") + (payload.delta ?? "");
        aiTranscriptByItemRef.current.set(itemId, text);
        updateConversationMessage(`ai-${itemId}`, "ai", text);
      }
      if (isAiTranscriptDone) {
        const transcript = (payload.transcript ?? aiTranscriptByItemRef.current.get(itemId) ?? "").trim();
        if (transcript) {
          aiTranscriptByItemRef.current.set(itemId, transcript);
          updateConversationMessage(`ai-${itemId}`, "ai", transcript);
        }
      }

      if (type === "error") {
        const message = payload.error?.message ?? "音声の処理中にエラーが発生しました";
        realtimeErrorRef.current = message;
        if (!endingConversationRef.current) {
          toast({ title: "音声入力エラー", description: message, variant: "destructive" });
        }
      }
    } catch (error) {
      realtimeErrorRef.current = error instanceof Error ? error.message : "音声イベントを処理できませんでした";
      console.error("Failed to parse Realtime API event:", error);
    }
  };

  const handleUnexpectedRealtimeClose = () => {
    if (intentionalCloseRef.current || endingConversationRef.current) return;
    const wasReady = connectionReadyRef.current;
    closeRealtimeConnection();
    setIsStartingRecording(false);
    setIsStoppingRecording(false);
    if (!wasReady) return;
    toast({
      title: "音声接続が切断されました",
      description: "入力内容は登録されていません。ネットワークを確認してもう一度お試しください。",
      variant: "destructive",
    });
  };

  const waitForDataChannelOpen = (channel: RTCDataChannel): Promise<void> => new Promise((resolve, reject) => {
    if (channel.readyState === "open") {
      resolve();
      return;
    }
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("音声接続がタイムアウトしました"));
    }, CONNECTION_TIMEOUT_MS);
    const cleanup = () => {
      window.clearTimeout(timeout);
      channel.removeEventListener("open", onOpen);
      channel.removeEventListener("error", onError);
      channel.removeEventListener("close", onClose);
    };
    const onOpen = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error("音声データ接続を確立できませんでした"));
    };
    const onClose = () => {
      cleanup();
      reject(new Error("音声データ接続が閉じられました"));
    };
    channel.addEventListener("open", onOpen);
    channel.addEventListener("error", onError);
    channel.addEventListener("close", onClose);
  });

  const startVoiceReport = async () => {
    if (!condominiumId) {
      toast({
        title: "物件を選択してください",
        description: "物件詳細からチャット相談を開いてください。",
        variant: "destructive",
      });
      return;
    }

    setIsStartingRecording(true);
    resetVoiceState();
    intentionalCloseRef.current = false;
    endingConversationRef.current = false;
    connectionReadyRef.current = false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      microphoneStreamRef.current = stream;

      const peerConnection = new RTCPeerConnection();
      peerConnectionRef.current = peerConnection;
      peerConnection.addEventListener("connectionstatechange", () => {
        if (["failed", "disconnected"].includes(peerConnection.connectionState)) {
          handleUnexpectedRealtimeClose();
        }
      });
      peerConnection.addEventListener("track", (event) => {
        const remoteStream = event.streams[0] ?? new MediaStream([event.track]);
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = remoteStream;
          void remoteAudioRef.current.play().catch(() => {
            // The start button is a user gesture; some browsers still delay playback.
          });
        }
      });
      stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));

      const dataChannel = peerConnection.createDataChannel("oai-events");
      dataChannelRef.current = dataChannel;
      dataChannel.addEventListener("message", handleRealtimeEvent);
      dataChannel.addEventListener("error", handleUnexpectedRealtimeClose);
      dataChannel.addEventListener("close", handleUnexpectedRealtimeClose);
      dataChannel.addEventListener("open", () => {
        try {
          sendRealtimeEvent({
            type: "response.create",
            response: {
              output_modalities: ["audio"],
              instructions: "会話相手は管理会社の窓口担当者です。日本語で「住民の方から受け付けた内容を報告してください。どのようなお申し出でしたか？」と最初に尋ねてください。住民本人として扱わず、一度に一問にしてください。",
            },
          });
        } catch (error) {
          realtimeErrorRef.current = error instanceof Error ? error.message : "最初の質問を送信できませんでした";
        }
      });

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      if (!offer.sdp) throw new Error("音声接続情報を作成できませんでした");

      const response = await fetch("/api/realtime/consultation-session", {
        method: "POST",
        headers: { "Content-Type": "application/sdp" },
        body: offer.sdp,
        signal: AbortSignal.timeout(CONNECTION_TIMEOUT_MS),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error ?? "音声入力セッションを開始できませんでした");
      }

      const answerSdp = await response.text();
      await peerConnection.setRemoteDescription({ type: "answer", sdp: answerSdp });
      await waitForDataChannelOpen(dataChannel);
      connectionReadyRef.current = true;
      setIsRecording(true);
    } catch (error) {
      intentionalCloseRef.current = true;
      closeRealtimeConnection();
      const message = error instanceof DOMException && error.name === "NotAllowedError"
        ? "マイクの使用が許可されていません。ブラウザの設定をご確認ください。"
        : error instanceof Error ? error.message : "音声入力を開始できませんでした。";
      toast({ title: "音声入力を開始できません", description: message, variant: "destructive" });
    } finally {
      setIsStartingRecording(false);
    }
  };

  const waitForCommittedTranscriptions = (): Promise<void> => new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const pendingItems = Array.from(committedAudioItemsRef.current)
        .filter((itemId) => !completedTranscriptionItemsRef.current.has(itemId));
      const pendingCommit = commitRequestedRef.current || hasUncommittedAudioRef.current;
      const hasPartial = partialByItemRef.current.size > 0;
      const pendingResponse = activeResponseIdsRef.current.size > 0;

      if (realtimeErrorRef.current) {
        window.clearInterval(timer);
        reject(new Error(`音声文字起こしが不完全です: ${realtimeErrorRef.current}`));
        return;
      }
      if (!pendingCommit && pendingItems.length === 0 && !hasPartial && !pendingResponse) {
        window.clearInterval(timer);
        resolve();
        return;
      }
      if (Date.now() - startedAt >= TRANSCRIPTION_DRAIN_TIMEOUT_MS) {
        window.clearInterval(timer);
        reject(new Error("音声文字起こしの確定がタイムアウトしました。内容は保存されていません。"));
      }
    }, 100);
  });

  const finishVoiceConversation = async () => {
    if (!peerConnectionRef.current && !isRecording) return;
    setIsStoppingRecording(true);
    setIsRecording(false);
    endingConversationRef.current = true;
    microphoneStreamRef.current?.getTracks().forEach((track) => track.stop());

    try {
      const channel = dataChannelRef.current;
      // server_vad normally commits on speech_stopped. Give that event a
      // moment to arrive before falling back to an explicit commit, which
      // avoids sending an empty commit after an automatic one.
      if (channel?.readyState === "open" && hasUncommittedAudioRef.current) {
        await new Promise<void>((resolve) => window.setTimeout(resolve, speechStoppedAtRef.current ? 250 : 100));
      }
      if (channel?.readyState === "open" && hasUncommittedAudioRef.current && !commitRequestedRef.current) {
        commitRequestedRef.current = true;
        sendRealtimeEvent({ type: "input_audio_buffer.commit" });
      }
      await waitForCommittedTranscriptions();
      closeRealtimeConnection();

      const transcript = conversationRef.current
        .filter((message) => message.content.trim())
        .map((message) => ({
          role: message.role === "user" ? "user" as const : "assistant" as const,
          content: message.content.trim(),
        }));
      if (!transcript.some((turn) => turn.role === "user")) {
        throw new Error("利用者の報告が確認できませんでした。話してから終了してください。");
      }

      setIsGeneratingDraft(true);
      const response = await fetch("/api/consultation/report-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });
      const body = await response.json().catch(() => ({})) as ReportDraft & { error?: string };
      if (!response.ok) throw new Error(body.error ?? "報告書の下書きを作成できませんでした");
      setReportDraft({
        category: body.category || "報告",
        title: body.title || "音声相談の報告",
        facts: body.facts || "未確認",
        reportedCause: body.reportedCause || "未確認",
        unknowns: body.unknowns || "未確認",
        request: body.request || "未確認",
        action: body.action || "未確認",
        priority: body.priority === "high" || body.priority === "low" ? body.priority : "medium",
      });
      setIsReportDialogOpen(true);
    } catch (error) {
      closeRealtimeConnection();
      toast({
        title: "報告を確定できませんでした",
        description: error instanceof Error ? error.message : "内容は保存されていません。",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingDraft(false);
      setIsStoppingRecording(false);
      endingConversationRef.current = false;
    }
  };

  const updateDraft = (field: keyof ReportDraft, value: string) => {
    setReportDraft((current) => current ? { ...current, [field]: value } as ReportDraft : current);
  };

  const draftContent = (draft: ReportDraft) => [
    `【住民の申告・管理会社の確認事項】\n${draft.facts.trim() || "未確認"}`,
    `【申告された原因】\n${draft.reportedCause.trim() || "未確認"}`,
    `【不明点】\n${draft.unknowns.trim() || "未確認"}`,
    `【住民の希望する対応】\n${draft.request.trim() || "未確認"}`,
    `【管理会社の対応済み事項・対応予定】\n${draft.action.trim() || "未確認"}`,
  ].join("\n\n");

  const registerReport = async () => {
    if (!reportDraft || !reportDraft.title.trim()) {
      toast({ title: "入力内容を確認してください", description: "件名は必須です。", variant: "destructive" });
      return;
    }

    setIsRegisteringReport(true);
    try {
      const response = await fetch(`/api/condominiums/${condominiumId}/consultation-logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: reportDraft.category.trim() || "報告",
          title: reportDraft.title.trim(),
          content: draftContent(reportDraft),
          status: "open",
          priority: reportDraft.priority,
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error ?? "報告の登録に失敗しました");
      }
      await queryClient.invalidateQueries({
        queryKey: [`/api/condominiums/${condominiumId}/consultation-logs`],
      });
      setMessages((current) => [
        ...current,
        {
          id: `registered-${Date.now()}`,
          role: "ai",
          content: "報告を登録しました。相談履歴から確認できます。",
          timestamp: new Date(),
        },
      ]);
      setIsReportDialogOpen(false);
      setReportDraft(null);
      toast({ title: "報告を登録しました", description: "相談履歴に保存しました。" });
    } catch (error) {
      toast({
        title: "登録できませんでした",
        description: error instanceof Error ? error.message : "時間をおいて再度お試しください。",
        variant: "destructive",
      });
    } finally {
      setIsRegisteringReport(false);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };
    conversationRef.current = [...conversationRef.current, userMsg];
    setMessages(conversationRef.current);
    setInput("");
    setIsTyping(true);
    chatResponseTimerRef.current = window.setTimeout(() => {
      chatResponseTimerRef.current = null;
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: `${userMsg.content}についてのご質問ですね。一般的な見解としては、管理規約の定めに従いつつ、理事会での決議が必要となります。詳細な状況に合わせて、区分所有法や標準管理規約の最新版に照らしたアドバイスも可能です。`,
        timestamp: new Date(),
      };
      conversationRef.current = [...conversationRef.current, aiMsg];
      setMessages(conversationRef.current);
      setIsTyping(false);
    }, 2000);
  };

  const handleFaqClick = (faq: string) => {
    setInput(faq);
  };

  const closeReportDialog = (open: boolean) => {
    if (isRegisteringReport) return;
    setIsReportDialogOpen(open);
    if (!open) setReportDraft(null);
  };

  return (
    <div className="flex flex-col h-full gap-4 overflow-hidden">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <nav className="text-sm text-gray-500 mb-1">
            <Link href={`/condominiums/${condominiumId}`} className="hover:text-gray-700">マンション詳細</Link>
            <span className="mx-2">{">"}</span>
            <span className="text-gray-400">AIチャット</span>
            <span className="mx-2">{">"}</span>
            <span>チャット相談</span>
          </nav>
          <h1 className="text-2xl font-bold flex items-center">
            <MessageSquare className="mr-2 h-6 w-6 text-orange-500" />
            チャット相談
          </h1>
        </div>
        <SubNav items={[
          { label: "チャット相談", path: `/consultation/chat?condominiumId=${condominiumId}`, icon: MessageSquare },
          { label: "相談履歴", path: `/consultation/history?condominiumId=${condominiumId}`, icon: History },
        ]} />
      </div>

      <div className="flex gap-4 min-h-0 flex-1">
        <Card className="flex-1 flex flex-col bg-white min-h-0">
          <CardHeader className="border-b py-3 px-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <MessageSquare className="mr-2 h-5 w-5 text-orange-500" />
                AI管理業務相談
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={isRecording ? "destructive" : "outline"}
                  onClick={isRecording ? finishVoiceConversation : startVoiceReport}
                  disabled={isStartingRecording || isStoppingRecording || isGeneratingDraft}
                  className={!isRecording ? "border-orange-200 text-orange-700 hover:bg-orange-50" : ""}
                  data-testid="button-voice-report"
                >
                  {isStartingRecording || isStoppingRecording || isGeneratingDraft ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : isRecording ? (
                    <Square className="mr-2 h-3.5 w-3.5 fill-current" />
                  ) : (
                    <Mic className="mr-2 h-4 w-4" />
                  )}
                  {isStartingRecording ? "接続中..." : isStoppingRecording ? "文字起こしを確定中..." : isGeneratingDraft ? "下書きを作成中..." : isRecording ? "会話を終了" : "音声で報告"}
                </Button>
                <Tabs defaultValue="all" className="w-auto">
                  <TabsList className="h-8">
                    <TabsTrigger value="all" className="text-xs">すべて</TabsTrigger>
                    <TabsTrigger value="complaint" className="text-xs">クレーム</TabsTrigger>
                    <TabsTrigger value="law" className="text-xs">法令解釈</TabsTrigger>
                    <TabsTrigger value="operation" className="text-xs">運用判断</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardHeader>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {(isRecording || isStoppingRecording || isGeneratingDraft || partialTranscript) && (
                <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-orange-800">
                    <span className={`h-2.5 w-2.5 rounded-full bg-orange-500 ${isRecording ? "animate-pulse" : ""}`} />
                    {isRecording ? "音声で報告を聞き取り中" : isStoppingRecording ? "文字起こしを確定中" : "報告書の下書きを作成中"}
                  </div>
                  <p className="text-sm leading-relaxed text-orange-900">
                    AIが質問します。終了するまで、話した内容とAIの質問がこの画面に表示されます。
                  </p>
                  {partialTranscript && (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">{partialTranscript}</p>
                  )}
                </div>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex max-w-[80%] items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`rounded-full flex items-center justify-center h-8 w-8 flex-shrink-0 ${msg.role === "user" ? "bg-gray-200" : "bg-orange-100"}`}>
                      {msg.role === "user" ? <User className="h-4 w-4 text-gray-600" /> : <Bot className="h-4 w-4 text-orange-600" />}
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className={`rounded-2xl px-4 py-2 text-sm shadow-sm ${msg.role === "user" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-900"}`}>
                        {msg.content}
                      </div>
                      <div className={`text-[10px] text-gray-400 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-end gap-2">
                    <div className="rounded-full flex items-center justify-center h-8 w-8 flex-shrink-0 bg-orange-100">
                      <Bot className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl px-4 py-2 text-sm shadow-sm animate-pulse text-gray-900">入力中...</div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          <div className="p-4 border-t bg-gray-50/50 flex-shrink-0">
            <div className="flex gap-2">
              <Input
                placeholder="メッセージを入力してください..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="bg-white"
                disabled={isRecording || isStoppingRecording || isGeneratingDraft}
                data-testid="input-chat-message"
              />
              <Button onClick={handleSend} disabled={isRecording || isStoppingRecording || isGeneratingDraft} className="bg-orange-500 hover:bg-orange-600" data-testid="button-send-message">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        <div className="w-80 space-y-4">
          <Card className="bg-white">
            <CardHeader className="py-3 px-4 border-b">
              <CardTitle className="text-sm font-bold flex items-center">
                <HelpCircle className="mr-2 h-4 w-4 text-orange-500" />
                よくある質問
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-2">
                {FAQ_ITEMS.map((faq, i) => (
                  <button
                    key={i}
                    onClick={() => handleFaqClick(faq)}
                    className="w-full text-left text-xs p-2 rounded-md border hover:bg-orange-50 hover:border-orange-200 transition-colors"
                    data-testid={`button-faq-${i}`}
                  >
                    {faq}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-100">
            <CardContent className="p-4">
              <h4 className="text-sm font-bold text-orange-800 mb-2">AI相談のヒント</h4>
              <p className="text-xs text-orange-700 leading-relaxed">
                具体的な状況（日時、場所、関係者など）を含めて質問すると、より精度の高い回答が得られます。
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" aria-hidden="true" />

      <Dialog open={isReportDialogOpen} onOpenChange={closeReportDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-600" />
              報告書の下書きを確認
            </DialogTitle>
            <DialogDescription>
              AIが面談記録から整理した下書きです。内容を編集して「登録する」を押すまで保存されません。
            </DialogDescription>
          </DialogHeader>

          {reportDraft && (
            <div className="max-h-[65vh] overflow-y-auto space-y-4 pr-1">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="report-category" className="text-sm font-medium">カテゴリ</label>
                  <Select value={reportDraft.category} onValueChange={(value) => updateDraft("category", value)}>
                    <SelectTrigger id="report-category" data-testid="select-report-category"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="報告">報告</SelectItem>
                      <SelectItem value="クレーム">クレーム</SelectItem>
                      <SelectItem value="設備">設備</SelectItem>
                      <SelectItem value="その他">その他</SelectItem>
                      <SelectItem value="法令解釈">法令解釈</SelectItem>
                      <SelectItem value="運用判断">運用判断</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="report-priority" className="text-sm font-medium">優先度</label>
                  <Select value={reportDraft.priority} onValueChange={(value) => updateDraft("priority", value)}>
                    <SelectTrigger id="report-priority" data-testid="select-report-priority"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">高</SelectItem>
                      <SelectItem value="medium">中</SelectItem>
                      <SelectItem value="low">低</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="report-title" className="text-sm font-medium">件名</label>
                <Input id="report-title" value={reportDraft.title} onChange={(event) => updateDraft("title", event.target.value)} data-testid="input-report-title" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {([
                  ["facts", "住民の申告・管理会社の確認事項"],
                  ["reportedCause", "申告された原因"],
                  ["unknowns", "不明点"],
                  ["request", "住民の希望する対応"],
                  ["action", "管理会社の対応済み事項・対応予定"],
                ] as Array<[keyof ReportDraft, string]>).map(([field, label]) => (
                  <div className="space-y-2" key={field}>
                    <label htmlFor={`report-${field}`} className="text-sm font-medium">{label}</label>
                    <Textarea
                      id={`report-${field}`}
                      value={String(reportDraft[field])}
                      onChange={(event) => updateDraft(field, event.target.value)}
                      className="min-h-24"
                      data-testid={`textarea-report-${field}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => closeReportDialog(false)} disabled={isRegisteringReport}>
              登録しない
            </Button>
            <Button type="button" onClick={registerReport} disabled={isRegisteringReport || !reportDraft} className="bg-orange-600 hover:bg-orange-700" data-testid="button-confirm-report">
              {isRegisteringReport && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              登録する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}