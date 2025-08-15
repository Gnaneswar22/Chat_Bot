import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    const response = await fetch("https://openrouter.ai/api/v1/auth/key", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        {
          valid: false,
          error: `API key validation failed: ${response.status} - ${errorText}`,
        },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json({
      valid: true,
      keyInfo: data,
    })
  } catch (error) {
    return NextResponse.json(
      {
        valid: false,
        error: error instanceof Error ? error.message : "Failed to validate API key",
      },
      { status: 500 },
    )
  }
}
