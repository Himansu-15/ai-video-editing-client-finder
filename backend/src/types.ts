import { Request } from 'express';

export interface UserPayload {
  id: string;
  email: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

export interface ScrapeResult {
  name: string;
  channelId: string;
  platform: 'YOUTUBE' | 'INSTAGRAM';
  url: string;
  email: string | null;
  subscriberCount: number;
  averageViews: number;
  uploadFrequency: number; // videos per week
  engagementScore: number;
  recentVideos: Array<{
    title: string;
    url: string;
    views: number;
    publishedAt: string;
  }>;
  socialLinks: {
    instagram?: string;
    tiktok?: string;
    twitter?: string;
    website?: string;
  };
}

export interface LeadScoreResult {
  qualityScore: 'HIGH' | 'MEDIUM' | 'LOW';
  scoreReason: string;
}
