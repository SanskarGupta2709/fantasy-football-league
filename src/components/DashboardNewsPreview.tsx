import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Newspaper, ChevronRight, ExternalLink } from 'lucide-react';

interface Article {
  source: { name: string };
  title: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

interface Props {
  onViewMore: () => void;
}

export const DashboardNewsPreview: React.FC<Props> = ({ onViewMore }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const url = `https://sselpjbwuykyfjitahmi.supabase.co/functions/v1/football-news?category=all&pageSize=3`;
    fetch(url, {
      headers: {
        apikey:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZWxwamJ3dXlreWZqaXRhaG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMTQwNjIsImV4cCI6MjA2NTg5MDA2Mn0.vSi2IkDRgl2OduPw-aaKowU1YKMvrZLHi2i8N0ME6bw',
      },
    })
      .then((r) => r.json())
      .then((d) => {
        setArticles((d.articles || []).slice(0, 3));
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50/60 to-white shadow-md">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Newspaper className="h-5 w-5 text-orange-500" />
          Latest Football Headlines
        </CardTitle>
        <Button size="sm" variant="ghost" onClick={onViewMore} className="text-orange-600 hover:text-orange-700">
          View More <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading && (
          <div className="text-center py-6 text-sm text-muted-foreground">
            ⚽ Fetching Latest Football News...
          </div>
        )}
        {!loading && error && (
          <div className="text-center py-6 text-sm text-muted-foreground">
            Couldn't load headlines right now.
          </div>
        )}
        {!loading && !error && articles.length === 0 && (
          <div className="text-center py-6 text-sm text-muted-foreground">
            No headlines available.
          </div>
        )}
        {articles.map((a, i) => (
          <a
            key={i}
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 p-2 rounded-lg hover:bg-orange-50 transition group"
          >
            {a.urlToImage ? (
              <img
                src={a.urlToImage}
                alt=""
                className="w-16 h-16 object-cover rounded-md shrink-0"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <div className="w-16 h-16 rounded-md bg-gradient-to-br from-green-200 to-blue-200 flex items-center justify-center text-2xl shrink-0">
                ⚽
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-orange-700">
                {a.title}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <span className="font-medium">{a.source.name}</span>
                <span>·</span>
                <span>{timeAgo(a.publishedAt)}</span>
                <ExternalLink className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100" />
              </div>
            </div>
          </a>
        ))}
      </CardContent>
    </Card>
  );
};
