import * as hbs from 'nodemailer-express-handlebars';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import { Injectable, Logger } from '@nestjs/common';
import { EnvService } from '@common/configuration/env/dotenv.config';
import { ErrorHandlingUtil } from '@shared/utils/error.util';
import { IMailOptionsWithTemplate } from '@shared/interfaces/mail-options.interface';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private envService: EnvService) {
    this.transporter = nodemailer.createTransport({
      host: this.envService.getMailHost(),
      port: this.envService.getMailPort(),
      secure: this.envService.getMailSecure(),
      auth: {
        user: this.envService.getMailUser(),
        pass: this.envService.getMailPass(),
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
      from: `"My App" <${this.envService.getMailFrom()}>`,
      to,
      subject: 'Email Verification',
      template: 'verification',
      context: { code, year: new Date().getFullYear() },
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Verification email sent to ${to}`);
    } catch (error) {
      ErrorHandlingUtil.handleEmailError(error, 'send verification email');
    }
  }

  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    const mailOptions: IMailOptionsWithTemplate = {
      from: `"My App" <${this.envService.getMailFrom()}>`,
      to,
      subject: 'Password Reset',
      template: 'password-reset',
      context: { resetUrl, year: new Date().getFullYear() },
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent to ${to}`);
    } catch (error) {
      ErrorHandlingUtil.handleEmailError(error, 'send password reset email');
    }
  }
}
