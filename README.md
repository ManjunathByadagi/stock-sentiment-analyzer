# 📈 Stock Market Sentiment Analyzer

A real-time dashboard that correlates financial news sentiment with stock price movements using Python, NLP, and Streamlit.

## 🚀 Live Demo
https://manjunath-stock-sentiment.streamlit.app/

## 📊 Features
- **Live stock data** via yfinance (no API key needed)
- **Financial news** from NewsAPI (free tier)
- **NLP sentiment scoring** using VADER
- **Interactive charts** with Plotly
- **Correlation analysis** between news mood and price movement
- **Prediction accuracy** — does yesterday's sentiment predict today's price?

## 🛠️ Tech Stack
| Tool | Purpose |
|------|---------|
| `yfinance` | Real-time stock prices |
| `NewsAPI` | Financial news headlines |
| `VADER NLP` | Sentiment scoring |
| `Pandas` | Data processing |
| `Plotly` | Interactive charts |
| `Streamlit` | Web app deployment |

## ⚙️ Setup

### 1. Clone the repository
```bash
git clone https://github.com/ManjunathByadagi/stock-sentiment-analyzer.git
cd stock-sentiment-analyzer
```

### 2. Create virtual environment
```bash
python -m venv venv
source venv/bin/activate   # Mac/Linux
venv\Scripts\activate      # Windows
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Add API key
```bash
cp .env.example .env
# Edit .env and add your NewsAPI key from https://newsapi.org
```

### 5. Run the app
```bash
streamlit run app.py
```

Open your browser at **http://localhost:8501**

## 📁 Project Structure
```
stock_sentiment_analyzer/
├── app.py                 ← Main Streamlit dashboard
├── data_fetcher.py        ← yfinance stock price data
├── sentiment_analyzer.py  ← NewsAPI + VADER sentiment
├── analysis.py            ← Merge data + correlation
├── requirements.txt       ← Python dependencies
├── .env.example           ← API key template
├── .gitignore             ← Ignores .env file
└── README.md              ← This file
```

## 📸 Screenshots
Screenshot.png

## 🎓 About
- REST API integration
- Natural Language Processing (NLP)
- Time-series correlation analysis
- End-to-end data pipeline deployment

---
⭐ Star this repo if you found it helpful!
