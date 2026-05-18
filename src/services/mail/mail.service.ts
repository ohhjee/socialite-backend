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

    if (!fs.existsSync(filePath)) {
      throw new Error(`Template not found: ${filePath}`);
    }

    let html = fs.readFileSync(filePath, "utf-8");
    for (const key in replacements) {
      html = html.replace(new RegExp(`{{${key}}}`, "g"), replacements[key]);
    }

    const result = await transporter.sendMail({
      from: emailUser,
      to,
      subject,
      html,
    });

    console.log(`✉️ Email sent successfully to ${to}:`, result.messageId);
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error);
    throw error; // Re-throw so BullMQ knows this job failed
  }
};
