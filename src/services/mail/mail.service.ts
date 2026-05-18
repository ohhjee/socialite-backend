import { transporter } from "@/config/email";
import { emailUser } from "@/constant";
import { log } from "console";
import fs from "fs";
import path from "path";

export const sendEmailTemplate = async (
  to: string,
  subject: string,
  templateName: string,
  replacements: Record<string, string>,
) => {
  try {
    const filePath = path.join(__dirname, "templates", templateName);
    let html = fs.readFileSync(filePath, "utf-8");
    for (const key in replacements) {
      html = html.replace(new RegExp(`{{${key}}}`, "g"), replacements[key]);
    }

    await transporter.sendMail({
      from: emailUser,
      to,
      subject,
      html,
    });
  } catch (error) {
    log(error);
  }
};
