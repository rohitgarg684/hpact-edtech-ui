import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Send, 
  Plus, 
  MessageSquare, 
  User, 
  Bot, 
  Trash2,
  Edit2,
  Check,
  X,
  LogOut,
  Save
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { User as UserType, ChatSession, ChatMessage } from "@shared/schema";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function Chat() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check authentication
  useEffect(() => {
    const storedSessionId = localStorage.getItem("session_id");
    const storedUser = localStorage.getItem("user");
    
    if (!storedSessionId || !storedUser) {
      setLocation("/login");
      return;
    }
    
    setSessionId(storedSessionId);
    setCurrentUser(JSON.parse(storedUser));
  }, [setLocation]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send chat message
  const chatMutation = useMutation({
    mutationFn: async ({ prompt, session_id }: { prompt: string; session_id?: string }) => {
      const response = await apiRequest("POST", "chat", { prompt, session_id }, {
        Authorization: `Bearer ${sessionId}`,
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Add user message
      const userMessage: Message = {
        id: Date.now().toString() + "-user",
        role: "user",
        content: variables.prompt,
        timestamp: new Date(),
      };
      
      // Add AI response
      const aiMessage: Message = {
        id: Date.now().toString() + "-ai",
        role: "assistant", 
        content: data.response,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, userMessage, aiMessage]);
      setInputMessage("");
    },
    onError: (error: any) => {
      toast({
        title: "Chat Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Save chat session
  const saveChatMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "saveChat", undefined, {
        Authorization: `Bearer ${sessionId}`,
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Chat Saved",
        description: data.message || "Chat session saved successfully",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Save Error", 
        description: error.message || "Failed to save chat",
        variant: "destructive",
      });
    },
  });

  // Create new chat session
  const handleNewChat = () => {
    const newSessionId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newSessionId,
      user_id: currentUser?.id || "",
      title: `New Chat ${sessions.length + 1}`,
      created_at: new Date(),
      updated_at: new Date(),
    };
    
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSessionId);
    setMessages([]);
  };

  // Send message
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    if (!currentSessionId) {
      handleNewChat();
    }
    
    chatMutation.mutate({
      prompt: inputMessage,
      session_id: currentSessionId || undefined,
    });
  };

  // Handle key press in input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Switch to different session
  const handleSessionClick = (session: ChatSession) => {
    setCurrentSessionId(session.id);
    // In a real app, you'd load messages for this session
    setMessages([]);
  };

  // Delete session
  const handleDeleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
      setMessages([]);
    }
  };

  // Start editing session title
  const handleEditSession = (session: ChatSession) => {
    setEditingSessionId(session.id);
    setEditingTitle(session.title);
  };

  // Save edited title
  const handleSaveTitle = () => {
    setSessions(prev => prev.map(s => 
      s.id === editingSessionId 
        ? { ...s, title: editingTitle, updated_at: new Date() }
        : s
    ));
    setEditingSessionId(null);
    setEditingTitle("");
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingSessionId(null);
    setEditingTitle("");
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("session_id");
    localStorage.removeItem("user");
    setLocation("/login");
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">Chat Sessions</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut size={16} />
            </Button>
          </div>
          <Button
            onClick={handleNewChat}
            className="w-full"
            data-testid="button-new-chat"
          >
            <Plus size={16} className="mr-2" />
            New Chat
          </Button>
        </div>

        {/* Sessions List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {sessions.map((session) => (
              <Card
                key={session.id}
                className={`cursor-pointer transition-colors hover:bg-accent ${
                  currentSessionId === session.id ? "bg-accent border-primary" : ""
                }`}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div 
                      className="flex-1 min-w-0"
                      onClick={() => handleSessionClick(session)}
                      data-testid={`session-${session.id}`}
                    >
                      {editingSessionId === session.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            className="h-6 text-sm"
                            data-testid="input-edit-title"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleSaveTitle}
                            data-testid="button-save-title"
                          >
                            <Check size={12} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCancelEdit}
                            data-testid="button-cancel-edit"
                          >
                            <X size={12} />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <MessageSquare size={16} />
                            <span className="font-medium text-sm truncate" data-testid={`text-session-title-${session.id}`}>
                              {session.title}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {session.created_at ? new Date(session.created_at).toLocaleDateString() : 'Today'}
                          </p>
                        </>
                      )}
                    </div>
                    
                    {editingSessionId !== session.id && (
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditSession(session);
                          }}
                          data-testid={`button-edit-${session.id}`}
                        >
                          <Edit2 size={12} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSession(session.id);
                          }}
                          data-testid={`button-delete-${session.id}`}
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        {/* User Info */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>
                {currentUser.first_name[0]}{currentUser.last_name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" data-testid="text-current-user">
                {currentUser.first_name} {currentUser.last_name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {currentUser.username}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentSessionId ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold" data-testid="text-chat-title">
                {sessions.find(s => s.id === currentSessionId)?.title || "Chat"}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => saveChatMutation.mutate()}
                disabled={saveChatMutation.isPending || messages.length === 0}
                data-testid="button-save-chat"
              >
                <Save size={16} className="mr-2" />
                {saveChatMutation.isPending ? "Saving..." : "Save Chat"}
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4 max-w-4xl mx-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${
                      message.role === "user" ? "flex-row-reverse" : ""
                    }`}
                    data-testid={`message-${message.role}-${message.id}`}
                  >
                    <Avatar className="shrink-0">
                      <AvatarFallback>
                        {message.role === "user" ? <User size={16} /> : <Bot size={16} />}
                      </AvatarFallback>
                    </Avatar>
                    <Card
                      className={`max-w-[70%] ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <CardContent className="p-3">
                        <p className="text-sm whitespace-pre-wrap" data-testid={`text-message-content-${message.id}`}>
                          {message.content}
                        </p>
                        <p className="text-xs opacity-70 mt-2">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
                
                {chatMutation.isPending && (
                  <div className="flex items-start gap-3">
                    <Avatar className="shrink-0">
                      <AvatarFallback>
                        <Bot size={16} />
                      </AvatarFallback>
                    </Avatar>
                    <Card className="bg-muted">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t border-border">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-end gap-3">
                  <Textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 min-h-[60px] max-h-[200px] resize-none"
                    data-testid="textarea-message"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || chatMutation.isPending}
                    size="lg"
                    data-testid="button-send"
                  >
                    <Send size={16} />
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare size={64} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Start a New Conversation</h3>
              <p className="text-muted-foreground mb-4">
                Create a new chat session to get started
              </p>
              <Button onClick={handleNewChat} data-testid="button-start-chat">
                <Plus size={16} className="mr-2" />
                New Chat
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}