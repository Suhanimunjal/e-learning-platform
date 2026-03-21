import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsReportingService {
  private readonly logger = new Logger(AnalyticsReportingService.name);

  constructor(private prisma: PrismaService) {}

  // ==================== COURSE ANALYTICS ====================

  async getCourseAnalytics(courseId: string) {
    try {
      const [
        enrollmentCount,
        completionCount,
        courseEvents,
        avgModulesPerUser,
        avgQuizScore,
      ] = await Promise.all([
        this.prisma.enrollment.count({ where: { courseId } }),
        this.prisma.analyticsEvent.count({
          where: {
            courseId,
            type: 'course.completed',
          },
        }),
        this.prisma.analyticsEvent.findMany({
          where: { courseId },
          select: { type: true },
        }),
        this.getAvgModulesCompleted(courseId),
        this.getAvgQuizScore(courseId),
      ]);

      const eventCounts = this.countEventsByType(courseEvents);
      const completionRate = enrollmentCount > 0 ? (completionCount / enrollmentCount) * 100 : 0;

      return {
        courseId,
        enrollmentCount,
        completionCount,
        completionRate: Math.round(completionRate),
        avgModulesCompleted: avgModulesPerUser,
        avgQuizScore: avgQuizScore,
        eventBreakdown: eventCounts,
      };
    } catch (error) {
      this.logger.error(`Error getting course analytics for ${courseId}:`, error);
      throw error;
    }
  }

  async getStudentProgress(courseId: string, userId: string) {
    try {
      const enrollment = await this.prisma.enrollment.findFirst({
        where: { courseId, userId },
      });

      if (!enrollment) {
        return null;
      }

      const [
        modulesCompleted,
        quizzesTaken,
        averageQuizScore,
        certificateEarned,
        timeSpent,
      ] = await Promise.all([
        this.prisma.analyticsEvent.count({
          where: {
            userId,
            courseId,
            type: 'module.completed',
          },
        }),
        this.prisma.analyticsEvent.count({
          where: {
            userId,
            courseId,
            type: 'quiz.completed',
          },
        }),
        this.getAverageScoreForUser(userId, courseId, 'quiz.completed'),
        this.prisma.analyticsEvent.count({
          where: {
            userId,
            courseId,
            type: 'certificate.earned',
          },
        }),
        this.getTotalTimeSpent(userId, courseId),
      ]);

      return {
        userId,
        courseId,
        enrolledAt: enrollment.createdAt,
        modulesCompleted,
        quizzesTaken,
        averageQuizScore,
        certificateEarned: certificateEarned > 0,
        totalTimeSpent: timeSpent, // in seconds
      };
    } catch (error) {
      this.logger.error(`Error getting student progress:`, error);
      throw error;
    }
  }

  async getCourseStudentsProgress(courseId: string) {
    try {
      const enrollments = await this.prisma.enrollment.findMany({
        where: { courseId },
        include: { user: true },
      });

      const studentProgress = await Promise.all(
        enrollments.map(enrollment =>
          this.getStudentProgress(courseId, enrollment.userId),
        ),
      );

      return studentProgress.filter(sp => sp !== null);
    } catch (error) {
      this.logger.error(`Error getting course students progress:`, error);
      throw error;
    }
  }

  // ==================== USER ANALYTICS ====================

  async getUserAnalytics(userId: string) {
    try {
      const [
        enrollmentCount,
        coursesCompleted,
        certificatesEarned,
        totalTimeSpent,
        recentEvents,
      ] = await Promise.all([
        this.prisma.enrollment.count({ where: { userId } }),
        this.prisma.analyticsEvent.count({
          where: { userId, type: 'course.completed' },
        }),
        this.prisma.analyticsEvent.count({
          where: { userId, type: 'certificate.earned' },
        }),
        this.getTotalTimeSpentByUser(userId),
        this.prisma.analyticsEvent.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 10,
        }),
      ]);

      return {
        userId,
        enrollmentCount,
        coursesCompleted,
        certificatesEarned,
        totalTimeSpent, // in seconds
        recentEvents,
      };
    } catch (error) {
      this.logger.error(`Error getting user analytics:`, error);
      throw error;
    }
  }

  // ==================== PLATFORM ANALYTICS ====================

  async getPlatformAnalytics(startDate?: Date, endDate?: Date) {
    try {
      const [
        totalUsers,
        totalCourses,
        totalEnrollments,
        completedEnrollments,
        totalRevenue,
        topCourses,
        eventBreakdown,
        enrollmentTrend,
        revenueTrend,
        growthMetrics,
      ] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.course.count(),
        this.prisma.enrollment.count(),
        this.prisma.analyticsEvent.count({
          where: { type: 'course.completed' },
        }),
        this.prisma.order.aggregate({
          where: { status: 'COMPLETED' },
          _sum: { amount: true },
        }),
        this.getTopCourses(5),
        this.getPlatformEventBreakdown(),
        this.getEnrollmentTrend(6),
        this.getRevenueTrend(6),
        this.getGrowthMetrics(),
      ]);

      const completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0;

      return {
        totalUsers,
        totalCourses,
        totalEnrollments,
        completedEnrollments,
        completionRate: Math.round(completionRate),
        totalRevenue: totalRevenue._sum.amount || 0,
        enrollmentTrend,
        revenueTrend,
        userGrowthRate: growthMetrics.userGrowthRate,
        revenueGrowthRate: growthMetrics.revenueGrowthRate,
        enrollmentGrowthRate: growthMetrics.enrollmentGrowthRate,
        topCourses,
        eventBreakdown,
        period: {
          startDate: startDate || new Date(new Date().setDate(1)),
          endDate: endDate || new Date(),
        },
      };
    } catch (error) {
      this.logger.error('Error getting platform analytics:', error);
      throw error;
    }
  }

  async getTopCourses(limit: number = 5, startDate?: Date, endDate?: Date) {
    try {
      const dateFilter = this._buildDateFilter(startDate, endDate);

      const topCourses = await this.prisma.course.findMany({
        select: {
          id: true,
          title: true,
          enrollments: {
            where: dateFilter ? { createdAt: dateFilter } : {},
          },
        },
        orderBy: {
          enrollments: {
            _count: 'desc',
          },
        },
        take: limit,
      });

      return topCourses.map(course => ({
        courseId: course.id,
        title: course.title,
        enrollmentCount: course.enrollments.length,
      }));
    } catch (error) {
      this.logger.error('Error getting top courses:', error);
      throw error;
    }
  }

  async getEngagementMetrics(startDate?: Date, endDate?: Date) {
    try {
      const dateFilter = this._buildDateFilter(startDate, endDate);

      const where = dateFilter ? { createdAt: dateFilter } : {};
      const events = await this.prisma.analyticsEvent.findMany({
        where,
        select: { type: true, metadata: true },
      });

      const avgTimePerModule = this._calculateAvgTimePerModule(events);
      const quizPassRate = this._calculateQuizPassRate(events);
      const activeDays = await this._calculateActiveDays(startDate, endDate);

      return {
        avgTimePerModule, // in seconds
        quizPassRate: Math.round(quizPassRate),
        activeDays,
      };
    } catch (error) {
      this.logger.error('Error getting engagement metrics:', error);
      throw error;
    }
  }

  // ==================== HELPER METHODS ====================

  private async getAvgModulesCompleted(courseId: string) {
    const result = await this.prisma.analyticsEvent.groupBy({
      by: ['userId'],
      where: { courseId, type: 'module.completed' },
      _count: true,
    });

    return result.length > 0
      ? result.reduce((sum, r) => sum + r._count, 0) / result.length
      : 0;
  }

  private async getAvgQuizScore(courseId: string) {
    const events = await this.prisma.analyticsEvent.findMany({
      where: { courseId, type: 'quiz.completed' },
      select: { metadata: true },
    });

    if (events.length === 0) return 0;

    const scores = events
      .map(e => {
        const meta = e.metadata as any;
        return meta.score / meta.maxScore * 100;
      })
      .filter(s => !isNaN(s));

    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  private async getAverageScoreForUser(userId: string, courseId: string, eventType: string) {
    const events = await this.prisma.analyticsEvent.findMany({
      where: { userId, courseId, type: eventType },
      select: { metadata: true },
    });

    if (events.length === 0) return 0;

    const scores = events
      .map(e => {
        const meta = e.metadata as any;
        const passingScore = meta.passingScore || 50; // Use quiz's passingScore, default to 50
        return {
          score: meta.score || 0,
          maxScore: meta.maxScore || 100,
          passingScore,
        };
      })
      .filter(s => s.maxScore > 0);

    if (scores.length === 0) return 0;

    const avgPercentage = scores.reduce((sum, s) => sum + (s.score / s.maxScore) * 100, 0) / scores.length;
    return Math.round(avgPercentage);
  }

  private async getTotalTimeSpent(userId: string, courseId: string) {
    const events = await this.prisma.analyticsEvent.findMany({
      where: { userId, courseId, type: 'module.time_spent' },
      select: { metadata: true },
    });

    return events.reduce((sum, e) => {
      const meta = e.metadata as any;
      return sum + (meta.duration || 0);
    }, 0);
  }

  private async getTotalTimeSpentByUser(userId: string) {
    const events = await this.prisma.analyticsEvent.findMany({
      where: { userId, type: 'module.time_spent' },
      select: { metadata: true },
    });

    return events.reduce((sum, e) => {
      const meta = e.metadata as any;
      return sum + (meta.duration || 0);
    }, 0);
  }

  private countEventsByType(events: { type: string }[]) {
    return events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private async getPlatformEventBreakdown(startDate?: Date, endDate?: Date) {
    const dateFilter = this._buildDateFilter(startDate, endDate);

    const where = dateFilter ? { createdAt: dateFilter } : {};
    const events = await this.prisma.analyticsEvent.findMany({
      where,
      select: { type: true },
    });

    return this.countEventsByType(events);
  }

  private _buildDateFilter(startDate?: Date, endDate?: Date) {
    if (!startDate && !endDate) return null;

    return {
      gte: startDate || new Date(0),
      lte: endDate || new Date(),
    };
  }

  private _calculateAvgTimePerModule(events: { type: string; metadata: any }[]) {
    const timeEvents = events.filter(e => e.type === 'module.time_spent');
    if (timeEvents.length === 0) return 0;

    const totalTime = timeEvents.reduce((sum, e) => sum + (e.metadata.duration || 0), 0);
    return Math.round(totalTime / timeEvents.length);
  }

  private _calculateQuizPassRate(events: { type: string; metadata: any }[]) {
    const quizEvents = events.filter(e => e.type === 'quiz.completed');
    if (quizEvents.length === 0) return 0;

    const passed = quizEvents.filter(e => e.metadata.passed).length;
    return (passed / quizEvents.length) * 100;
  }

  private async _calculateActiveDays(startDate?: Date, endDate?: Date) {
    const dateFilter = this._buildDateFilter(startDate, endDate);

    const where = dateFilter ? { createdAt: dateFilter } : {};
    const events = await this.prisma.analyticsEvent.findMany({
      where,
      select: { createdAt: true, userId: true },
    });

    const uniqueDays = new Set(
      events.map(e => e.createdAt.toISOString().split('T')[0]),
    );

    return uniqueDays.size;
  }

  private async getEnrollmentTrend(monthCount: number = 6) {
    const months = this._buildMonthBuckets(monthCount);
    const start = months[0].start;
    const end = months[months.length - 1].end;

    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      select: {
        createdAt: true,
      },
    });

    const counts: Record<string, number> = {};
    for (const month of months) {
      counts[month.key] = 0;
    }

    for (const enrollment of enrollments) {
      const key = this._toMonthKey(enrollment.createdAt);
      if (key in counts) {
        counts[key] += 1;
      }
    }

    return months.map((month) => ({
      month: month.label,
      enrollments: counts[month.key] || 0,
    }));
  }

  private async getRevenueTrend(monthCount: number = 6) {
    const months = this._buildMonthBuckets(monthCount);
    const start = months[0].start;
    const end = months[months.length - 1].end;

    const orders = await this.prisma.order.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      select: {
        createdAt: true,
        amount: true,
      },
    });

    const sums: Record<string, number> = {};
    for (const month of months) {
      sums[month.key] = 0;
    }

    for (const order of orders) {
      const key = this._toMonthKey(order.createdAt);
      if (key in sums) {
        sums[key] += Number(order.amount || 0);
      }
    }

    return months.map((month) => ({
      month: month.label,
      revenue: Math.round(sums[month.key] || 0),
    }));
  }

  private async getGrowthMetrics() {
    const now = new Date();
    const currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const [
      usersCurrent,
      usersPrevious,
      enrollmentsCurrent,
      enrollmentsPrevious,
      revenueCurrent,
      revenuePrevious,
    ] = await Promise.all([
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: currentStart,
            lte: now,
          },
        },
      }),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: previousStart,
            lte: previousEnd,
          },
        },
      }),
      this.prisma.enrollment.count({
        where: {
          createdAt: {
            gte: currentStart,
            lte: now,
          },
        },
      }),
      this.prisma.enrollment.count({
        where: {
          createdAt: {
            gte: previousStart,
            lte: previousEnd,
          },
        },
      }),
      this.prisma.order.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: currentStart,
            lte: now,
          },
        },
        _sum: { amount: true },
      }),
      this.prisma.order.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: previousStart,
            lte: previousEnd,
          },
        },
        _sum: { amount: true },
      }),
    ]);

    return {
      userGrowthRate: this._calculateGrowthRate(usersCurrent, usersPrevious),
      enrollmentGrowthRate: this._calculateGrowthRate(enrollmentsCurrent, enrollmentsPrevious),
      revenueGrowthRate: this._calculateGrowthRate(
        Number(revenueCurrent._sum.amount || 0),
        Number(revenuePrevious._sum.amount || 0),
      ),
    };
  }

  private _calculateGrowthRate(current: number, previous: number) {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }

    return Math.round(((current - previous) / previous) * 100);
  }

  private _buildMonthBuckets(monthCount: number) {
    const months: Array<{ key: string; label: string; start: Date; end: Date }> = [];
    const now = new Date();

    for (let i = monthCount - 1; i >= 0; i -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
      const key = this._toMonthKey(start);
      const label = start.toLocaleString('en-US', { month: 'short' });
      months.push({ key, label, start, end });
    }

    return months;
  }

  private _toMonthKey(date: Date) {
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    return `${date.getFullYear()}-${month}`;
  }
}
