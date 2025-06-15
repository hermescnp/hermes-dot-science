import { NextResponse } from "next/server"
import { loadJsonContent } from "@/lib/content-loader"

interface FlowNodeData {
  id: string
  x: number
  y: number
  label: string
  sublabel: string
  type: "input" | "process" | "decision" | "tool" | "output"
  width: number
  iconName: string
}

interface FlowEdgeData {
  id: string
  from: string
  to: string
}

interface AIFlowDiagramContent {
  nodes: FlowNodeData[]
  edges: FlowEdgeData[]
  statusIndicatorText: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lang = searchParams.get("lang") || "en"

    const diagramData = await loadJsonContent<AIFlowDiagramContent>(`ai-flow-diagram-${lang}.json`)
    return NextResponse.json(diagramData)
  } catch (error) {
    console.error("API Error fetching ai-flow-diagram.json:", error)
    return NextResponse.json({ error: "Failed to load AI flow diagram content" }, { status: 500 })
  }
}
