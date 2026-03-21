import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, ValidationPipe } from '@nestjs/common';
import { ModulesService } from './modules.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { GenerateContentDto } from './dto/generate-content.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CourseEnrollmentGuard } from '../common/guards/course-enrollment.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('modules')
@UseGuards(JwtAuthGuard)
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

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
  update(@Param('id') id: string, @Body() updateModuleDto: any, @Request() req) {
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
  updateContent(@Param('id') id: string, @Body() body: { content: any }, @Request() req) {
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
    @Body() body: { voiceId?: string },
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
    @Body() body: { reason?: string },
    @Request() req,
  ) {
    return this.modulesService.rejectVideo(id, body.reason, req.user);
  }

  @Get('voices')
  getVoices() {
    return this.modulesService.getAvailableVoices();
  }
}
