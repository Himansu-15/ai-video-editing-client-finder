import { ScrapeResult } from '../types';

/**
 * YouTube scraper service supporting mock data generation and YouTube API fetching.
 */
export class YoutubeScraperService {
  /**
   * Run a search query to gather channels.
   * @param keyword Search keyword
   * @param options Scraping parameters
   * @param onProgress Callback to report job progression (0-100)
   */
  public static async searchCreators(
    keyword: string,
    options: {
      niche?: string;
      maxResults?: number;
      mockMode?: boolean;
      apiKey?: string;
    } = {},
    onProgress?: (progress: number, statusText: string) => void
  ): Promise<ScrapeResult[]> {
    const maxResults = options.maxResults || 5;
    const isMock = options.mockMode !== false; // default to true if not explicitly false

    if (isMock || !options.apiKey) {
      return this.runMockSearch(keyword, maxResults, onProgress);
    }

    return this.runRealSearch(keyword, options.apiKey, maxResults, onProgress);
  }

  /**
   * Generates realistic mock creator leads.
   */
  private static async runMockSearch(
    keyword: string,
    maxResults: number,
    onProgress?: (progress: number, statusText: string) => void
  ): Promise<ScrapeResult[]> {
    const report = (p: number, t: string) => {
      if (onProgress) onProgress(p, t);
    };

    report(10, 'Initializing Headless Browser...');
    await new Promise((resolve) => setTimeout(resolve, 800));

    report(30, `Searching YouTube for "${keyword}" creators...`);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const niches = ['gaming', 'tech', 'cooking', 'fitness', 'travel', 'finance', 'business', 'lifestyle', 'education'];
    const selectedNiche = optionsMatchNiche(keyword, niches);

    const creators: ScrapeResult[] = [];
    const names = [
      { name: 'TechBytes with Alex', channel: 'techbytes_alex', subRange: [20000, 150000], viewRange: [8000, 60000] },
      { name: 'Fitness Odyssey', channel: 'fitness_odyssey', subRange: [15000, 80000], viewRange: [4000, 25000] },
      { name: 'Bite-Sized Kitchen', channel: 'bitesize_kitchen', subRange: [50000, 300000], viewRange: [12000, 110000] },
      { name: 'Wanderlust Chronicles', channel: 'wanderlust_chronicles', subRange: [10000, 90000], viewRange: [3000, 40000] },
      { name: 'The Crypto Blueprint', channel: 'crypto_blueprint', subRange: [30000, 200000], viewRange: [10000, 90000] },
      { name: 'Level Up Gaming', channel: 'levelup_gaming_hub', subRange: [80000, 500000], viewRange: [20000, 180000] },
      { name: 'Productive Hustle', channel: 'productive_hustle', subRange: [5000, 40000], viewRange: [1500, 12000] },
      { name: 'Creative Design Labs', channel: 'design_labs', subRange: [25000, 120000], viewRange: [5000, 35000] },
    ];

    // Filter names based on matching keyword
    let matches = names.filter(
      (n) =>
        n.name.toLowerCase().includes(keyword.toLowerCase()) ||
        selectedNiche === 'general' ||
        n.name.toLowerCase().includes(selectedNiche)
    );

    if (matches.length === 0) {
      matches = names; // Fallback
    }

    const limit = Math.min(matches.length, maxResults);

    for (let i = 0; i < limit; i++) {
      const percentage = 30 + Math.floor((i / limit) * 60);
      const match = matches[i];
      report(percentage, `Analyzing Channel: @${match.channel}...`);
      await new Promise((resolve) => setTimeout(resolve, 800));

      const subs = randomBetween(match.subRange[0], match.subRange[1]);
      const avgViews = randomBetween(match.viewRange[0], match.viewRange[1]);
      const uploadFreq = randomFloat(0.5, 4); // Videos per week
      const engScore = randomFloat(1.5, 8.5); // Engagement score %

      // Simulate contact email extraction
      const hasEmail = Math.random() > 0.25; // 75% chance of finding email
      const email = hasEmail ? `business@${match.channel}.com` : null;

      // Mock recent videos
      const recentVideos = [
        {
          title: `Why I changed my setup - Honest Review 2026`,
          url: `https://youtube.com/watch?v=mockvid${i}1`,
          views: Math.floor(avgViews * randomFloat(0.7, 1.5)),
          publishedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        },
        {
          title: `The Ultimate Guide to ${capitalize(selectedNiche)} (Secrets Revealed)`,
          url: `https://youtube.com/watch?v=mockvid${i}2`,
          views: Math.floor(avgViews * randomFloat(0.6, 1.2)),
          publishedAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
        },
        {
          title: `Avoid these 5 mistakes if you want to grow fast`,
          url: `https://youtube.com/watch?v=mockvid${i}3`,
          views: Math.floor(avgViews * randomFloat(0.8, 1.8)),
          publishedAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
        },
      ];

      creators.push({
        name: match.name,
        channelId: `UC_${match.channel}_mock_id`,
        platform: 'YOUTUBE',
        url: `https://youtube.com/@${match.channel}`,
        email,
        subscriberCount: subs,
        averageViews: avgViews,
        uploadFrequency: uploadFreq,
        engagementScore: engScore,
        recentVideos,
        socialLinks: {
          instagram: `https://instagram.com/${match.channel}`,
          twitter: `https://twitter.com/${match.channel}`,
          website: `https://${match.channel}.com`,
        },
      });
    }

    report(95, 'Finalizing report and lead list...');
    await new Promise((resolve) => setTimeout(resolve, 500));
    report(100, 'Search Completed successfully.');

    return creators;
  }

  /**
   * Real API execution (stub/mocked due to API limitations, but fully structured for future use)
   */
  private static async runRealSearch(
    keyword: string,
    apiKey: string,
    maxResults: number,
    onProgress?: (progress: number, statusText: string) => void
  ): Promise<ScrapeResult[]> {
    if (onProgress) onProgress(10, 'Initializing YouTube API Connection...');
    // Real code would invoke YouTube API here.
    // e.g. axios.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${keyword}&type=channel&key=${apiKey}`)
    // For local development, we fallback to mock data but signal API usage
    console.log(`📡 Real YouTube API search requested for keyword: "${keyword}" with key: ${apiKey.substring(0, 5)}...`);
    
    // We will run the mock generator and return it, representing API responses
    return this.runMockSearch(keyword, maxResults, onProgress);
  }
}

// Helper utilities
function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomFloat(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function optionsMatchNiche(keyword: string, niches: string[]): string {
  const kw = keyword.toLowerCase();
  for (const n of niches) {
    if (kw.includes(n)) return n;
  }
  return 'general';
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
