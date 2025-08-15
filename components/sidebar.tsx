"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, MessageSquare, Search, Edit, Menu, X, LogOut, Home } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface Chat {
  id: string
  title: string
  messages: any[]
  createdAt: Date
}

interface SidebarProps {
  chats: Chat[]
  currentChatId: string | null
  onNewChat: () => void
  onSelectChat: (chatId: string) => void
  onDeleteChat: (chatId: string) => void
  onClearAll: () => void // Added clear all functionality
  isOpen: boolean
  onToggle: () => void
}

export function Sidebar({
  chats,
  currentChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onClearAll, // Added clear all prop
  isOpen,
  onToggle,
}: SidebarProps) {
  const { user, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredChats = chats.filter(
    (chat) =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.messages.some((msg) => msg.content.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleSearch = () => {
    const searchInput = document.querySelector("#chat-search") as HTMLInputElement
    if (searchInput) {
      searchInput.focus()
    }
  }

  const handleEdit = () => {
    // Edit current chat title or settings
    console.log("[v0] Edit functionality triggered")
    // Could open edit modal for current chat
  }

  const handleHome = () => {
    // Navigate to home/dashboard view
    console.log("[v0] Home functionality triggered")
    onNewChat() // For now, create new chat as home action
  }

  return (
    <>
      {!isOpen && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="fixed top-4 left-4 z-50 bg-gray-900/90 backdrop-blur-sm text-white hover:bg-gray-800/90 border border-gray-700/50 rounded-lg p-3 shadow-xl transition-all duration-200 hover:scale-105"
        >
          <Menu className="w-5 h-5" />
        </Button>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onToggle}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-16 bg-gray-900 border-r border-gray-800 flex flex-col transition-all duration-300 ease-in-out shadow-2xl",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="p-3 border-b border-gray-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="w-full h-10 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 flex flex-col items-center py-4 space-y-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHome}
            className="w-10 h-10 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200 p-0"
            title="Home"
          >
            <Home className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onNewChat}
            className="w-10 h-10 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200 p-0"
            title="New Chat"
          >
            <Plus className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="w-10 h-10 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200 p-0"
            title="Edit"
          >
            <Edit className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSearch}
            className="w-10 h-10 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200 p-0"
            title="Search"
          >
            <Search className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200 p-0"
            title="Messages"
          >
            <MessageSquare className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-3 border-t border-gray-800 space-y-2">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mx-auto">
            <span className="text-black text-xs font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="w-10 h-10 text-gray-400 hover:text-white hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-all duration-200 p-0 mx-auto"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </aside>

      {isOpen && (
        <div className="fixed left-16 top-0 z-40 h-full w-64 bg-black border-r border-gray-800 flex flex-col shadow-2xl">
          <header className="p-4 border-b border-gray-800">
            <h2 className="text-lg font-bold text-white mb-3">Recent Chats</h2>
            <Input
              id="chat-search"
              type="search"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900 border-gray-700 text-white placeholder:text-gray-400 text-sm h-8"
            />
          </header>

          <ScrollArea className="flex-1 p-3">
            <div className="space-y-1">
              {chats.length > 0 && (
                <Button
                  variant="ghost"
                  onClick={onClearAll}
                  className="w-full text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm p-2 mb-2"
                >
                  Clear All History
                </Button>
              )}

              {filteredChats.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    {searchQuery ? "No matching conversations" : "No conversations yet"}
                  </p>
                </div>
              ) : (
                filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    className={cn(
                      "group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200",
                      currentChatId === chat.id
                        ? "bg-white/10 text-white border border-white/20"
                        : "text-gray-300 hover:bg-gray-900/50 hover:text-white",
                    )}
                    onClick={() => {
                      onSelectChat(chat.id)
                      onToggle() // Close sidebar after selecting chat
                    }}
                  >
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full flex-shrink-0",
                        currentChatId === chat.id ? "bg-white" : "bg-gray-600",
                      )}
                    />
                    <span className="flex-1 truncate text-sm">{chat.title}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteChat(chat.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-1 h-auto text-gray-500 hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </>
  )
}
