import { Controller, Post, Get, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { AiService } from './services/ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  // Course Generation
  @Post('generate-outline')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  async generateOutline(@Request() req, @Body() body: { topic: string }) {
    return this.aiService.generateCourseOutline(body.topic, req.user.id);
  }

  @Post('generate-lessons/:courseId')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  async generateLessons(@Request() req, @Param('courseId') courseId: string) {
    return this.aiService.generateLessons(courseId, req.user.id);
  }

  @Get('job/:jobId')
  async getJobStatus(@Param('jobId') jobId: string) {
    return this.aiService.getJobStatus(jobId);
  }

  @Post('generate-quiz/:moduleId')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  async generateQuiz(@Request() req, @Param('moduleId') moduleId: string) {
    return this.aiService.generateQuiz(moduleId, req.user.id);
  }

  @Post('generate-flashcards/:moduleId')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  async generateFlashcards(@Request() req, @Param('moduleId') moduleId: string) {
    return this.aiService.generateFlashcards(moduleId, req.user.id);
  }

  // Content Generation
  @Post('generate-assignment')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  async generateAssignment(@Body() body: { topic: string; tone?: string }) {
    return this.aiService.generateAssignment(body.topic, body.tone || 'formal');
  }

  @Post('generate-examples')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  async generateExamples(@Body() body: { topic: string; tone?: string }) {
    return this.aiService.generateExamples(body.topic, body.tone || 'casual');
  }

  @Post('summarize-content')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  async summarizeContent(@Body() body: { content: string; tone?: string }) {
    return this.aiService.summarizeContent(body.content, body.tone || 'simplified');
  }

  // Auto-Grading
  @Post('grade/:submissionId')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  async gradeSubmission(@Param('submissionId') submissionId: string) {
    return this.aiService.gradeSubmission(submissionId);
  }

  @Get('grade/:submissionId/feedback')
  async getFeedback(@Param('submissionId') submissionId: string) {
    return this.aiService.getGradingFeedback(submissionId);
  }

  @Post('grade/:submissionId/override')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  async overrideGrade(
    @Param('submissionId') submissionId: string,
    @Body() body: { score: number; feedback?: string }
  ) {
    return this.aiService.overrideGrade(submissionId, body.score, body.feedback);
  }

  // Recommendations
  @Get('recommendations/:studentId')
  async getRecommendations(@Param('studentId') studentId: string) {
    return this.aiService.getRecommendations(studentId);
  }

  @Post('recommendations/track')
  async trackProgress(@Body() body: { studentId: string; topic: string; score: number }) {
    return this.aiService.trackProgress(body.studentId, body.topic, body.score);
  }

  // Translation
  @Post('translate')
  async translate(@Body() body: { text: string; targetLang: string; sourceLang?: string }) {
    return this.aiService.translateText(body.text, body.targetLang, body.sourceLang);
  }

  @Post('detect-language')
  async detectLanguage(@Body() body: { text: string }) {
    return this.aiService.detectLanguage(body.text);
  }

  // Smart Search
  @Get('search')
  async search(@Query('query') query: string, @Query() filters: any) {
    return this.aiService.search(query, filters);
  }

  @Get('search/suggestions')
  async getSuggestions(@Query('query') query: string) {
    return this.aiService.getSearchSuggestions(query);
  }

  // Chatbot
  @Post('chat')
  async chat(@Body() body: { message: string; sessionId?: string; courseId?: string }) {
    return this.aiService.chat(body.message, body.sessionId, body.courseId);
  }

  @Get('chat/history/:sessionId')
  async getChatHistory(@Param('sessionId') sessionId: string) {
    return this.aiService.getChatHistory(sessionId);
  }

  @Post('chat/session')
  async createSession(@Body() body?: { courseId?: string }) {
    return this.aiService.createChatSession(body?.courseId);
  }
}
