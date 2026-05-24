import { LeadScorerService } from '../services/leadScorer';
import { ScrapeResult } from '../types';

describe('LeadScorerService - Rule-based scoring tests', () => {
  test('Should score LOW if creator has no contact email', async () => {
    const mockLead: ScrapeResult = {
      name: 'No Email Creator',
      channelId: 'UC_no_email',
      platform: 'YOUTUBE',
      url: 'https://youtube.com/@no_email',
      email: null,
      subscriberCount: 50000,
      averageViews: 10000,
      uploadFrequency: 2.0,
      engagementScore: 5.0,
      recentVideos: [],
      socialLinks: {},
    };

    const result = await LeadScorerService.scoreLead(mockLead);
    expect(result.qualityScore).toBe('LOW');
    expect(result.scoreReason).toContain('No public contact email');
  });

  test('Should score LOW if creator is inactive', async () => {
    const mockLead: ScrapeResult = {
      name: 'Inactive Creator',
      channelId: 'UC_inactive',
      platform: 'YOUTUBE',
      url: 'https://youtube.com/@inactive',
      email: 'collab@inactive.com',
      subscriberCount: 20000,
      averageViews: 8000,
      uploadFrequency: 0.1, // less than 0.2 videos/week
      engagementScore: 4.2,
      recentVideos: [],
      socialLinks: {},
    };

    const result = await LeadScorerService.scoreLead(mockLead);
    expect(result.qualityScore).toBe('LOW');
    expect(result.scoreReason).toContain('Inactive posting schedule');
  });

  test('Should score HIGH for creators in the subscriber sweet spot with high activity and engagement', async () => {
    const mockLead: ScrapeResult = {
      name: 'Active Growth Creator',
      channelId: 'UC_active_growth',
      platform: 'YOUTUBE',
      url: 'https://youtube.com/@active_growth',
      email: 'business@activegrowth.com',
      subscriberCount: 45000, // sweet spot: 10k to 250k
      averageViews: 12000,
      uploadFrequency: 1.5, // >= 1.0 vids/week
      engagementScore: 4.5, // > 2.0%
      recentVideos: [],
      socialLinks: {},
    };

    const result = await LeadScorerService.scoreLead(mockLead);
    expect(result.qualityScore).toBe('HIGH');
    expect(result.scoreReason).toContain('Perfect client profile');
  });

  test('Should score MEDIUM for creators with massive sub counts who likely have agencies', async () => {
    const mockLead: ScrapeResult = {
      name: 'Mega Influencer',
      channelId: 'UC_mega',
      platform: 'YOUTUBE',
      url: 'https://youtube.com/@mega',
      email: 'management@mega.com',
      subscriberCount: 1500000, // over 800k
      averageViews: 400000,
      uploadFrequency: 2.0,
      engagementScore: 6.0,
      recentVideos: [],
      socialLinks: {},
    };

    const result = await LeadScorerService.scoreLead(mockLead);
    expect(result.qualityScore).toBe('MEDIUM');
    expect(result.scoreReason).toContain('Very large creator');
  });
});
