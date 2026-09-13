from fastapi import APIRouter, Query
from typing import List
from pydantic import BaseModel
import yfinance as yf
import requests

router = APIRouter()

CUSTOM_SESSION = requests.Session()
CUSTOM_SESSION.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
})

class TickerInfo(BaseModel):
    symbol: str
    name: str
    exchange: str

POPULAR_STOCKS = [
    # Top US Equities
    {"symbol": "AA", "name": "Alcoa Corporation", "exchange": "NYSE"},
    {"symbol": "AAL", "name": "American Airlines Group Inc.", "exchange": "NASDAQ"},
    {"symbol": "AAPL", "name": "Apple Inc.", "exchange": "NASDAQ"},
    {"symbol": "AMZN", "name": "Amazon.com Inc.", "exchange": "NASDAQ"},
    {"symbol": "GOOGL", "name": "Alphabet Inc. (Google)", "exchange": "NASDAQ"},
    {"symbol": "MSFT", "name": "Microsoft Corporation", "exchange": "NASDAQ"},
    {"symbol": "NVDA", "name": "NVIDIA Corporation", "exchange": "NASDAQ"},
    {"symbol": "TSLA", "name": "Tesla Inc.", "exchange": "NASDAQ"},

    # Top Indian NSE Equities
    {"symbol": "ADANIENT.NS", "name": "Adani Enterprises Ltd.", "exchange": "NSE"},
    {"symbol": "ADANIPORTS.NS", "name": "Adani Ports and SEZ Ltd.", "exchange": "NSE"},
    {"symbol": "ADANIPOWER.NS", "name": "Adani Power Ltd.", "exchange": "NSE"},
    {"symbol": "APOLLOHOSP.NS", "name": "Apollo Hospitals Enterprise Ltd.", "exchange": "NSE"},
    {"symbol": "ASIANPAINT.NS", "name": "Asian Paints Ltd.", "exchange": "NSE"},
    {"symbol": "AXISBANK.NS", "name": "Axis Bank Ltd.", "exchange": "NSE"},
    {"symbol": "BAJAJ-AUTO.NS", "name": "Bajaj Auto Ltd.", "exchange": "NSE"},
    {"symbol": "BAJAJFINSV.NS", "name": "Bajaj Finserv Ltd.", "exchange": "NSE"},
    {"symbol": "BAJFINANCE.NS", "name": "Bajaj Finance Ltd.", "exchange": "NSE"},
    {"symbol": "BEL.NS", "name": "Bharat Electronics Ltd.", "exchange": "NSE"},
    {"symbol": "BHARTIARTL.NS", "name": "Bharti Airtel Ltd.", "exchange": "NSE"},
    {"symbol": "BPCL.NS", "name": "Bharat Petroleum Corporation Ltd.", "exchange": "NSE"},
    {"symbol": "BRITANNIA.NS", "name": "Britannia Industries Ltd.", "exchange": "NSE"},
    {"symbol": "CIPLA.NS", "name": "Cipla Ltd.", "exchange": "NSE"},
    {"symbol": "COALINDIA.NS", "name": "Coal India Ltd.", "exchange": "NSE"},
    {"symbol": "DIVISLAB.NS", "name": "Divi's Laboratories Ltd.", "exchange": "NSE"},
    {"symbol": "DRREDDY.NS", "name": "Dr. Reddy's Laboratories Ltd.", "exchange": "NSE"},
    {"symbol": "EICHERMOT.NS", "name": "Eicher Motors Ltd.", "exchange": "NSE"},
    {"symbol": "HCLTECH.NS", "name": "HCL Technologies Ltd.", "exchange": "NSE"},
    {"symbol": "HDFCBANK.NS", "name": "HDFC Bank Ltd.", "exchange": "NSE"},
    {"symbol": "HDFCLIFE.NS", "name": "HDFC Life Insurance Company Ltd.", "exchange": "NSE"},
    {"symbol": "HINDALCO.NS", "name": "Hindalco Industries Ltd.", "exchange": "NSE"},
    {"symbol": "HINDUNILVR.NS", "name": "Hindustan Unilever Ltd.", "exchange": "NSE"},
    {"symbol": "ICICIBANK.NS", "name": "ICICI Bank Ltd.", "exchange": "NSE"},
    {"symbol": "INDUSINDBK.NS", "name": "IndusInd Bank Ltd.", "exchange": "NSE"},
    {"symbol": "INFY.NS", "name": "Infosys Limited", "exchange": "NSE"},
    {"symbol": "IOC.NS", "name": "Indian Oil Corporation Ltd.", "exchange": "NSE"},
    {"symbol": "ITC.NS", "name": "ITC Limited", "exchange": "NSE"},
    {"symbol": "JSWSTEEL.NS", "name": "JSW Steel Ltd.", "exchange": "NSE"},
    {"symbol": "KOTAKBANK.NS", "name": "Kotak Mahindra Bank Ltd.", "exchange": "NSE"},
    {"symbol": "LICI.NS", "name": "Life Insurance Corporation of India", "exchange": "NSE"},
    {"symbol": "LT.NS", "name": "Larsen & Toubro Ltd.", "exchange": "NSE"},
    {"symbol": "MARUTI.NS", "name": "Maruti Suzuki India Ltd.", "exchange": "NSE"},
    {"symbol": "NTPC.NS", "name": "NTPC Limited", "exchange": "NSE"},
    {"symbol": "ONGC.NS", "name": "Oil & Natural Gas Corporation", "exchange": "NSE"},
    {"symbol": "POWERGRID.NS", "name": "Power Grid Corporation of India", "exchange": "NSE"},
    {"symbol": "RELIANCE.NS", "name": "Reliance Industries Ltd.", "exchange": "NSE"},
    {"symbol": "SBILIFE.NS", "name": "SBI Life Insurance Company Ltd.", "exchange": "NSE"},
    {"symbol": "SBIN.NS", "name": "State Bank of India", "exchange": "NSE"},
    {"symbol": "SHRIRAMFIN.NS", "name": "Shriram Finance Ltd.", "exchange": "NSE"},
    {"symbol": "SUNPHARMA.NS", "name": "Sun Pharmaceutical Industries Ltd.", "exchange": "NSE"},
    {"symbol": "TATACONSUM.NS", "name": "Tata Consumer Products Ltd.", "exchange": "NSE"},
    {"symbol": "TATAMOTORS.NS", "name": "Tata Motors Ltd.", "exchange": "NSE"},
    {"symbol": "TATAPOWER.NS", "name": "Tata Power Company Ltd.", "exchange": "NSE"},
    {"symbol": "TATASTEEL.NS", "name": "Tata Steel Ltd.", "exchange": "NSE"},
    {"symbol": "TCS.NS", "name": "Tata Consultancy Services Ltd.", "exchange": "NSE"},
    {"symbol": "TECHM.NS", "name": "Tech Mahindra Ltd.", "exchange": "NSE"},
    {"symbol": "TITAN.NS", "name": "Titan Company Ltd.", "exchange": "NSE"},
    {"symbol": "TRENT.NS", "name": "Trent Ltd.", "exchange": "NSE"},
    {"symbol": "ULTRACEMCO.NS", "name": "UltraTech Cement Ltd.", "exchange": "NSE"},
    {"symbol": "WIPRO.NS", "name": "Wipro Limited", "exchange": "NSE"},
]

@router.get("/search", response_model=List[TickerInfo])
def search_companies(query: str = Query("", min_length=0)):
    q = query.strip().upper()
    if not q:
        return POPULAR_STOCKS[:10]

    # Priority 1: Match Ticker Symbol starting with query (e.g., "AA" -> AAPL, AAL, AA)
    symbol_prefix_matches = [
        s for s in POPULAR_STOCKS 
        if s["symbol"].upper().startswith(q)
    ]

    # Priority 2: Match Company Name words starting with query (e.g., "T" -> Tata Motors, TCS)
    name_word_prefix_matches = [
        s for s in POPULAR_STOCKS 
        if any(word.startswith(q) for word in s["name"].upper().split())
    ]

    # Priority 3: Substring matches inside symbol or company name
    substring_matches = [
        s for s in POPULAR_STOCKS 
        if q in s["symbol"].upper() or q in s["name"].upper()
    ]

    # Merge and deduplicate maintaining prefix priority order
    seen_symbols = set()
    combined = []

    for item in symbol_prefix_matches + name_word_prefix_matches + substring_matches:
        if item["symbol"] not in seen_symbols:
            seen_symbols.add(item["symbol"])
            combined.append(item)

    # Fallback lookup to yfinance for unlisted tickers
    if not combined and " " not in q and len(q) <= 12:
        try:
            lookup_symbol = q if (q.endswith(".NS") or "." in q) else f"{q}.NS"
            t = yf.Ticker(lookup_symbol, session=CUSTOM_SESSION)
            info = t.info
            name = info.get("longName") or info.get("shortName")
            if name:
                combined.append({"symbol": lookup_symbol, "name": name, "exchange": info.get("exchange", "NSE")})
        except Exception:
            pass

    return combined