import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PublicCourseGuard } from '../common/guards/public-course.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  create(@Request() req, @Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto, req.user);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  findAll(@Request() req) {
    return this.coursesService.findAll(req.user);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard, PublicCourseGuard)
  findOne(@Param('id') id: string, @Request() req) {
    return this.coursesService.findOne(id, req.user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto, @Request() req) {
    return this.coursesService.update(id, updateCourseDto, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  remove(@Param('id') id: string, @Request() req) {
    return this.coursesService.remove(id, req.user);
  }
}
