import { Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../types';

export class AdminController {
  /**
   * Fetches global analytics summaries for administration dashboard.
   */
  public static async getGlobalStats(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const [
        totalUsers,
        totalSearches,
        totalLeads,
        leadsByQuality,
        leadsByOutreach,
        recentUsages,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.search.count(),
        prisma.lead.count(),
        prisma.lead.groupBy({
          by: ['qualityScore'],
          _count: { id: true },
        }),
        prisma.lead.groupBy({
          by: ['outreachStatus'],
          _count: { id: true },
        }),
        prisma.apiUsage.findMany({
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        }),
      ]);

      // Normalize charts/aggregations for easier frontend consumption
      const qualityMap = { HIGH: 0, MEDIUM: 0, LOW: 0 };
      leadsByQuality.forEach((group) => {
        const key = group.qualityScore as keyof typeof qualityMap;
        if (key in qualityMap) {
          qualityMap[key] = group._count.id;
        }
      });

      const outreachMap = { NOT_CONTACTED: 0, CONTACTED: 0, REPLIED: 0, CLOSED: 0 };
      leadsByOutreach.forEach((group) => {
        const key = group.outreachStatus as keyof typeof outreachMap;
        if (key in outreachMap) {
          outreachMap[key] = group._count.id;
        }
      });

      res.json({
        stats: {
          totalUsers,
          totalSearches,
          totalLeads,
          leadsByQuality: qualityMap,
          leadsByOutreach: outreachMap,
        },
        recentUsages,
      });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }
}
