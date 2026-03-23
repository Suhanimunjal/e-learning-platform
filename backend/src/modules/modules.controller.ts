import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, ValidationPipe } from '@nestjs/common';
import { ModulesService } from './modules.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { GenerateContentDto } from './dto/generate-content.dto';
import { UpdateContentBodyDto, GenerateVideoBodyDto, RejectVideoBodyDto } from './dto/module-body.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CourseEnrollmentGuard } from '../common/guards/course-enrollment.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Controller('modules')
@UseGuards(JwtAuthGuard)
export class ModulesController {
  constructor(
    private readonly modulesService: ModulesService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  create(@Request() req, @Body() createModuleDto: CreateModuleDto) {
    return this.modulesService.create(createModuleDto, req.user);
  }

  @Get('section/:sectionId')
  @UseGuards(CourseEnrollmentGuard)
  findAll(@Param('sectionId') sectionId: string, @Request() req) {
    return this.modulesService.findAll(sectionId, req.user);
  }

  @Get(':id')
  @UseGuards(CourseEnrollmentGuard)
  findOne(@Param('id') id: string, @Request() req) {
    return this.modulesService.findOne(id, req.user);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  update(@Param('id') id: string, @Body() updateModuleDto: UpdateModuleDto, @Request() req) {
    return this.modulesService.update(id, updateModuleDto, req.user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  remove(@Param('id') id: string, @Request() req) {
    return this.modulesService.remove(id, req.user);
  }

  // Video Generation Endpoints
  
  @Post(':id/generate-content')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  generateContent(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) 
    body: GenerateContentDto,
    @Request() req,
  ) {
    return this.modulesService.generateContent(id, body.topic, req.user);
  }

  @Patch(':id/content')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  updateContent(@Param('id') id: string, @Body() body: UpdateContentBodyDto, @Request() req) {
    return this.modulesService.updateContent(id, body.content, req.user);
  }

  @Post(':id/approve-content')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  approveContent(@Param('id') id: string, @Request() req) {
    return this.modulesService.approveContent(id, req.user);
  }

  @Get(':id/video-status')
  @UseGuards(CourseEnrollmentGuard)
  getVideoStatus(@Param('id') id: string, @Request() req) {
    return this.modulesService.getVideoStatus(id, req.user);
  }

  @Post(':id/generate-video')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  generateVideo(
    @Param('id') id: string,
    @Body() body: GenerateVideoBodyDto,
    @Request() req,
  ) {
    return this.modulesService.generateVideo(id, body.voiceId, req.user);
  }

  @Get(':id/video-preview')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  getVideoPreview(@Param('id') id: string, @Request() req) {
    return this.modulesService.getVideoPreview(id, req.user);
  }

  @Post(':id/approve-video')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  approveVideo(@Param('id') id: string, @Request() req) {
    return this.modulesService.approveVideo(id, req.user);
  }

  @Post(':id/reject-video')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  rejectVideo(
    @Param('id') id: string,
    @Body() body: RejectVideoBodyDto,
    @Request() req,
  ) {
    return this.modulesService.rejectVideo(id, body.reason, req.user);
  }

  @Get('voices')
  getVoices() {
    return this.modulesService.getAvailableVoices();
  }

  // Mark module as complete for student
  @Post(':id/complete')
  @Roles(Role.STUDENT)
  async markComplete(@Param('id') id: string, @Request() req) {
    const existing = await this.prisma.progress.findFirst({
      where: { userId: req.user.id, moduleId: id },
    });

    if (existing) {
      return this.prisma.progress.update({
        where: { id: existing.id },
        data: { completed: true, lastAccessed: new Date() },
      });
    }

    return this.prisma.progress.create({
      data: {
        userId: req.user.id,
        moduleId: id,
        completed: true,
      },
    });
  }
}
