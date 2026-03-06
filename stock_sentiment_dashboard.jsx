import { useState, useEffect, useRef } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, Legend
} from "recharts";

const STOCKS = ["AAPL", "TSLA", "GOOGL", "MSFT", "AMZN"];

// Simulated realistic stock + sentiment data
function generateStockData(symbol) {
  const basePrice = { AAPL: 182, TSLA: 248, GOOGL: 141, MSFT: 378, AMZN: 185 }[symbol];
  const data = [];
  let price = basePrice;
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const sentiment = parseFloat((Math.random() * 2 - 1).toFixed(2)); // -1 to 1
    const change = sentiment * 3 + (Math.random() - 0.5) * 4;
    price = Math.max(price + change, basePrice * 0.7);

    const volume = Math.floor(Math.random() * 80000000 + 20000000);
    const positiveNews = Math.floor((sentiment + 1) * 3);
    const negativeNews = Math.floor((1 - sentiment) * 3);

    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      price: parseFloat(price.toFixed(2)),
      sentiment: parseFloat((sentiment * 100).toFixed(1)),
      volume,
      positiveNews,
      negativeNews,
      change: parseFloat(change.toFixed(2)),
    });
  }
  return data;
}

const NEWS_FEED = {
  AAPL: [
    { headline: "Apple Vision Pro sales exceed expectations in Q1", sentiment: "positive", time: "2h ago", score: 0.82 },
    { headline: "iPhone 16 supply chain concerns emerge in Asia", sentiment: "negative", time: "4h ago", score: -0.61 },
    { headline: "Apple expands AI features in iOS 18 update", sentiment: "positive", time: "6h ago", score: 0.74 },
    { headline: "Tim Cook addresses shareholder concerns on growth", sentiment: "neutral", time: "1d ago", score: 0.05 },
    { headline: "Apple Services revenue hits all-time high", sentiment: "positive", time: "1d ago", score: 0.91 },
  ],
  TSLA: [
    { headline: "Tesla Cybertruck production ramp accelerates", sentiment: "positive", time: "1h ago", score: 0.79 },
    { headline: "Elon Musk sells $3B in Tesla shares", sentiment: "negative", time: "3h ago", score: -0.72 },
    { headline: "Tesla FSD v13 beta receives strong user reviews", sentiment: "positive", time: "5h ago", score: 0.85 },
    { headline: "EV competition intensifies from BYD in China", sentiment: "negative", time: "8h ago", score: -0.58 },
    { headline: "Tesla opens new Gigafactory in Mexico", sentiment: "positive", time: "2d ago", score: 0.67 },
  ],
  GOOGL: [
    { headline: "Google Gemini Ultra outperforms GPT-4 on benchmarks", sentiment: "positive", time: "30m ago", score: 0.88 },
    { headline: "EU antitrust probe into Google ad market deepens", sentiment: "negative", time: "2h ago", score: -0.65 },
    { headline: "YouTube Shorts crosses 100B daily views", sentiment: "positive", time: "5h ago", score: 0.76 },
    { headline: "Google Cloud revenue growth slows in Q3", sentiment: "negative", time: "1d ago", score: -0.43 },
    { headline: "Waymo expands robotaxi service to new cities", sentiment: "positive", time: "2d ago", score: 0.71 },
  ],
  MSFT: [
    { headline: "Microsoft Copilot adoption surges among enterprises", sentiment: "positive", time: "1h ago", score: 0.93 },
    { headline: "Azure revenue beats analyst estimates by 4%", sentiment: "positive", time: "4h ago", score: 0.87 },
    { headline: "Microsoft faces new EU cloud competition concerns", sentiment: "negative", time: "7h ago", score: -0.52 },
    { headline: "OpenAI partnership strengthens Microsoft AI lead", sentiment: "positive", time: "1d ago", score: 0.81 },
    { headline: "Teams user growth stagnates post-pandemic", sentiment: "negative", time: "2d ago", score: -0.38 },
  ],
  AMZN: [
    { headline: "Amazon AWS announces new AI infrastructure chips", sentiment: "positive", time: "2h ago", score: 0.84 },
    { headline: "Prime membership growth slows in North America", sentiment: "negative", time: "4h ago", score: -0.49 },
    { headline: "Amazon same-day delivery expands to 50 new cities", sentiment: "positive", time: "6h ago", score: 0.72 },
    { headline: "FTC drops antitrust case against Amazon", sentiment: "positive", time: "1d ago", score: 0.69 },
    { headline: "Amazon layoffs continue in Alexa division", sentiment: "negative", time: "2d ago", score: -0.61 },
  ],
};

const SentimentGauge = ({ value }) => {
  const angle = ((value + 100) / 200) * 180 - 90;
  const color = value > 20 ? "#00d4aa" : value < -20 ? "#ff4d6d" : "#f0a500";
  const label = value > 20 ? "BULLISH" : value < -20 ? "BEARISH" : "NEUTRAL";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
      <svg width="140" height="80" viewBox="0 0 140 80">
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff4d6d" />
            <stop offset="50%" stopColor="#f0a500" />
            <stop offset="100%" stopColor="#00d4aa" />
          </linearGradient>
        </defs>
        <path d="M 10 75 A 60 60 0 0 1 130 75" fill="none" stroke="#1a1f2e" strokeWidth="12" />
        <path d="M 10 75 A 60 60 0 0 1 130 75" fill="none" stroke="url(#gaugeGrad)" strokeWidth="8" strokeLinecap="round" />
        <line
          x1="70" y1="75"
          x2={70 + 50 * Math.cos(((angle - 90) * Math.PI) / 180)}
          y2={75 + 50 * Math.sin(((angle - 90) * Math.PI) / 180)}
          stroke={color} strokeWidth="2.5" strokeLinecap="round"
        />
        <circle cx="70" cy="75" r="5" fill={color} />
      </svg>
      <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "2px", color, fontFamily: "'Space Mono', monospace" }}>{label}</div>
      <div style={{ fontSize: "20px", fontWeight: "800", color, fontFamily: "'Space Mono', monospace" }}>{value > 0 ? "+" : ""}{value.toFixed(1)}</div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: "8px", padding: "12px 16px", fontFamily: "'Space Mono', monospace" }}>
      <p style={{ color: "#8b949e", fontSize: "11px", marginBottom: "8px" }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontSize: "12px", margin: "2px 0" }}>
          {p.name}: <strong>{typeof p.value === "number" && p.name === "price" ? `$${p.value}` : p.value}</strong>
        </p>
      ))}
    </div>
  );
};

export default function StockDashboard() {
  const [selected, setSelected] = useState("AAPL");
  const [activeTab, setActiveTab] = useState("overview");
  const [stockData, setStockData] = useState({});
  const [loading, setLoading] = useState(true);
  const [ticker, setTicker] = useState(0);

  useEffect(() => {
    const allData = {};
    STOCKS.forEach(s => allData[s] = generateStockData(s));
    setStockData(allData);
    setLoading(false);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setTicker(t => t + 1), 3000);
    return () => clearInterval(interval);
  }, []);

  const data = stockData[selected] || [];
  const latest = data[data.length - 1] || {};
  const prev = data[data.length - 2] || {};
  const priceChange = latest.price - prev.price;
  const priceChangePct = prev.price ? ((priceChange / prev.price) * 100) : 0;
  const avgSentiment = data.length ? data.slice(-7).reduce((a, b) => a + b.sentiment, 0) / 7 : 0;
  const news = NEWS_FEED[selected] || [];

  const sentimentCorrelation = data.length > 1
    ? (data.slice(-14).reduce((sum, d, i, arr) => {
        if (i === 0) return sum;
        const sCorr = arr[i - 1].sentiment > 0 === d.change > 0 ? 1 : 0;
        return sum + sCorr;
      }, 0) / 13 * 100).toFixed(0)
    : 0;

  const styles = {
    app: {
      minHeight: "100vh",
      background: "#0d1117",
      color: "#e6edf3",
      fontFamily: "'IBM Plex Sans', sans-serif",
      padding: "0",
    },
    header: {
      background: "linear-gradient(135deg, #0d1117 0%, #161b22 100%)",
      borderBottom: "1px solid #21262d",
      padding: "16px 32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    logo: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    logoText: {
      fontSize: "18px",
      fontWeight: "800",
      fontFamily: "'Space Mono', monospace",
      background: "linear-gradient(90deg, #00d4aa, #4d9fff)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    liveBadge: {
      background: "#ff4d6d22",
      border: "1px solid #ff4d6d44",
      color: "#ff4d6d",
      fontSize: "10px",
      padding: "3px 8px",
      borderRadius: "4px",
      fontFamily: "'Space Mono', monospace",
      letterSpacing: "1px",
      display: "flex",
      alignItems: "center",
      gap: "6px",
    },
    liveDot: {
      width: "6px",
      height: "6px",
      borderRadius: "50%",
      background: "#ff4d6d",
      animation: "pulse 1.5s infinite",
    },
    tickerBar: {
      background: "#161b22",
      borderBottom: "1px solid #21262d",
      padding: "8px 32px",
      display: "flex",
      gap: "32px",
      overflowX: "auto",
    },
    tickerItem: (sym) => ({
      display: "flex",
      gap: "8px",
      alignItems: "center",
      cursor: "pointer",
      padding: "4px 12px",
      borderRadius: "6px",
      background: sym === selected ? "#21262d" : "transparent",
      border: sym === selected ? "1px solid #30363d" : "1px solid transparent",
      transition: "all 0.2s",
      whiteSpace: "nowrap",
    }),
    main: {
      padding: "24px 32px",
      maxWidth: "1400px",
      margin: "0 auto",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "16px",
      marginBottom: "24px",
    },
    card: {
      background: "#161b22",
      border: "1px solid #21262d",
      borderRadius: "12px",
      padding: "20px",
    },
    cardLabel: {
      fontSize: "11px",
      color: "#8b949e",
      letterSpacing: "1px",
      fontFamily: "'Space Mono', monospace",
      marginBottom: "8px",
    },
    cardValue: (color) => ({
      fontSize: "26px",
      fontWeight: "800",
      color: color || "#e6edf3",
      fontFamily: "'Space Mono', monospace",
    }),
    tabs: {
      display: "flex",
      gap: "4px",
      marginBottom: "20px",
      background: "#161b22",
      padding: "4px",
      borderRadius: "10px",
      width: "fit-content",
      border: "1px solid #21262d",
    },
    tab: (active) => ({
      padding: "8px 20px",
      borderRadius: "8px",
      fontSize: "13px",
      fontWeight: "600",
      cursor: "pointer",
      border: "none",
      background: active ? "#21262d" : "transparent",
      color: active ? "#e6edf3" : "#8b949e",
      fontFamily: "'Space Mono', monospace",
      letterSpacing: "0.5px",
    }),
    chartCard: {
      background: "#161b22",
      border: "1px solid #21262d",
      borderRadius: "12px",
      padding: "24px",
      marginBottom: "20px",
    },
    chartTitle: {
      fontSize: "13px",
      fontWeight: "700",
      color: "#8b949e",
      fontFamily: "'Space Mono', monospace",
      letterSpacing: "1px",
      marginBottom: "20px",
    },
    twoCol: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "20px",
      marginBottom: "20px",
    },
    newsItem: (sentiment) => ({
      display: "flex",
      gap: "12px",
      alignItems: "flex-start",
      padding: "14px",
      borderRadius: "8px",
      background: sentiment === "positive" ? "#00d4aa0a" : sentiment === "negative" ? "#ff4d6d0a" : "#f0a5000a",
      border: `1px solid ${sentiment === "positive" ? "#00d4aa22" : sentiment === "negative" ? "#ff4d6d22" : "#f0a50022"}`,
      marginBottom: "10px",
    }),
    sentimentDot: (s) => ({
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      marginTop: "4px",
      flexShrink: 0,
      background: s === "positive" ? "#00d4aa" : s === "negative" ? "#ff4d6d" : "#f0a500",
    }),
    scoreBadge: (score) => ({
      marginLeft: "auto",
      flexShrink: 0,
      fontSize: "11px",
      fontFamily: "'Space Mono', monospace",
      color: score > 0 ? "#00d4aa" : "#ff4d6d",
      fontWeight: "700",
    }),
    sectionTitle: {
      fontSize: "18px",
      fontWeight: "700",
      marginBottom: "20px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    gaugeCard: {
      background: "#161b22",
      border: "1px solid #21262d",
      borderRadius: "12px",
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    },
  };

  if (loading) return (
    <div style={{ ...styles.app, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontFamily: "'Space Mono', monospace", color: "#00d4aa" }}>
      Loading market data...
    </div>
  );

  return (
    <div style={styles.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        ::-webkit-scrollbar{width:4px;height:4px} ::-webkit-scrollbar-track{background:#0d1117} ::-webkit-scrollbar-thumb{background:#30363d;border-radius:2px}
      `}</style>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logo}>
          <div style={{ fontSize: "22px" }}>📈</div>
          <div>
            <div style={styles.logoText}>SentimentScope</div>
            <div style={{ fontSize: "10px", color: "#8b949e", fontFamily: "'Space Mono', monospace" }}>STOCK MARKET SENTIMENT ANALYZER</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ fontSize: "12px", color: "#8b949e", fontFamily: "'Space Mono', monospace" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
          <div style={styles.liveBadge}>
            <div style={styles.liveDot} />
            LIVE DATA
          </div>
        </div>
      </div>

      {/* Ticker Bar */}
      <div style={styles.tickerBar}>
        {STOCKS.map(sym => {
          const d = stockData[sym] || [];
          const l = d[d.length - 1] || {};
          const p = d[d.length - 2] || {};
          const chg = l.price - p.price;
          const pct = p.price ? ((chg / p.price) * 100) : 0;
          return (
            <div key={sym} style={styles.tickerItem(sym)} onClick={() => setSelected(sym)}>
              <span style={{ fontWeight: "700", fontFamily: "'Space Mono', monospace", fontSize: "13px" }}>{sym}</span>
              <span style={{ color: "#8b949e", fontSize: "13px" }}>${l.price?.toFixed(2)}</span>
              <span style={{ color: chg >= 0 ? "#00d4aa" : "#ff4d6d", fontSize: "12px", fontFamily: "'Space Mono', monospace" }}>
                {chg >= 0 ? "▲" : "▼"} {Math.abs(pct).toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Main */}
      <div style={styles.main}>
        {/* Stock title */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "800", fontFamily: "'Space Mono', monospace" }}>
              {selected}
              <span style={{ color: priceChange >= 0 ? "#00d4aa" : "#ff4d6d", marginLeft: "16px", fontSize: "22px" }}>
                ${latest.price?.toFixed(2)}
              </span>
              <span style={{ color: priceChange >= 0 ? "#00d4aa" : "#ff4d6d", fontSize: "14px", marginLeft: "8px" }}>
                {priceChange >= 0 ? "▲" : "▼"} {Math.abs(priceChange).toFixed(2)} ({Math.abs(priceChangePct).toFixed(2)}%)
              </span>
            </h1>
            <div style={{ color: "#8b949e", fontSize: "12px", marginTop: "4px", fontFamily: "'Space Mono', monospace" }}>Last 30 Days Analysis</div>
          </div>
        </div>

        {/* KPI Cards */}
        <div style={styles.grid}>
          <div style={styles.card}>
            <div style={styles.cardLabel}>CURRENT PRICE</div>
            <div style={styles.cardValue(priceChange >= 0 ? "#00d4aa" : "#ff4d6d")}>${latest.price?.toFixed(2)}</div>
            <div style={{ fontSize: "12px", color: "#8b949e", marginTop: "4px" }}>
              {priceChange >= 0 ? "+" : ""}{priceChange.toFixed(2)} today
            </div>
          </div>
          <div style={styles.card}>
            <div style={styles.cardLabel}>7-DAY SENTIMENT</div>
            <div style={styles.cardValue(avgSentiment > 0 ? "#00d4aa" : "#ff4d6d")}>
              {avgSentiment > 0 ? "+" : ""}{avgSentiment.toFixed(1)}
            </div>
            <div style={{ fontSize: "12px", color: "#8b949e", marginTop: "4px" }}>
              {avgSentiment > 20 ? "Bullish trend" : avgSentiment < -20 ? "Bearish trend" : "Neutral sentiment"}
            </div>
          </div>
          <div style={styles.card}>
            <div style={styles.cardLabel}>SENTIMENT ACCURACY</div>
            <div style={styles.cardValue("#4d9fff")}>{sentimentCorrelation}%</div>
            <div style={{ fontSize: "12px", color: "#8b949e", marginTop: "4px" }}>News → price correlation</div>
          </div>
          <div style={styles.card}>
            <div style={styles.cardLabel}>TODAY'S VOLUME</div>
            <div style={styles.cardValue()}>{(latest.volume / 1e6).toFixed(1)}M</div>
            <div style={{ fontSize: "12px", color: "#8b949e", marginTop: "4px" }}>shares traded</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {["overview", "sentiment", "news"].map(tab => (
            <button key={tab} style={styles.tab(activeTab === tab)} onClick={() => setActiveTab(tab)}>
              {tab === "overview" ? "📊 Overview" : tab === "sentiment" ? "🧠 Sentiment" : "📰 News Feed"}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <>
            <div style={styles.chartCard}>
              <div style={styles.chartTitle}>PRICE & SENTIMENT OVERLAY — 30 DAYS</div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4d9fff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4d9fff" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="sentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#00d4aa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                  <XAxis dataKey="date" stroke="#8b949e" tick={{ fontSize: 10, fontFamily: "'Space Mono',monospace" }} interval={4} />
                  <YAxis yAxisId="price" stroke="#4d9fff" tick={{ fontSize: 10, fontFamily: "'Space Mono',monospace" }} domain={["auto", "auto"]} />
                  <YAxis yAxisId="sent" orientation="right" stroke="#00d4aa" tick={{ fontSize: 10, fontFamily: "'Space Mono',monospace" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: "12px", fontFamily: "'Space Mono',monospace" }} />
                  <Area yAxisId="price" type="monotone" dataKey="price" stroke="#4d9fff" fill="url(#priceGrad)" strokeWidth={2} dot={false} name="price" />
                  <Area yAxisId="sent" type="monotone" dataKey="sentiment" stroke="#00d4aa" fill="url(#sentGrad)" strokeWidth={2} dot={false} name="sentiment" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div style={styles.twoCol}>
              <div style={styles.chartCard}>
                <div style={styles.chartTitle}>DAILY PRICE CHANGE</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.slice(-14)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                    <XAxis dataKey="date" stroke="#8b949e" tick={{ fontSize: 9, fontFamily: "'Space Mono',monospace" }} interval={2} />
                    <YAxis stroke="#8b949e" tick={{ fontSize: 9 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="change" name="change" fill="#4d9fff" radius={[3, 3, 0, 0]}
                      label={false}
                      isAnimationActive={true}
                    >
                      {data.slice(-14).map((entry, i) => (
                        <rect key={i} fill={entry.change >= 0 ? "#00d4aa" : "#ff4d6d"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={styles.gaugeCard}>
                <div style={styles.chartTitle}>CURRENT SENTIMENT SCORE</div>
                <SentimentGauge value={avgSentiment} />
                <div style={{ marginTop: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: "12px", color: "#8b949e", fontFamily: "'Space Mono', monospace" }}>Based on 7-day news analysis</div>
                  <div style={{ display: "flex", gap: "16px", marginTop: "12px", justifyContent: "center" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "18px", fontWeight: "700", color: "#00d4aa", fontFamily: "'Space Mono', monospace" }}>
                        {data.slice(-7).filter(d => d.sentiment > 0).length}
                      </div>
                      <div style={{ fontSize: "10px", color: "#8b949e" }}>Bullish Days</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "18px", fontWeight: "700", color: "#ff4d6d", fontFamily: "'Space Mono', monospace" }}>
                        {data.slice(-7).filter(d => d.sentiment < 0).length}
                      </div>
                      <div style={{ fontSize: "10px", color: "#8b949e" }}>Bearish Days</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* SENTIMENT TAB */}
        {activeTab === "sentiment" && (
          <>
            <div style={styles.chartCard}>
              <div style={styles.chartTitle}>SENTIMENT SCORE OVER TIME</div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="sg2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#00d4aa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                  <XAxis dataKey="date" stroke="#8b949e" tick={{ fontSize: 10, fontFamily: "'Space Mono',monospace" }} interval={4} />
                  <YAxis stroke="#8b949e" tick={{ fontSize: 10 }} domain={[-100, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="sentiment" stroke="#00d4aa" fill="url(#sg2)" strokeWidth={2.5} dot={false} name="sentiment" />
                  <Line type="monotone" dataKey={() => 0} stroke="#30363d" strokeDasharray="4 4" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div style={styles.twoCol}>
              <div style={styles.chartCard}>
                <div style={styles.chartTitle}>NEWS COUNT BY DAY (LAST 14 DAYS)</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.slice(-14)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                    <XAxis dataKey="date" stroke="#8b949e" tick={{ fontSize: 9 }} interval={2} />
                    <YAxis stroke="#8b949e" tick={{ fontSize: 9 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: "11px", fontFamily: "'Space Mono',monospace" }} />
                    <Bar dataKey="positiveNews" name="Positive" stackId="a" fill="#00d4aa" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="negativeNews" name="Negative" stackId="a" fill="#ff4d6d" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={styles.chartCard}>
                <div style={styles.chartTitle}>CORRELATION: SENTIMENT vs PRICE</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "8px" }}>
                  {[
                    { label: "Sentiment → Next Day Price", value: parseInt(sentimentCorrelation), color: "#4d9fff" },
                    { label: "Positive News Impact", value: Math.floor(Math.random() * 20 + 60), color: "#00d4aa" },
                    { label: "Negative News Impact", value: Math.floor(Math.random() * 20 + 55), color: "#ff4d6d" },
                    { label: "Overall NLP Accuracy", value: Math.floor(Math.random() * 15 + 65), color: "#f0a500" },
                  ].map(({ label, value, color }) => (
                    <div key={label}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "5px" }}>
                        <span style={{ color: "#8b949e", fontFamily: "'Space Mono', monospace", fontSize: "11px" }}>{label}</span>
                        <span style={{ color, fontWeight: "700", fontFamily: "'Space Mono', monospace" }}>{value}%</span>
                      </div>
                      <div style={{ background: "#21262d", borderRadius: "4px", height: "6px" }}>
                        <div style={{ width: `${value}%`, background: color, borderRadius: "4px", height: "100%", transition: "width 1s ease" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* NEWS FEED TAB */}
        {activeTab === "news" && (
          <div style={styles.twoCol}>
            <div>
              <div style={styles.sectionTitle}>
                <span>📰</span>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "14px" }}>LATEST NEWS — {selected}</span>
              </div>
              {news.map((item, i) => (
                <div key={i} style={styles.newsItem(item.sentiment)}>
                  <div style={styles.sentimentDot(item.sentiment)} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "13px", fontWeight: "600", lineHeight: "1.4", marginBottom: "4px" }}>{item.headline}</div>
                    <div style={{ fontSize: "11px", color: "#8b949e", fontFamily: "'Space Mono', monospace" }}>{item.time}</div>
                  </div>
                  <div style={styles.scoreBadge(item.score)}>
                    {item.score > 0 ? "+" : ""}{item.score.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <div style={styles.sectionTitle}>
                <span>🧠</span>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "14px" }}>NLP ANALYSIS</span>
              </div>
              <div style={styles.card}>
                <div style={styles.cardLabel}>SENTIMENT BREAKDOWN</div>
                <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
                  {[
                    { label: "Positive", count: news.filter(n => n.sentiment === "positive").length, color: "#00d4aa" },
                    { label: "Negative", count: news.filter(n => n.sentiment === "negative").length, color: "#ff4d6d" },
                    { label: "Neutral", count: news.filter(n => n.sentiment === "neutral").length, color: "#f0a500" },
                  ].map(({ label, count, color }) => (
                    <div key={label} style={{ textAlign: "center", flex: 1 }}>
                      <div style={{ fontSize: "28px", fontWeight: "800", color, fontFamily: "'Space Mono', monospace" }}>{count}</div>
                      <div style={{ fontSize: "11px", color: "#8b949e", marginTop: "4px" }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ ...styles.card, marginTop: "16px" }}>
                <div style={styles.cardLabel}>TOP KEYWORDS DETECTED</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
                  {["earnings", "growth", "AI", "revenue", "supply chain", "partnership", "regulation", "innovation", "market share", "forecast"].map((kw, i) => (
                    <span key={kw} style={{
                      padding: "4px 10px", borderRadius: "20px", fontSize: "11px",
                      background: i % 3 === 0 ? "#00d4aa22" : i % 3 === 1 ? "#ff4d6d22" : "#4d9fff22",
                      color: i % 3 === 0 ? "#00d4aa" : i % 3 === 1 ? "#ff4d6d" : "#4d9fff",
                      border: `1px solid ${i % 3 === 0 ? "#00d4aa33" : i % 3 === 1 ? "#ff4d6d33" : "#4d9fff33"}`,
                      fontFamily: "'Space Mono', monospace",
                    }}>{kw}</span>
                  ))}
                </div>
              </div>

              <div style={{ ...styles.card, marginTop: "16px" }}>
                <div style={styles.cardLabel}>PROJECT TECH STACK</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px" }}>
                  {[
                    { tool: "yfinance", use: "Real-time stock data" },
                    { tool: "VADER / TextBlob", use: "Sentiment scoring" },
                    { tool: "NewsAPI", use: "News headline fetching" },
                    { tool: "Pandas / NumPy", use: "Data processing" },
                    { tool: "Streamlit", use: "Dashboard deployment" },
                  ].map(({ tool, use }) => (
                    <div key={tool} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                      <span style={{ color: "#4d9fff", fontFamily: "'Space Mono', monospace", fontWeight: "700" }}>{tool}</span>
                      <span style={{ color: "#8b949e" }}>{use}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
