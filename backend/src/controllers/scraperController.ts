import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../types';
import { YoutubeScraperService } from '../services/youtubeScraper';
import { LeadScorerService } from '../services/leadScorer';

const scrapeJobSchema = z.object({
  keyword: z.string().min(1),
  niche: z.string().optional(),
  platform: z.enum(['YOUTUBE', 'INSTAGRAM']).default('YOUTUBE'),
  maxResults: z.number().int().min(1).max(20).default(5),
});

export class ScraperController {
  /**
   * Triggers a new background scraping and lead scoring operation.
   */
  public static async startScrape(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;

      const parsed = scrapeJobSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ errors: parsed.error.flatten() });
        return;
      }

      const { keyword, niche, platform, maxResults } = parsed.data;

      // Check user API settings (API Keys / Mock status)
      const settings = await prisma.setting.findUnique({ where: { userId } });
      const mockMode = settings ? settings.mockScraper : true;
      const youtubeApiKey = settings?.youtubeApiKey || undefined;
      const openaiApiKey = settings?.openaiApiKey || undefined;

      // 1. Create a Search history record with RUNNING status
      const searchRecord = await prisma.search.create({
        data: {
          userId,
          keyword,
          niche: niche || null,
          platform,
          filters: JSON.stringify({ maxResults }),
          status: 'RUNNING',
          runCount: 0,
        },
      });

      // 2. Perform the scrape asynchronously
      // Execute in the background so the REST endpoint responds instantly
      ScraperController.runBackgroundScrape(
        userId,
        searchRecord.id,
        keyword,
        niche,
        platform,
        maxResults,
        mockMode,
        youtubeApiKey,
        openaiApiKey
      );

      // Return the search record
      res.status(202).json({
        message: 'Scraping job started successfully',
        search: searchRecord,
      });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  /**
   * Background runner execution.
   */
  private static async runBackgroundScrape(
    userId: string,
    searchId: string,
    keyword: string,
    niche: string | undefined,
    _platform: 'YOUTUBE' | 'INSTAGRAM',
    maxResults: number,
    mockMode: boolean,
    youtubeApiKey?: string,
    openaiApiKey?: string
  ): Promise<void> {
    try {
      console.log(`🚀 Starting background scrape for Search ID: ${searchId}...`);

      // Track usage
      await prisma.apiUsage.create({
        data: {
          userId,
          action: 'SCRAPE_JOB',
          details: `Search keyword: "${keyword}", Max: ${maxResults}`,
        },
      });

      // Search channels
      const scrapeResults = await YoutubeScraperService.searchCreators(keyword, {
        niche,
        maxResults,
        mockMode,
        apiKey: youtubeApiKey,
      });

      let savedLeadsCount = 0;

      for (const rawLead of scrapeResults) {
        // Score the lead using AI Scoring Service
        const score = await LeadScorerService.scoreLead(rawLead, openaiApiKey);

        // Upsert lead in database (prevent duplicates on unique channelId)
        await prisma.lead.upsert({
          where: { channelId: rawLead.channelId },
          update: {
            subscriberCount: rawLead.subscriberCount,
            averageViews: rawLead.averageViews,
            uploadFrequency: rawLead.uploadFrequency,
            engagementScore: rawLead.engagementScore,
            qualityScore: score.qualityScore,
            scoreReason: score.scoreReason,
            recentVideos: JSON.stringify(rawLead.recentVideos),
            socialLinks: JSON.stringify(rawLead.socialLinks),
            email: rawLead.email || undefined,
            searchId,
          },
          create: {
            name: rawLead.name,
            channelId: rawLead.channelId,
            platform: rawLead.platform,
            url: rawLead.url,
            email: rawLead.email,
            subscriberCount: rawLead.subscriberCount,
            averageViews: rawLead.averageViews,
            uploadFrequency: rawLead.uploadFrequency,
            engagementScore: rawLead.engagementScore,
            qualityScore: score.qualityScore,
            scoreReason: score.scoreReason,
            recentVideos: JSON.stringify(rawLead.recentVideos),
            socialLinks: JSON.stringify(rawLead.socialLinks),
            userId,
            searchId,
          },
        });

        savedLeadsCount++;
      }

      // Update Search history record
      await prisma.search.update({
        where: { id: searchId },
        data: {
          status: 'COMPLETED',
          runCount: savedLeadsCount,
        },
      });

      console.log(`✅ Background scrape completed. Found & processed ${savedLeadsCount} leads.`);
    } catch (error) {
      console.error(`❌ Background scrape failed for Search ID ${searchId}:`, error);

      await prisma.search.update({
        where: { id: searchId },
        data: {
          status: 'FAILED',
        },
      }).catch((dbErr) => console.error('Failed to mark search as failed:', dbErr));
    }
  }

  /**
   * Fetch all previous queries run by the user.
   */
  public static async getSearchHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const history = await prisma.search.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ history });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }
}
