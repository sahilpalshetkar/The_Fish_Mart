import { sendEmail } from "../utils/sendEmail.js";

export const sendAuthOtpEmail = async (user, otp) => {
  return await sendEmail({
    to: user.email,
    subject: "Your Password Reset OTP",
    html: `
      <h2>Password Reset OTP</h2>
      <p>Hello ${user.fullName || "Customer"},</p>
      <p>Your OTP for resetting your password is:</p>
      <h1>${otp}</h1>
      <p>This OTP will expire in 5 minutes.</p>
      <p>If you did not request a password reset, please ignore this email.</p>
    `,
  });
};

export const sendDeliveryOtpEmail = async (user, otp) => {
  const result = await sendEmail({
    to: user.email,
    subject: "Your Delivery OTP",
    html: `
      <h2>Delivery OTP</h2>
      <p>Hello ${user.fullName || "Customer"},</p>
      <p>Your delivery OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP will expire in 5 minutes.</p>
      <p>Please share this OTP with the delivery partner only after receiving your order.</p>
    `,
  });

  return result;
};
