import * as nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'ohamza762@gmail.com',
    pass: 'pzapbzkwmgpcwzos',
  },
});

export const sendVerificationEmail = async (
  to: string,
  verificationCode: string,
): Promise<void> => {
  await transporter.sendMail({
    from: 'UniSaver <no-reply@unisaver.com>',
    to,
    subject: 'UniSaver Email Verification',
    text: `Your verification code: ${verificationCode}`,
  });
};

export const sendPasswordResetEmail = async (
  to: string,
  resetToken: string,
): Promise<void> => {
  await transporter.sendMail({
    from: 'UniSaver <no-reply@unisaver.com>',
    to,
    subject: 'UniSaver Password Reset',
    text: `Click the following link to reset your password: https://example.com/reset-password?token=${resetToken}`,
  });
};
