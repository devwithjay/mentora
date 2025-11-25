"use client";

import React, {useCallback, useEffect, useRef, useState} from "react";

import {
  Check,
  Loader2,
  Menu,
  MoreVertical,
  Pencil,
  Plus,
  SendHorizontal,
  Trash2,
  X,
} from "lucide-react";
import {useSession} from "next-auth/react";
import ReactMarkdown from "react-markdown";

import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {UpgradeDialog} from "@/components/upgrade-dialog";

type Conversation = {
  id: string;
  title: string | null;
  createdAt: string;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

const ChatPage = () => {
  const {data: session, status} = useSession();

  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string>("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isAuthenticated = status === "authenticated";
  const userId = session?.user?.id as string | undefined;
  const plan = session?.user?.plan ?? "Free";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    fetchConversations();
  }, []);

  const loadMessages = useCallback(async (convId: string) => {
    if (!convId) return;
    try {
      setIsLoadingMessages(true);
      const response = await fetch(`/api/conversations/${convId}/messages`);
      if (response.ok) {
        const data: Message[] = await response.json();
        setMessages(data);
      }
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (conversationId) loadMessages(conversationId);
  }, [conversationId, loadMessages]);

  const fetchConversations = async () => {
    try {
      setIsLoadingConversations(true);
      const response = await fetch("/api/conversations");
      if (response.ok) {
        const data: Conversation[] = await response.json();
        setConversations(data);
        if (data.length > 0) setConversationId(data[0].id);
      }
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const createNewConversation = async () => {
    const response = await fetch("/api/conversations", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({title: "New Chat"}),
    });

    if (response.ok) {
      const newConversation: Conversation = await response.json();
      setConversations(prev => [newConversation, ...prev]);
      setConversationId(newConversation.id);
      setMessages([]);
      setIsSidebarOpen(false);
    }
  };

  const deleteConversation = async (id: string) => {
    const response = await fetch(`/api/conversations/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      const updated = conversations.filter(c => c.id !== id);
      setConversations(updated);

      if (conversationId === id) {
        if (updated.length > 0) setConversationId(updated[0].id);
        else {
          setConversationId("");
          setMessages([]);
        }
      }
    }
  };

  const startEditTitle = (conversation: Conversation) => {
    setEditingId(conversation.id);
    setEditTitle(conversation.title || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const saveTitle = async (id: string) => {
    const response = await fetch(`/api/conversations/${id}`, {
      method: "PATCH",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({title: editTitle}),
    });

    if (response.ok) {
      const updated: Conversation = await response.json();
      setConversations(prev => prev.map(c => (c.id === id ? updated : c)));
      setEditingId(null);
      setEditTitle("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming || !conversationId) return;
    if (!isAuthenticated || !userId) return;

    const userMessage = input.trim();
    setInput("");
    setIsStreaming(true);

    const optimisticMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: userMessage,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          messages: [{role: "user", content: userMessage}],
          conversationId,
          userId,
          plan,
        }),
      });

      if (response.status === 429) {
        setIsUpgradeOpen(true);
        setIsStreaming(false);
        return;
      }

      if (!response.ok || !response.body) throw new Error();

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      while (true) {
        const {done, value} = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        assistantContent += chunk;

        setMessages(prev =>
          prev.map(m =>
            m.id === assistantMessage.id ? {...m, content: assistantContent} : m
          )
        );
      }

      await loadMessages(conversationId);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="bg-primary border-primary text-primary flex h-screen border-t">
        <aside
          className={`border-primary bg-secondary fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r shadow-sm transition-transform duration-200 ease-out md:static md:translate-x-0 ${
            isSidebarOpen
              ? "translate-x-0 text-white"
              : "-translate-x-full md:translate-x-0"
          }`}
        >
          <div className="border-primary flex items-center justify-between border-b p-3 pt-16 md:hidden">
            <h2 className="text-sm font-semibold">Chats</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="border-primary hidden border-b p-3 pt-6 md:block">
            <Button
              onClick={createNewConversation}
              className="bg-brand hover:bg-brand-hover flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-white shadow-md"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoadingConversations ? (
              <div className="text-secondary flex items-center justify-center p-8 text-sm">
                <Loader2 className="text-brand mr-2 h-5 w-5 animate-spin" />
                Loading chats…
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-secondary p-6 text-center text-sm">
                <p className="mb-2">No conversations yet</p>
                <p className="text-xs opacity-70">
                  Tap &quot;New Chat&quot; to start.
                </p>
              </div>
            ) : (
              <nav className="space-y-1 p-2">
                {conversations.map(conv => (
                  <div
                    key={conv.id}
                    className={`group relative rounded-lg transition-all ${
                      conversationId === conv.id
                        ? "border-primary bg-brand-secondary/60 border"
                        : "hover:bg-brand-secondary/40"
                    }`}
                  >
                    {editingId === conv.id ? (
                      <div className="flex items-center gap-1 p-2">
                        <Input
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          className="h-8 flex-1 text-sm"
                          autoFocus
                          onKeyDown={e => {
                            if (e.key === "Enter") saveTitle(conv.id);
                            if (e.key === "Escape") cancelEdit();
                          }}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => saveTitle(conv.id)}
                        >
                          <Check className="text-brand h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={cancelEdit}
                        >
                          <X className="text-secondary h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <button
                          onClick={() => {
                            setConversationId(conv.id);
                            setIsSidebarOpen(false);
                          }}
                          className="flex-1 truncate px-3 py-2.5 text-left text-sm"
                        >
                          {conv.title || "Untitled Chat"}
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                            >
                              <MoreVertical className="text-secondary h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                              onClick={() => startEditTitle(conv)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deleteConversation(conv.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            )}
          </div>
        </aside>

        <div className="flex flex-1 flex-col md:ml-0">
          <header className="border-primary bg-primary flex items-center justify-between border-b px-4 py-3 backdrop-blur-sm md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="text-primary h-5 w-5" />
            </Button>
            <div className="flex flex-1 flex-col items-center">
              <span className="text-brand text-sm font-semibold">
                Mentora Chat
              </span>
              <span className="text-secondary text-xs">
                Guided by Bhagavad-gītā As It Is
              </span>
            </div>
            <div className="w-9" />
          </header>

          <header className="border-primary bg-primary hidden border-b px-6 py-4 backdrop-blur-sm sm:px-10 md:block lg:px-20">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-primary text-2xl font-bold sm:text-3xl">
                  Mentora Chat
                </h1>
                <p className="text-secondary mt-1 text-sm sm:text-base">
                  Ask from the heart. Mentora answers using{" "}
                  <span className="text-brand font-medium">
                    Bhagavad-gītā As It Is
                  </span>
                </p>
              </div>
              <Badge
                variant="outline"
                className="border-primary bg-brand-secondary text-brand w-fit"
              >
                Guided by Gītā
              </Badge>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-10 sm:py-6 lg:px-20">
            <div className="mx-auto flex h-full max-w-4xl flex-col">
              {isLoadingMessages ? (
                <div className="text-secondary flex flex-1 flex-col items-center justify-center text-center">
                  <Loader2 className="text-brand h-8 w-8 animate-spin" />
                  <p className="mt-3 text-sm">Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
                  <div className="bg-brand-secondary/60 max-w-md rounded-2xl p-6 sm:p-8">
                    <p className="text-secondary text-sm leading-relaxed sm:text-base">
                      Share what you&apos;re going through — stress, confusion,
                      overthinking, or questions about purpose. Mentora will
                      reply with gentle, Gītā-based reflections.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pt-2 pb-4 sm:space-y-6">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm sm:px-5 sm:py-3.5 sm:text-base ${
                          message.role === "user"
                            ? "bg-brand text-white"
                            : "border-primary bg-primary text-primary border"
                        }`}
                      >
                        {message.role === "assistant" ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown
                              components={{
                                p: ({node, ...props}) => (
                                  <p className="mb-2" {...props} />
                                ),
                                strong: ({node, ...props}) => (
                                  <strong className="font-bold" {...props} />
                                ),
                                em: ({node, ...props}) => (
                                  <em className="italic" {...props} />
                                ),
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <div className="wrap-break-word whitespace-pre-wrap">
                            {message.content}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>

          <div className="border-primary bg-primary border-t px-4 py-3 backdrop-blur-sm sm:px-10 sm:py-4 lg:px-20">
            <form onSubmit={handleSubmit} className="mx-auto max-w-4xl">
              <div className="border-primary bg-primary flex flex-col gap-3 rounded-2xl border p-3 shadow-lg sm:flex-row sm:items-end sm:p-4">
                <Textarea
                  rows={2}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder="Type your question or share what you feel..."
                  className="text-primary flex-1 resize-none border-0 bg-transparent text-sm focus-visible:ring-0 focus-visible:ring-offset-0 sm:text-base"
                  disabled={!isAuthenticated || isStreaming}
                />

                <Button
                  type="submit"
                  disabled={
                    isStreaming ||
                    !input.trim() ||
                    !conversationId ||
                    !isAuthenticated
                  }
                  className="bg-brand hover:bg-brand-hover mt-1 flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-md disabled:opacity-50 sm:mt-0 sm:px-6 sm:py-3"
                >
                  {isStreaming ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Thinking…
                    </>
                  ) : (
                    <>
                      Send
                      <SendHorizontal className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>

              <p className="text-secondary mt-2 text-center text-[10px] leading-snug sm:mt-3 sm:text-xs">
                Mentora is not a doctor or therapist. If you feel unsafe or in
                crisis, please contact local emergency services or a trusted
                person immediately.
              </p>
            </form>
          </div>
        </div>
      </div>

      <UpgradeDialog
        open={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
      />
    </>
  );
};

export default ChatPage;
