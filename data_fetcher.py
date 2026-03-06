# data_fetcher.py
import yfinance as yf
import pandas as pd

def get_stock_data(symbol, period='30d'):
    """Fetch historical stock data for a given symbol"""
    stock = yf.Ticker(symbol)
    df = stock.history(period=period)
    df = df.reset_index()
    df['Date'] = pd.to_datetime(df['Date']).dt.date
    df = df[['Date', 'Open', 'High', 'Low', 'Close', 'Volume']]
    df['Daily_Change'] = df['Close'].pct_change() * 100
    return df

# Test it:
if __name__ == '__main__':
    df = get_stock_data('AAPL')
    print(df.tail())
