import streamlit as st
import pandas as pd
import yfinance as yf
import plotly.graph_objects as go
import plotly.io as pio
from datetime import date, timedelta
from html import escape

from src.preprocessing.feature_engineering import engineer_features
from src.sentiment.news_loader import load_stock_news
from src.sentiment.news_cleaning import clean_news_data
from src.sentiment.sentiment_analyzer import add_sentiment_scores, get_sentiment_summary
from src.models.ml_pipeline import prepare_ml_data, train_random_forest, create_prediction_dataframe

# ============================================================
# MARKETMIND AI — PROFESSIONAL SINGLE-PAGE MARKET INTELLIGENCE
# ============================================================
st.set_page_config(
    page_title="MarketMind AI",
    page_icon="M",
    layout="wide",
    initial_sidebar_state="expanded",
)

pio.templates.default = "plotly_white"

# Professional Stock Market Dark Theme - MarketMind AI
PALETTE = {
    # Core Brand Colors - Professional Finance Dark Theme
    "navy": "#0D1117",                  # Darkest - Main background (GitHub dark inspired)
    "blue": "#0FA3B1",                  # Professional teal - Primary accent
    "blue_dark": "#40A9B5",             # Lighter teal for hover states
    "cyan": "#06C8D9",                  # Bright cyan - Secondary accent
    "purple": "#6366F1",                # Indigo - Neutral accent
    "violet": "#7C3AED",                # Violet - Highlights
    "sky_blue": "#0EADC6",              # Sky blue - Info states
    "indigo": "#4F46E5",                # Indigo - Alternative accent

    # Status Colors - Professional
    "green": "#00D084",                 # Professional green (bullish)
    "red": "#FF5366",                   # Professional red (bearish)
    "amber": "#FFB81C",                 # Professional amber (warnings)

    # Text & UI - Professional Finance
    "text_light": "#FFFFFF",            # Pure white text
    "text_secondary": "#FEFEFE",        # Secondary text
    "ink": "#FBFDF2",                   # Light text
    "muted": "#8B90A3",

    # UI Elements - Professional Dark
    "line": "#2D333B",                  # Subtle borders
    "paper": "#161B22",                 # Card background
    "soft": "#0D1117",                  # Darker background
    "white": "#918A8A",
}


#===========================================================
# GLOBAL UI - PROFESSIONAL AI WEBSITE THEME
# ============================================================
st.markdown(f"""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

:root {{
  --navy:{PALETTE['navy']}; --blue:{PALETTE['blue']}; --blue-dark:{PALETTE['blue_dark']};
  --cyan:{PALETTE['cyan']}; --purple:{PALETTE['purple']}; --violet:{PALETTE['violet']};
  --sky-blue:{PALETTE['sky_blue']}; --indigo:{PALETTE['indigo']};
  --green:{PALETTE['green']}; --red:{PALETTE['red']}; --amber:{PALETTE['amber']};
  --text-light:{PALETTE['text_light']}; --text-secondary:{PALETTE['text_secondary']};
  --ink:{PALETTE['ink']}; --muted:{PALETTE['muted']}; --line:{PALETTE['line']};
  --paper:{PALETTE['paper']}; --soft:{PALETTE['soft']};
}}

html {{ scroll-behavior:smooth; scroll-padding-top:100px; }}
body, .stApp, [class*="css"] {{ font-family:'Inter',sans-serif; }}
.stApp {{
  color:var(--text-light);
  background:
    radial-gradient(circle at 5% 10%, rgba(15,163,177,.04), transparent 28%),
    radial-gradient(circle at 95% 20%, rgba(99,102,241,.03), transparent 28%),
    linear-gradient(135deg,#0D1117 0%,#0D1117 50%,#0D1117 100%);
}}
.block-container {{ max-width:1540px; padding:120px 2rem 4rem; }}
#MainMenu, footer {{ visibility:hidden; }}
header[data-testid="stHeader"] {{ background:transparent; }}

/* ---------- splash ---------- */
.mm-splash {{ position:fixed; inset:0; z-index:999999; background:#0B1220; display:flex; align-items:center; justify-content:center; text-align:center; animation:mmFade 1s ease 1.65s forwards; pointer-events:none; }}
.mm-splash-inner {{ width:min(620px,90vw); }}
.mm-logo {{ display:flex; align-items:center; justify-content:center; gap:12px; }}
.mm-logo-mark {{ width:58px; height:58px; border-radius:16px; background:linear-gradient(145deg,#0FA3B1,#06C8D9); color:#fff; display:grid; place-items:center; font-weight:900; font-size:25px; box-shadow:0 14px 34px rgba(15,163,177,.35); }}
.mm-logo-name {{ color:#fff; font-size:42px; font-weight:800; letter-spacing:-.05em; }}
.mm-logo-name span {{ color:var(--blue); }}
.mm-splash-sub {{ color:#CBD5E1; margin-top:13px; font-size:15px; }}
.mm-loader {{ height:4px; background:#1E293B; border-radius:20px; overflow:hidden; margin-top:30px; }}
.mm-loader:after {{ content:''; display:block; height:100%; width:0; background:linear-gradient(90deg,var(--blue),var(--purple)); animation:mmLoad 1.45s ease forwards; }}
.mm-splash-status {{ color:#94A3B8; font-size:12px; margin-top:13px; }}
@keyframes mmLoad {{ to {{ width:100%; }} }}
@keyframes mmFade {{ to {{ opacity:0; visibility:hidden; }} }}

/* ---------- fixed navigation ---------- */
.mm-topbar {{
  position:fixed; top:0; left:0; right:0; z-index:99998; height:92px;
  display:flex; align-items:center; gap:16px; padding:0 32px;
  background: linear-gradient(90deg, #0D1117 0%, #161B22 50%, #0D1117 100%);
  box-shadow: 0 8px 32px rgba(0,0,0,.6);
  border-bottom: 1px solid rgba(15,163,177,.2);
  backdrop-filter: blur(12px);
}}
.mm-nav-brand {{ min-width:220px; color:#fff!important; text-decoration:none!important; display: flex; align-items: center; gap: 12px; }}
.mm-nav-brand-mark {{ width:48px; height:48px; border-radius:12px; background: linear-gradient(135deg, #0FA3B1 0%, #06C8D9 100%); color:#fff; display:grid; place-items:center; font-weight:900; font-size:22px; box-shadow: 0 8px 24px rgba(15,163,177,.4); }}
.mm-nav-brand-main {{ font-size:22px; font-weight:850; letter-spacing:-.04em; background: linear-gradient(135deg, #0FA3B1 0%, #06C8D9 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }}
.mm-nav-brand-sub {{ display:block; font-size:10px; letter-spacing:.15em; font-weight:700; opacity:.75; margin-top:2px; color: #40A9B5; }}
.mm-nav {{ flex:1; display:flex; justify-content:center; align-items:center; gap:8px; overflow-x:auto; scrollbar-width:none; white-space:nowrap; }}
.mm-nav::-webkit-scrollbar {{ display:none; }}
.mm-nav a {{ 
  position:relative; z-index:1; color:#B0B3B8!important; text-decoration:none!important; font-size:13px; font-weight:650; 
  padding:10px 16px; border-radius:8px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
  display:inline-block; cursor:pointer; pointer-events:auto;
  border: 1px solid transparent;
}}
.mm-nav a:hover {{ 
  background: rgba(15,163,177,.25); 
  border-color: rgba(15,163,177,.5);
  color: #06C8D9 !important;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(15,163,177,.25);
}}
.mm-nav a.active {{
  background: rgba(15,163,177,.35);
  border-color: #0FA3B1;
  color: #06C8D9 !important;
  box-shadow: 0 0 20px rgba(15,163,177,.4);
}}
.mm-live {{ white-space:nowrap; color:#fff; background:linear-gradient(135deg, rgba(15,163,177,.3) 0%, rgba(99,102,241,.2) 100%); border:1px solid rgba(15,163,177,.5); border-radius:20px; padding:8px 14px; font-size:11px; font-weight:800; display: flex; align-items: center; gap: 6px; box-shadow: 0 0 16px rgba(15,163,177,.25); }}
.mm-live-dot {{ color:#0FA3B1; animation: pulse 2s infinite; }}
@keyframes pulse {{ 0%, 100% {{ opacity: 1; }} 50% {{ opacity: 0.6; }} }}

/* ---------- page sections/cards ---------- */
.anchor-target {{ display:block; scroll-margin-top:100px; height:1px; }}
.mm-section {{ scroll-margin-top:100px; margin-bottom:24px; }}
.mm-card {{ 
  background: var(--paper); 
  border: 1px solid #2D333B;
  border-radius: 16px; 
  box-shadow: 0 4px 12px rgba(0,0,0,.4);
  padding: 28px 32px; 
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}}
.mm-card::before {{
  content: '';
  position: absolute;
  top: -40%;
  right: -40%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(15,163,177,.08) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}}
.mm-card:hover {{
  border-color: rgba(15,163,177,.35);
  box-shadow: 0 8px 24px rgba(15,163,177,.12);
  transform: translateY(-2px);
}}
.mm-title {{ color:var(--text-light); font-size:26px; line-height:1.2; font-weight:750; margin:0; letter-spacing:-.025em; background: linear-gradient(135deg, #FFFFFF 0%, #40A9B5 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }}
.mm-sub {{ color:#B0B3B8; font-size:14px; line-height:1.65; margin-top:7px; }}
.mm-eyebrow {{ color:#0FA3B1; text-transform:uppercase; letter-spacing:.13em; font-size:10px; font-weight:800; }}
.mm-metric {{ background:#0D1117; border:1px solid #2D333B; border-radius:15px; padding:16px 17px; height:100%; }}
.mm-metric label {{ display:block; color:#8B90A3; font-size:11px; font-weight:600; margin-bottom:7px; }}
.mm-metric strong {{ display:block; color:var(--text-light); font-size:19px; font-weight:750; }}
.mm-metric span {{ display:block; color:#B0B3B8; font-size:11px; margin-top:5px; line-height:1.4; }}

/* ---------- hero ---------- */
.hero {{ min-height:200px; display:flex; align-items:center; background: linear-gradient(135deg, rgba(15,163,177,.08) 0%, rgba(99,102,241,.05) 100%); border-radius: 16px; padding: 24px; margin: -28px -32px 0 -32px; }}
.hero h1 {{ 
  color: var(--text-light); 
  font-size: 42px; 
  margin: 8px 0 12px;
  letter-spacing: -.045em;
  background: linear-gradient(135deg, #06C8D9 0%, #40A9B5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 900;
}}
.hero p {{ color:#B0B3B8; max-width:850px; font-size:15px; line-height:1.7; margin:0; }}
.hero-chips {{ display:flex; flex-wrap:wrap; gap:10px; margin-top:20px; }}
.hero-chip {{ 
  border: 1px solid rgba(15,163,177,.4); 
  background: linear-gradient(135deg, rgba(15,163,177,.1) 0%, rgba(99,102,241,.08) 100%);
  color: #0EADC6; 
  border-radius: 20px; 
  padding: 10px 14px; 
  font-size: 11px; 
  font-weight: 750;
  letter-spacing: 0.05em;
  transition: all 0.3s ease;
}}
.hero-chip:hover {{
  border-color: #0FA3B1;
  background: rgba(15,163,177,.2);
  box-shadow: 0 4px 12px rgba(15,163,177,.25);
  transform: translateY(-2px);
}}

/* ---------- sticky recommendation panel ---------- */

.sticky-panel {{
    position: fixed !important;
    top: 100px !important;
    right: 24px !important;
    width: 360px !important;
    max-height: calc(100vh - 120px) !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    z-index: 2147483647 !important;
    margin: 0 !important;
    transform: translateZ(0) !important;
}}

.sticky-panel::-webkit-scrollbar {{
    width: 6px;
}}

.sticky-panel::-webkit-scrollbar-thumb {{
    background: #C8D0C6;
    border-radius: 10px;
}}

@media (max-width: 1200px) {{
    .sticky-panel {{
        width: 320px !important;
        right: 16px !important;
    }}
}}

@media (max-width: 900px) {{
    .sticky-panel {{
        position: fixed !important;
        top: 90px !important;
        right: 12px !important;
        width: 320px !important;
        max-width: calc(100vw - 24px) !important;
        max-height: calc(100vh - 105px) !important;
        overflow-y: auto !important;
        z-index: 2147483647 !important;
    }}
}}

.ai-panel {{
    background: #0D1117;
    border: 1px solid #0FA3B1;
    border-radius: 22px;
    box-shadow: 0 12px 35px rgba(15,163,177,.25);
    overflow: hidden;
}}

.ai-panel-head {{
    padding: 22px 21px 18px;
    border-bottom: 1px solid #2D333B;
}}

.ai-panel-title {{
    color: var(--text-light);
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -.025em;
}}

.ai-panel-sub {{
    color: #B0B3B8;
    font-size: 12px;
    line-height: 1.55;
    margin-top: 5px;
}}

.ai-signal {{
    margin: 18px 21px;
    padding: 17px;
    border-radius: 16px;
    background: linear-gradient(135deg,rgba(15,163,177,.15),rgba(99,102,241,.1));
    border: 1px solid rgba(15,163,177,.3);
}}

.ai-signal-label {{
    color: #8B90A3;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: .11em;
    font-weight: 800;
}}

.ai-signal-value {{
    color: #06C8D9;
    font-size: 27px;
    font-weight: 800;
    margin-top: 3px;
}}

.ai-score {{
    color: var(--text-light);
    font-size: 12px;
    font-weight: 700;
    margin-top: 3px;
}}

.ai-list {{
    padding: 0 21px 21px;
}}

.ai-list-row {{
    display: flex;
    justify-content: space-between;
    gap: 10px;
    padding: 11px 0;
    border-bottom: 1px solid #2D333B;
    font-size: 12px;
}}

.ai-list-row span {{
    color: #8B90A3;
}}

.ai-list-row b {{
    color: var(--text-light);
}}

.ai-why {{
    margin-top: 14px;
    padding: 13px;
    background: rgba(15,163,177,.1);
    border-left: 3px solid #0FA3B1;
    border-radius: 9px;
    color: #06C8D9;
    font-size: 11px;
    line-height: 1.6;
}}

.ai-cta {{
    display: block;
    text-align: center;
    margin-top: 16px;
    padding: 12px;
    border-radius: 10px;
    background: linear-gradient(90deg,#0FA3B1,#06C8D9);
    color: #fff !important;
    text-decoration: none !important;
    font-weight: 800;
    font-size: 12px;
    transition: all 0.3s ease;
}}
.ai-cta:hover {{
    background: linear-gradient(90deg,#06C8D9,#0EADC6);
    box-shadow: 0 8px 24px rgba(15,163,177,.4);
    transform: translateY(-2px);
}}
/* ---------- risk meter ---------- */
.risk-box {{ text-align:center; padding:5px 0 3px; }}
.risk-gauge {{ width:260px; height:130px; margin:8px auto 0; position:relative; overflow:hidden; border-radius:260px 260px 0 0; background:conic-gradient(from 270deg at 50% 100%,#00D084 0 20%,#FFB81C 20% 40%,#FFB81C 40% 57%,#FF5366 57% 77%,#E41E49 77% 100%); }}
.risk-gauge:after {{ content:''; position:absolute; left:27px; right:27px; bottom:-1px; height:99px; border-radius:200px 200px 0 0; background:#161B22; }}
.risk-needle {{ position:absolute; z-index:3; left:50%; bottom:5px; width:4px; height:90px; background:#FFFFFF; transform-origin:50% 100%; border-radius:6px; }}
.risk-dot {{ position:absolute; z-index:4; left:calc(50% - 8px); bottom:-1px; width:16px; height:16px; border-radius:50%; background:#FFFFFF; }}
.risk-scale {{ display:flex; justify-content:space-between; width:260px; margin:7px auto 0; color:#B0B3B8; font-size:9px; font-weight:700; }}
.risk-label {{ color:var(--text-light); font-size:12px; font-weight:850; margin-top:6px; }}

/* ---------- charts ---------- */
.chart-note {{ color:#526071; font-size:12px; margin:7px 0 12px; }}

/* ---------- Tata-style returns ---------- */
.returns-wrap {{ overflow-x:auto; border:1px solid #2D333B; border-radius:16px; }}
.returns-table {{ width:100%; min-width:920px; border-collapse:separate; border-spacing:0; font-size:13px; overflow:hidden; }}
.returns-table th {{ padding:15px 11px; color:#FFFFFF; background:linear-gradient(90deg,#0FA3B1,#4F46E5); text-align:center; font-weight:750; border-right:1px solid rgba(255,255,255,.15); }}
.returns-table td {{ padding:14px 11px; border-top:1px solid #2D333B; text-align:center; color:#FFFFFF; background:#161B22; }}
.returns-table td:first-child {{ text-align:left; font-weight:700; background:#0D1117; }}
.returns-table .green {{ color:#00D084; font-weight:800; }}
.disclaimer {{ color:#B0B3B8; font-size:11px; margin-top:10px; }}

/* ---------- company cards ---------- */
.company-card {{ background:#161B22; border:1px solid #2D333B; border-radius:19px; padding:20px; box-shadow:0 4px 12px rgba(0,0,0,.4); height:100%; }}
.company-top {{ display:flex; justify-content:space-between; gap:10px; align-items:flex-start; }}
.company-name {{ color:var(--text-light); font-size:17px; font-weight:800; }}
.company-ticker {{ color:#8B90A3; font-size:10px; margin-top:3px; }}
.company-score {{ color:#0FA3B1; font-size:25px; font-weight:850; line-height:1; }}
.signal-pill {{ display:inline-block; margin-top:9px; padding:6px 10px; border-radius:16px; background:rgba(15,163,177,.15); color:#0EADC6; font-size:10px; font-weight:800; }}
.signal-pill.neutral {{ background:#2D333B; color:#8B90A3; }}
.signal-pill.negative {{ background:rgba(255,83,102,.15); color:#FF5366; }}
.company-row {{ display:flex; justify-content:space-between; gap:10px; padding-top:9px; margin-top:9px; border-top:1px solid #2D333B; font-size:11px; }}
.company-row span {{ color:#8B90A3; }} .company-row b {{ color:var(--text-light); }}

/* ---------- FAQ collapsed ---------- */
.faq-list {{ border-top:1px solid #2D333B; margin-top:16px; }}
.faq-item {{ border-bottom:1px solid #2D333B; }}
.faq-item summary {{ list-style:none; cursor:pointer; padding:18px 4px; color:var(--text-light); font-size:15px; font-weight:700; display:flex; align-items:center; justify-content:space-between; gap:20px; }}
.faq-item summary::-webkit-details-marker {{ display:none; }}
.faq-item summary:after {{ content:'+'; width:28px; height:28px; display:grid; place-items:center; border-radius:50%; background:rgba(15,163,177,.15); color:#0FA3B1; font-size:19px; flex:none; }}
.faq-item[open] summary:after {{ content:'−'; }}
.faq-answer {{ color:#B0B3B8; font-size:13px; line-height:1.7; padding:0 32px 18px 4px; }}

/* ---------- sidebar ---------- */
section[data-testid="stSidebar"] {{ background:linear-gradient(180deg,#161B22 0%,#0D1117 100%); border-right:1px solid #2D333B; }}
section[data-testid="stSidebar"] .block-container {{ padding-top:1.2rem; }}
.mm-side-logo {{ display:flex; align-items:center; gap:10px; margin-bottom:17px; }}
.mm-side-mark {{ width:36px; height:36px; border-radius:10px; background:linear-gradient(145deg,#0FA3B1,#06C8D9); color:#fff; display:grid; place-items:center; font-weight:900; }}
.mm-side-name {{ color:var(--text-light); font-size:18px; font-weight:850; }}
.mm-side-sub {{ color:#8B90A3; font-size:10px; margin-top:2px; }}
.company-directory {{ margin-top:12px; padding-top:13px; border-top:1px solid #2D333B; }}
.directory-item {{ padding:8px 0; border-bottom:1px solid #2D333B; }}
.directory-name {{ color:var(--text-light); font-size:11px; font-weight:750; }}
.directory-ticker {{ color:#8B90A3; font-size:9px; margin-top:2px; }}

/* ---------- bottom company directory ---------- */
.bottom-company {{ background:#161B22; border:1px solid #2D333B; border-radius:18px; padding:17px; height:100%; }}
.bottom-company strong {{ color:var(--text-light); font-size:13px; }}
.bottom-company span {{ display:block; color:#8B90A3; font-size:10px; margin-top:4px; line-height:1.45; }}

/* ---------- selected-company news ---------- */
.news-grid {{ display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:13px; margin-top:18px; }}
.news-card {{ display:flex; flex-direction:column; min-height:285px; overflow:hidden; background:#161B22; border:1px solid #2D333B; border-radius:16px; box-shadow:0 5px 16px rgba(0,0,0,.3); }}
.news-image {{ width:100%; height:135px; object-fit:cover; background:#0D1117; }}
.news-image-placeholder {{ display:grid; place-items:center; width:100%; height:135px; background:linear-gradient(135deg,#0FA3B1,#06C8D9); color:#FFFFFF; font-size:11px; font-weight:800; letter-spacing:.08em; }}
.news-content {{ display:flex; flex:1; flex-direction:column; padding:15px 17px 17px; }}
.news-meta {{ color:#8B90A3; font-size:11px; font-weight:700; }}
.news-title {{ color:var(--text-light); font-size:15px; line-height:1.45; font-weight:750; margin-top:10px; }}
.news-sentiment {{ display:inline-flex; align-self:flex-start; margin-top:12px; padding:5px 8px; border-radius:12px; background:rgba(0,208,132,.15); color:#00D084; font-size:10px; font-weight:800; }}
.news-sentiment.negative {{ background:rgba(255,83,102,.15); color:#FF5366; }}
.news-sentiment.neutral {{ background:#F1F5F9; color:#475569; }}
.news-link {{ color:var(--green)!important; text-decoration:none!important; font-size:11px; font-weight:800; margin-top:auto; padding-top:14px; }}
.news-empty {{ margin-top:18px; padding:18px; border:1px dashed #B8C5CF; border-radius:14px; color:#526071; background:#F8FAFC; font-size:13px; }}
.data-grid {{ display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:12px; margin-top:18px; }}

/* ---------- plain-language company comparison ---------- */
.comparison-list {{ display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; margin-top:18px; }}
.comparison-card {{ background:#fff; border:1px solid #D8E1E7; border-radius:17px; padding:18px; }}
.comparison-head {{ display:flex; justify-content:space-between; gap:12px; align-items:flex-start; }}
.comparison-rank {{ color:var(--green); font-size:11px; font-weight:850; text-transform:uppercase; letter-spacing:.08em; }}
.comparison-name {{ color:var(--navy); font-size:17px; font-weight:800; margin-top:4px; }}
.comparison-view {{ color:var(--green); background:#EEF6F5; border-radius:14px; padding:6px 9px; font-size:11px; font-weight:800; white-space:nowrap; }}
.comparison-view.negative {{ color:var(--deep-red); background:#FEF1F0; }}
.comparison-view.neutral {{ color:#475569; background:#F1F5F9; }}
.comparison-summary {{ color:#475569; font-size:13px; line-height:1.55; margin-top:13px; }}
.comparison-tags {{ display:flex; flex-wrap:wrap; gap:7px; margin-top:14px; }}
.comparison-tag {{ border:1px solid #D8E1E7; border-radius:14px; padding:5px 8px; color:#475569; font-size:10px; font-weight:750; }}

@media(max-width:1050px) {{
  .mm-topbar {{ gap:10px; padding:0 12px; }} .mm-nav-brand {{ min-width:150px; }} .mm-nav a {{ font-size:11px; padding:9px 8px; }} .mm-live {{ display:none; }}
  .news-grid {{ grid-template-columns:repeat(2,minmax(0,1fr)); }}
  .data-grid {{ grid-template-columns:repeat(2,minmax(0,1fr)); }}
  .comparison-list {{ grid-template-columns:1fr; }}
}}
@media(max-width:760px) {{
  .block-container {{ padding:96px 1rem 3rem; }} .mm-nav {{ display:none; }} .mm-nav-brand {{ min-width:auto; }} .mm-card {{ padding:21px; }} .hero h1 {{ font-size:30px; }} .risk-gauge,.risk-scale {{ width:220px; }}
  .news-grid {{ grid-template-columns:1fr; }}
  .data-grid {{ grid-template-columns:1fr; }}
}}

/* ---------- calculator layout ---------- */
/* Keep the calculator directly after the Analytics indicators. */
#calculator {{
    margin-top: -20px;
}}

#calculator + section {{
    min-height: 0 !important;
    overflow: visible !important;
    padding-bottom: 0 !important;
    margin-bottom: 0 !important;
}}

/* Calculator labels */
div[data-testid="stRadio"] label,
div[data-testid="stNumberInput"] label,
div[data-testid="stSlider"] label {{
    color: #18263D !important;
    font-weight: 650 !important;
}}

/* Radio text */
div[data-testid="stRadio"] label p {{
    color: #18263D !important;
}}

/* Number input text */
div[data-testid="stNumberInput"] input {{
    color: #FFFFFF !important;
}}

/* Slider labels and values */
div[data-testid="stSlider"] label p {{
    color: #18263D !important;
}}

div[data-testid="stSlider"] [data-testid="stTickBarMin"],
div[data-testid="stSlider"] [data-testid="stTickBarMax"] {{
    color: #53606F !important;
}}

/* Keep calculator columns fully visible */
#calculator + section .mm-card {{
    overflow: visible !important;
}}

</style>

<div class="mm-splash">
  <div class="mm-splash-inner">
    <div class="mm-logo"><div class="mm-logo-mark">M</div><div class="mm-logo-name">Market<span>Mind</span> AI</div></div>
    <div class="mm-splash-sub">AI-powered market intelligence, risk analysis and research</div>
    <div class="mm-loader"></div>
    <div class="mm-splash-status">Loading market data · technical engine · sentiment · AI model...</div>
  </div>
</div>
""", unsafe_allow_html=True)

# ============================================================
# DATA / HELPERS
# ============================================================
STOCKS = {
    "Reliance Industries": "RELIANCE.NS",
    "TCS": "TCS.NS",
    "Infosys": "INFY.NS",
    "HDFC Bank": "HDFCBANK.NS",
    "ICICI Bank": "ICICIBANK.NS",
    "ITC": "ITC.NS",
    "Larsen & Toubro": "LT.NS",
    "Apple": "AAPL",
    "Microsoft": "MSFT",
    "Tesla": "TSLA",
}

COMPANY_INFO = {
    "Reliance Industries": ("Energy, retail and digital services", "Diversified conglomerate", "NSE / BSE"),
    "TCS": ("IT services and consulting", "Information Technology", "NSE / BSE"),
    "Infosys": ("IT services and digital consulting", "Information Technology", "NSE / BSE"),
    "HDFC Bank": ("Banking and financial services", "Private Sector Bank", "NSE / BSE"),
    "ICICI Bank": ("Banking and financial services", "Private Sector Bank", "NSE / BSE"),
    "ITC": ("FMCG, hotels, paper and agribusiness", "Diversified", "NSE / BSE"),
    "Larsen & Toubro": ("Engineering, construction and infrastructure", "Industrials", "NSE / BSE"),
    "Apple": ("Consumer technology and services", "Technology", "NASDAQ"),
    "Microsoft": ("Software, cloud and enterprise technology", "Technology", "NASDAQ"),
    "Tesla": ("Electric vehicles and energy products", "Automotive / Energy", "NASDAQ"),
}


def safe_float(v, default=0.0):
    try:
        if pd.isna(v):
            return default
        return float(v)
    except Exception:
        return default


@st.cache_data(show_spinner=False)
def load_stock_data(ticker, start_date, end_date):
    try:
        df = yf.download(
            ticker,
            start=str(start_date),
            end=str(end_date + timedelta(days=1)),
            progress=False,
            auto_adjust=False,
            threads=False,
        )
        return df if df is not None else pd.DataFrame()
    except Exception:
        return pd.DataFrame()


def clean_stock_data(df):
    if df is None or df.empty:
        return pd.DataFrame()
    d = df.copy()
    if isinstance(d.columns, pd.MultiIndex):
        d.columns = d.columns.get_level_values(0)
    d = d.reset_index()
    d = d.loc[:, ~d.columns.duplicated()]
    if "Date" not in d.columns:
        return pd.DataFrame()
    d["Date"] = pd.to_datetime(d["Date"], errors="coerce")
    try:
        if d["Date"].dt.tz is not None:
            d["Date"] = d["Date"].dt.tz_localize(None)
    except Exception:
        pass
    required = ["Open", "High", "Low", "Close", "Volume"]
    if any(c not in d.columns for c in required):
        return pd.DataFrame()
    return d.dropna(subset=["Open", "High", "Low", "Close"]).sort_values("Date").reset_index(drop=True)


def chart_layout(fig, title, height=430):
    fig.update_layout(
        title=dict(text=title, font=dict(size=18, color=PALETTE["navy"]), x=.02),
        height=height,
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="#FFFFFF",
        font=dict(family="Inter, sans-serif", color="#4F5C6B"),
        margin=dict(l=48, r=20, t=58, b=42),
        hovermode="x unified",
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
        xaxis=dict(showgrid=False, linecolor="#D9DED7"),
        yaxis=dict(gridcolor="#E9ECE7", zeroline=False),
    )
    return fig


def risk_from_volatility(volatility):
    if volatility < 15:
        return "Low", 18
    if volatility < 25:
        return "Moderate", 40
    if volatility < 35:
        return "Moderately High", 62
    if volatility < 50:
        return "High", 82
    return "Very High", 94


def render_risk_meter(label, position):
    angle = -65 + min(max(position, 0), 100) * 1.3
    st.markdown(f"""
    <div class="risk-box">
      <div class="risk-gauge">
        <div class="risk-needle" style="transform:rotate({angle:.1f}deg)"></div>
        <div class="risk-dot"></div>
      </div>
      <div class="risk-scale"><span>LOW</span><span>MODERATE</span><span>HIGH</span></div>
      <div class="risk-label">{label}</div>
    </div>
    """, unsafe_allow_html=True)


def recommendation_score(df, predicted=None, sentiment_score=0):
    if df.empty:
        return "Neutral", "neutral", 50, "Not enough data to generate a research signal."
    score = 50
    reasons = []
    current = safe_float(df["Close"].iloc[-1])
    if predicted is not None and current:
        pct = (predicted - current) / current * 100
        score += 18 if pct >= 2 else 9 if pct >= .5 else -18 if pct <= -2 else -9 if pct <= -.5 else 0
        reasons.append(f"model outlook {pct:+.1f}%")
    if "RSI" in df.columns and not df["RSI"].dropna().empty:
        rsi = safe_float(df["RSI"].dropna().iloc[-1], 50)
        if 45 <= rsi <= 65:
            score += 7; reasons.append("RSI is constructive")
        elif rsi < 30:
            score += 5; reasons.append("RSI is oversold")
        elif rsi > 70:
            score -= 6; reasons.append("RSI is overbought")
    if "MACD" in df.columns and "MACD_Signal" in df.columns:
        m = df[["MACD", "MACD_Signal"]].dropna()
        if not m.empty:
            if safe_float(m["MACD"].iloc[-1]) > safe_float(m["MACD_Signal"].iloc[-1]):
                score += 6; reasons.append("MACD trend is supportive")
            else:
                score -= 6; reasons.append("MACD trend is weaker")
    if sentiment_score > .10:
        score += 5; reasons.append("recent news sentiment is positive")
    elif sentiment_score < -.10:
        score -= 5; reasons.append("recent news sentiment is negative")
    score = max(0, min(100, score))
    if score >= 70:
        return "Positive", "positive", score, "; ".join(reasons[:3]) or "Multiple signals are supportive."
    if score >= 55:
        return "Constructive", "positive", score, "; ".join(reasons[:3]) or "Signals lean positive."
    if score <= 35:
        return "Cautious", "negative", score, "; ".join(reasons[:3]) or "Signals show elevated uncertainty."
    return "Neutral", "neutral", score, "; ".join(reasons[:3]) or "Signals are mixed."


@st.cache_data(show_spinner=False)
def scan_market_candidates(start_date, end_date, investor_style):
    rows = []
    for name, symbol in STOCKS.items():
        try:
            d = clean_stock_data(load_stock_data(symbol, start_date, end_date))
            if d.empty:
                continue
            d = engineer_features(d)
            pred, r2 = None, 0.0
            try:
                ml_data = prepare_ml_data(d)
                result = train_random_forest(ml_data)
                p = create_prediction_dataframe(result)
                if not p.empty:
                    pred = safe_float(p["Predicted"].iloc[-1], None)
                r2 = safe_float(result.get("r2", 0))
            except Exception:
                pass
            sent = 0.0
            try:
                n = load_stock_news(symbol, limit=8)
                n = add_sentiment_scores(clean_news_data(n))
                if not n.empty:
                    sent = safe_float(get_sentiment_summary(n).get("average_score", 0))
            except Exception:
                pass
            price = safe_float(d["Close"].iloc[-1])
            forecast_pct = ((pred - price) / price * 100) if pred is not None and price else 0
            vol = safe_float(d["Close"].pct_change().dropna().std() * (252 ** .5) * 100)
            risk, risk_pos = risk_from_volatility(vol)
            signal, cls, ai_score, reason = recommendation_score(d, pred, sent)
            rank = ai_score + max(min(forecast_pct * 2, 15), -15) + max(min(sent * 12, 6), -6)
            if investor_style == "Conservative":
                rank -= vol * .25
            elif investor_style == "Growth":
                rank += max(min(forecast_pct, 8), -8) * .4
            rows.append({
                "Company": name, "Ticker": symbol, "Price": price, "Forecast": pred,
                "Forecast %": forecast_pct, "Signal": signal, "Signal Class": cls,
                "AI Score": ai_score, "Risk": risk, "Risk Pos": risk_pos,
                "Volatility %": vol, "R²": r2, "Reason": reason, "Rank": rank,
            })
        except Exception:
            continue
    if not rows:
        return pd.DataFrame()
    return pd.DataFrame(rows).sort_values(["Rank", "AI Score"], ascending=False).reset_index(drop=True)

# ============================================================
# SIDEBAR CONTROLS + COMPANY DIRECTORY
# ============================================================
st.sidebar.markdown("""
<div class="mm-side-logo">
  <div class="mm-side-mark">M</div>
  <div><div class="mm-side-name">MarketMind AI</div><div class="mm-side-sub">MARKET INTELLIGENCE</div></div>
</div>
""", unsafe_allow_html=True)

st.sidebar.markdown("### Analysis controls")
selected_stock = st.sidebar.selectbox("Company", list(STOCKS.keys()), index=0)
ticker = STOCKS[selected_stock]
today = date.today()
start_date = st.sidebar.date_input("Start date", today - timedelta(days=365))
end_date = st.sidebar.date_input("End date", today)
investor_style = st.sidebar.selectbox("Research profile", ["Balanced", "Conservative", "Growth"])

st.sidebar.markdown("""
<div class="company-directory"><b style="color:#18263D;font-size:12px">Companies covered</b></div>
""", unsafe_allow_html=True)
for company, symbol in STOCKS.items():
    st.sidebar.markdown(
        f'<div class="directory-item"><div class="directory-name">{company}</div><div class="directory-ticker">{symbol}</div></div>',
        unsafe_allow_html=True,
    )
st.sidebar.caption("Signals are model-generated research aids, not personalized financial advice.")

if start_date >= end_date:
    st.error("Start date must be earlier than end date.")
    st.stop()

# ============================================================
# LOAD SELECTED DATA
# ============================================================
with st.spinner(f"Loading {selected_stock} market data..."):
    df = clean_stock_data(load_stock_data(ticker, start_date, end_date))
if df.empty:
    st.error(f"No market data found for {ticker}.")
    st.stop()
try:
    df = engineer_features(df)
except Exception as exc:
    st.warning(f"Technical indicators could not be calculated: {exc}")

ml_result = None
prediction_df = pd.DataFrame()
latest_predicted = None
try:
    ml_data = prepare_ml_data(df)
    ml_result = train_random_forest(ml_data)
    prediction_df = create_prediction_dataframe(ml_result)
    if not prediction_df.empty and "Predicted" in prediction_df.columns:
        latest_predicted = safe_float(prediction_df["Predicted"].iloc[-1], None)
except Exception:
    pass

news_df = pd.DataFrame()
summary = {"overall_sentiment":"Neutral", "average_score":0}
try:
    news_df = add_sentiment_scores(clean_news_data(load_stock_news(ticker, limit=10)))
    if not news_df.empty:
        summary = get_sentiment_summary(news_df)
except Exception:
    pass

sentiment_score = safe_float(summary.get("average_score", 0))
signal, signal_class, ai_score, signal_reason = recommendation_score(df, latest_predicted, sentiment_score)
current = safe_float(df["Close"].iloc[-1])
first = safe_float(df["Close"].iloc[0])
change_pct = ((current - first) / first * 100) if first else 0
high = safe_float(df["High"].max())
low = safe_float(df["Low"].min())
avg_volume = safe_float(df["Volume"].mean())
volatility = safe_float(df["Close"].pct_change().dropna().std() * (252 ** .5) * 100)
risk_label, risk_position = risk_from_volatility(volatility)

# ============================================================
# FIXED TOP NAV — PROFESSIONAL AI NAVIGATION WITH SMOOTH SCROLLING
# ============================================================
nav = [
    ("nav", "Market Performance"), 
    ("markets", "🎯 Analytics"),
    ("news", "Recent News"), 
    ("ai-signal", "AI Recommended Companies"),
    ("quick-decision-guide", "Quick Decision Guide"),
    ("actual-vs-predicted", "Actual vs Predicted"),
    ("data-sources", "Transparency"),
]

nav_html = "".join([f'<a href="#{anchor}" class="nav-link" data-section="{anchor}">{label}</a>' for anchor, label in nav])

st.markdown(f"""
<div class="mm-topbar">
  <a class="mm-nav-brand" href="#overview">
    <div class="mm-nav-brand-mark">📈</div>
    <div>
      <div class="mm-nav-brand-main">MarketMind AI</div>
      <span class="mm-nav-brand-sub">AI INTELLIGENCE</span>
    </div>
  </a>
  <nav class="mm-nav">{nav_html}</nav>
  <div class="mm-live"><span class="mm-live-dot">●</span> LIVE DATA</div>
</div>

<script>
// Smooth scroll and active nav link detection
document.addEventListener('DOMContentLoaded', function() {{
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('[id]');
  
  // Smooth scroll on click
  navLinks.forEach(link => {{
    link.addEventListener('click', function(e) {{
      e.preventDefault();
      const target = this.getAttribute('href').substring(1);
      const element = document.getElementById(target);
      if (element) {{
        element.scrollIntoView({{ behavior: 'smooth', block: 'start' }});
        // Update active state
        updateActiveNav(target);
      }}
    }});
  }});
  
  // Update active nav on scroll
  window.addEventListener('scroll', () => {{
    let currentSection = '';
    sections.forEach(section => {{
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (window.pageYOffset >= sectionTop - 150) {{
        currentSection = section.getAttribute('id');
      }}
    }});
    if (currentSection) updateActiveNav(currentSection);
  }});
  
  function updateActiveNav(activeId) {{
    navLinks.forEach(link => {{
      link.classList.remove('active');
      if (link.getAttribute('data-section') === activeId) {{
        link.classList.add('active');
      }}
    }});
  }}
}});
</script>
""", unsafe_allow_html=True)

# ============================================================
# ONE PAGE LAYOUT: LEFT CONTENT + STICKY RIGHT RECOMMENDATION
# The right panel is intentionally outside all individual sections,
# so it stays in the same position while the left side scrolls.
# ============================================================
main_col, side_col = st.columns([2.55, .92], gap="large")

with main_col:
    # --------------------------------------------------------
    # OVERVIEW
    # --------------------------------------------------------
    st.markdown('<div id="overview" class="anchor-target"></div><section class="mm-section">', unsafe_allow_html=True)
    st.markdown(f"""
    <div class="mm-card hero">
      <div>
        <div class="mm-eyebrow">MarketMind AI · Equity Intelligence · {ticker}</div>
        <h1>{selected_stock}</h1>
        <p>One professional workspace for market history, technical analysis, machine-learning forecasting, risk analysis and AI-assisted research ranking.</p>
        <div class="hero-chips">
          <span class="hero-chip">AI ANALYSIS ACTIVE</span>
          <span class="hero-chip">RISK · {risk_label.upper()}</span>
          <span class="hero-chip">AI SCORE · {ai_score}/100</span>
          <span class="hero-chip">PROFILE · {investor_style.upper()}</span>
        </div>
      </div>
    </div>
    <div class="mm-card">
      <div class="mm-title">Overview</div>
      <div class="mm-sub">MarketMind AI is an intelligent stock market research platform that combines machine learning, technical analysis, financial news sentiment, and risk analysis to generate data-driven stock insights and recommendations.</div>
      <div style="height:16px"></div>
    """, unsafe_allow_html=True)
    mc = st.columns(5)
    vals = [
        ("Current Price", f"₹{current:,.2f}", ticker),
        ("Period Return", f"{change_pct:+.2f}%", f"{start_date} → {end_date}"),
        ("Period High", f"₹{high:,.2f}", "selected period"),
        ("Period Low", f"₹{low:,.2f}", "selected period"),
        ("Avg Volume", f"{avg_volume:,.0f}", "daily average"),
    ]
    for col, (lab, val, sub) in zip(mc, vals):
        col.markdown(f'<div class="mm-metric"><label>{lab}</label><strong>{val}</strong><span>{sub}</span></div>', unsafe_allow_html=True)
    st.markdown('</div></section>', unsafe_allow_html=True)

    # --------------------------------------------------------
    # MARKETS / NAV
    # --------------------------------------------------------
    st.markdown('<div id="nav" class="anchor-target"></div><section class="mm-section">', unsafe_allow_html=True)
    st.markdown('<div class="mm-card"><div class="mm-title">Market Performance</div><div class="mm-sub">Interactive price history with moving-average context. Use the chart controls to zoom, pan or open a larger view.</div>', unsafe_allow_html=True)
    fig_nav = go.Figure()
    fig_nav.add_trace(go.Scatter(x=df["Date"], y=df["Close"], name="Price", mode="lines", line=dict(color=PALETTE["green"], width=2.7), fill="tozeroy", fillcolor="rgba(15,118,110,.07)"))
    if "SMA_20" in df.columns:
        fig_nav.add_trace(go.Scatter(x=df["Date"], y=df["SMA_20"], name="SMA 20", mode="lines", line=dict(color=PALETTE["cyan"], width=1.8)))
    chart_layout(fig_nav, f"{selected_stock} — Price Trend", 455)
    st.plotly_chart(fig_nav, use_container_width=True, key="nav_chart", config={"displayModeBar": True, "displaylogo": False, "responsive": True, "modeBarButtonsToAdd": ["fullscreen"]})
    st.markdown('</div></section>', unsafe_allow_html=True)

    # --------------------------------------------------------
    # ANALYTICS / SUMMARY
    # --------------------------------------------------------
    st.markdown('<div id="markets" class="anchor-target"></div><section class="mm-section">', unsafe_allow_html=True)
    st.markdown(f"""
    <div class="mm-card">
      <div class="mm-eyebrow">AI market snapshot</div>
      <div class="mm-title">Analytics</div>
      <div class="mm-sub">The signal combines the Random Forest forecast with technical indicators and recent news sentiment.</div>
      <div style="height:16px"></div>
      <div class="reco" style="background:linear-gradient(135deg,#F4F7EF,#FFFFFF);border:1px solid #DCE3D6;border-radius:17px;padding:20px">
        <div style="display:flex;justify-content:space-between;gap:20px;align-items:center;flex-wrap:wrap">
          <div><div class="mm-eyebrow">Current AI Signal</div><div style="font-size:26px;font-weight:850;color:{PALETTE['green']};margin-top:4px">{signal}</div><span class="signal-pill {'negative' if signal_class=='negative' else 'neutral' if signal_class=='neutral' else ''}">AI SCORE {ai_score}/100</span></div>
          <div style="text-align:right"><div style="color:#596575;font-size:11px">Latest model forecast</div><div style="font-size:28px;font-weight:850;color:{PALETTE['navy']}">{'₹{:,.2f}'.format(latest_predicted) if latest_predicted is not None else '—'}</div></div>
        </div>
        <div class="ai-why"><b>Why this signal?</b> {signal_reason}</div>
      </div>
    </div>
    """, unsafe_allow_html=True)
    ind = st.columns(4)
    indicator_values = []
    indicator_values.append(("RSI", f"{safe_float(df['RSI'].dropna().iloc[-1]):.1f}" if "RSI" in df.columns and not df["RSI"].dropna().empty else "—", "momentum"))
    indicator_values.append(("MACD", f"{safe_float(df['MACD'].dropna().iloc[-1]):.2f}" if "MACD" in df.columns and not df["MACD"].dropna().empty else "—", "trend"))
    indicator_values.append(("News Sentiment", str(summary.get("overall_sentiment", "Neutral")), "latest articles"))
    indicator_values.append(("Volatility", f"{volatility:.1f}%", "annualized"))
    for c, (lab, val, sub) in zip(ind, indicator_values):
        c.markdown(f'<div class="mm-metric"><label>{lab}</label><strong>{val}</strong><span>{sub}</span></div>', unsafe_allow_html=True)
    st.markdown('</section>', unsafe_allow_html=True)

    # --------------------------------------------------------
    # CALCULATORS
    # --------------------------------------------------------
    st.markdown('<div id="calculator" class="anchor-target"></div><section class="mm-section">', unsafe_allow_html=True)
    st.markdown('<div class="mm-card"><div class="mm-title">Calculators</div><div class="mm-sub">A clean investment-growth calculator, presented as one complete section.</div>', unsafe_allow_html=True)
    cc1, cc2 = st.columns([1, 1.25])
    with cc1:
        mode = st.radio("Investment type", ["SIP", "Lumpsum"], horizontal=True)
        amount = st.number_input("Monthly SIP / Initial investment (₹)", min_value=100.0, value=10000.0, step=500.0)
        years = st.slider("Investment period (years)", 1, 30, 5)
        expected_return = st.slider("Assumed annual return (%)", 1.0, 30.0, 10.0, .5)
    with cc2:
        r = expected_return / 100 / 12
        months = years * 12
        if mode == "SIP":
            invested = amount * months
            future_value = amount * (((1+r) ** months - 1) / r) * (1+r) if r else invested
        else:
            invested = amount
            future_value = amount * ((1 + expected_return/100) ** years)
        gain = future_value - invested
        st.markdown(f"""
        <div style="border:1px solid #D9DED7;border-radius:17px;padding:20px;background:#F8F9F5">
          <div class="mm-eyebrow">Illustrative result</div>
          <div class="mm-title">₹{future_value:,.0f}</div>
          <div class="mm-sub">Estimated future value</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px">
            <div class="mm-metric"><label>Total invested</label><strong>₹{invested:,.0f}</strong></div>
            <div class="mm-metric"><label>Estimated gain</label><strong>₹{gain:,.0f}</strong></div>
          </div>
        </div>
        """, unsafe_allow_html=True)
    st.markdown('</div></section>', unsafe_allow_html=True)

    # --------------------------------------------------------
    # HOLDING ANALYSIS
    # --------------------------------------------------------
    st.markdown('<div id="holding" class="anchor-target"></div><section class="mm-section">', unsafe_allow_html=True)
    st.markdown('<div class="mm-card"><div class="mm-title">Holding Analysis</div><div class="mm-sub">Price structure and trading activity for the selected company. Graphs are interactive and can be opened in fullscreen.</div>', unsafe_allow_html=True)
    h1, h2 = st.columns(2)
    with h1:
        fig_h = go.Figure()
        fig_h.add_trace(go.Bar(x=df["Date"], y=df["Volume"], name="Volume", marker_color=PALETTE["text_secondary"]))
        chart_layout(fig_h, "Trading Volume", 370)
        st.plotly_chart(fig_h, use_container_width=True, key="holding_volume", config={"displayModeBar": True, "displaylogo": False, "responsive": True, "modeBarButtonsToAdd": ["fullscreen"]})
    with h2:
        fig_c = go.Figure(go.Candlestick(x=df["Date"], open=df["Open"], high=df["High"], low=df["Low"], close=df["Close"], name=ticker))
        fig_c.update_layout(xaxis_rangeslider_visible=False)
        chart_layout(fig_c, "Price Structure", 370)
        st.plotly_chart(fig_c, use_container_width=True, key="holding_candle", config={"displayModeBar": True, "displaylogo": False, "responsive": True, "modeBarButtonsToAdd": ["fullscreen"]})
    st.markdown('</div></section>', unsafe_allow_html=True)

    # --------------------------------------------------------
    # RETURNS — TATA STYLE
    # --------------------------------------------------------
    st.markdown('<div id="returns" class="anchor-target"></div><section class="mm-section">', unsafe_allow_html=True)
    st.markdown('<div class="mm-card"><div class="mm-title">Returns over the years</div><div class="mm-sub">Historical annualized performance with a ₹10,000 comparison, presented in a single table module.</div>', unsafe_allow_html=True)
    # Calculate returns only when the selected date range contains enough
    # trading history for the requested period. This prevents the 1Y, 3Y and
    # 5Y rows from incorrectly showing the same value when only one year of
    # data has been loaded.
    available_days = len(df) - 1
    periods = [
        ("Selected Period", available_days, True),
        ("Last 1 Year", 252, available_days >= 252),
        ("Last 3 Years", 756, available_days >= 756),
        ("Last 5 Years", 1260, available_days >= 1260),
    ]
    rows = []
    for label, n, available in periods:
        if n <= 0:
            continue
        if not available:
            rows.append((label, None, None, None, None, None, None))
            continue
        start_p = safe_float(df["Close"].iloc[-n-1])
        if start_p <= 0 or current <= 0:
            rows.append((label, None, None, None, None, None, None))
            continue
        # Annualised return over the actual requested trading period.
        ret = ((current / start_p) ** (252 / n) - 1) * 100
        benchmark = ret - 0.65
        additional = ret - 0.73
        rows.append((label, ret, benchmark, additional,
                     10000 * (1 + ret / 100),
                     10000 * (1 + benchmark / 100),
                     10000 * (1 + additional / 100)))
    html = '<table class="returns-table"><thead><tr><th>Period</th><th>Annualized (%)</th><th>Benchmark (%)</th><th>Additional Benchmark (%)</th><th colspan="3">Current value of ₹10,000 invested</th></tr><tr><th></th><th></th><th></th><th></th><th>Scheme</th><th>Benchmark</th><th>Additional Benchmark</th></tr></thead><tbody>'
    for row in rows:
        if row[1] is None:
            html += (
                f'<tr><td>{row[0]}</td>'
                '<td colspan="6" style="color:#7A8491;font-style:italic;">'
                'Not enough historical data for this period'
                '</td></tr>'
            )
        else:
            html += (
                f'<tr><td>{row[0]}</td>'
                f'<td class="green">{row[1]:.2f}%</td>'
                f'<td>{row[2]:.2f}%</td>'
                f'<td>{row[3]:.2f}%</td>'
                f'<td class="green">₹{row[4]:,.0f}</td>'
                f'<td>₹{row[5]:,.0f}</td>'
                f'<td>₹{row[6]:,.0f}</td></tr>'
            )
    html += '</tbody></table>'
    st.markdown(f'<div class="returns-wrap">{html}</div><div class="disclaimer">Past performance may or may not be sustained in future. Benchmark figures here are illustrative dashboard comparisons.</div></div></section>', unsafe_allow_html=True)

    # --------------------------------------------------------
    # COMPANY INFORMATION
    # --------------------------------------------------------
    st.markdown('<div id="company-info" class="anchor-target"></div><section class="mm-section">', unsafe_allow_html=True)
    business, industry, exchange = COMPANY_INFO.get(selected_stock, ("Listed company", "—", "—"))
    week_high = safe_float(df["High"].max())
    week_low = safe_float(df["Low"].min())
    st.markdown(f"""
    <div class="mm-card">
      <div class="mm-eyebrow">Company profile</div>
      <div class="mm-title">{selected_stock}</div>
      <div class="mm-sub">This is useful because the AI signal should be read in the context of what the company actually does, where it trades and what market data is being analysed.</div>
      <div style="height:16px"></div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
        <div class="mm-metric"><label>Business</label><strong>{business}</strong><span>Primary activity</span></div>
        <div class="mm-metric"><label>Industry</label><strong>{industry}</strong><span>Sector classification</span></div>
        <div class="mm-metric"><label>Exchange</label><strong>{exchange}</strong><span>Listed market</span></div>
        <div class="mm-metric"><label>Ticker</label><strong>{ticker}</strong><span>Market identifier</span></div>
        <div class="mm-metric"><label>Period High</label><strong>₹{week_high:,.2f}</strong><span>Selected analysis window</span></div>
        <div class="mm-metric"><label>Period Low</label><strong>₹{week_low:,.2f}</strong><span>Selected analysis window</span></div>
      </div>
    </div>
    """, unsafe_allow_html=True)
    st.markdown('</section>', unsafe_allow_html=True)

    # --------------------------------------------------------
    # RISKOMETER
    # --------------------------------------------------------
    st.markdown('<div id="risk" class="anchor-target"></div><section class="mm-section">', unsafe_allow_html=True)
    st.markdown('<div class="mm-card"><div class="mm-title">Riskometer</div><div class="mm-sub">A visual risk band based on annualized historical volatility. It is a statistical research indicator, not a guarantee of future risk.</div>', unsafe_allow_html=True)
    render_risk_meter(f"{risk_label.upper()} RISK", risk_position)
    st.markdown(f'<div style="text-align:center;color:#4F5C6B;font-size:12px;margin-top:8px">Annualized historical volatility: <b>{volatility:.1f}%</b></div>', unsafe_allow_html=True)
    st.markdown('</div></section>', unsafe_allow_html=True)

    # --------------------------------------------------------
    # RECENT NEWS — SELECTED COMPANY
    # --------------------------------------------------------
    st.markdown('<div id="news" class="anchor-target"></div><section class="mm-section">', unsafe_allow_html=True)
    st.markdown(f'<div class="mm-card"><div class="mm-eyebrow">Live company coverage</div><div class="mm-title">Recent news about {escape(selected_stock)}</div><div class="mm-sub">Latest headlines returned for {escape(ticker)}. Sentiment is an automated reading of each headline, not investment advice.</div>', unsafe_allow_html=True)
    if news_df.empty:
        st.markdown('<div class="news-empty">Recent news is temporarily unavailable for this company. Try refreshing the dashboard in a moment.</div>', unsafe_allow_html=True)
    else:
        news_html = '<div class="news-grid">'
        for _, article in news_df.head(6).iterrows():
            title = escape(str(article.get("title", "Financial market update")))
            publisher = escape(str(article.get("publisher", "Market source")))
            published = article.get("published")
            published_text = "Recent"
            if pd.notna(published):
                try:
                    published_text = pd.to_datetime(published).strftime("%d %b %Y")
                except Exception:
                    pass
            sentiment = str(article.get("sentiment", "Neutral")).title()
            sentiment_class = "negative" if sentiment == "Negative" else "neutral" if sentiment == "Neutral" else ""
            article_url = str(article.get("link", ""))
            image_url = str(article.get("image", ""))
            image_html = f'<img class="news-image" src="{escape(image_url, quote=True)}" alt="" loading="lazy">' if image_url.startswith(("https://", "http://")) else '<div class="news-image-placeholder">MARKET UPDATE</div>'
            link_html = f'<a class="news-link" href="{escape(article_url, quote=True)}" target="_blank" rel="noopener noreferrer">Read source →</a>' if article_url.startswith(("https://", "http://")) else ''
            news_html += f'<article class="news-card">{image_html}<div class="news-content"><div class="news-meta">{publisher} · {published_text}</div><div class="news-title">{title}</div><span class="news-sentiment {sentiment_class}">{sentiment}</span>{link_html}</div></article>'
        news_html += '</div>'
        st.markdown(news_html, unsafe_allow_html=True)
    st.markdown('</div></section>', unsafe_allow_html=True)

    # --------------------------------------------------------
    # DATA SOURCES / MODEL INPUTS
    # --------------------------------------------------------
    model_r2 = safe_float(ml_result.get("r2"), 0) if ml_result else None
    model_status = f"R² {model_r2:.2f}" if model_r2 is not None else "Unavailable"
    st.markdown(f'''<div id="data-sources" class="anchor-target"></div><section class="mm-section"><div class="mm-card"><div class="mm-eyebrow">Transparency</div><div class="mm-title">Data sources & model inputs</div><div class="mm-sub">A concise record of the inputs used for the current {escape(selected_stock)} analysis.</div><div class="data-grid"><div class="mm-metric"><label>MARKET DATA</label><strong>{escape(ticker)}</strong><span>Yahoo Finance · {start_date} to {end_date}</span></div><div class="mm-metric"><label>PRICE HISTORY</label><strong>{len(df):,} sessions</strong><span>OHLCV data after validation</span></div><div class="mm-metric"><label>NEWS INPUT</label><strong>{len(news_df):,} headlines</strong><span>Latest selected-company articles</span></div><div class="mm-metric"><label>MODEL CHECK</label><strong>{model_status}</strong><span>Random Forest evaluation metric</span></div></div><div class="disclaimer">Data can be delayed, incomplete, or revised by the source. The dashboard is for research and education only.</div></div></section>''', unsafe_allow_html=True)

    # --------------------------------------------------------
    # FAQ — answers hidden by default
    # --------------------------------------------------------
    st.markdown('<div id="faq" class="anchor-target"></div><section class="mm-section">', unsafe_allow_html=True)
    faqs = [
        ("What is MarketMind AI?", "MarketMind AI is a research dashboard combining historical data, technical indicators, news sentiment, risk analysis and machine-learning forecasts."),
        ("Is the AI forecast guaranteed?", "No. A model forecast is a research signal and can be wrong. It should not be treated as a guaranteed future price."),
        ("How is the AI score calculated?", "The score combines the model forecast with technical signals and recent news sentiment to create a research ranking."),
        ("What does the risk meter mean?", "It summarizes annualized historical volatility into a visual risk band. Higher volatility means larger historical price movements."),
        ("Why are other companies shown?", "The recommendation section compares candidates using the same research framework so users can see which companies rank strongest under the selected profile."),
        ("Is this personalized financial advice?", "No. The dashboard is an educational and research tool. Investment decisions should consider your own objectives and risk tolerance."),
    ]
    faq_html = '<div class="mm-card"><div class="mm-title">Frequently Asked Questions</div><div class="mm-sub">Click a question only when you want to reveal its explanation.</div><div class="faq-list">'
    for q, a in faqs:
        faq_html += f'<details class="faq-item"><summary>{q}</summary><div class="faq-answer">{a}</div></details>'
    faq_html += '</div></div>'
    st.markdown(faq_html, unsafe_allow_html=True)
    st.markdown('</section>', unsafe_allow_html=True)

    # --------------------------------------------------------
    # AI RECOMMENDATIONS — FULL WIDTH, LAST MAJOR SECTION
    # --------------------------------------------------------
    st.markdown('<div id="ai-signal" class="anchor-target"></div><section class="mm-section">', unsafe_allow_html=True)
    st.markdown('<div class="mm-card"><div class="mm-eyebrow">MarketMind ranking engine</div><div class="mm-title">AI Recommended Companies</div><div class="mm-sub">Not just a price prediction: this section ranks companies using model outlook, technical signals, sentiment and historical risk. The risk meter is shown on every card for quick visual comparison.</div></div>', unsafe_allow_html=True)
    with st.spinner("Scanning market candidates..."):
        ranking_df = scan_market_candidates(start_date, end_date, investor_style)
    if ranking_df.empty:
        st.info("Market scan is temporarily unavailable. Check the selected date range or data connection.")
    else:
        top_n = min(6, len(ranking_df))
        card_cols = st.columns(3)
        for i in range(top_n):
            row = ranking_df.iloc[i]
            with card_cols[i % 3]:
                forecast = safe_float(row["Forecast"], None) if pd.notna(row["Forecast"]) else None
                forecast_text = f"₹{forecast:,.2f}" if forecast is not None else "—"
                badge_class = "negative" if row["Signal Class"] == "negative" else "neutral" if row["Signal Class"] == "neutral" else ""
                st.markdown(f"""
                <div class="company-card">
                  <div class="company-top"><div><div class="company-name">{row['Company']}</div><div class="company-ticker">{row['Ticker']}</div></div><div class="company-score">{row['AI Score']:.0f}</div></div>
                  <span class="signal-pill {badge_class}">{row['Signal']}</span>
                  <div style="margin-top:8px"></div>
                """, unsafe_allow_html=True)
                render_risk_meter(f"{str(row['Risk']).upper()} RISK", safe_float(row["Risk Pos"], 50))
                st.markdown(f"""
                  <div class="company-row"><span>Current</span><b>₹{row['Price']:,.2f}</b></div>
                  <div class="company-row"><span>AI Forecast</span><b>{forecast_text}</b></div>
                  <div class="company-row"><span>Forecast change</span><b>{row['Forecast %']:+.2f}%</b></div>
                  <div class="company-row"><span>Volatility</span><b>{row['Volatility %']:.1f}%</b></div>
                  <div class="company-row"><span>Model R²</span><b>{row['R²']:.2f}</b></div>
                  <div class="ai-why"><b>Why ranked here:</b> {row['Reason']}</div>
                </div>
                """, unsafe_allow_html=True)
        st.markdown('<div style="height:8px"></div>', unsafe_allow_html=True)
        display = ranking_df[["Company","Ticker","Price","Forecast","Forecast %","Signal","AI Score","Risk","Volatility %","R²"]].copy()
        display["Price"] = display["Price"].map(lambda x: f"₹{x:,.2f}")
        display["Forecast"] = display["Forecast"].map(lambda x: f"₹{x:,.2f}" if pd.notna(x) else "—")
        display["Forecast %"] = display["Forecast %"].map(lambda x: f"{x:+.2f}%")
        display["AI Score"] = display["AI Score"].map(lambda x: f"{x:.0f}/100")
        display["Volatility %"] = display["Volatility %"].map(lambda x: f"{x:.1f}%")
        display["R²"] = display["R²"].map(lambda x: f"{x:.2f}")
        comparison_html = '<div id="quick-decision-guide" class="anchor-target"></div><div class="mm-card"><div class="mm-eyebrow">Quick decision guide</div><div class="mm-title">Company comparison</div><div class="mm-sub">Get a quick AI view of direction, opportunity, and risk at a glance</div><div class="comparison-list">'
        for rank, (_, row) in enumerate(ranking_df.iterrows(), start=1):
            forecast_change = safe_float(row["Forecast %"], 0)
            direction = "could move higher" if forecast_change > 0.5 else "could be broadly flat" if forecast_change >= -0.5 else "could face downward pressure"
            change_text = f"about {abs(forecast_change):.1f}%" if abs(forecast_change) >= 0.5 else "with little change"
            view_class = "negative" if row["Signal Class"] == "negative" else "neutral" if row["Signal Class"] == "neutral" else ""
            comparison_html += f'''<article class="comparison-card"><div class="comparison-head"><div><div class="comparison-rank">Rank #{rank}</div><div class="comparison-name">{escape(str(row["Company"]))}</div></div><span class="comparison-view {view_class}">{escape(str(row["Signal"]))} view</span></div><div class="comparison-summary">The model suggests this share {direction} by {change_text}. {escape(str(row["Reason"]))}</div><div class="comparison-tags"><span class="comparison-tag">Risk: {escape(str(row["Risk"]))}</span><span class="comparison-tag">Price swings: {safe_float(row["Volatility %"], 0):.1f}%</span><span class="comparison-tag">AI confidence: {safe_float(row["AI Score"], 0):.0f}/100</span></div></article>'''
        comparison_html += '</div><div class="disclaimer">Ranking is a model-based research aid, not personalized investment advice.</div></div>'
        st.markdown(comparison_html, unsafe_allow_html=True)
    st.markdown('</section>', unsafe_allow_html=True)

    # --------------------------------------------------------
    # MODEL PERFORMANCE — kept at the end, not the hero
    # --------------------------------------------------------
    st.markdown('<section class="mm-section">', unsafe_allow_html=True)
    st.markdown('<div class="mm-card"><div class="mm-title">AI Model Performance</div><div class="mm-sub">Technical model diagnostics are available for transparency, while the main dashboard focuses on actionable interpretation.</div>', unsafe_allow_html=True)
    if ml_result:
        mm = st.columns(4)
        metrics = [
            ("MAE", safe_float(ml_result.get("mae"), 0), "mean absolute error"),
            ("RMSE", safe_float(ml_result.get("rmse"), 0), "root mean square error"),
            ("R² Score", safe_float(ml_result.get("r2"), 0), "explained variance"),
            ("Latest Forecast", latest_predicted, "model output"),
        ]
        for c, (lab, val, sub) in zip(mm, metrics):
            if lab == "Latest Forecast":
                value = f"₹{val:,.2f}" if val is not None else "—"
            elif lab == "R² Score":
                value = f"{val:.2f}"
            else:
                value = f"{val:.2f}"
            c.markdown(f'<div class="mm-metric"><label>{lab}</label><strong>{value}</strong><span>{sub}</span></div>', unsafe_allow_html=True)
    else:
        st.info("Machine-learning prediction is currently unavailable for this dataset.")
    st.markdown('</div></section>', unsafe_allow_html=True)

    if ml_result is not None and not prediction_df.empty:
        st.markdown('<div id="actual-vs-predicted" class="anchor-target"></div><section class="mm-section">', unsafe_allow_html=True)
        st.markdown('<div class="mm-card"><div class="mm-title">Actual vs Predicted</div><div class="mm-sub">Model evaluation view. Use fullscreen in the graph controls for a larger view.</div>', unsafe_allow_html=True)
        fig_pred = go.Figure()
        x = prediction_df["Date"] if "Date" in prediction_df.columns else prediction_df.index
        fig_pred.add_trace(go.Scatter(x=x, y=prediction_df["Actual"], name="Actual", mode="lines", line=dict(color=PALETTE["red"], width=2.5)))
        fig_pred.add_trace(go.Scatter(x=x, y=prediction_df["Predicted"], name="Predicted", mode="lines", line=dict(color=PALETTE["green"], width=2.2, dash="dot")))
        chart_layout(fig_pred, "Actual vs Predicted Price", 450)
        st.plotly_chart(fig_pred, use_container_width=True, key="prediction_chart", config={"displayModeBar": True, "displaylogo": False, "responsive": True, "modeBarButtonsToAdd": ["fullscreen"]})
        st.markdown('</div></section>', unsafe_allow_html=True)



# ============================================================
# STICKY AI RECOMMENDATION — FIXED TO VIEWPORT
# Kept visually identical; rendered as one HTML block so CSS fixed
# positioning is not broken by nested Streamlit elements.
# ============================================================
_risk_angle = -65 + min(max(risk_position, 0), 100) * 1.3
_sticky_risk_html = f"""
<div class="risk-box">
  <div class="risk-gauge">
    <div class="risk-needle" style="transform:rotate({_risk_angle:.1f}deg)"></div>
    <div class="risk-dot"></div>
  </div>
  <div class="risk-scale"><span>LOW</span><span>MODERATE</span><span>HIGH</span></div>
  <div class="risk-label">{risk_label.upper()} RISK</div>
</div>
"""

st.markdown(f"""<div class="sticky-panel">
<div class="ai-panel">
<div class="ai-panel-head">
<div class="mm-eyebrow">MarketMind recommendation</div>
<div class="ai-panel-title">{selected_stock}</div>
<div class="ai-panel-sub">Live research summary for the selected company.</div>
</div>
<div class="ai-signal">
<div class="ai-signal-label">AI Signal</div>
<div class="ai-signal-value">{signal}</div>
<div class="ai-score">AI Research Score · {ai_score}/100</div>
</div>
{_sticky_risk_html}
<div class="ai-list">
<div class="ai-list-row"><span>Current price</span><b>₹{current:,.2f}</b></div>
<div class="ai-list-row"><span>AI forecast</span><b>{'₹{:,.2f}'.format(latest_predicted) if latest_predicted is not None else '—'}</b></div>
<div class="ai-list-row"><span>Volatility</span><b>{volatility:.1f}%</b></div>
<div class="ai-list-row"><span>News sentiment</span><b>{summary.get('overall_sentiment','Neutral')}</b></div>
<div class="ai-why"><b>Research view</b><br>{signal_reason}</div>
<a class="ai-cta" href="#ai-signal">View AI recommendations</a>
</div>
</div>
</div>""", unsafe_allow_html=True)

# ============================================================
# BOTTOM COMPANY DIRECTORY — NAMES ALSO VISIBLE ON HOME PAGE
# ============================================================
st.markdown('<section class="mm-section">', unsafe_allow_html=True)
st.markdown('<div class="mm-card"><div class="mm-eyebrow">Market coverage</div><div class="mm-title">Companies covered by MarketMind AI</div><div class="mm-sub">The same company universe is available in the sidebar and here at the bottom, so the home page remains self-explanatory.</div><div style="height:14px"></div>', unsafe_allow_html=True)
cols = st.columns(5)
for i, (company, symbol) in enumerate(STOCKS.items()):
    business, industry, exchange = COMPANY_INFO.get(company, ("Listed company", "—", "—"))
    with cols[i % 5]:
        st.markdown(f'<div class="bottom-company"><strong>{company}</strong><span>{symbol} · {industry}<br>{exchange}</span></div>', unsafe_allow_html=True)
st.markdown('</div></section>', unsafe_allow_html=True)

# ============================================================
# FOOTER
# ============================================================
st.markdown(f"""
<div style="padding:28px 8px 8px;text-align:center;color:#566273;font-size:11px;line-height:1.7">
  <b style="color:{PALETTE['navy']}">MarketMind AI</b> · AI market intelligence · historical data · technical analysis · sentiment · ML forecasting · research ranking.<br>
  For educational and research purposes only. Not personalized financial advice.
</div>
""", unsafe_allow_html=True)
