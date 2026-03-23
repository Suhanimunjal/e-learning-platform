import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  BadRequestException,
  Res,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, createReadStream, statSync } from 'fs';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

const uploadPath = join(process.cwd(), 'uploads', 'course-materials');

// Blocked extensions - executables, scripts, and dangerous files
const BLOCKED_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.msi', '.scr', '.pif', '.vbs', '.vbe',
  '.js', '.jse', '.ws', '.wsf', '.wsc', '.wsh', '.ps1', '.ps1xml', '.ps2',
  '.ps2xml', '.psc1', '.psc2', '.msh', '.msh1', '.msh2', '.inf', '.reg',
  '.dll', '.sys', '.drv', '.cpl', '.hta', '.ins', '.isp', '.sct', '.shb',
  '.shs', '.deb', '.rpm', '.run', '.app', '.gadget', '.workflow',
];

// Allowed MIME types
const ALLOWED_MIMES = [
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/webm',
  'video/ogg',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'application/zip',
  'application/x-zip-compressed',
];

const fileFilter = (req: any, file: any, cb: any) => {
  // Check MIME type
  if (!ALLOWED_MIMES.includes(file.mimetype)) {
    cb(new BadRequestException(`File type ${file.mimetype} is not allowed`), false);
    return;
  }

  // Check extension - block dangerous executables
  const ext = extname(file.originalname).toLowerCase();
  if (BLOCKED_EXTENSIONS.includes(ext)) {
    cb(new BadRequestException(`File extension ${ext} is not allowed for security reasons`), false);
    return;
  }

  // Double-check by looking at the original filename for tricks like "file.pdf.exe"
  const lowerName = file.originalname.toLowerCase();
  for (const blocked of BLOCKED_EXTENSIONS) {
    if (lowerName.endsWith(blocked) && !lowerName.endsWith(ext)) {
      cb(new BadRequestException(`File appears to contain a blocked extension: ${blocked}`), false);
      return;
    }
  }

  cb(null, true);
};

const storage = diskStorage({
  destination: uploadPath,
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    // Sanitize extension
    const safeExt = ext.toLowerCase().replace(/[^a-z0-9.]/g, '');
    cb(null, `${uniqueSuffix}${safeExt}`);
  },
});

@Controller('uploads')
export class UploadsController {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}
  @Post('single')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      fileFilter,
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    }),
  )
  uploadSingle(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return {
      name: file.originalname,
      url: `/uploads/course-materials/${file.filename}`,
      type: this.getFileType(file.mimetype),
      size: file.size,
    };
  }

  @Post('multiple')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      storage,
      fileFilter,
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB per file
    }),
  )
  uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    return files.map((file) => ({
      name: file.originalname,
      url: `/uploads/course-materials/${file.filename}`,
      type: this.getFileType(file.mimetype),
      size: file.size,
    }));
  }

  @Get('download/:filename')
  async downloadFile(
    @Param('filename') filename: string,
    @Query('token') token: string,
    @Res() res: Response,
  ) {
    // Validate token from query param (for browser downloads) or header
    if (!token) {
      throw new UnauthorizedException('Authentication required');
    }

    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      const payload = this.jwtService.verify(token, { secret });
      
      // Validate user exists
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Sanitize filename to prevent path traversal
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '');
    const filePath = join(uploadPath, safeName);

    if (!existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    const stat = statSync(filePath);
    const stream = createReadStream(filePath);

    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Length': stat.size.toString(),
      'Content-Disposition': `attachment; filename="${safeName}"`,
    });

    stream.pipe(res);
  }

  private getFileType(mimetype: string): string {
    if (mimetype === 'application/pdf') return 'pdf';
    if (mimetype.includes('powerpoint') || mimetype.includes('presentation')) return 'ppt';
    if (mimetype.includes('word') || mimetype.includes('document')) return 'doc';
    if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) return 'xls';
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('video/')) return 'video';
    if (mimetype.startsWith('audio/')) return 'audio';
    return 'file';
  }
}
