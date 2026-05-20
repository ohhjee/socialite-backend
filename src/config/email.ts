import dns from "dns";
dns.setDefaultResultOrder("ipv4first");
import { emailPass, emailUser } from "@/constant";
import nodemailer from "nodemailer";
export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  family: 4, // ✅ force IPv4
  auth: {
    user: emailUser,
    pass: emailPass,
  },
} as any);
