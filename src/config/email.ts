import { emailPass, emailUser } from "@/constant";
import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587, // ✅ use this
  secure: false, // ✅ MUST be false
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});
