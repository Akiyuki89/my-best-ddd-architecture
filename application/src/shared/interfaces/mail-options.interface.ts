import { SendMailOptions } from 'nodemailer';

interface IMailOptionsWithTemplate extends SendMailOptions {
  template: string;
  context: Record<string, any>;
}

export { IMailOptionsWithTemplate };
