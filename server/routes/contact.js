// ✅ FIX: Changed to ES Module syntax
import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

// POST /api/contact
router.post("/", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ msg: "All fields are required." });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // your Gmail
        pass: process.env.EMAIL_PASS, // Gmail App Password
      },
    });

    // 1️⃣ Send message to you
    const adminMail = {
      from: `"ÆTHER Contact Form" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `New Contact Form Submission from ${name}`,
      text: `
        Name: ${name}
        Email: ${email}
        Message: ${message}
      `,
    };
    await transporter.sendMail(adminMail);

    // 2️⃣ Send confirmation to user
    const userMail = {
      from: `"ÆTHER" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "We’ve received your message!",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
          <div style="background: linear-gradient(90deg, #f49ac2, #f76300, #64a6bd); color: white; padding: 1.5rem; text-align: center;">
            <h1 style="margin: 0; font-size: 1.8rem; letter-spacing: 1px;">ÆTHER</h1>
            <p style="margin: 0; font-size: 1rem;">Breathe the Vibe, Redefined for You</p>
          </div>
          <div style="padding: 1.5rem;">
            <h2 style="color: #cf1020;">Hi ${name},</h2>
            <p>Thank you for reaching out to <strong>ÆTHER</strong>. We’ve received your message and will get back to you as soon as possible.</p>
            <p><em>Your message:</em></p>
            <blockquote style="border-left: 4px solid #48d1cc; padding-left: 10px; color: #555; background: #f9f9f9; border-radius: 5px;">
              ${message}
            </blockquote>
            <p>Until then, keep breathing the vibe ✨</p>
          </div>
          <div style="background: #fada5e; text-align: center; padding: 1rem;">
            <p style="margin: 0.5rem 0; font-weight: 600;">Follow us</p>
            <a href="https://instagram.com" style="margin: 0 8px; text-decoration: none; color: #cf1020;">Instagram</a> |
            <a href="https://twitter.com" style="margin: 0 8px; text-decoration: none; color: #cf1020;">Twitter</a> |
            <a href="https://facebook.com" style="margin: 0 8px; text-decoration: none; color: #cf1020;">Facebook</a>
            <p style="margin-top: 1rem; font-size: 0.9rem; color: #555;">
              © ${new Date().getFullYear()} ÆTHER. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };
    await transporter.sendMail(userMail);

    res.json({ msg: "Message sent successfully and confirmation email delivered!" });

  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ msg: "Failed to send message." });
  }
});

// ✅ FIX: Changed to ES Module syntax
export default router;