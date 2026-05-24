import { LeadScoreResult, ScrapeResult } from '../types';
import axios from 'axios';

/**
 * Service to score leads using rule-based metrics or OpenAI GPT analysis.
 */
export class LeadScorerService {
  /**
   * Determine lead quality score and reason.
   */
  public static async scoreLead(
    lead: ScrapeResult,
    openaiApiKey?: string | null
  ): Promise<LeadScoreResult> {
    if (openaiApiKey) {
      try {
        return await this.scoreWithOpenAI(lead, openaiApiKey);
      } catch (error) {
        console.error('⚠️ OpenAI Scoring failed, falling back to rule-based scoring:', error);
        // fall back to rule-based
      }
    }

    return this.scoreWithRules(lead);
  }

  /**
   * Rule-based lead scoring algorithm.
   */
  private static scoreWithRules(lead: ScrapeResult): LeadScoreResult {
    const { subscriberCount, averageViews, uploadFrequency, engagementScore, email } = lead;

    // Critical negative factor: No email makes contacting very difficult
    if (!email) {
      return {
        qualityScore: 'LOW',
        scoreReason: 'No public contact email was found, making cold outreach difficult.',
      };
    }

    // Critical negative factor: Inactivity
    if (uploadFrequency < 0.2) {
      return {
        qualityScore: 'LOW',
        scoreReason: `Inactive posting schedule (${uploadFrequency.toFixed(1)} videos/week). Low immediate need for editing.`,
      };
    }

    // Sweet Spot: Creators with 10k to 250k subscribers. They have traffic and budget, but probably edit themselves or have a amateur editor.
    const isInSubSweetSpot = subscriberCount >= 10000 && subscriberCount <= 250000;
    const isVeryLargeCreator = subscriberCount > 800000;
    const isVerySmallCreator = subscriberCount < 5000;

    if (isVeryLargeCreator) {
      return {
        qualityScore: 'MEDIUM',
        scoreReason: `Very large creator (${(subscriberCount / 1000000).toFixed(1)}M subs). Highly likely to already have a dedicated editing agency, but has a budget if they are hiring.`,
      };
    }

    if (isVerySmallCreator) {
      return {
        qualityScore: 'LOW',
        scoreReason: `Small audience size (${subscriberCount.toLocaleString()} subs). Likely lacks the budget to hire a professional video editor.`,
      };
    }

    // High Quality: In sweet spot, active, good views and engagement, email available
    if (isInSubSweetSpot && uploadFrequency >= 1.0 && engagementScore > 2.0 && averageViews > 3000) {
      return {
        qualityScore: 'HIGH',
        scoreReason: `Perfect client profile! Active creator in the growth sweet spot (${(subscriberCount / 1000).toFixed(0)}k subs), posting frequently with healthy engagement (${engagementScore.toFixed(1)}%) and view counts, and has a contact email available.`,
      };
    }

    // Medium Quality: Sweet spot but slightly lower engagement or posting frequency
    if (isInSubSweetSpot) {
      return {
        qualityScore: 'MEDIUM',
        scoreReason: `Creator is in the target subscriber sweet spot (${(subscriberCount / 1000).toFixed(0)}k subs) with an email available, but has moderate engagement (${engagementScore.toFixed(1)}%) or a slower posting schedule.`,
      };
    }

    // Default Fallback
    return {
      qualityScore: 'MEDIUM',
      scoreReason: `Moderate lead quality. Active creator with public contact details, but metrics fall outside ideal sweet spot parameters.`,
    };
  }

  /**
   * OpenAI GPT-based scoring.
   */
  private static async scoreWithOpenAI(lead: ScrapeResult, apiKey: string): Promise<LeadScoreResult> {
    const prompt = `
Analyze this YouTube creator profile and determine if they are a good lead for a freelance video editor.
Determine if they have budget, if they have content activity, and if their editing needs improvement.

Creator Profile:
- Name: ${lead.name}
- Channel URL: ${lead.url}
- Subscribers: ${lead.subscriberCount.toLocaleString()}
- Average Views per Video: ${lead.averageViews.toLocaleString()}
- Upload Frequency: ${lead.uploadFrequency.toFixed(2)} videos per week
- Engagement Score: ${lead.engagementScore}%
- Contact Email: ${lead.email || 'None'}
- Recent Video Titles:
${lead.recentVideos.map((v) => `  * "${v.title}" (${v.views.toLocaleString()} views)`).join('\n')}

Respond with a JSON object ONLY in this format:
{
  "qualityScore": "HIGH" | "MEDIUM" | "LOW",
  "scoreReason": "A 2-3 sentence explanation summarizing the opportunity, why you assigned this score, and a potential hook for the editor to use in a cold pitch."
}
`;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        timeout: 10000,
      }
    );

    const content = response.data.choices[0].message.content;
    const result = JSON.parse(content);

    return {
      qualityScore: result.qualityScore as 'HIGH' | 'MEDIUM' | 'LOW',
      scoreReason: result.scoreReason,
    };
  }

  /**
   * Generates a cold email template for a specific lead.
   */
  public static async generateColdEmail(
    lead: any,
    userProfileName: string,
    openaiApiKey?: string | null
  ): Promise<string> {
    if (openaiApiKey) {
      try {
        const prompt = `
Write a short, high-converting, personalized cold outreach email from a video editor named "${userProfileName}" to the creator "${lead.name}".
Use the following channel information to personalize the email:
- Subscriber count: ${lead.subscriberCount.toLocaleString()}
- Recent video title: "${JSON.parse(lead.recentVideos)[0]?.title || 'your recent videos'}"
- Channel niche/concept: Subscriber counts indicate they are growing.

Make it professional, casual (not too corporate), and focus on how we can save them time or increase their retention rate. Highlight their recent video. Keep it under 150 words. Do not use generic placeholders.

Respond ONLY with the email subject line and body. Format:
Subject: [Subject]

[Body]
`;
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${openaiApiKey}`,
            },
            timeout: 10000,
          }
        );
        return response.data.choices[0].message.content.trim();
      } catch (error) {
        console.error('⚠️ OpenAI Cold Email generation failed, falling back to rule-based template:', error);
      }
    }

    // Default template fallback
    const recentVideos = JSON.parse(lead.recentVideos);
    const videoTitle = recentVideos[0]?.title || 'your recent content';
    
    return `Subject: Love your videos, ${lead.name} - Quick question about your editing workflow

Hi ${lead.name},

I came across your channel and really enjoyed your video, "${videoTitle}". The content is excellent, and you're building a highly engaged community.

I'm ${userProfileName}, a freelance video editor. I help creators in your space elevate their production quality, increase audience retention, and save 15+ hours a week by taking editing off their plate.

Given your active posting schedule, I'd love to edit a 60-second trial video for you completely free of charge. If you like the result, we can discuss working together. If not, no hard feelings.

Would you be open to me sending over a couple of retention-focused ideas for your next video?

Best regards,

${userProfileName}
Video Editor & Storyteller`;
  }
}
