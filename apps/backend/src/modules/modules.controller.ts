import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ModulesService } from './modules.service';
import { CreateModuleDto } from './dto/create-module.dto';
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
}
