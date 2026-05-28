import React, { useState, useEffect, useRef } from "react";
import { useGetChatHistory, useSendChatMessage, useClearChatHistory } from "@/lib/api-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, Trash2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Chatbot() {
  const [sessionId] = useState(() =>
    localStorage.getItem("phishguard_chat_session") || crypto.randomUUID()
  );

  useEffect(() => {
    localStorage.setItem("phishguard_chat_session", sessionId);
  }, [sessionId]);

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: historyData, refetch: refetchHistory } = useGetChatHistory(sessionId, {
    query: { queryKey: ["/api/chatbot/history", sessionId] },
  });

  const sendMutation = useSendChatMessage();
  const clearMutation = useClearChatHistory();

  const [messages, setMessages] = useState<Array<{ role: string; content: string; created_at: string }>>([]);

  useEffect(() => {
    if (historyData) setMessages(historyData);
  }, [historyData]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sendMutation.isPending]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sendMutation.isPending) return;
    const userMsg = input.trim();
    setInput("");
    const newMsg = { role: "user", content: userMsg, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, newMsg]);
    sendMutation.mutate(
      { data: { session_id: sessionId, message: userMsg } },
      {
        onSuccess: (data) => {
          setMessages((prev) => [
            ...prev.filter((m) => m !== newMsg),
            { role: "user", content: userMsg, created_at: new Date().toISOString() },
            data,
          ]);
        },
        onError: () => setMessages((prev) => prev.filter((m) => m !== newMsg)),
      }
    );
  };

  const handleClear = () => {
    clearMutation.mutate({ sessionId }, {
      onSuccess: () => { setMessages([]); refetchHistory(); },
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-5xl mx-auto w-full border border-border rounded-xl overflow-hidden bg-card/50 backdrop-blur-xl shadow-2xl relative">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-destructive/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="flex items-center justify-between p-4 border-b border-border/50 bg-card/80 backdrop-blur z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-bold">SOC Analyst Assistant</h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Online & Ready
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleClear} disabled={messages.length === 0}>
          <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive transition-colors" />
        </Button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 z-10 scroll-smooth">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
            <Sparkles className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-medium mb-2">How can I assist your investigation?</h3>
            <p className="text-muted-foreground max-w-md">
              Ask me to analyze specific IOCs, explain phishing techniques, or summarize recent scan data.
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center mt-1 border ${
                  msg.role === "user" ? "bg-secondary border-border" : "bg-primary/20 border-primary/30 text-primary"
                }`}>
                  {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-secondary text-secondary-foreground rounded-tr-none"
                    : "bg-muted/50 border border-border/50 text-foreground rounded-tl-none font-mono text-[13px]"
                }`}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {sendMutation.isPending && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 max-w-[85%] mr-auto">
            <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center mt-1 bg-primary/20 border border-primary/30 text-primary">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-none bg-muted/50 border border-border/50 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </motion.div>
        )}
      </div>

      <div className="p-4 bg-card/80 backdrop-blur border-t border-border/50 z-10">
        <form onSubmit={handleSend} className="relative flex items-center gap-2">
          <Input
            data-testid="input-chat"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Query intelligence database or analyze an IOC..."
            className="h-14 bg-background border-border/50 pr-14 font-mono text-sm focus-visible:ring-primary/50"
            disabled={sendMutation.isPending}
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-2 h-10 w-10 bg-primary/20 hover:bg-primary/40 text-primary border border-primary/20"
            disabled={!input.trim() || sendMutation.isPending}
            data-testid="button-chat-send"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
