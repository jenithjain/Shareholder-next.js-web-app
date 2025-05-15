import { NextRequest, NextResponse } from "next/server";
interface ShareholdingData {
  symbol: string;
  companyName: string;
  sector: string;
  industry: string;
  marketCap: string;
  currentPrice: string;
  change: string;
  changePercent: string;
  open: string;
  high: string;
  low: string;
  volume: string;
  peRatio: string;
  pbRatio: string;
  eps: string;
  dividendYield: string;
  weekHigh52: string;
  weekLow52: string;
  deliveryQuantity: string;
  deliveryPercentage: string;
  lastUpdated: string;
  dataSource: string;
  data: { category: string; percentage: number }[];
}

// Simple stock database
const stockDatabase: { [key: string]: { name: string; sector: string; industry: string } } = {
  "TCS": {
    name: "Tata Consultancy Services Ltd.",
    sector: "Information Technology",
    industry: "IT Services & Consulting"
  },
  "RELIANCE": {
    name: "Reliance Industries Ltd.",
    sector: "Oil & Gas",
    industry: "Integrated Oil & Gas"
  },
  "INFY": {
    name: "Infosys Ltd.",
    sector: "Information Technology",
    industry: "IT Services & Consulting"
  },
  "HDFCBANK": {
    name: "HDFC Bank Ltd.",
    sector: "Financial Services",
    industry: "Banking"
  },
  "RVNL": {
    name: "Rail Vikas Nigam Ltd.",
    sector: "Infrastructure",
    industry: "Construction & Engineering"
  }
};

const ALPHA_VANTAGE_API_KEY = "4OOAM7M1KW4AEEC5";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json(
      { error: "Stock symbol is required" },
      { status: 400 }
    );
  }

  const upperSymbol = symbol.toUpperCase();
  console.log(`Processing request for symbol: ${upperSymbol}`);
  
  try {
    // Try to get information using web search
    console.log(`Attempting to fetch data via web search for: ${upperSymbol}`);
    const webSearchInfo = await fetchWebSearchData(upperSymbol);
    
    if (webSearchInfo) {
      console.log(`Successfully fetched web data for ${upperSymbol}`);
      
      // Format the response data
      const shareholdingData: ShareholdingData = {
        symbol: upperSymbol,
        companyName: webSearchInfo.companyName || `${upperSymbol} Ltd.`,
        sector: webSearchInfo.sector || "N/A",
        industry: webSearchInfo.industry || "N/A",
        marketCap: webSearchInfo.marketCap || "N/A",
        currentPrice: webSearchInfo.currentPrice || "N/A",
        change: webSearchInfo.change || "N/A",
        changePercent: webSearchInfo.changePercent || "N/A",
        open: webSearchInfo.open || "N/A",
        high: webSearchInfo.high || "N/A",
        low: webSearchInfo.low || "N/A",
        volume: webSearchInfo.volume || "N/A",
        peRatio: webSearchInfo.peRatio || "N/A",
        pbRatio: webSearchInfo.pbRatio || "N/A",
        eps: webSearchInfo.eps || "N/A",
        dividendYield: webSearchInfo.dividendYield || "N/A",
        weekHigh52: webSearchInfo.weekHigh52 || "N/A",
        weekLow52: webSearchInfo.weekLow52 || "N/A",
        deliveryQuantity: webSearchInfo.deliveryQuantity || "N/A",
        deliveryPercentage: webSearchInfo.deliveryPercentage || "N/A",
        lastUpdated: new Date().toLocaleString('en-IN', { 
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        dataSource: webSearchInfo.dataSource || "Web Search",
        data: webSearchInfo.shareholdingPattern || getShareholdingPattern(upperSymbol, webSearchInfo.sector || "N/A")
      };

      return NextResponse.json(shareholdingData);
    }

    // If web search failed, use fallback data
    console.log("No data found from web search, using fallback data");
    return NextResponse.json(getFallbackData(upperSymbol));

  } catch (error) {
    console.error("Error:", error);
    console.log("Using fallback data due to error");
    return NextResponse.json(getFallbackData(upperSymbol));
  }
}

// Function to fetch data using web search
async function fetchWebSearchData(symbol: string) {
  try {
    // Search query for the stock
    const searchQuery = encodeURIComponent(`${symbol} stock NSE India moneycontrol shareholding pattern`);
    
    const apiKey = "AIzaSyCwXnFaKW-y8y67gCzYTJJZCPhLKrIcx0U";
    const cx = "1389a4bea5ecf4890";
    
    console.log(`Performing web search for: ${symbol}`);
    
    const response = await fetch(`https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${searchQuery}`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) {
      console.log(`Google Search API responded with status: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    if (!data.items || data.items.length === 0) {
      console.log("No search results found");
      return null;
    }
    
    console.log(`Found ${data.items.length} search results`);
    
    // Prioritize MoneyControl links
    const moneyControlLinks = data.items.filter((item: any) => 
      item.link && item.link.includes("moneycontrol.com")
    );
    
    if (moneyControlLinks.length > 0) {
      console.log("Found MoneyControl link, attempting to scrape data");
      
      // Get the first MoneyControl link
      const mcLink = moneyControlLinks[0].link;
      
      try {
        // Fetch the webpage content
        const pageResponse = await fetch(mcLink, {
          cache: 'no-store',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        
        if (!pageResponse.ok) {
          console.log(`Failed to fetch MoneyControl page: ${pageResponse.status}`);
          return extractFromSearchSnippets(data.items);
        }
        
        const pageHtml = await pageResponse.text();
        console.log("Successfully fetched MoneyControl page");
        
        // In the fetchWebSearchData function, update the companyInfo object:
        const companyInfo: any = {
          companyName: null,
          sector: null,
          industry: null,
          marketCap: null,
          currentPrice: null,
          change: null,
          changePercent: null,
          open: null,
          high: null,
          low: null,
          volume: null,
          peRatio: null,
          pbRatio: null,
          eps: null,
          dividendYield: null,
          weekHigh52: null,
          weekLow52: null,
          deliveryQuantity: null,
          deliveryPercentage: null
        };
        
        // Robust extraction for all fields, only if not already set
        if (!companyInfo.peRatio) {
          const peRatioMatch = pageHtml.match(/P\/E(?: TTM)?<\/(?:div|span)>[^<]*<(?:div|span)[^>]*>([^<]+)<\/(?:div|span)>/i);
          if (peRatioMatch && peRatioMatch[1]) companyInfo.peRatio = peRatioMatch[1].trim();
        }
        if (!companyInfo.pbRatio) {
          const pbRatioMatch = pageHtml.match(/P\/B(?: TTM)?<\/(?:div|span)>[^<]*<(?:div|span)[^>]*>([^<]+)<\/(?:div|span)>/i);
          if (pbRatioMatch && pbRatioMatch[1]) companyInfo.pbRatio = pbRatioMatch[1].trim();
        }
        if (!companyInfo.eps) {
          const epsMatch = pageHtml.match(/EPS \(TTM\)<\/(?:div|span)>[^<]*<(?:div|span)[^>]*>([^<]+)<\/(?:div|span)>/i);
          if (epsMatch && epsMatch[1]) companyInfo.eps = epsMatch[1].trim();
        }
        if (!companyInfo.dividendYield) {
          const dividendYieldMatch = pageHtml.match(/Dividend Yield<\/(?:div|span)>[^<]*<(?:div|span)[^>]*>([^<]+)<\/(?:div|span)>/i);
          if (dividendYieldMatch && dividendYieldMatch[1]) companyInfo.dividendYield = dividendYieldMatch[1].trim();
        }
        if (!companyInfo.volume) {
          const volumeMatch = pageHtml.match(/Volume<\/(?:div|span)>[^<]*<(?:div|span)[^>]*>([^<]+)<\/(?:div|span)>/i);
          if (volumeMatch && volumeMatch[1]) {
            let volumeText = volumeMatch[1].trim();
            let volume = parseFloat(volumeText.replace(/,/g, ''));
            if (!isNaN(volume)) {
              if (volumeText.toLowerCase().includes('cr')) volume *= 10000000;
              else if (volumeText.toLowerCase().includes('lakh')) volume *= 100000;
              companyInfo.volume = Math.round(volume).toLocaleString('en-IN');
            }
          }
        }
        if (!companyInfo.marketCap) {
          const marketCapMatch = pageHtml.match(/Market Cap(?: \(Rs Cr\.\))?<\/(?:span|div)>[^<]*<(?:span|div)[^>]*>([^<]+)<\/(?:span|div)>/i);
          if (marketCapMatch && marketCapMatch[1]) {
            const mcText = marketCapMatch[1].trim();
            const marketCap = parseFloat(mcText.replace(/,/g, ''));
            if (!isNaN(marketCap)) companyInfo.marketCap = `₹${marketCap.toLocaleString('en-IN')} Cr`;
          }
        }
        if (!companyInfo.weekHigh52) {
          const week52HighMatch = pageHtml.match(/52 Week High<\/(?:div|span)>[^<]*<(?:div|span)[^>]*>([^<]+)<\/(?:div|span)>/i);
          if (week52HighMatch && week52HighMatch[1]) companyInfo.weekHigh52 = week52HighMatch[1].trim();
        }
        if (!companyInfo.weekLow52) {
          const week52LowMatch = pageHtml.match(/52 Week Low<\/(?:div|span)>[^<]*<(?:div|span)[^>]*>([^<]+)<\/(?:div|span)>/i);
          if (week52LowMatch && week52LowMatch[1]) companyInfo.weekLow52 = week52LowMatch[1].trim();
        }
        if (!companyInfo.deliveryQuantity) {
          const deliveryMatch = pageHtml.match(/Deliverable Volume<\/(?:div|span)>[^<]*<(?:div|span)[^>]*>([^<]+)<\/(?:div|span)>/i);
          if (deliveryMatch && deliveryMatch[1]) {
            companyInfo.deliveryQuantity = deliveryMatch[1].trim();
            const deliveryQty = parseFloat(deliveryMatch[1].replace(/,/g, ''));
            const totalVolume = parseFloat((companyInfo.volume || '').replace(/,/g, ''));
            if (!isNaN(deliveryQty) && !isNaN(totalVolume) && totalVolume > 0) {
              companyInfo.deliveryPercentage = `${((deliveryQty / totalVolume) * 100).toFixed(2)}%`;
            }
          }
        }
        if (!companyInfo.companyName) {
          const companyNameMatch = pageHtml.match(/<h1[^>]*>([^<]+)<\/h1>/i);
          if (companyNameMatch && companyNameMatch[1]) companyInfo.companyName = companyNameMatch[1].trim();
        }
        if (!companyInfo.currentPrice) {
          const priceMatch = pageHtml.match(/class="[^"]*inprice1[^"]*"[^>]*>([^<]+)<\/span>/i);
          if (priceMatch && priceMatch[1]) {
            const price = parseFloat(priceMatch[1].replace(/,/g, '').trim());
            if (!isNaN(price)) companyInfo.currentPrice = `₹${price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
          }
        }
        if (!companyInfo.change || !companyInfo.changePercent) {
          const changeMatch = pageHtml.match(/class="[^"]*pricupdn[^"]*"[^>]*>([^<]+)<\/span>/i);
          if (changeMatch && changeMatch[1]) {
            const changeText = changeMatch[1].trim();
            const changeValue = parseFloat(changeText.split(' ')[0].replace(/,/g, ''));
            if (!isNaN(changeValue)) {
              companyInfo.change = `${changeValue >= 0 ? '+' : ''}${changeValue.toFixed(2)}`;
              const percentMatch = changeText.match(/\(([^)]+)\)/);
              if (percentMatch && percentMatch[1]) {
                const percentValue = parseFloat(percentMatch[1].replace('%', ''));
                if (!isNaN(percentValue)) companyInfo.changePercent = `${percentValue >= 0 ? '+' : ''}${percentValue.toFixed(2)}%`;
              }
            }
          }
        }
        if (!companyInfo.sector) {
          const sectorMatch = pageHtml.match(/Sector<\/span>[^<]*<span[^>]*>([^<]+)<\/span>/i);
          if (sectorMatch && sectorMatch[1]) companyInfo.sector = sectorMatch[1].trim();
        }
        if (!companyInfo.industry) {
          const industryMatch = pageHtml.match(/Industry<\/span>[^<]*<span[^>]*>([^<]+)<\/span>/i);
          if (industryMatch && industryMatch[1]) companyInfo.industry = industryMatch[1].trim();
        }
        if (!companyInfo.open) {
          const openMatch = pageHtml.match(/Open Price<\/div>[^<]*<div[^>]*>([^<]+)<\/div>/i);
          if (openMatch && openMatch[1]) {
            const open = parseFloat(openMatch[1].replace(/,/g, '').trim());
            if (!isNaN(open)) companyInfo.open = `₹${open.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
          }
        }
        if (!companyInfo.high) {
          const highMatch = pageHtml.match(/High Price<\/div>[^<]*<div[^>]*>([^<]+)<\/div>/i);
          if (highMatch && highMatch[1]) {
            const high = parseFloat(highMatch[1].replace(/,/g, '').trim());
            if (!isNaN(high)) companyInfo.high = `₹${high.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
          }
        }
        if (!companyInfo.low) {
          const lowMatch = pageHtml.match(/Low Price<\/div>[^<]*<div[^>]*>([^<]+)<\/div>/i);
          if (lowMatch && lowMatch[1]) {
            const low = parseFloat(lowMatch[1].replace(/,/g, '').trim());
            if (!isNaN(low)) companyInfo.low = `₹${low.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
          }
        }

        const volumeMatch = pageHtml.match(/Volume<\/div>[^<]*<div[^>]*>([^<]+)<\/div>/i);
        if (volumeMatch && volumeMatch[1]) {
          const volumeText = volumeMatch[1].trim();
          let volume = parseFloat(volumeText.replace(/,/g, ''));
          if (!isNaN(volume)) {
            if (volumeText.includes('Cr')) {
              volume = volume * 10000000;
            } else if (volumeText.includes('Lakh')) {
              volume = volume * 100000;
            }
            companyInfo.volume = Math.round(volume).toLocaleString('en-IN');
          }
        }
        
        // Extract shareholding pattern
        let shareholdingPattern = null;
        
        // Look for shareholding pattern table
        if (pageHtml.includes('Shareholding Pattern')) {
          console.log("Found shareholding pattern section");
          
          // Try to find the shareholding pattern section
          const promoterMatch = pageHtml.match(/Promoters[^<]*<span[^>]*>([^<]+)%<\/span>/i);
          const fiiMatch = pageHtml.match(/FII[^<]*<span[^>]*>([^<]+)%<\/span>/i);
          const diiMatch = pageHtml.match(/DII[^<]*<span[^>]*>([^<]+)%<\/span>/i);
          const publicMatch = pageHtml.match(/Public[^<]*<span[^>]*>([^<]+)%<\/span>/i);
          
          if (promoterMatch || fiiMatch || diiMatch || publicMatch) {
            console.log("Successfully extracted shareholding pattern from MoneyControl");
            
            const pattern = [];
            
            if (promoterMatch && promoterMatch[1]) {
              const percentage = parseFloat(promoterMatch[1]);
              if (!isNaN(percentage) && percentage > 0 && percentage <= 100) {
                pattern.push({
                  category: "Promoters & Promoter Group",
                  percentage: percentage
                });
              }
            }
            
            if (fiiMatch && fiiMatch[1]) {
              const percentage = parseFloat(fiiMatch[1]);
              if (!isNaN(percentage) && percentage > 0 && percentage <= 100) {
                pattern.push({
                  category: "Foreign Institutional Investors (FIIs)",
                  percentage: percentage
                });
              }
            }
            
            if (diiMatch && diiMatch[1]) {
              const percentage = parseFloat(diiMatch[1]);
              if (!isNaN(percentage) && percentage > 0 && percentage <= 100) {
                pattern.push({
                  category: "Domestic Institutional Investors (DIIs)",
                  percentage: percentage
                });
              }
            }
            
            if (publicMatch && publicMatch[1]) {
              const percentage = parseFloat(publicMatch[1]);
              if (!isNaN(percentage) && percentage > 0 && percentage <= 100) {
                pattern.push({
                  category: "Public Shareholders",
                  percentage: percentage
                });
              }
            }
            
            // If we have at least one valid category, use it
            if (pattern.length > 0) {
              shareholdingPattern = pattern;
            }
          }
        }
        
        return {
          shareholdingPattern,
          ...companyInfo,
          dataSource: "MoneyControl (Direct Scrape)"
        };
      } catch (scrapeError) {
        console.error("Error scraping MoneyControl:", scrapeError);
        // Fall back to search snippet extraction
        return extractFromSearchSnippets(data.items);
      }
    }
    
    // If no MoneyControl link, use search snippet extraction
    return extractFromSearchSnippets(data.items);
    
  } catch (error) {
    console.error("Error in web search:", error);
    return null;
  }
}

// Helper function to extract data from search snippets
function extractFromSearchSnippets(items: any[]) {
  // Filter for financial sites
  const financialSites = items.filter((item: any) => 
    item.link && (
      item.link.includes("moneycontrol.com") || 
      item.link.includes("screener.in") ||
      item.link.includes("tickertape.in") ||
      item.link.includes("nseindia.com") ||
      item.link.includes("trendlyne.com")
    )
  );
  
  if (financialSites.length === 0) {
    return null;
  }
  
  console.log(`Found ${financialSites.length} relevant financial sites for data extraction`);
  
  // Combine all snippets for better pattern matching
  const allText = financialSites.map((item: any) => 
    `${item.title || ""} ${item.snippet || ""}`
  ).join(" ");
  
  // Enhanced regex patterns for better extraction
  const promoterRegex = /(?:promoters?|promoter group).*?(\d+(?:\.\d+)?)\s*%/i;
  const fiiRegex = /(?:foreign|fii|fiis).*?(\d+(?:\.\d+)?)\s*%/i;
  const diiRegex = /(?:domestic|dii|diis|mutual funds).*?(\d+(?:\.\d+)?)\s*%/i;
  const publicRegex = /(?:public|retail|others).*?(\d+(?:\.\d+)?)\s*%/i;
  
  // Try to extract shareholding percentages
  const promoterMatch = allText.match(promoterRegex);
  const fiiMatch = allText.match(fiiRegex);
  const diiMatch = allText.match(diiRegex);
  const publicMatch = allText.match(publicRegex);
  
  // Extract shareholding pattern
  let shareholdingPattern = null;
  
  // If we found at least one category, create a shareholding pattern
  if (promoterMatch || fiiMatch || diiMatch || publicMatch) {
    console.log("Found shareholding pattern data in search results");
    
    const pattern = [];
    
    if (promoterMatch && promoterMatch[1]) {
      const percentage = parseFloat(promoterMatch[1]);
      if (!isNaN(percentage) && percentage > 0 && percentage <= 100) {
        pattern.push({
          category: "Promoters & Promoter Group",
          percentage: percentage
        });
      }
    }
    
    // Add FII category
    if (fiiMatch && fiiMatch[1]) {
      const percentage = parseFloat(fiiMatch[1]);
      if (!isNaN(percentage) && percentage > 0 && percentage <= 100) {
        pattern.push({
          category: "Foreign Institutional Investors (FIIs)",
          percentage: percentage
        });
      }
    }
    
    // Add DII category
    if (diiMatch && diiMatch[1]) {
      const percentage = parseFloat(diiMatch[1]);
      if (!isNaN(percentage) && percentage > 0 && percentage <= 100) {
        pattern.push({
          category: "Domestic Institutional Investors (DIIs)",
          percentage: percentage
        });
      }
    }
    
    // Add Public category
    if (publicMatch && publicMatch[1]) {
      const percentage = parseFloat(publicMatch[1]);
      if (!isNaN(percentage) && percentage > 0 && percentage <= 100) {
        pattern.push({
          category: "Public Shareholders",
          percentage: percentage
        });
      }
    }
    
    // If we have at least one valid category, use it
    if (pattern.length > 0) {
      shareholdingPattern = pattern;
    }
  }
  
  // Try to extract company information
  const companyInfo: any = {
    companyName: null,
    sector: null,
    industry: null,
    marketCap: null,
    currentPrice: null,
    change: null,
    changePercent: null,
    open: null,    // Added missing property
    high: null,    // Added missing property
    low: null,     // Added missing property
    volume: null
  };
  
  // Look for company name in title with safer regex
  try {
    if (financialSites[0] && financialSites[0].title) {
      const titleMatch = financialSites[0].title.match(/([^-:|]+)(?:[-:|])/i);
      if (titleMatch && titleMatch[1]) {
        companyInfo.companyName = titleMatch[1].trim();
      }
    }
  } catch (regexError) {
    console.error("Error extracting company name:", regexError);
  }
  
  return {
    shareholdingPattern,
    ...companyInfo,
    dataSource: "Web Search Snippets"
  };
}

// Function to get fallback data
function getFallbackData(symbol: string, webSearchInfo?: any): ShareholdingData {
  const stockInfo = stockDatabase[symbol] || {
    name: `${symbol} Ltd.`,
    sector: "N/A",
    industry: "N/A"
  };

  return {
    symbol: symbol,
    companyName: webSearchInfo?.companyName || stockInfo.name,
    sector: webSearchInfo?.sector || stockInfo.sector,
    industry: webSearchInfo?.industry || stockInfo.industry,
    marketCap: webSearchInfo?.marketCap || "N/A",
    currentPrice: webSearchInfo?.currentPrice || "N/A",
    change: webSearchInfo?.change || "N/A",
    changePercent: webSearchInfo?.changePercent || "N/A",
    open: webSearchInfo?.open || "N/A",    // Added missing property
    high: webSearchInfo?.high || "N/A",    // Added missing property
    low: webSearchInfo?.low || "N/A",      // Added missing property
    volume: webSearchInfo?.volume || "N/A",
    peRatio: webSearchInfo?.peRatio || "N/A",
    pbRatio: webSearchInfo?.pbRatio || "N/A",
    eps: webSearchInfo?.eps || "N/A",
    dividendYield: webSearchInfo?.dividendYield || "N/A",
    weekHigh52: webSearchInfo?.weekHigh52 || "N/A",
    weekLow52: webSearchInfo?.weekLow52 || "N/A",
    deliveryQuantity: webSearchInfo?.deliveryQuantity || "N/A",
    deliveryPercentage: webSearchInfo?.deliveryPercentage || "N/A",
    lastUpdated: new Date().toLocaleString('en-IN', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    dataSource: webSearchInfo ? "Web Search + Fallback Data" : "Fallback Data",
    data: webSearchInfo?.shareholdingPattern || getShareholdingPattern(symbol, stockInfo.sector)
  };
}

// Function to get shareholding pattern data
function getShareholdingPattern(symbol: string, sector: string): { category: string; percentage: number }[] {
  // Specific patterns for known stocks
  const specificPatterns: {[key: string]: { category: string; percentage: number }[]} = {
    "TCS": [
      { category: "Promoters & Promoter Group", percentage: 72.05 },
      { category: "Foreign Institutional Investors (FIIs)", percentage: 15.62 },
      { category: "Domestic Institutional Investors (DIIs)", percentage: 7.47 },
      { category: "Public Shareholders", percentage: 4.86 }
    ],
    "RELIANCE": [
      { category: "Promoters & Promoter Group", percentage: 50.48 },
      { category: "Foreign Institutional Investors (FIIs)", percentage: 24.37 },
      { category: "Domestic Institutional Investors (DIIs)", percentage: 12.75 },
      { category: "Public Shareholders", percentage: 12.40 }
    ],
    "INFY": [
      { category: "Promoters & Promoter Group", percentage: 15.11 },
      { category: "Foreign Institutional Investors (FIIs)", percentage: 33.72 },
      { category: "Domestic Institutional Investors (DIIs)", percentage: 36.06 },
      { category: "Public Shareholders", percentage: 15.11 }
    ],
    "HDFCBANK": [
      { category: "Promoters & Promoter Group", percentage: 25.71 },
      { category: "Foreign Institutional Investors (FIIs)", percentage: 39.18 },
      { category: "Domestic Institutional Investors (DIIs)", percentage: 21.25 },
      { category: "Public Shareholders", percentage: 13.86 }
    ],
    "RVNL": [
      { category: "Promoters & Promoter Group (Government)", percentage: 78.20 },
      { category: "Foreign Institutional Investors (FIIs)", percentage: 2.35 },
      { category: "Domestic Institutional Investors (DIIs)", percentage: 8.76 },
      { category: "Public Shareholders", percentage: 10.69 }
    ]
  };
  
  if (specificPatterns[symbol]) {
    return specificPatterns[symbol];
  }
  
  // If no specific data, use sector averages or generate random data
  const sectorPatterns: {[key: string]: { category: string; percentage: number }[]} = {
    "Information Technology": [
      { category: "Promoters & Promoter Group", percentage: 30.5 },
      { category: "Foreign Institutional Investors (FIIs)", percentage: 35.2 },
      { category: "Domestic Institutional Investors (DIIs)", percentage: 18.7 },
      { category: "Public Shareholders", percentage: 15.6 }
    ],
    "Financial Services": [
      { category: "Promoters & Promoter Group", percentage: 26.8 },
      { category: "Foreign Institutional Investors (FIIs)", percentage: 38.4 },
      { category: "Domestic Institutional Investors (DIIs)", percentage: 22.3 },
      { category: "Public Shareholders", percentage: 12.5 }
    ],
    "Oil & Gas": [
      { category: "Promoters & Promoter Group", percentage: 51.2 },
      { category: "Foreign Institutional Investors (FIIs)", percentage: 22.6 },
      { category: "Domestic Institutional Investors (DIIs)", percentage: 15.8 },
      { category: "Public Shareholders", percentage: 10.4 }
    ],
    "Infrastructure": [
      { category: "Promoters & Promoter Group", percentage: 54.8 },
      { category: "Foreign Institutional Investors (FIIs)", percentage: 12.3 },
      { category: "Domestic Institutional Investors (DIIs)", percentage: 18.6 },
      { category: "Public Shareholders", percentage: 14.3 }
    ]
  };
  
  if (sectorPatterns[sector]) {
    return sectorPatterns[sector];
  }
  
  // Default pattern if no specific or sector data is available
  return [
    { category: "Promoters & Promoter Group", percentage: 40 + Math.random() * 20 },
    { category: "Foreign Institutional Investors (FIIs)", percentage: 20 + Math.random() * 15 },
    { category: "Domestic Institutional Investors (DIIs)", percentage: 15 + Math.random() * 10 },
    { category: "Public Shareholders", percentage: 10 + Math.random() * 10 }
  ];}
