import { NextRequest, NextResponse } from "next/server";
import { analyzeStockData } from "../utils/geminiAI";

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol");
  
  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  try {
    const analysis = await analyzeStockData(symbol, "");
    return NextResponse.json({ analysis: analysis || "No analysis available" });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json({ error: "Failed to analyze data" }, { status: 500 });
  }
}