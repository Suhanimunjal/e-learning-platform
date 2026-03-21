import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  create(@Request() req, @Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationsService.create(createOrganizationDto, req.user);
  }

  @Get()
  findAll(@Request() req) {
    return this.organizationsService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.organizationsService.findOne(id, req.user);
  }

  @Post(':id/users/:userId')
  @Roles(Role.ADMIN, Role.MANAGER)
  addUser(
    @Param('id') organizationId: string,
    @Param('userId') userId: string,
    @Request() req,
  ) {
    return this.organizationsService.addUserToOrganization(organizationId, userId, req.user);
  }
}
