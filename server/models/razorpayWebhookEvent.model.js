import mongoose from "mongoose";

const razorpayWebhookEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    event: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["processing", "processed", "failed"],
      default: "processing",
    },
    razorpayOrderId: {
      type: String,
      default: null,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    processedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const RazorpayWebhookEvent = mongoose.model(
  "RazorpayWebhookEvent",
  razorpayWebhookEventSchema,
);

export default RazorpayWebhookEvent;
