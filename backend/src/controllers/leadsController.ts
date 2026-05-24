import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../types';
import { Exporter } from '../utils/exporter';
import { LeadScorerService } from '../services/leadScorer';

export class LeadsController {
  /**
   * Get paginated, filtered, and searched list of leads.
   */
  public static async listLeads(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const {
        page = '1',
        limit = '10',
        search = '',
        qualityScore,
        outreachStatus,
        platform,
        minSubs,
        maxSubs,
      } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      // Construct dynamic filters
      const where: any = { userId };

      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
          { scoreReason: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      if (qualityScore) {
        where.qualityScore = qualityScore as string;
      }

      if (outreachStatus) {
        where.outreachStatus = outreachStatus as string;
      }

      if (platform) {
        where.platform = platform as string;
      }

      if (minSubs || maxSubs) {
        where.subscriberCount = {};
        if (minSubs) where.subscriberCount.gte = parseInt(minSubs as string, 10);
        if (maxSubs) where.subscriberCount.lte = parseInt(maxSubs as string, 10);
      }

      // Fetch count and records
      const [total, leads] = await Promise.all([
        prisma.lead.count({ where }),
        prisma.lead.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      res.json({
        leads,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  /**
   * Update lead properties (e.g. outreachStatus).
   */
  public static async updateLead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const updateSchema = z.object({
        outreachStatus: z.enum(['NOT_CONTACTED', 'CONTACTED', 'REPLIED', 'CLOSED']).optional(),
        qualityScore: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
        email: z.string().email().nullable().optional(),
      });

      const parsed = updateSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ errors: parsed.error.flatten() });
        return;
      }

      // Confirm ownership
      const lead = await prisma.lead.findFirst({ where: { id, userId } });
      if (!lead) {
        res.status(404).json({ error: 'Lead not found' });
        return;
      }

      const updatedLead = await prisma.lead.update({
        where: { id },
        data: parsed.data,
      });

      res.json({ lead: updatedLead });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  /**
   * Delete a lead.
   */
  public static async deleteLead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const lead = await prisma.lead.findFirst({ where: { id, userId } });
      if (!lead) {
        res.status(404).json({ error: 'Lead not found' });
        return;
      }

      await prisma.lead.delete({ where: { id } });

      res.json({ message: 'Lead deleted successfully' });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  /**
   * Export leads in CSV or Excel format.
   */
  public static async exportLeads(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { format = 'csv' } = req.query;

      const leads = await prisma.lead.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      if (format === 'excel' || format === 'xlsx') {
        const buffer = Exporter.exportToExcel(leads);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=leads-${Date.now()}.xlsx`);
        res.send(buffer);
        return;
      } else {
        const csvContent = Exporter.exportToCsv(leads);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=leads-${Date.now()}.csv`);
        res.send(csvContent);
        return;
      }
    } catch (error) {
      next(error);
      return;
    }
  }

  /**
   * Generate highly personalized AI cold email for a lead.
   */
  public static async generateEmail(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const lead = await prisma.lead.findFirst({ where: { id, userId } });
      if (!lead) {
        res.status(404).json({ error: 'Lead not found' });
        return;
      }

      // Fetch user profile and API keys
      const [user, settings] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId } }),
        prisma.setting.findUnique({ where: { userId } }),
      ]);

      const emailTemplate = await LeadScorerService.generateColdEmail(
        lead,
        user?.name || 'A Professional Video Editor',
        settings?.openaiApiKey
      );

      // Track usage
      await prisma.apiUsage.create({
        data: {
          userId,
          action: 'AI_EMAIL_GENERATE',
          details: `Generated email template for lead ${lead.name}`,
        },
      });

      res.json({ email: emailTemplate });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }
}
