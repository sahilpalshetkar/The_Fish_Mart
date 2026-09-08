import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

export const sendOtpMail = async (to, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL,
    to,
    subject: "Reset Your Password - The Fishy Mart",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">

        <h2 style="color: #0284c7;">
          Password Reset OTP
        </h2>

        <p>
          We received a request to reset your password.
        </p>

        <p>
          Use the OTP below to continue:
        </p>

        <div style="
          background: #f0f9ff;
          padding: 20px;
          text-align: center;
          border-radius: 10px;
          margin: 20px 0;
        ">
          <p style="margin: 0; color: #64748b;">
            Your OTP
          </p>

          <h1 style="
            font-size: 32px;
            letter-spacing: 8px;
            color: #0284c7;
            margin: 10px 0;
          ">
            ${otp}
          </h1>
        </div>

        <p>
          This OTP is valid for <strong>5 minutes</strong>.
        </p>

        <p style="color: #dc2626;">
          <strong>Important:</strong> Never share this OTP with anyone.
        </p>

        <p style="color: #64748b; font-size: 13px;">
          If you did not request a password reset, you can safely ignore
          this email.
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb;" />

        <p>
          Thank you,<br />
          <strong>Bombay Fresh Fish</strong> 🐟
        </p>

      </div>
    `,
  });
};

export const sendDeliveryOtpMail = async (user, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL,
    to: user.email,
    subject: "Your Delivery OTP - The Fishy Mart",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">

        <h2 style="color: #0284c7;">
          Delivery Verification OTP
        </h2>

        <p>Hello ${user.fullName || "Customer"},</p>

        <p>
          Your delivery partner is arriving with your order.
          Please use the OTP below to confirm delivery.
        </p>

        <div style="
          background: #f0f9ff;
          padding: 20px;
          text-align: center;
          border-radius: 10px;
          margin: 20px 0;
        ">
          <p style="margin: 0; color: #64748b;">
            Your Delivery OTP
          </p>

          <h1 style="
            font-size: 32px;
            letter-spacing: 8px;
            color: #0284c7;
            margin: 10px 0;
          ">
            ${otp}
          </h1>
        </div>

        <p>
          This OTP is valid for <strong>5 minutes</strong>.
        </p>

        <p style="color: #dc2626;">
          <strong>Important:</strong> Do not share this OTP with anyone
          until your order is physically delivered to you.
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb;" />

        <p style="color: #64748b; font-size: 13px;">
          If you did not request this OTP, please contact our support team.
        </p>

        <p>
          Thank you for choosing <strong>Bombay Fresh Fish</strong> 🐟
        </p>

      </div>
    `,
  });
};
