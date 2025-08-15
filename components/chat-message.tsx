"use client"
import { Button } from "@/components/ui/button"
import { User, Copy, Check, Brain, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  reasoning?: string
  timestamp: Date
}

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"
  const [copied, setCopied] = useState(false)
  const [showReasoning, setShowReasoning] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const renderContent = (content: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
    const inlineCodeRegex = /`([^`]+)`/g
    const listRegex = /^(\d+\.|[-*])\s+(.+)$/gm
    const headerRegex = /^(#{1,6})\s+(.+)$/gm
    const boldRegex = /\*\*([^*]+)\*\*/g

    let processedContent = content

    // Process headers
    processedContent = processedContent.replace(headerRegex, (match, hashes, text) => {
      const level = hashes.length
      const className =
        level === 1
          ? "text-xl font-bold mt-6 mb-3"
          : level === 2
            ? "text-lg font-semibold mt-5 mb-2"
            : "text-base font-medium mt-4 mb-2"
      return `<h${level} class="${className}">${text}</h${level}>`
    })

    // Process bold text
    processedContent = processedContent.replace(boldRegex, '<strong class="font-semibold">$1</strong>')

    const parts = []
    let lastIndex = 0
    let match

    // Handle code blocks
    while ((match = codeBlockRegex.exec(processedContent)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        const textBefore = processedContent.slice(lastIndex, match.index)
        parts.push(
          <div
            key={`text-${lastIndex}`}
            className="whitespace-pre-wrap"
            dangerouslySetInnerHTML={{
              __html: textBefore.replace(
                inlineCodeRegex,
                '<code class="bg-gray-200 text-black px-1.5 py-0.5 rounded text-sm font-mono">$1</code>',
              ),
            }}
          />,
        )
      }

      // Add code block with enhanced styling
      const language = match[1] || "text"
      const code = match[2]
      parts.push(
        <div
          key={`code-${match.index}`}
          className="my-4 rounded-lg overflow-hidden bg-gray-900 border border-gray-700 shadow-lg"
        >
          <div className="flex items-center justify-between bg-gray-800 px-4 py-2 border-b border-gray-700">
            <span className="text-xs text-gray-300 font-mono uppercase tracking-wide">{language}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigator.clipboard.writeText(code)}
              className="h-6 px-2 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
          <pre className="p-4 overflow-x-auto">
            <code className="text-sm font-mono text-white leading-relaxed">{code}</code>
          </pre>
        </div>,
      )

      lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < processedContent.length) {
      const remainingText = processedContent.slice(lastIndex)
      parts.push(
        <div
          key={`text-${lastIndex}`}
          className="whitespace-pre-wrap"
          dangerouslySetInnerHTML={{
            __html: remainingText.replace(
              inlineCodeRegex,
              '<code class="bg-gray-200 text-black px-1.5 py-0.5 rounded text-sm font-mono">$1</code>',
            ),
          }}
        />,
      )
    }

    return parts.length > 0 ? (
      parts
    ) : (
      <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: processedContent }} />
    )
  }

  return (
    <div
      className={cn("px-4 lg:px-6 py-6 lg:py-8 transition-colors duration-200", isUser ? "bg-black" : "bg-gray-950/50")}
    >
      <div className={cn("max-w-4xl", isUser ? "ml-auto mr-4" : "mr-auto ml-4")}>
        <div className={cn("flex gap-4 lg:gap-6", isUser ? "justify-end" : "justify-start")}>
          {!isUser && (
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-black text-xs font-bold">Q</span>
            </div>
          )}

          <div className={cn("min-w-0", isUser ? "max-w-md text-right" : "flex-1")}>
            {!isUser && message.reasoning && (
              <div className="mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReasoning(!showReasoning)}
                  className="h-8 px-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200 text-xs"
                >
                  <Brain className="w-3 h-3 mr-1.5" />
                  <span>Thinking process</span>
                  {showReasoning ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                </Button>
                {showReasoning && (
                  <div className="mt-2 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                    <div className="text-xs text-gray-400 mb-2 font-medium">AI Reasoning:</div>
                    <div className="text-sm text-gray-300 leading-relaxed italic">{message.reasoning}</div>
                  </div>
                )}
              </div>
            )}

            <div
              className={cn(
                "leading-relaxed text-sm lg:text-base",
                isUser ? "text-white bg-gray-800 rounded-2xl px-4 py-3 inline-block" : "text-white",
              )}
            >
              {renderContent(message.content)}
            </div>

            {!isUser && (
              <div className="flex items-center gap-2 mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  className="h-8 px-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200 text-xs"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span className="ml-1.5">{copied ? "Copied!" : "Copy"}</span>
                </Button>
              </div>
            )}
          </div>

          {isUser && (
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-black" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
