import { addMailJob } from "@/queues/mail.queue";

export async function sendResetPasswordEmail(email: string, code: string) {
  await addMailJob({
    to: email,
    subject: "Reset your password",
    template: "resetPassword.html",
    replacements: {
      CODE: code,
      app_name: process.env.APP_NAME || "My App",
    },
  });
}

export async function sendNewPasswordEmail(email: string, username: string) {
  await addMailJob({
    to: email,
    subject: "Password updated",
    template: "newPasswordNotice.html",
    replacements: {
      username,
      app_name: process.env.APP_NAME || "My App",
    },
  });
}

export async function sendVerificationEmail(
  email: string,
  url: string,
  username: string,
) {
  await addMailJob({
    to: email,
    subject: "Verify your email",
    template: "verifyEmail.html",
    replacements: {
      url,
      username,
      app_name: process.env.APP_NAME || "My App",
    },
  });
}
