import { NextRequest, NextResponse } from "next/server"
import { GoogleAuth } from "google-auth-library"

interface SimplificationResult {
  summary: string
  pros: string[]
  cons: string[]
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()
    if (!text?.trim()) {
      return NextResponse.json({ error: "Policy text is required" }, { status: 400 })
    }

    const MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash"

    const prompt = `Summarize this government policy in plain English. Then list 3 pros and 3 cons.

Policy text: ${text}

Format:
SUMMARY: [Plain English summary here]
PROS:
1. [First pro]
2. [Second pro]
3. [Third pro]
CONS:
1. [First con]
2. [Second con]
3. [Third con]`

    const base64Credentials = process.env.GOOGLE_CREDENTIALS_BASE64
    if (!base64Credentials) {
      throw new Error("Missing GOOGLE_CREDENTIALS_BASE64 environment variable")
    }
    const credentialsJson = Buffer.from(base64Credentials, "base64").toString("utf-8")
    const credentials = JSON.parse(credentialsJson)

    const auth = new GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/generative-language"],
    })

    const client = await auth.getClient()

    const url = `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent`

    const response = await client.request({
      url,
      method: "POST",
      data: {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      },
    })

    const data = response.data as any
    const outputText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Gemini API returned no usable text"

    const parsed = parseAIResponse(outputText)
    return NextResponse.json(parsed)
  } catch (err) {
    console.error("API route error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function parseAIResponse(text: string): SimplificationResult {
  const result: SimplificationResult = { summary: "", pros: [], cons: [] }
  try {
    const sections = text.split(/(?:SUMMARY:|PROS:|CONS:)/i)
    if (sections.length >= 2) result.summary = cleanMarkdown(sections[1]?.trim() || "Summary not available")
    if (sections.length >= 3) result.pros = extractListItems(sections[2]).slice(0, 3)
    if (sections.length >= 4) result.cons = extractListItems(sections[3]).slice(0, 3)
    if (result.pros.length === 0) result.pros = ["Analysis of benefits not available"]
    if (result.cons.length === 0) result.cons = ["Analysis of drawbacks not available"]
  } catch (err) {
    console.error("Error parsing AI response:", err)
    result.summary = "Error processing the policy analysis"
    result.pros = ["Unable to analyze benefits"]
    result.cons = ["Unable to analyze drawbacks"]
  }
  return result
}

function extractListItems(text: string): string[] {
  return text
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter(line => !line.match(/^\*\*\w+\*\*$/))
    .map((line) => line.replace(/^\d+\.\s*/, "").replace(/^[-•*]\s*/, ""))
    .map(line => cleanMarkdown(line))
}

function cleanMarkdown(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
}
