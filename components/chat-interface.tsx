"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sidebar } from "@/components/sidebar"
import { ChatMessage } from "@/components/chat-message"
import { SuggestionCards } from "@/components/suggestion-cards"
import { useAuth } from "@/contexts/auth-context"
import { Send, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  reasoning?: string // Added reasoning field for enhanced explanations
  timestamp: Date
}

interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
}

export function ChatInterface() {
  const { user } = useAuth()
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const currentChat = chats.find((chat) => chat.id === currentChatId)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }

    handleResize()

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const savedChats = localStorage.getItem(`quantalex-chats-${user?.id}`)
    if (savedChats) {
      const parsedChats = JSON.parse(savedChats).map((chat: any) => ({
        ...chat,
        createdAt: new Date(chat.createdAt),
        messages: chat.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      }))
      setChats(parsedChats)
    }
  }, [user?.id])

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`quantalex-chats-${user.id}`, JSON.stringify(chats))
    }
  }, [chats, user?.id])

  useEffect(() => {
    if (currentChat) {
      setMessages(currentChat.messages)
    } else {
      setMessages([])
    }
  }, [currentChat])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
    }
    setChats((prev) => [newChat, ...prev])
    setCurrentChatId(newChat.id)
    setMessages([])
    if (window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }

  const selectChat = (chatId: string) => {
    setCurrentChatId(chatId)
    if (window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }

  const deleteChat = (chatId: string) => {
    setChats((prev) => prev.filter((chat) => chat.id !== chatId))
    if (currentChatId === chatId) {
      setCurrentChatId(null)
      setMessages([])
    }
  }

  const clearAllChats = () => {
    setChats([])
    setCurrentChatId(null)
    setMessages([])
  }

  const sendMessage = async (content?: string) => {
    const messageContent = content || input.trim()
    if (!messageContent || isLoading) return

    if (!user) {
      console.error("[v0] User not authenticated")
      return
    }

    let chatId = currentChatId
    if (!chatId) {
      const newChat: Chat = {
        id: Date.now().toString(),
        title: messageContent.slice(0, 50) + (messageContent.length > 50 ? "..." : ""),
        messages: [],
        createdAt: new Date(),
      }
      setChats((prev) => [newChat, ...prev])
      chatId = newChat.id
      setCurrentChatId(chatId)
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageContent,
      timestamp: new Date(),
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput("")
    setIsLoading(true)

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              messages: newMessages,
              title:
                chat.title === "New Chat"
                  ? messageContent.slice(0, 50) + (messageContent.length > 50 ? "..." : "")
                  : chat.title,
            }
          : chat,
      ),
    )

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
          "x-user-email": user.email,
        },
        body: JSON.stringify({
          messages: newMessages.map((msg) => ({ role: msg.role, content: msg.content })),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()

        if (response.status === 401) {
          throw new Error("Authentication failed. Please log in again.")
        }

        throw new Error(errorData.error || "Failed to get response")
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content,
        reasoning: data.reasoning, // Extract reasoning from API response
        timestamp: new Date(),
      }

      const finalMessages = [...newMessages, assistantMessage]
      setMessages(finalMessages)

      setChats((prev) => prev.map((chat) => (chat.id === chatId ? { ...chat, messages: finalMessages } : chat)))
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : "Unknown error"}. Please check that your OpenRouter API key is properly configured.`,
        timestamp: new Date(),
      }
      const finalMessages = [...newMessages, errorMessage]
      setMessages(finalMessages)

      setChats((prev) => prev.map((chat) => (chat.id === chatId ? { ...chat, messages: finalMessages } : chat)))
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar
        chats={chats}
        currentChatId={currentChatId}
        onNewChat={createNewChat}
        onSelectChat={selectChat}
        onDeleteChat={deleteChat}
        onClearAll={clearAllChats}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className={cn("flex-1 flex flex-col transition-all duration-300", sidebarOpen ? "ml-80" : "ml-0")}>
        {/* Messages Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="border-b border-gray-800 bg-black sticky top-0 z-10">
            <div className="flex items-center justify-between px-4 lg:px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-black" />
                </div>
                <h1 className="text-xl lg:text-2xl font-bold text-white">QuantaLex</h1>
              </div>
            </div>
          </header>

          <main className="flex-1 flex flex-col min-h-0">
            {messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
                <div className="max-w-2xl w-full text-center">
                  <div className="mb-8 lg:mb-12">
                    <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Sparkles className="w-8 h-8 lg:w-10 lg:h-10 text-black" />
                    </div>
                    <h2 className="text-2xl lg:text-4xl font-bold text-white mb-4">Welcome to QuantaLex</h2>
                    <p className="text-gray-300 text-base lg:text-lg leading-relaxed max-w-lg mx-auto">
                      Your intelligent AI assistant powered by advanced language models. Start a conversation below.
                    </p>
                  </div>
                  <SuggestionCards onSuggestionClick={sendMessage} />
                </div>
              </div>
            ) : (
              <ScrollArea className="flex-1">
                <div className="px-4 lg:px-6 py-4 bg-black">
                  {messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
                  {isLoading && (
                    <div className="py-6">
                      <div className="flex gap-4">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-black text-xs font-bold">Q</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            />
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            )}
          </main>
        </div>

        {/* Right-side input panel like messaging apps */}
        <footer className="border-t border-gray-800 bg-black p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="w-full bg-gray-900 border-gray-700 text-white placeholder:text-gray-400 focus:border-white focus:ring-white h-12 px-4 pr-12 rounded-2xl resize-none"
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                className="bg-white hover:bg-gray-200 text-black h-12 w-12 rounded-2xl disabled:opacity-50 flex items-center justify-center flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-xs text-gray-500 text-center mt-2">
              QuantaLex can make mistakes. Consider checking important information.
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
