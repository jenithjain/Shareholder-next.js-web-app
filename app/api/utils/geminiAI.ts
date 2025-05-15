import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API with your API key
const genAI = new GoogleGenerativeAI("AIzaSyBB8WDwvDwF8ZRMqyOZN52yfwWsj9mq_SY");

export async function analyzeStockData(symbol: string, rawHtml: string) {
  try {
    // Using gemini-1.5-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `
      You are a financial data extraction expert. From the given HTML of MoneyControl for ${symbol}, carefully extract these specific fields:
      
      1. Look for the current stock price (usually a prominent number with ₹ symbol)
      2. Find the market cap (look for "MARKET CAP" or "M.Cap" labels)
      3. Extract the P/E ratio (look for "P/E" label)
      4. Find shareholding pattern data:
         - Promoters holding percentage (look for "Promoter" or "Promoter Holding")
         - FII holding percentage (look for "FII" or "Foreign")
         - DII holding percentage (look for "DII" or "Domestic")
         - Public holding percentage (look for "Public" or "Others")
      5. Extract trading volume (look for "Volume" label)
      6. Find 52-week high price (look for "52-w H" or "52 week high")
      7. Find 52-week low price (look for "52-w L" or "52 week low")
      
      Return ONLY this exact JSON format with numeric values (no text, symbols or units):
      {
        "currentPrice": "numeric value only",
        "marketCap": "include units like Cr or Lakh",
        "peRatio": "numeric value only",
        "shareholdingPattern": {
          "promoters": "percentage only",
          "fii": "percentage only",
          "dii": "percentage only",
          "public": "percentage only"
        },
        "volume": "numeric value only",
        "weekHigh52": "numeric value only",
        "weekLow52": "numeric value only"
      }
      
      If you can't find a value, use "N/A". Return ONLY the JSON object, no other text.
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt + "\n\nHTML Content:\n" + rawHtml.substring(0, 100000) }]}],
      generationConfig: {
        temperature: 0.1,
        topP: 0.1,
        topK: 16,
        maxOutputTokens: 1000,
      },
    });

    const response = await result.response;
    const text = response.text().trim();
    
    try {
      // Clean the response to ensure it's valid JSON
      const cleanedText = text
        .replace(/^```json\s*/, '')
        .replace(/\s*```$/, '')
        .replace(/^```\s*/, '')
        .replace(/[\n\r]/g, '')
        .trim();
      
      console.log('Cleaned text:', cleanedText);
      
      const parsed = JSON.parse(cleanedText);
      
      // Transform shareholding pattern to match expected format for frontend
      const shareholdingPattern = [
        { category: "Promoters & Promoter Group", percentage: parseFloat(parsed.shareholdingPattern?.promoters) || 0 },
        { category: "Foreign Institutional Investors (FIIs)", percentage: parseFloat(parsed.shareholdingPattern?.fii) || 0 },
        { category: "Domestic Institutional Investors (DIIs)", percentage: parseFloat(parsed.shareholdingPattern?.dii) || 0 },
        { category: "Public Shareholders", percentage: parseFloat(parsed.shareholdingPattern?.public) || 0 }
      ];
      
      // Return only the data needed for the frontend
      return {
        currentPrice: parsed.currentPrice || "N/A",
        marketCap: parsed.marketCap || "N/A",
        peRatio: parsed.peRatio || "N/A",
        shareholdingPattern: shareholdingPattern,
        volume: parsed.volume || "N/A",
        weekHigh52: parsed.weekHigh52 || "N/A",
        weekLow52: parsed.weekLow52 || "N/A"
      };
    } catch (parseError) {
      console.error("Raw response:", text);
      console.error("Parse error:", parseError);
      return null;
    }
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return null;
  }
}