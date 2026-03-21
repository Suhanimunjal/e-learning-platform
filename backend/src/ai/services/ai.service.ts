import { Injectable, Logger, BadRequestException, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ContentGeneratorEnhancedService } from '../content-generator-enhanced.service';
import { AnthropicService } from './anthropic.service';
import { TTSService } from '../tts.service';
import { CustomAiJobScheduler } from './custom-ai-job-scheduler';

@Injectable()
export class AiService implements OnModuleDestroy {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private prisma: PrismaService,
    private contentGenerator: ContentGeneratorEnhancedService,
    private anthropicService: AnthropicService,
    private ttsService: TTSService,
    private customScheduler: CustomAiJobScheduler,
  ) {}

  async onModuleDestroy() {
    // Cleanup if needed
  }

  async generateCourseOutline(topic: string, userId: string) {
    const job = await this.prisma.aIGenerationJob.create({
      data: {
        type: 'course',
        status: 'pending',
        input: { topic },
        version: 'claude-3-5-sonnet',
        tenantId: userId,
      },
    });

    // Use custom scheduler for async processing
    await this.customScheduler.addJob('generate-outline', { topic, jobId: job.id });

    return job;
  }

  async generateLessons(courseId: string, userId: string) {
    const job = await this.prisma.aIGenerationJob.create({
      data: {
        type: 'lesson',
        status: 'pending',
        input: { courseId },
        version: 'claude-3-5-sonnet',
        tenantId: userId,
      },
    });

    await this.customScheduler.addJob('generate-lessons', { courseId, jobId: job.id });

    return job;
  }

  async generateQuiz(moduleId: string, userId: string) {
    const job = await this.prisma.aIGenerationJob.create({
      data: {
        type: 'quiz',
        status: 'pending',
        input: { moduleId },
        version: 'claude-3-5-sonnet',
        tenantId: userId,
      },
    });

    await this.customScheduler.addJob('generate-quiz', { moduleId, jobId: job.id });

    return job;
  }

  async generateFlashcards(moduleId: string, userId: string) {
    const job = await this.prisma.aIGenerationJob.create({
      data: {
        type: 'flashcards',
        status: 'pending',
        input: { moduleId },
        version: 'claude-3-5-sonnet',
        tenantId: userId,
      },
    });

    await this.customScheduler.addJob('generate-flashcards', { moduleId, jobId: job.id });

    return job;
  }

  async getJobStatus(jobId: string) {
    return this.prisma.aIGenerationJob.findUnique({ where: { id: jobId } });
  }

  async generateAssignment(topic: string, tone: string): Promise<any> {
    const content = await this.contentGenerator.generateFullContent(topic);
    
    return {
      success: true,
      data: {
        title: content.title,
        content: content.assignment.problemStatement,
        instructions: content.assignment.instructions,
        rubric: content.assignment.rubric,
        expectedOutput: content.assignment.expectedOutput,
        tone,
        topic,
      },
    };
  }

  async generateExamples(topic: string, tone: string): Promise<any> {
    const content = await this.contentGenerator.generateFullContent(topic);
    
    return {
      success: true,
      data: {
        title: `Code Examples: ${topic}`,
        examples: content.examples,
        tone,
        topic,
      },
    };
  }

  async summarizeContent(contentText: string, tone: string): Promise<any> {
    const summaryPrompt = `Summarize the following content in a ${tone} tone. Provide a clear and concise summary with key points.

Content to summarize:
${contentText}

Return JSON with this structure:
{
  "summary": "2-3 paragraph summary",
  "keyPoints": ["point1", "point2", "point3"],
  "mainTakeaway": "one sentence conclusion"
}`;

    try {
      const response = await this.anthropicService.generateStructuredResponse(summaryPrompt);
      
      return {
        success: true,
        data: {
          summary: response.summary || contentText.substring(0, 500),
          keyPoints: response.keyPoints || [],
          mainTakeaway: response.mainTakeaway || '',
          tone,
          originalLength: contentText.length,
        },
      };
    } catch (error) {
      this.logger.error('Summarize content failed:', error);
      throw new BadRequestException('Failed to summarize content');
    }
  }

  async gradeSubmission(submissionId: string): Promise<any> {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: { assignment: true },
    });

    if (!submission) {
      throw new BadRequestException('Submission not found');
    }

    const studentAnswer = submission.textContent || '';
    const assignmentTitle = submission.assignment?.title || 'Assignment';
    const maxPoints = submission.assignment?.maxPoints || 100;

    const gradingPrompt = `Grade this student submission for: ${assignmentTitle}

Student's Answer:
${studentAnswer}

Assignment Maximum Points: ${maxPoints}

Provide a detailed grading response in JSON format:
{
  "aiScore": number (0-${maxPoints}),
  "aiConfidence": number (0-100),
  "feedback": "detailed feedback on the answer",
  "strengths": ["strength1", "strength2"],
  "areasForImprovement": ["area1", "area2"],
  "detailedComments": "line by line or section by section analysis"
}`;

    try {
      const gradingResult = await this.anthropicService.generateStructuredResponse(gradingPrompt);
      
      await this.prisma.submission.update({
        where: { id: submissionId },
        data: {
          grade: gradingResult.aiScore,
          feedback: gradingResult.feedback,
          gradedAt: new Date(),
        },
      });

      return {
        success: true,
        data: {
          submissionId,
          aiScore: gradingResult.aiScore,
          aiConfidence: gradingResult.aiConfidence,
          feedback: gradingResult.feedback,
          gradedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error('Grading failed:', error);
      throw new BadRequestException('Failed to grade submission');
    }
  }

  async gradeQuizAttempt(attemptId: string, user: any): Promise<any> {
    const attempt = await this.prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          include: {
            questions: {
              orderBy: { order: 'asc' },
            },
            module: {
              include: {
                section: {
                  include: {
                    course: true,
                  },
                },
              },
            },
          },
        },
        user: true,
      },
    });

    if (!attempt) {
      throw new BadRequestException('Quiz attempt not found');
    }

    if (!attempt.quiz.published) {
      throw new BadRequestException('Quiz is not published');
    }

    const quiz = attempt.quiz;
    const answers = attempt.answers as Record<string, { answer: string | string[] }>;
    const grades: Record<string, { points: number; feedback: string; confidence: number }> = {};
    let totalScore = 0;
    let maxScore = 0;

    for (const question of quiz.questions) {
      maxScore += question.points;
      const studentAnswer = answers[question.id]?.answer || '';
      
      const gradingPrompt = `You are grading a ${question.type} question.

Question: ${question.text}
${question.type === 'multiple_choice' && question.options ? `Options: ${JSON.stringify(question.options)}` : ''}
Correct Answer: ${question.correctAnswer}
Student's Answer: ${studentAnswer}
Max Points: ${question.points}

Provide a detailed grading response in JSON format:
{
  "earnedPoints": number (0-${question.points}),
  "confidence": number (0-100),
  "feedback": "explanation of why points were awarded or deducted",
  "isCorrect": boolean
}`;

      try {
        const result = await this.anthropicService.generateStructuredResponse(gradingPrompt);
        
        const earnedPoints = Math.min(Math.max(0, result.earnedPoints || 0), question.points);
        totalScore += earnedPoints;
        
        grades[question.id] = {
          points: earnedPoints,
          feedback: result.feedback || '',
          confidence: result.confidence || 50,
        };
      } catch (error) {
        this.logger.error(`Failed to grade question ${question.id}:`, error);
        grades[question.id] = {
          points: 0,
          feedback: 'Failed to grade automatically. Please review manually.',
          confidence: 0,
        };
      }
    }

    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    const passed = percentage >= quiz.passingScore;

    await this.prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        answers: {
          ...answers,
          teacherGrades: grades,
        } as any,
        score: totalScore,
        percentage: Math.round(percentage * 100) / 100,
        passed,
      },
    });

    return {
      success: true,
      attemptId,
      quizId: quiz.id,
      studentName: attempt.user.name,
      totalScore,
      maxScore,
      percentage: Math.round(percentage * 100) / 100,
      passingScore: quiz.passingScore,
      passed,
      grades,
      gradedAt: new Date().toISOString(),
    };
  }

  async getQuizGradingStatus(attemptId: string): Promise<any> {
    const attempt = await this.prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          include: {
            questions: true,
          },
        },
      },
    });

    if (!attempt) {
      throw new BadRequestException('Quiz attempt not found');
    }

    const answers = attempt.answers as Record<string, any>;
    const grades = answers?.teacherGrades || {};
    const gradedCount = Object.keys(grades).length;
    const totalQuestions = attempt.quiz.questions.length;

    return {
      attemptId,
      status: gradedCount === totalQuestions ? 'completed' : 'in_progress',
      gradedCount,
      totalQuestions,
      score: attempt.score,
      percentage: attempt.percentage,
      passed: attempt.passed,
    };
  }

  async getGradingFeedback(submissionId: string): Promise<any> {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      throw new BadRequestException('Submission not found');
    }

    if (!submission.feedback) {
      return {
        success: true,
        data: {
          submissionId,
          feedback: 'No feedback available yet. Please wait for grading to complete.',
          suggestions: [],
        },
      };
    }

    return {
      success: true,
      data: {
        submissionId,
        feedback: submission.feedback,
        grade: submission.grade,
        suggestions: [
          'Review the feedback above',
          'Revise your answer based on the comments',
          'Schedule office hours for additional help',
        ],
      },
    };
  }

  async overrideGrade(submissionId: string, score: number, feedback?: string): Promise<any> {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: { assignment: true },
    });

    if (!submission) {
      throw new BadRequestException('Submission not found');
    }

    const maxPoints = submission.assignment?.maxPoints || 100;
    if (score < 0 || score > maxPoints) {
      throw new BadRequestException(`Score must be between 0 and ${maxPoints}`);
    }

    const updated = await this.prisma.submission.update({
      where: { id: submissionId },
      data: {
        grade: score,
        feedback: feedback || submission.feedback,
        gradedAt: new Date(),
      },
    });

    return {
      success: true,
      data: {
        submissionId,
        finalScore: updated.grade,
        teacherOverride: true,
        feedback: updated.feedback,
        overriddenAt: updated.gradedAt?.toISOString(),
      },
    };
  }

  async getRecommendations(studentId: string): Promise<any> {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId: studentId },
      include: {
        course: {
          include: {
            sections: {
              include: {
                modules: {
                  include: {
                    progresses: {
                      where: { userId: studentId },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!enrollments.length) {
      return {
        success: true,
        data: [],
      };
    }

    const completedModuleIds = new Set<string>();
    const moduleScores: { moduleId: string; score: number }[] = [];

    for (const enrollment of enrollments) {
      for (const section of enrollment.course.sections || []) {
        for (const mod of section.modules || []) {
          const progress = mod.progresses[0];
          if (progress?.completed) {
            completedModuleIds.add(mod.id);
          }
          if (progress?.courseProgress !== undefined) {
            moduleScores.push({ moduleId: mod.id, score: progress.courseProgress });
          }
        }
      }
    }

    const avgScore = moduleScores.length > 0
      ? moduleScores.reduce((sum, m) => sum + m.score, 0) / moduleScores.length
      : 0;

    const recommendedCourses = await this.prisma.course.findMany({
      where: {
        status: 'APPROVED',
        id: { notIn: enrollments.map(e => e.courseId) },
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    const recommendations = recommendedCourses.map(course => {
      let matchScore = 50;
      let reason = 'New course available';

      if (avgScore >= 70) {
        matchScore = 85;
        reason = 'Great progress overall - explore new topics';
      } else if (avgScore >= 50) {
        matchScore = 75;
        reason = 'Building on your current knowledge level';
      } else {
        matchScore = 65;
        reason = 'Strengthen your foundations with this course';
      }

      return {
        courseId: course.id,
        title: course.title,
        reason,
        matchScore,
      };
    });

    return {
      success: true,
      data: recommendations,
    };
  }

  async trackProgress(studentId: string, topic: string, score: number): Promise<any> {
    if (score < 0 || score > 100) {
      throw new BadRequestException('Score must be between 0 and 100');
    }

    const modules = await this.prisma.module.findMany({
      where: {
        OR: [
          { title: { contains: topic } },
          { textContent: { contains: topic } },
        ],
      },
      take: 1,
    });

    if (modules.length > 0) {
      const existingProgress = await this.prisma.progress.findFirst({
        where: {
          userId: studentId,
          moduleId: modules[0].id,
        },
      });

      if (existingProgress) {
        await this.prisma.progress.update({
          where: { id: existingProgress.id },
          data: {
            courseProgress: score,
            completed: score >= 70,
            lastAccessed: new Date(),
          },
        });
      } else {
        await this.prisma.progress.create({
          data: {
            userId: studentId,
            moduleId: modules[0].id,
            courseProgress: score,
            completed: score >= 70,
          },
        });
      }
    }

    return {
      success: true,
      data: {
        studentId,
        topic,
        score,
        trackedAt: new Date().toISOString(),
      },
    };
  }

  async translateText(text: string, targetLang: string, sourceLang?: string): Promise<any> {
    if (!text || text.trim().length === 0) {
      throw new BadRequestException('Text is required for translation');
    }

    const prompt = `Translate the following text${sourceLang ? ` from ${sourceLang}` : ''} to ${targetLang}.

Text to translate:
${text}

Return JSON:
{
  "original": "original text",
  "translated": "translated text",
  "sourceLang": "${sourceLang || 'auto-detected'}",
  "targetLang": "${targetLang}"
}`;

    try {
      const result = await this.anthropicService.generateStructuredResponse(prompt);
      
      return {
        success: true,
        data: {
          original: text,
          translated: result.translated || text,
          sourceLang: result.sourceLang || sourceLang || 'unknown',
          targetLang,
        },
      };
    } catch (error) {
      this.logger.error('Translation failed:', error);
      throw new BadRequestException('Failed to translate text');
    }
  }

  async detectLanguage(text: string): Promise<any> {
    if (!text || text.trim().length === 0) {
      throw new BadRequestException('Text is required for language detection');
    }

    const prompt = `Detect the language of the following text. Return only the language name and confidence score.

Text: ${text.substring(0, 500)}

Return JSON:
{
  "language": "language name",
  "confidence": 0.95,
  "code": "ISO 639-1 code"
}`;

    try {
      const result = await this.anthropicService.generateStructuredResponse(prompt);
      
      return {
        success: true,
        data: {
          language: result.language || 'Unknown',
          confidence: result.confidence || 0.5,
          code: result.code || 'unknown',
        },
      };
    } catch (error) {
      this.logger.error('Language detection failed:', error);
      throw new BadRequestException('Failed to detect language');
    }
  }

  async search(query: string, filters?: any): Promise<any> {
    if (!query || query.trim().length === 0) {
      throw new BadRequestException('Search query is required');
    }

    const courses = await this.prisma.course.findMany({
      where: {
        status: 'APPROVED',
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        sections: {
          include: {
            modules: {
              where: {
                OR: [
                  { title: { contains: query, mode: 'insensitive' } },
                  { textContent: { contains: query, mode: 'insensitive' } },
                ],
              },
            },
          },
        },
      },
      take: 20,
    });

    const results: any[] = [];

    for (const course of courses) {
      results.push({
        id: course.id,
        type: 'course',
        title: course.title,
        snippet: course.description.substring(0, 200),
        relevanceScore: 90,
      });

      for (const section of course.sections) {
        for (const mod of section.modules) {
          results.push({
            id: mod.id,
            type: mod.type.toLowerCase(),
            title: mod.title,
            snippet: mod.textContent?.substring(0, 200) || '',
            relevanceScore: 85,
          });
        }
      }
    }

    return {
      success: true,
      data: results,
      query,
      filters: filters || {},
    };
  }

  async getSearchSuggestions(query: string): Promise<any> {
    if (!query || query.trim().length < 2) {
      return { success: true, data: [] };
    }

    const courses = await this.prisma.course.findMany({
      where: {
        status: 'APPROVED',
        title: { contains: query, mode: 'insensitive' },
      },
      select: { title: true },
      take: 5,
    });

    const suggestions = courses.map(c => c.title);
    
    return { success: true, data: suggestions };
  }

  async chat(message: string, sessionId?: string, courseId?: string): Promise<any> {
    if (!message || message.trim().length === 0) {
      throw new BadRequestException('Message is required');
    }

    let context = '';
    if (courseId) {
      const course = await this.prisma.course.findUnique({
        where: { id: courseId },
        include: {
          sections: {
            include: {
              modules: {
                take: 5,
                orderBy: { order: 'asc' },
              },
            },
          },
        },
      });
      if (course) {
        context = `The user is asking about the course "${course.title}". `;
        context += `Course description: ${course.description}. `;
        context += `Available modules: ${course.sections.flatMap(s => s.modules).map(m => m.title).join(', ')}.`;
      }
    }

    const prompt = `${context}

User question: ${message}

Provide a helpful response as a course assistant. If the question is about course content, provide accurate information. If you don't know, say so.

Return JSON:
{
  "response": "your helpful response",
  "suggestions": ["related question 1", "related question 2"]
}`;

    try {
      const result = await this.anthropicService.generateStructuredResponse(prompt);
      
      return {
        success: true,
        data: {
          message,
          response: result.response || 'I can help you with your learning questions.',
          sessionId: sessionId || `session-${Date.now()}`,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error('Chat failed:', error);
      throw new BadRequestException('Failed to generate response');
    }
  }

  async getChatHistory(sessionId: string): Promise<any> {
    return {
      success: true,
      data: [],
      sessionId,
    };
  }

  async createChatSession(courseId?: string): Promise<any> {
    return {
      success: true,
      data: {
        id: `session-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        courseId,
        createdAt: new Date().toISOString(),
      },
    };
  }
}
