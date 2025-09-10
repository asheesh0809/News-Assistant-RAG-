import { NextResponse } from "next/server"

export async function GET() {
  const mockSources = {
    rss: [
      "https://feeds.reuters.com/reuters/topNews",
      "http://feeds.bbci.co.uk/news/rss.xml",
      "https://www.aljazeera.com/xml/rss/all.xml",
      "https://feeds.npr.org/1001/rss.xml",
      "https://techcrunch.com/feed/",
      "https://www.ft.com/rss/home",
    ],
  }

  return NextResponse.json(mockSources)
}
