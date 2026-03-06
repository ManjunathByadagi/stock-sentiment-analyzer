# app.py — Main Streamlit Dashboard (Fixed Stock Switcher)
import streamlit as st
import plotly.graph_objects as go
import plotly.express as px
from data_fetcher import get_stock_data
from sentiment_analyzer import get_news_sentiment
from analysis import merge_and_analyze

st.set_page_config(
    page_title='Stock Sentiment Analyzer',
    page_icon='📈',
    layout='wide'
)

# ── Custom CSS ────────────────────────────────────────────────────────────────
st.markdown("""
<style>
    .stock-btn { padding: 8px 20px; border-radius: 8px; font-weight: bold; }
    div[data-testid="metric-container"] { background: #1E293B; border-radius: 10px; padding: 12px; }
</style>
""", unsafe_allow_html=True)

# ── Stock Selection at TOP (easy to switch) ───────────────────────────────────
st.title("📈 Stock Market Sentiment Analyzer")
st.markdown("---")

# Big clickable buttons for stock selection
col1, col2, col3, col4, col5 = st.columns(5)

STOCKS = {
    "🍎 AAPL":  ("AAPL",  "Apple"),
    "🚗 TSLA":  ("TSLA",  "Tesla"),
    "🔍 GOOGL": ("GOOGL", "Google"),
    "💻 MSFT":  ("MSFT",  "Microsoft"),
    "📦 AMZN":  ("AMZN",  "Amazon"),
}

# Use session state to remember selected stock
if "selected_stock" not in st.session_state:
    st.session_state.selected_stock = "🍎 AAPL"

with col1:
    if st.button("🍎 AAPL", use_container_width=True):
        st.session_state.selected_stock = "🍎 AAPL"
with col2:
    if st.button("🚗 TSLA", use_container_width=True):
        st.session_state.selected_stock = "🚗 TSLA"
with col3:
    if st.button("🔍 GOOGL", use_container_width=True):
        st.session_state.selected_stock = "🔍 GOOGL"
with col4:
    if st.button("💻 MSFT", use_container_width=True):
        st.session_state.selected_stock = "💻 MSFT"
with col5:
    if st.button("📦 AMZN", use_container_width=True):
        st.session_state.selected_stock = "📦 AMZN"

symbol, company_name = STOCKS[st.session_state.selected_stock]

# ── Sidebar ───────────────────────────────────────────────────────────────────
st.sidebar.title("⚙️ Settings")
period = st.sidebar.selectbox("Time Period", ["7d", "14d", "30d"], index=2)
st.sidebar.markdown("---")
st.sidebar.markdown(f"**Selected:** `{symbol}`")
st.sidebar.markdown(f"**Company:** {company_name}")
st.sidebar.markdown("---")
st.sidebar.markdown("**How it works:**")
st.sidebar.markdown("1. 📥 Fetches stock prices via yfinance")
st.sidebar.markdown("2. 📰 Pulls news from NewsAPI")
st.sidebar.markdown("3. 🧠 Scores sentiment with VADER NLP")
st.sidebar.markdown("4. 📊 Finds correlation with price change")

# ── Load Data ─────────────────────────────────────────────────────────────────
st.markdown(f"### Showing: **{company_name} ({symbol})** — Last {period}")

with st.spinner(f'Fetching data for {company_name}...'):
    df = merge_and_analyze(symbol, company_name, period)

# ── KPI Cards ─────────────────────────────────────────────────────────────────
latest = df.iloc[-1]
c1, c2, c3, c4 = st.columns(4)
c1.metric("💰 Current Price",   f"${latest['Close']:.2f}",           f"{latest['Daily_Change']:.2f}%")
c2.metric("🧠 Sentiment Score", f"{latest['avg_sentiment']:.3f}",    "Today")
c3.metric("📰 Total News",      int(df['news_count'].sum()),          f"{period} total")
c4.metric("✅ Positive News",   int(df['positive_count'].sum()),      f"vs {int(df['negative_count'].sum())} negative")

st.markdown("---")

# ── Price + Sentiment Overlay ─────────────────────────────────────────────────
st.subheader("📊 Price vs Sentiment Overlay")
fig = go.Figure()
fig.add_trace(go.Scatter(
    x=df['Date'], y=df['Close'],
    name='Stock Price', line=dict(color='#2563EB', width=2.5)
))
colors = ['#16A34A' if x >= 0 else '#DC2626' for x in df['avg_sentiment']]
fig.add_trace(go.Bar(
    x=df['Date'], y=df['avg_sentiment'],
    name='Daily Sentiment', yaxis='y2',
    marker_color=colors, opacity=0.7
))
fig.update_layout(
    yaxis=dict(title='Stock Price ($)', side='left'),
    yaxis2=dict(title='Sentiment Score', overlaying='y', side='right', range=[-1, 1]),
    legend=dict(x=0, y=1.1, orientation='h'),
    height=420,
    plot_bgcolor='#F8FAFC',
    paper_bgcolor='white',
    title=f"{company_name} ({symbol}) — Price & News Sentiment"
)
st.plotly_chart(fig, use_container_width=True)

# ── Two Column Charts ─────────────────────────────────────────────────────────
col1, col2 = st.columns(2)

with col1:
    st.subheader("🔥 Correlation Heatmap")
    corr = df[['Close', 'Daily_Change', 'avg_sentiment', 'lagged_sentiment']].corr()
    fig2 = px.imshow(
        corr, text_auto='.2f',
        color_continuous_scale='RdBu',
        title='Sentiment vs Price Correlation'
    )
    fig2.update_layout(height=350)
    st.plotly_chart(fig2, use_container_width=True)

with col2:
    st.subheader("📰 News Volume (Positive vs Negative)")
    fig3 = go.Figure()
    fig3.add_trace(go.Bar(
        x=df['Date'], y=df['positive_count'],
        name='Positive', marker_color='#16A34A'
    ))
    fig3.add_trace(go.Bar(
        x=df['Date'], y=df['negative_count'],
        name='Negative', marker_color='#DC2626'
    ))
    fig3.update_layout(
        barmode='stack', height=350,
        plot_bgcolor='#F8FAFC', paper_bgcolor='white',
        legend=dict(x=0, y=1.1, orientation='h'),
        title=f"{company_name} News Sentiment Volume"
    )
    st.plotly_chart(fig3, use_container_width=True)

# ── Candlestick Chart ─────────────────────────────────────────────────────────
st.subheader("🕯️ Candlestick Chart")
fig4 = go.Figure(data=[go.Candlestick(
    x=df['Date'],
    open=df['Open'], high=df['High'],
    low=df['Low'],   close=df['Close'],
    increasing_line_color='#16A34A',
    decreasing_line_color='#DC2626',
    name=symbol
)])
fig4.update_layout(
    height=380, plot_bgcolor='#F8FAFC', paper_bgcolor='white',
    title=f"{company_name} Candlestick Chart",
    xaxis_rangeslider_visible=False
)
st.plotly_chart(fig4, use_container_width=True)

# ── Data Table ────────────────────────────────────────────────────────────────
st.subheader("📋 Recent Data")
display_cols = ['Date', 'Close', 'Daily_Change', 'avg_sentiment', 'news_count', 'positive_count', 'negative_count']
st.dataframe(
    df[display_cols].tail(15).round(3).sort_values('Date', ascending=False),
    use_container_width=True
)

st.markdown("---")
st.caption("Built with yfinance • NewsAPI • VADER NLP • Streamlit | B.Tech Data Analysis Project")
