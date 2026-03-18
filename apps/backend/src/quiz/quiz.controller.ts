import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDto, UpdateQuizDto, CreateQuestionDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('quizzes')
@UseGuards(JwtAuthGuard)
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  create(@Request() req, @Body() createQuizDto: CreateQuizDto) {
    return this.quizService.create(createQuizDto, req.user);
  }

  // More specific routes FIRST, then generic :id route
  @Get('module/:moduleId')
  getByModule(@Param('moduleId') moduleId: string, @Request() req) {
    return this.quizService.findByModule(moduleId, req.user);
  }

  @Get('course/:courseId/all')
  getQuizzesByCourse(@Param('courseId') courseId: string, @Request() req) {
    return this.quizService.getQuizzesByCourse(courseId, req.user);
  }

  @Get(':id')
  getQuiz(@Param('id') id: string, @Request() req) {
    return this.quizService.getQuiz(id, req.user);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  update(@Param('id') id: string, @Body() updateQuizDto: UpdateQuizDto, @Request() req) {
    return this.quizService.update(id, updateQuizDto, req.user);
  }

  @Post(':id/publish')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  publish(@Param('id') id: string, @Request() req) {
    return this.quizService.publishQuiz(id, req.user);
  }

  @Post(':id/unpublish')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  unpublish(@Param('id') id: string, @Request() req) {
    return this.quizService.unpublishQuiz(id, req.user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  remove(@Param('id') id: string, @Request() req) {
    return this.quizService.deleteQuiz(id, req.user);
  }

  // Question endpoints - use specific paths
  @Post(':quizId/questions')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  addQuestion(
    @Param('quizId') quizId: string,
    @Body() createQuestionDto: CreateQuestionDto,
    @Request() req,
  ) {
    return this.quizService.addQuestion(quizId, createQuestionDto, req.user);
  }

  @Patch('questions/:questionId')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  updateQuestion(
    @Param('questionId') questionId: string,
    @Body() updateQuestionDto: any,
    @Request() req,
  ) {
    return this.quizService.updateQuestion(questionId, updateQuestionDto, req.user);
  }

  @Delete('questions/:questionId')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  deleteQuestion(@Param('questionId') questionId: string, @Request() req) {
    return this.quizService.deleteQuestion(questionId, req.user);
  }
}
