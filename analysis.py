# analysis.py
import pandas as pd
from data_fetcher import get_stock_data
from sentiment_analyzer import get_news_sentiment

def merge_and_analyze(symbol, company_name, period='30d'):
    """Merge stock price and sentiment data, then compute correlation"""
    stock_df = get_stock_data(symbol, period)
    articles_df, sentiment_df = get_news_sentiment(company_name)

    if sentiment_df.empty:
        stock_df['avg_sentiment'] = 0
        stock_df['news_count'] = 0
        stock_df['positive_count'] = 0
        stock_df['negative_count'] = 0
        stock_df['lagged_sentiment'] = 0
        return stock_df

    # Merge on date
    merged = pd.merge(stock_df, sentiment_df, left_on='Date', right_on='date', how='left')
    merged['avg_sentiment'] = merged['avg_sentiment'].fillna(0)
    merged['news_count'] = merged['news_count'].fillna(0)
    merged['positive_count'] = merged['positive_count'].fillna(0)
    merged['negative_count'] = merged['negative_count'].fillna(0)

    # Lag sentiment by 1 day (news affects NEXT day's price)
    merged['lagged_sentiment'] = merged['avg_sentiment'].shift(1)

    # Calculate correlation
    corr = merged[['Daily_Change', 'avg_sentiment', 'lagged_sentiment']].corr()
    print('\n=== Correlation Matrix ===')
    print(corr)

    # Prediction accuracy
    merged['prediction_correct'] = (
        ((merged['lagged_sentiment'] > 0) & (merged['Daily_Change'] > 0)) |
        ((merged['lagged_sentiment'] < 0) & (merged['Daily_Change'] < 0))
    )
    accuracy = merged['prediction_correct'].mean() * 100
    print(f'\nSentiment Prediction Accuracy: {accuracy:.1f}%')

    return merged

if __name__ == '__main__':
    df = merge_and_analyze('AAPL', 'Apple')
    print(df[['Date', 'Close', 'avg_sentiment', 'Daily_Change']].tail(10))
