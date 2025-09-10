import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const fileType = file.type
    let text = ""

    if (fileType === 'text/plain') {
      text = await file.text()
    } else if (fileType === 'application/pdf') {
      try {
        const pdfParse = require('pdf-parse')
        const buffer = await file.arrayBuffer()
        const data = await pdfParse(Buffer.from(buffer))
        text = data.text
      } catch (error) {
        return NextResponse.json({ error: "Failed to extract text from PDF" }, { status: 500 })
      }
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               fileType === 'application/msword') {
      try {
        const mammoth = require('mammoth')
        const buffer = await file.arrayBuffer()
        const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) })
        text = result.value
      } catch (error) {
        return NextResponse.json({ error: "Failed to extract text from document" }, { status: 500 })
      }
    } else {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 })
    }

    text = text
      .replace(/\r\n/g, '\n')  
      .replace(/\n{3,}/g, '\n\n')  
      .trim()

    if (!text) {
      return NextResponse.json({ error: "No text found in the file" }, { status: 400 })
    }

    return NextResponse.json({ text })
  } catch (error) {
    console.error("Text extraction error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}