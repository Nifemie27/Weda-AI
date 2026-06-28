import { type NextRequest } from 'next/server';
import { successResponse, errorResponse, withErrorHandling } from '@/lib/api-helpers';
import { YOUTUBE_BASE_URL } from '@/lib/constants';
import type { YouTubeVideo } from '@/features/travel/types';

interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    thumbnails: { medium: { url: string } };
    channelTitle: string;
    publishedAt: string;
  };
}

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const { searchParams } = request.nextUrl;
    const query = searchParams.get('q');

    if (!query) {
      return errorResponse('MISSING_PARAMS', 'Provide a search query (q).', 400);
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return errorResponse('CONFIG_ERROR', 'YouTube API key not configured.', 500);
    }

    const url = new URL(`${YOUTUBE_BASE_URL}/search`);
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('q', `${query} travel guide`);
    url.searchParams.set('type', 'video');
    url.searchParams.set('maxResults', '6');
    url.searchParams.set('order', 'relevance');
    url.searchParams.set('videoEmbeddable', 'true');
    url.searchParams.set('key', apiKey);

    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      if (response.status === 403) {
        return errorResponse('YOUTUBE_QUOTA', 'YouTube API quota exceeded.', 429);
      }
      return errorResponse('YOUTUBE_ERROR', 'Failed to fetch travel videos.', response.status);
    }

    const data = await response.json();

    const videos: YouTubeVideo[] = (data.items || []).map((item: YouTubeSearchItem) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
    }));

    return successResponse(videos);
  });
}
