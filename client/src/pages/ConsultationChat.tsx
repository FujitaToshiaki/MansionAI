import { useState, useRef, useEffect } from "react";
import { useSearch } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, User, Bot, HelpCircle, History } from "lucide-react";
import { SubNav } from "@/components/SubNav";
import { Link } from "wouter";

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
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

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
              <Tabs defaultValue="all" className="w-auto">
                <TabsList className="h-8">
                  <TabsTrigger value="all" className="text-xs">すべて</TabsTrigger>
                  <TabsTrigger value="complaint" className="text-xs">クレーム</TabsTrigger>
                  <TabsTrigger value="law" className="text-xs">法令解釈</TabsTrigger>
                  <TabsTrigger value="operation" className="text-xs">運用判断</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
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
    </div>
  );
}
