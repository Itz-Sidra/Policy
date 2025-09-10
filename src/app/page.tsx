"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, FileText, ThumbsUp, ThumbsDown, Upload, X } from "lucide-react"

interface SimplificationResult {
  summary: string
  pros: string[]
  cons: string[]
}

export default function HomePage() {
  const [policyText, setPolicyText] = useState("")
  const [result, setResult] = useState<SimplificationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessingFile, setIsProcessingFile] = useState(false)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a text file, PDF, or Word document")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB")
      return
    }

    setUploadedFile(file)
    setIsProcessingFile(true)
    setError("")

    try {
      let text = ""
      
      if (file.type === 'text/plain') {
        text = await file.text()
      } else if (file.type === 'application/pdf') {
        const formData = new FormData()
        formData.append('file', file)
        
        const response = await fetch('/api/extract-text', {
          method: 'POST',
          body: formData,
        })
        
        if (!response.ok) {
          throw new Error('Failed to extract text from PDF')
        }
        
        const data = await response.json()
        text = data.text
      } else {
        const formData = new FormData()
        formData.append('file', file)
        
        const response = await fetch('/api/extract-text', {
          method: 'POST',
          body: formData,
        })
        
        if (!response.ok) {
          throw new Error('Failed to extract text from document')
        }
        
        const data = await response.json()
        text = data.text
      }

      setPolicyText(text)
    } catch (err) {
      setError("Failed to process the uploaded file")
      console.error("File processing error:", err)
      setUploadedFile(null)
    } finally {
      setIsProcessingFile(false)
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
    setPolicyText("")
  }

  const handleSimplify = async () => {
    if (!policyText.trim()) {
      setError("Please enter some policy text or upload a file to analyze.")
      return
    }

    setIsLoading(true)
    setError("")
    setResult(null)

    try {
      const response = await fetch("/api/simplify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: policyText }),
      })

      if (!response.ok) {
        throw new Error("Failed to simplify policy")
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError("Failed to analyze the policy. Please try again.")
      console.error("Error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4 text-balance">
            Policy in Plain English – Making Governance Accessible
          </h1>
          <p className="text-lg text-muted-foreground text-pretty">
            Transform complex government policies into clear, understandable summaries with pros and cons analysis.
          </p>
        </div>

        {/* Input Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Policy Input
            </CardTitle>
            <CardDescription>Upload a policy document or paste the text directly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload */}
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
              <input
                type="file"
                id="policy-file"
                className="hidden"
                accept=".txt,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                disabled={isProcessingFile}
              />
              <label htmlFor="policy-file" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {isProcessingFile ? "Processing file..." : "Click to upload a policy document"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Supports TXT, PDF, DOC, DOCX (up to 10MB)
                    </p>
                  </div>
                </div>
              </label>
            </div>

            {/* Uploaded File Display */}
            {uploadedFile && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">{uploadedFile.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({(uploadedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or paste text directly</span>
              </div>
            </div>

            {/* Text Area */}
            <Textarea
              placeholder="Paste your government policy or bill text here..."
              value={policyText}
              onChange={(e) => setPolicyText(e.target.value)}
              className="min-h-[200px] resize-none"
              disabled={isProcessingFile}
            />

            <Button 
              onClick={handleSimplify} 
              disabled={isLoading || isProcessingFile || !policyText.trim()} 
              className="w-full" 
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing policy…
                </>
              ) : isProcessingFile ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing file…
                </>
              ) : (
                "Simplify Policy"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-primary">Plain-English Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">{result.summary}</p>
              </CardContent>
            </Card>

            {/* Pros and Cons */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Pros */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <ThumbsUp className="h-5 w-5" />
                    Pros
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {result.pros.map((pro, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        <span 
                          className="text-foreground leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: pro }}
                        />
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Cons */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <ThumbsDown className="h-5 w-5" />
                    Cons
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {result.cons.map((con, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                        <span 
                          className="text-foreground leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: con }}
                        />
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}