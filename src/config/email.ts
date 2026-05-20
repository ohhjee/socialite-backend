import { emailPass, emailUser } from "@/constant";
import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import dns from "dns";

dns.setDefaultResultOrder("ipv4first");

const transportOptions: SMTPTransport.Options = {
  host: "smtp.gmail.com",
  port: 587,
  secure: false,

  auth: {
    user: emailUser,
    pass: emailPass,
  },
};

export const transporter = nodemailer.createTransport(transportOptions);
