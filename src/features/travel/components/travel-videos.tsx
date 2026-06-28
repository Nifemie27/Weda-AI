'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Play, Video, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useTravelVideos } from '../hooks/use-travel-videos';

interface TravelVideosProps {
  city: string;
}

export function TravelVideos({ city }: TravelVideosProps) {
  const { data: videos, isLoading } = useTravelVideos(city);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-4">Travel Videos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Video className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No travel videos found for {city}.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Travel Videos — {city}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <Card
              className="overflow-hidden cursor-pointer group"
              onClick={() => setActiveVideoId(video.id)}
            >
              <div className="relative">
                <Image
                  src={video.thumbnail}
                  alt={video.title}
                  width={320}
                  height={180}
                  className="w-full h-40 object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="h-12 w-12 text-white fill-white" />
                </div>
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-medium line-clamp-2">{video.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{video.channelTitle}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Video player dialog */}
      <Dialog open={!!activeVideoId} onOpenChange={(open) => !open && setActiveVideoId(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b">
            <p className="text-sm font-medium truncate pr-4">
              {videos.find((v) => v.id === activeVideoId)?.title}
            </p>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={() => setActiveVideoId(null)}
              aria-label="Close video"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {activeVideoId && (
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1`}
                title="Travel video"
                width="100%"
                height="100%"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="border-0"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
