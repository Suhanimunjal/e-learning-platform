import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { SectionsService } from './sections.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('sections')
@UseGuards(JwtAuthGuard)
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  create(@Request() req, @Body() createSectionDto: CreateSectionDto) {
    return this.sectionsService.create(createSectionDto, req.user);
  }

  @Get('course/:courseId')
  findAll(@Param('courseId') courseId: string, @Request() req) {
    return this.sectionsService.findAll(courseId, req.user);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  update(@Param('id') id: string, @Body() updateSectionDto: UpdateSectionDto, @Request() req) {
    return this.sectionsService.update(id, updateSectionDto, req.user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  remove(@Param('id') id: string, @Request() req) {
    return this.sectionsService.remove(id, req.user);
  }
}
