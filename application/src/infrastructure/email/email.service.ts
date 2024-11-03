import * as hbs from 'nodemailer-express-handlebars';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import { Injectable } from '@nestjs/common';
import { IMailOptionsWithTemplate } from '@shared/interfaces/mail-options.interface';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT, 10),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    this.transporter.use(
      'compile',
      hbs({
        viewEngine: {
          layoutsDir: path.resolve('./src/email/views/layouts'),
          partialsDir: path.resolve('./src/email/views/templates'),
          defaultLayout: 'main',
          extname: '.hbs',
        },
        viewPath: path.resolve('./src/email/views/templates'),
        extName: '.hbs',
      }),
    );
  }

  async sendVerificationEmail(to: string, code: string): Promise<void> {
    const mailOptions: IMailOptionsWithTemplate = {
      from: `"My App" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Email Verification',
      template: 'verification',
      context: { code, year: new Date().getFullYear() },
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    const mailOptions: IMailOptionsWithTemplate = {
      from: `"My App" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Password Reset',
      template: 'password-reset',
      context: { resetUrl, year: new Date().getFullYear() },
    };

    await this.transporter.sendMail(mailOptions);
  }
}
