interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  async send(options: EmailOptions): Promise<void> {
    console.log('[Email] Sending to:', options.to);
    // Integration with Resend, SendGrid, etc.
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    await this.send({
      to: email,
      subject: 'مرحباً بك في AQIOM',
      html: `<h1>مرحباً ${name}</h1><p>شكراً لانضمامك إلى AQIOM</p>`,
    });
  }

  async sendPasswordReset(email: string, token: string): Promise<void> {
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
    await this.send({
      to: email,
      subject: 'إعادة تعيين كلمة المرور',
      html: `<p>انقر <a href="${resetLink}">هنا</a> لإعادة تعيين كلمة المرور</p>`,
    });
  }
}

export const emailService = new EmailService();
