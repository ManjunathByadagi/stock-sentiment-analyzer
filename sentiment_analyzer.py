# sentiment_analyzer.py
import os, requests, pandas as pd
from datetime import datetime, timedelta
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv('NEWS_API_KEY')
analyzer = SentimentIntensityAnalyzer()

def get_news_sentiment(company_name, days=30):
    """Fetch news headlines and compute daily sentiment scores"""

    # Free tier only supports last 30 days, use smaller window to get results
    from_date = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')

    url = (
        f'https://newsapi.org/v2/everything'
        f'?q={company_name}&from={from_date}'
        f'&language=en&sortBy=publishedAt'
        f'&pageSize=100&apiKey={API_KEY}'
    )

    print(f"Fetching news for: {company_name}")
    response = requests.get(url)
    data = response.json()

    print(f"API Status: {data.get('status')}")
    print(f"Total Results: {data.get('totalResults', 0)}")

    if data.get('status') != 'ok':
        print(f"API Error: {data.get('message', 'Unknown error')}")
        # Return empty but valid dataframes
        empty_articles = pd.DataFrame(columns=['date','headline','score','sentiment'])
        empty_daily = pd.DataFrame(columns=['date','avg_sentiment','news_count','positive_count','negative_count'])
        return empty_articles, empty_daily

    articles = data.get('articles', [])
    print(f"Articles fetched: {len(articles)}")

    records = []
    for article in articles:
        title = article.get('title', '') or ''
        if title == '[Removed]' or not title:
            continue
        date  = article.get('publishedAt', '')[:10]
        score = analyzer.polarity_scores(title)['compound']
        sentiment = 'positive' if score > 0.05 else 'negative' if score < -0.05 else 'neutral'
        records.append({
            'date': date,
            'headline': title,
            'score': score,
            'sentiment': sentiment
        })

    if not records:
        print("No valid articles found!")
        empty_articles = pd.DataFrame(columns=['date','headline','score','sentiment'])
        empty_daily = pd.DataFrame(columns=['date','avg_sentiment','news_count','positive_count','negative_count'])
        return empty_articles, empty_daily

    df = pd.DataFrame(records)
    df['date'] = pd.to_datetime(df['date']).dt.date

    print(f"Valid articles: {len(df)}")
    print(f"Date range: {df['date'].min()} to {df['date'].max()}")

    # Compute daily average sentiment
    daily = df.groupby('date').agg(
        avg_sentiment=('score', 'mean'),
        news_count=('score', 'count'),
        positive_count=('sentiment', lambda x: (x == 'positive').sum()),
        negative_count=('sentiment', lambda x: (x == 'negative').sum())
    ).reset_index()

    return df, daily

# Test it:
if __name__ == '__main__':
    articles, daily = get_news_sentiment('Apple')
    print("\n--- Daily Sentiment ---")
    print(daily)