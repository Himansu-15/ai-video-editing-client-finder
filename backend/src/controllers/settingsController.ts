import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../types';

export class SettingsController {
  /**
   * Get user configuration, masking private API Keys.
   */
  public static async getSettings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      let settings = await prisma.setting.findUnique({ where: { userId } });

      // Create settings if they somehow don't exist
      if (!settings) {
        settings = await prisma.setting.create({
          data: {
            userId,
            mockScraper: true,
            theme: 'dark',
          },
        });
      }

      // Mask sensitive fields for security
      const responseSettings = {
        id: settings.id,
        mockScraper: settings.mockScraper,
        theme: settings.theme,
        emailTemplate: settings.emailTemplate,
        youtubeApiKey: settings.youtubeApiKey ? maskKey(settings.youtubeApiKey) : null,
        openaiApiKey: settings.openaiApiKey ? maskKey(settings.openaiApiKey) : null,
        hasYoutubeKey: !!settings.youtubeApiKey,
        hasOpenaiKey: !!settings.openaiApiKey,
      };

      res.json({ settings: responseSettings });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  /**
   * Update configuration. Only replaces keys if provided.
   */
  public static async updateSettings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;

      const updateSchema = z.object({
        mockScraper: z.boolean().optional(),
        theme: z.enum(['light', 'dark']).optional(),
        emailTemplate: z.string().nullable().optional(),
        youtubeApiKey: z.string().nullable().optional(),
        openaiApiKey: z.string().nullable().optional(),
      });

      const parsed = updateSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ errors: parsed.error.flatten() });
        return;
      }

      const data: any = { ...parsed.data };

      // Retain existing API keys if user passes masked values
      if (data.youtubeApiKey && data.youtubeApiKey.includes('****')) {
        delete data.youtubeApiKey;
      }
      if (data.openaiApiKey && data.openaiApiKey.includes('****')) {
        delete data.openaiApiKey;
      }

      const updatedSettings = await prisma.setting.upsert({
        where: { userId },
        update: data,
        create: {
          userId,
          ...data,
        },
      });

      res.json({
        message: 'Settings updated successfully',
        settings: {
          id: updatedSettings.id,
          mockScraper: updatedSettings.mockScraper,
          theme: updatedSettings.theme,
          emailTemplate: updatedSettings.emailTemplate,
          hasYoutubeKey: !!updatedSettings.youtubeApiKey,
          hasOpenaiKey: !!updatedSettings.openaiApiKey,
        },
      });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }
}

function maskKey(key: string): string {
  if (key.length <= 8) return '********';
  return `********${key.substring(key.length - 4)}`;
}
