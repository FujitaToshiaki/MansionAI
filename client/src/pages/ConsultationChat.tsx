import { useState, useRef, useEffect } from "react";
import { useSearch } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
import { MessageSquare, Send, User, Bot, HelpCircle, History, Mic, Square, Loader2, AlertTriangle } from "lucide-react";
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

const FAQ_ITEMS = [
  "理事会の議事録作成のコツを教えてください",
  "修繕積立金の改定に必要な手続きは何ですか？",
  "区分所有法における「重大な変更」の定義を教えてください",
];

export default function ConsultationChat() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const condominiumId = params.get("condominiumId") ?? "";
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content: "こんにちは。管理業務に関するご相談を承ります。どのようなことでお困りでしょうか？",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isStartingRecording, setIsStartingRecording] = useState(false);
  const [isStoppingRecording, setIsStoppingRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [partialTranscript, setPartialTranscript] = useState("");
  const [isComplaintDialogOpen, setIsComplaintDialogOpen] = useState(false);
  const [complaintTitle, setComplaintTitle] = useState("");
  const [complaintContent, setComplaintContent] = useState("");
  const [complaintPriority, setComplaintPriority] = useState("medium");
  const [isRegisteringComplaint, setIsRegisteringComplaint] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);
  const transcriptSegmentsRef = useRef<string[]>([]);
  const partialTranscriptRef = useRef("");
  const transcriptOrderRef = useRef<string[]>([]);
  const transcriptByItemRef = useRef<Map<string, string>>(new Map());
  const partialByItemRef = useRef<Map<string, string>>(new Map());
  const lastTranscriptEventAtRef = useRef(0);
  const recordingActiveRef = useRef(false);
  const intentionalCloseRef = useRef(false);
  const { toast } = useToast();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    return () => {
      microphoneStreamRef.current?.getTracks().forEach((track) => track.stop());
      dataChannelRef.current?.close();
      peerConnectionRef.current?.close();
    };
  }, []);

  const closeRealtimeConnection = () => {
    recordingActiveRef.current = false;
    microphoneStreamRef.current?.getTracks().forEach((track) => track.stop());
    microphoneStreamRef.current = null;
    dataChannelRef.current?.close();
    dataChannelRef.current = null;
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
  };

  const rebuildTranscript = () => {
    const completed = transcriptOrderRef.current
      .map((itemId) => transcriptByItemRef.current.get(itemId))
      .filter((text): text is string => Boolean(text));
    const partial = transcriptOrderRef.current
      .map((itemId) => partialByItemRef.current.get(itemId))
      .filter((text): text is string => Boolean(text))
      .join("");

    transcriptSegmentsRef.current = completed;
    partialTranscriptRef.current = partial;
    setVoiceTranscript(completed.join("\n"));
    setPartialTranscript(partial);
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

  const prepareComplaintConfirmation = () => {
    const completedTranscript = transcriptSegmentsRef.current.join("\n").trim();
    const transcript = completedTranscript || partialTranscriptRef.current.trim() || voiceTranscript.trim();
    if (!transcript) {
      toast({
        title: "音声を認識できませんでした",
        description: "マイクに向かって内容を話してから、もう一度お試しください。",
        variant: "destructive",
      });
      return;
    }

    setComplaintContent(transcript);
    setComplaintTitle(transcript.length > 32 ? `${transcript.slice(0, 32)}…` : transcript);
    setComplaintPriority("medium");
    setIsComplaintDialogOpen(true);
  };

  const handleRealtimeEvent = (event: MessageEvent<string>) => {
    try {
      const payload = JSON.parse(event.data);

      if (payload.type === "input_audio_buffer.committed") {
        rememberTranscriptItem(String(payload.item_id ?? ""), payload.previous_item_id);
      }

      if (payload.type === "conversation.item.input_audio_transcription.delta") {
        const itemId = String(payload.item_id ?? "");
        rememberTranscriptItem(itemId);
        partialByItemRef.current.set(
          itemId,
          (partialByItemRef.current.get(itemId) ?? "") + (payload.delta ?? ""),
        );
        lastTranscriptEventAtRef.current = Date.now();
        rebuildTranscript();
      }

      if (payload.type === "conversation.item.input_audio_transcription.completed") {
        const itemId = String(payload.item_id ?? "");
        rememberTranscriptItem(itemId);
        const transcript = String(payload.transcript ?? "").trim();
        if (transcript) {
          transcriptByItemRef.current.set(itemId, transcript);
        }
        partialByItemRef.current.delete(itemId);
        lastTranscriptEventAtRef.current = Date.now();
        rebuildTranscript();
      }

      if (payload.type === "error") {
        console.error("Realtime API event error:", payload);
        toast({
          title: "音声入力エラー",
          description: payload.error?.message ?? "音声の処理中にエラーが発生しました。",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to parse Realtime API event:", error);
    }
  };

  const handleUnexpectedRealtimeClose = () => {
    if (intentionalCloseRef.current || !recordingActiveRef.current) return;
    closeRealtimeConnection();
    setIsRecording(false);
    setIsStartingRecording(false);
    setIsStoppingRecording(false);
    toast({
      title: "音声接続が切断されました",
      description: "入力内容は登録されていません。ネットワークを確認してもう一度お試しください。",
      variant: "destructive",
    });
  };

  const startVoiceComplaint = async () => {
    if (!condominiumId) {
      toast({
        title: "物件を選択してください",
        description: "物件詳細からチャット相談を開いてください。",
        variant: "destructive",
      });
      return;
    }

    setIsStartingRecording(true);
    setVoiceTranscript("");
    setPartialTranscript("");
    transcriptSegmentsRef.current = [];
    partialTranscriptRef.current = "";
    transcriptOrderRef.current = [];
    transcriptByItemRef.current.clear();
    partialByItemRef.current.clear();
    lastTranscriptEventAtRef.current = 0;
    intentionalCloseRef.current = false;

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
      stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));

      const dataChannel = peerConnection.createDataChannel("oai-events");
      dataChannelRef.current = dataChannel;
      dataChannel.addEventListener("message", handleRealtimeEvent);
      dataChannel.addEventListener("error", handleUnexpectedRealtimeClose);
      dataChannel.addEventListener("close", handleUnexpectedRealtimeClose);

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      const response = await fetch("/api/realtime/transcription-session", {
        method: "POST",
        headers: { "Content-Type": "application/sdp" },
        body: offer.sdp,
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "音声入力セッションを開始できませんでした");
      }

      const answerSdp = await response.text();
      await peerConnection.setRemoteDescription({ type: "answer", sdp: answerSdp });
      recordingActiveRef.current = true;
      setIsRecording(true);
    } catch (error) {
      closeRealtimeConnection();
      const message = error instanceof DOMException && error.name === "NotAllowedError"
        ? "マイクの使用が許可されていません。ブラウザの設定をご確認ください。"
        : error instanceof Error ? error.message : "音声入力を開始できませんでした。";
      toast({ title: "音声入力を開始できません", description: message, variant: "destructive" });
    } finally {
      setIsStartingRecording(false);
    }
  };

  const stopVoiceComplaint = async () => {
    setIsStoppingRecording(true);
    setIsRecording(false);
    intentionalCloseRef.current = true;
    microphoneStreamRef.current?.getTracks().forEach((track) => track.stop());

    if (dataChannelRef.current?.readyState === "open") {
      dataChannelRef.current.send(JSON.stringify({ type: "input_audio_buffer.commit" }));
    }

    const drainStartedAt = Date.now();
    await new Promise<void>((resolve) => {
      const timer = window.setInterval(() => {
        const elapsed = Date.now() - drainStartedAt;
        const quietFor = Date.now() - lastTranscriptEventAtRef.current;
        const hasTranscript = transcriptByItemRef.current.size > 0 || partialByItemRef.current.size > 0;
        if ((hasTranscript && quietFor >= 900) || elapsed >= 5000) {
          window.clearInterval(timer);
          resolve();
        }
      }, 100);
    });
    closeRealtimeConnection();
    setIsStoppingRecording(false);
    prepareComplaintConfirmation();
  };

  const registerComplaint = async () => {
    if (!complaintTitle.trim() || !complaintContent.trim()) {
      toast({ title: "入力内容を確認してください", description: "件名とクレーム内容は必須です。", variant: "destructive" });
      return;
    }

    setIsRegisteringComplaint(true);
    try {
      const response = await fetch(`/api/condominiums/${condominiumId}/consultation-logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "クレーム",
          title: complaintTitle.trim(),
          content: complaintContent.trim(),
          status: "open",
          priority: complaintPriority,
        }),
      });

      if (!response.ok) {
        throw new Error("クレームの登録に失敗しました");
      }
      await queryClient.invalidateQueries({
        queryKey: [`/api/condominiums/${condominiumId}/consultation-logs`],
      });

      const timestamp = new Date();
      setMessages((current) => [
        ...current,
        {
          id: `voice-${Date.now()}`,
          role: "user",
          content: complaintContent.trim(),
          timestamp,
        },
        {
          id: `registered-${Date.now()}`,
          role: "ai",
          content: "内容をクレームとして登録しました。相談履歴から確認できます。",
          timestamp,
        },
      ]);
      setIsComplaintDialogOpen(false);
      setVoiceTranscript("");
      setPartialTranscript("");
      transcriptSegmentsRef.current = [];
      partialTranscriptRef.current = "";
      transcriptOrderRef.current = [];
      transcriptByItemRef.current.clear();
      partialByItemRef.current.clear();
      toast({ title: "クレームを登録しました", description: "相談履歴に未対応のクレームとして保存しました。" });
    } catch (error) {
      toast({
        title: "登録できませんでした",
        description: error instanceof Error ? error.message : "時間をおいて再度お試しください。",
        variant: "destructive",
      });
    } finally {
      setIsRegisteringComplaint(false);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Mock AI response after 2 seconds
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: `${input}についてのご質問ですね。一般的な見解としては、管理規約の定めに従いつつ、理事会での決議が必要となります。詳細な状況に合わせて、区分所有法や標準管理規約の最新版に照らしたアドバイスも可能です。`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 2000);
  };

  const handleFaqClick = (faq: string) => {
    setInput(faq);
  };

  return (
    <div className="flex flex-col h-full gap-4 overflow-hidden">
      {/* Header row */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <nav className="text-sm text-gray-500 mb-1">
            <Link href={`/condominiums/${condominiumId}`} className="hover:text-gray-700">マンション詳細</Link>
            <span className="mx-2">{'>'}</span>
            <span className="text-gray-400">AIチャット</span>
            <span className="mx-2">{'>'}</span>
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
        {/* Main Chat Area */}
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
                  onClick={isRecording ? stopVoiceComplaint : startVoiceComplaint}
                  disabled={isStartingRecording || isStoppingRecording}
                  className={!isRecording ? "border-orange-200 text-orange-700 hover:bg-orange-50" : ""}
                  data-testid="button-voice-complaint"
                >
                  {isStartingRecording || isStoppingRecording ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : isRecording ? (
                    <Square className="mr-2 h-3.5 w-3.5 fill-current" />
                  ) : (
                    <Mic className="mr-2 h-4 w-4" />
                  )}
                  {isStartingRecording ? "接続中..." : isStoppingRecording ? "整理中..." : isRecording ? "録音を終了" : "音声でクレーム入力"}
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
              {(isRecording || isStoppingRecording || voiceTranscript || partialTranscript) && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-800">
                    <span className={`h-2.5 w-2.5 rounded-full bg-red-500 ${isRecording ? "animate-pulse" : ""}`} />
                    {isRecording ? "クレーム内容を聞き取り中" : isStoppingRecording ? "文字起こしを確定中" : "音声入力内容"}
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                    {voiceTranscript}
                    {partialTranscript && (
                      <span className="text-gray-500">{voiceTranscript ? "\n" : ""}{partialTranscript}</span>
                    )}
                    {!voiceTranscript && !partialTranscript && "発生した状況をマイクに向かってお話しください。"}
                  </p>
                </div>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex max-w-[80%] items-end gap-2 ${
                      msg.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div className={`rounded-full flex items-center justify-center h-8 w-8 flex-shrink-0 ${
                      msg.role === "user" ? "bg-gray-200" : "bg-orange-100"
                    }`}>
                      {msg.role === "user" ? (
                        <User className="h-4 w-4 text-gray-600" />
                      ) : (
                        <Bot className="h-4 w-4 text-orange-600" />
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <div
                        className={`rounded-2xl px-4 py-2 text-sm shadow-sm ${
                          msg.role === "user"
                            ? "bg-orange-500 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        {msg.content}
                      </div>
                      <div className={`text-[10px] text-gray-400 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                    <div className="bg-gray-100 rounded-2xl px-4 py-2 text-sm shadow-sm animate-pulse text-gray-900">
                      入力中...
                    </div>
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
                data-testid="input-chat-message"
              />
              <Button onClick={handleSend} className="bg-orange-500 hover:bg-orange-600" data-testid="button-send-message">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Sidebar / FAQs */}
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

      <Dialog open={isComplaintDialogOpen} onOpenChange={setIsComplaintDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              クレームとして登録しますか？
            </DialogTitle>
            <DialogDescription>
              音声から文字起こしした内容を確認・修正してください。「登録する」を押すまで保存されません。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="complaint-title" className="text-sm font-medium">件名</label>
              <Input
                id="complaint-title"
                value={complaintTitle}
                onChange={(event) => setComplaintTitle(event.target.value)}
                data-testid="input-complaint-title"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="complaint-content" className="text-sm font-medium">クレーム内容</label>
              <Textarea
                id="complaint-content"
                value={complaintContent}
                onChange={(event) => setComplaintContent(event.target.value)}
                className="min-h-40"
                data-testid="textarea-complaint-content"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">優先度</label>
              <Select value={complaintPriority} onValueChange={setComplaintPriority}>
                <SelectTrigger data-testid="select-complaint-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">高</SelectItem>
                  <SelectItem value="medium">中</SelectItem>
                  <SelectItem value="low">低</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsComplaintDialogOpen(false)}
              disabled={isRegisteringComplaint}
            >
              登録しない
            </Button>
            <Button
              type="button"
              onClick={registerComplaint}
              disabled={isRegisteringComplaint}
              className="bg-orange-600 hover:bg-orange-700"
              data-testid="button-confirm-complaint"
            >
              {isRegisteringComplaint && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              登録する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
