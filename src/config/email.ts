import { emailPass, emailUser } from "@/constant";
import nodemailer from "nodemailer";
import dns from "dns";

dns.setDefaultResultOrder("ipv4first");
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});
