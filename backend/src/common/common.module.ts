import { Module, Global } from '@nestjs/common';
import { OtpService } from './services/otp.service';
import { EmailService } from './services/email.service';
import { ActivityLogService } from './services/activity-log.service';

@Global()
@Module({
  providers: [OtpService, EmailService, ActivityLogService],
  exports: [OtpService, EmailService, ActivityLogService],
})
export class CommonModule {}
