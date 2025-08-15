import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    const userEmail = request.headers.get("x-user-email")

    if (!userId || !userEmail) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { messages, model } = await request.json()

    const envApiKey = process.env.OPENROUTER_API_KEY
    const realApiKey = "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"

    // Use real API key if env key is placeholder or missing
    const apiKey =
      !envApiKey || envApiKey.includes("your_") || envApiKey.includes("openrouter_api_key") ? realApiKey : envApiKey

    console.log("[v0] API Key available:", !!apiKey)
    console.log("[v0] API Key first 8 chars:", apiKey?.substring(0, 8) + "...")
    console.log("[v0] Authenticated user:", userEmail)

    if (!apiKey) {
      console.error("[v0] OPENROUTER_API_KEY is not set")
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    const modelName = model || "deepseek/deepseek-r1-distill-llama-70b"
    console.log("[v0] Using model:", modelName)

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "QuantaLex AI Assistant",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelName,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] OpenRouter API error:", response.status, errorText)

      if (response.status === 401) {
        return NextResponse.json(
          {
            error: "Authentication failed. Please check your OpenRouter API key.",
          },
          { status: 401 },
        )
      }

      return NextResponse.json(
        {
          error: `OpenRouter API error: ${response.status} - ${errorText}`,
        },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log("[v0] Successful API response received")

    console.log("[v0] Response data structure:", JSON.stringify(data, null, 2))

    if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      console.error("[v0] Invalid response structure:", data)
      return NextResponse.json(
        {
          error: "Invalid response from AI service",
        },
        { status: 500 },
      )
    }

    const messageContent = data.choices[0]?.message?.content
    const reasoning = data.choices[0]?.message?.reasoning

    if (!messageContent) {
      console.error("[v0] No message content in response:", data.choices[0])
      return NextResponse.json(
        {
          error: "No response content received",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      content: messageContent,
      reasoning: reasoning,
      usage: data.usage,
    })
  } catch (error) {
    console.error("[v0] Chat API error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to process chat request",
      },
      { status: 500 },
    )
  }
}
