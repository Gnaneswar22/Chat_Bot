"use client"

import { Card } from "@/components/ui/card"
import { MessageCircle, Code, Lightbulb, BookOpen } from "lucide-react"

interface SuggestionCardsProps {
  onSuggestionClick: (suggestion: string) => void
}

const suggestions = [
  {
    icon: MessageCircle,
    title: "Start a conversation",
    description: "Ask me anything you'd like to know",
    prompt: "Hello! What can you help me with today?",
  },
  {
    icon: Code,
    title: "Code assistance",
    description: "Get help with programming tasks",
    prompt: "Can you help me write a Python function to sort a list?",
  },
  {
    icon: Lightbulb,
    title: "Creative ideas",
    description: "Brainstorm and explore new concepts",
    prompt: "Give me some creative ideas for a weekend project",
  },
  {
    icon: BookOpen,
    title: "Learn something new",
    description: "Explore topics and expand knowledge",
    prompt: "Explain quantum computing in simple terms",
  },
]

export function SuggestionCards({ onSuggestionClick }: SuggestionCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
      {suggestions.map((suggestion, index) => (
        <Card
          key={index}
          className="p-4 bg-black border border-gray-700 hover:bg-gray-900 hover:border-white/20 transition-all duration-200 cursor-pointer group"
          onClick={() => onSuggestionClick(suggestion.prompt)}
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 transition-colors duration-200">
              <suggestion.icon className="w-4 h-4 text-black" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-white group-hover:text-gray-100 transition-colors duration-200 mb-1 text-sm">
                {suggestion.title}
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">{suggestion.description}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
