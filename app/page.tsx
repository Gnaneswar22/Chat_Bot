"use client"
import { useAuth } from "@/contexts/auth-context"
import { AuthForm } from "@/components/auth-form"
import { ChatInterface } from "@/components/chat-interface"

export default function Home() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 bg-black rounded-lg" />
          </div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  return <ChatInterface />
}
