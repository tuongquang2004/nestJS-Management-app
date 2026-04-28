import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'tuongquang2004@gmail.com',
        pass: 'dmzojqxjytsbhcpw',
      },
    });
  }

  async sendVerificationEmail(email: string, token: string) {
    const url = `http://localhost:3000/auth/verify?token=${token}`;
    await this.transporter.sendMail({
      from: '"NestJS-demo-project" <no-reply@example.com>',
      to: email,
      subject: 'Authorization Email',
      html: `Please click <a href="${url}">here</a> to verify your email.`,
    });
  }

  async sendNewPostNotification(email: string, postTitle: string) {
    await this.transporter.sendMail({
      from: '"NestJS-demo-project" <no-reply@example.com>',
      to: email,
      subject: 'New Post Available!',
      html: `New post available: <b>${postTitle}</b> has been published.`,
    });
  }
}
