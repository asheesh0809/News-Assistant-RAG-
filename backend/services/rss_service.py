import feedparser
import requests
from typing import List, Dict
import logging
from datetime import datetime
import asyncio
from bs4 import BeautifulSoup
import re

logger = logging.getLogger(__name__)

class RSSService:
    def __init__(self):
        self.rss_sources = [
            "https://feeds.reuters.com/reuters/topNews",
            "https://rss.cnn.com/rss/edition.rss",
            "https://feeds.bbci.co.uk/news/rss.xml",
            "https://feeds.npr.org/1001/rss.xml",
            "https://feeds.washingtonpost.com/rss/world",
            "https://www.theguardian.com/world/rss",
            "https://feeds.abcnews.go.com/abcnews/topstories",
            "https://feeds.foxnews.com/foxnews/latest"
        ]
    
    async def get_sources(self) -> List[str]:
        """Get list of RSS sources"""
        return self.rss_sources
    
    async def fetch_all_articles(self) -> List[Dict]:
        """Fetch articles from all RSS sources"""
        all_articles = []
        
        for source_url in self.rss_sources:
            try:
                logger.info(f"Fetching from: {source_url}")
                articles = await self._fetch_rss_feed(source_url)
                all_articles.extend(articles)
                logger.info(f"Fetched {len(articles)} articles from {source_url}")
                
                # Add delay to be respectful to servers
                await asyncio.sleep(1)
                
            except Exception as e:
                logger.error(f"Error fetching from {source_url}: {e}")
                continue
        
        logger.info(f"Total articles fetched: {len(all_articles)}")
        return all_articles
    
    async def _fetch_rss_feed(self, url: str) -> List[Dict]:
        """Fetch and parse a single RSS feed"""
        try:
            # Fetch RSS feed
            response = await asyncio.to_thread(requests.get, url, timeout=30)
            response.raise_for_status()
            
            # Parse feed
            feed = feedparser.parse(response.content)
            
            articles = []
            for entry in feed.entries[:20]:  # Limit to 20 articles per source
                try:
                    # Extract and clean content
                    content = self._extract_content(entry)
                    
                    if len(content.strip()) < 100:  # Skip very short articles
                        continue
                    
                    article = {
                        "title": entry.get("title", "").strip(),
                        "content": content,
                        "url": entry.get("link", ""),
                        "published": self._parse_date(entry),
                        "source": self._extract_source_name(url)
                    }
                    
                    articles.append(article)
                    
                except Exception as e:
                    logger.warning(f"Error processing entry: {e}")
                    continue
            
            return articles
            
        except Exception as e:
            logger.error(f"Error fetching RSS feed {url}: {e}")
            return []
    
    def _extract_content(self, entry) -> str:
        """Extract and clean article content"""
        content = ""
        
        # Try different content fields
        if hasattr(entry, 'content') and entry.content:
            content = entry.content[0].value
        elif hasattr(entry, 'summary') and entry.summary:
            content = entry.summary
        elif hasattr(entry, 'description') and entry.description:
            content = entry.description
        
        # Clean HTML tags
        if content:
            soup = BeautifulSoup(content, 'html.parser')
            content = soup.get_text()
            
            # Clean up whitespace
            content = re.sub(r'\s+', ' ', content).strip()
        
        return content
    
    def _parse_date(self, entry) -> str:
        """Parse and format publication date"""
        try:
            if hasattr(entry, 'published_parsed') and entry.published_parsed:
                dt = datetime(*entry.published_parsed[:6])
                return dt.isoformat()
            elif hasattr(entry, 'published') and entry.published:
                return entry.published
            else:
                return datetime.now().isoformat()
        except:
            return datetime.now().isoformat()
    
    def _extract_source_name(self, url: str) -> str:
        """Extract source name from URL"""
        try:
            if "reuters" in url:
                return "Reuters"
            elif "cnn" in url:
                return "CNN"
            elif "bbc" in url:
                return "BBC"
            elif "npr" in url:
                return "NPR"
            elif "washingtonpost" in url:
                return "Washington Post"
            elif "theguardian" in url:
                return "The Guardian"
            elif "abcnews" in url:
                return "ABC News"
            elif "foxnews" in url:
                return "Fox News"
            else:
                return "RSS Feed"
        except:
            return "Unknown Source"
