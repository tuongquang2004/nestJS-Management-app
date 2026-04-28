import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailService } from './mail.service';

@Processor('mail-queue')
export class MailProcessor extends WorkerHost {
  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    console.log(`[Worker] Beginning processing: ${job.name} (ID: ${job.id})`);

    try {
      switch (job.name) {
        case 'send-verification-email': {
          const { email, token } = job.data;
          await this.mailService.sendVerificationEmail(email, token);
          console.log(`[Worker] Sent verification email to: ${email}`);
          break;
        }

        case 'send-new-post-notification': {
          const { email, postTitle } = job.data;
          await this.mailService.sendNewPostNotification(email, postTitle);
          console.log(`[Worker] Sent new post notification to: ${email}`);
          break;
        }

        default:
          console.log(`[Worker] Cannot recognize job type: ${job.name}`);
      }
    } catch (error) {
      console.error(
        `[Worker] Error occurred while processing Job ${job.name}:`,
        error,
      );
      throw error;
    }
  }
}
