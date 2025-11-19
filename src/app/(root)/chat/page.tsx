"use client";

import type React from "react";
import {useCallback, useEffect, useRef, useState} from "react";

import {
  Check,
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  SendHorizontal,
  Trash2,
  X,
} from "lucide-react";

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
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string>("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchConversations();
  }, []);

  const loadMessages = useCallback(async (convId: string) => {
    if (!convId) return;

    try {
      setIsLoadingMessages(true);
      const response = await fetch(`/api/conversations/${convId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId);
    }
  }, [conversationId, loadMessages]);

  const fetchConversations = async () => {
    try {
      setIsLoadingConversations(true);
      const response = await fetch("/api/conversations");
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
        if (data.length > 0) {
          setConversationId(data[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const createNewConversation = async () => {
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({title: "New Chat"}),
      });

      if (response.ok) {
        const newConversation = await response.json();
        setConversations([newConversation, ...conversations]);
        setConversationId(newConversation.id);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const updatedConversations = conversations.filter(c => c.id !== id);
        setConversations(updatedConversations);

        if (conversationId === id) {
          if (updatedConversations.length > 0) {
            setConversationId(updatedConversations[0].id);
          } else {
            setConversationId("");
            setMessages([]);
          }
        }
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
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
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({title: editTitle}),
      });

      if (response.ok) {
        const updated = await response.json();
        setConversations(conversations.map(c => (c.id === id ? updated : c)));
        setEditingId(null);
        setEditTitle("");
      }
    } catch (error) {
      console.error("Error updating conversation:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isStreaming && conversationId) {
      const userMessage = input.trim();
      setInput("");
      setIsStreaming(true);

      const newUserMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: userMessage,
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, newUserMessage]);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            messages: [{role: "user", content: userMessage}],
            conversationId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to send message");
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let assistantContent = "";

        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "",
          createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, assistantMessage]);

        if (reader) {
          while (true) {
            const {done, value} = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            assistantContent += chunk;

            setMessages(prev =>
              prev.map(msg =>
                msg.id === assistantMessage.id
                  ? {...msg, content: assistantContent}
                  : msg
              )
            );
          }
        }

        await loadMessages(conversationId);
      } catch (error) {
        console.error("Error sending message:", error);
      } finally {
        setIsStreaming(false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-background flex h-screen">
      <aside className="border-border bg-card/50 flex w-72 flex-col border-r shadow-sm">
        <div className="border-border border-b p-3">
          <Button
            onClick={createNewConversation}
            className="w-full gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md hover:from-teal-600 hover:to-cyan-600"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoadingConversations ? (
            <div className="text-muted-foreground flex items-center justify-center p-8">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-muted-foreground p-6 text-center text-sm">
              <p className="mb-2">No conversations yet</p>
              <p className="text-xs opacity-70">
                Click &quot;New Chat&quot; to start
              </p>
            </div>
          ) : (
            <nav className="space-y-1 p-2">
              {conversations.map(conv => (
                <div
                  key={conv.id}
                  className={`group relative rounded-lg transition-all ${
                    conversationId === conv.id
                      ? "border border-teal-500/30 bg-gradient-to-r from-teal-500/10 to-cyan-500/10"
                      : "hover:bg-muted/50"
                  }`}
                >
                  {editingId === conv.id ? (
                    <div className="flex items-center gap-1 p-2">
                      <Input
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        className="h-8 text-sm"
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
                        <Check className="h-4 w-4 text-green-500" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={cancelEdit}
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <button
                        onClick={() => setConversationId(conv.id)}
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
                            <MoreVertical className="h-4 w-4" />
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

      <div className="flex flex-1 flex-col">
        <header className="border-border bg-card/30 border-b px-6 py-4 backdrop-blur-sm sm:px-10 lg:px-20">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-primary bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text font-sans text-2xl font-bold text-transparent sm:text-3xl">
                Mentora Chat
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Ask from the heart. Mentora answers using{" "}
                <span className="font-medium text-teal-600">
                  Bhagavad-gītā As It Is
                </span>
              </p>
            </div>
            <Badge
              variant="outline"
              className="w-fit border-teal-500/50 bg-teal-50 text-teal-600 dark:bg-teal-950/30"
            >
              Guided by Gītā
            </Badge>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-10 lg:px-20">
          <div className="mx-auto max-w-4xl">
            {isLoadingMessages ? (
              <div className="text-muted-foreground flex h-full flex-col items-center justify-center text-center">
                <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
                <p className="mt-3 text-sm">Loading messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-muted-foreground flex h-full flex-col items-center justify-center py-20 text-center">
                <div className="max-w-md rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 p-8 dark:from-teal-950/20 dark:to-cyan-950/20">
                  <p className="text-base leading-relaxed">
                    Share what you&apos;re going through — stress, confusion,
                    overthinking, or questions about purpose. Mentora will reply
                    with gentle, Gītā-based reflections.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 pb-4">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm shadow-sm sm:text-base ${
                        message.role === "user"
                          ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white"
                          : "bg-card border-border border"
                      }`}
                    >
                      <div className="break-words whitespace-pre-wrap">
                        {message.content}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        <div className="border-border bg-card/30 border-t px-6 py-4 backdrop-blur-sm sm:px-10 lg:px-20">
          <form onSubmit={handleSubmit} className="mx-auto max-w-4xl">
            <div className="bg-card border-border flex flex-col gap-3 rounded-2xl border p-3 shadow-lg sm:flex-row sm:items-end sm:p-4">
              <Textarea
                rows={2}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type your question or share what you feel..."
                className="flex-1 resize-none border-0 bg-transparent text-sm focus-visible:ring-0 focus-visible:ring-offset-0 sm:text-base"
              />

              <Button
                type="submit"
                disabled={isStreaming || !input.trim() || !conversationId}
                className="mt-2 flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-md hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 sm:mt-0"
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

            <p className="text-muted-foreground mt-3 text-center text-xs leading-snug">
              Mentora is not a doctor or therapist. If you feel unsafe or in
              crisis, please contact local emergency services or a trusted
              person immediately.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
