import { sendEmailTemplate } from "./mail/mail.service";

export async function sendResetPasswordEmail(email: string, code: string) {
  await sendEmailTemplate(email, "Reset your password", "resetPassword.html", {
    CODE: code,
    app_name: process.env.APP_NAME || "My App",
  });
}

export async function sendNewPasswordEmail(email: string, username: string) {
  await sendEmailTemplate(email, "Password updated", "newPasswordNotice.html", {
    username,
    app_name: process.env.APP_NAME || "My App",
  });
}

export async function sendVerificationEmail(
  email: string,
  url: string,
  username: string,
) {
  await sendEmailTemplate(email, "Verify your email", "verifyEmail.html", {
    url,
    username,
    app_name: process.env.APP_NAME || "My App",
  });
}
