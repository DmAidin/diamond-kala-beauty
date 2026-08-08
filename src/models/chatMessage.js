import mongoose from "mongoose";

const ChatMessageSchema = new mongoose.Schema(
  {
    // conversations are grouped by the customer's userId, whether the
    // message was sent by that customer or by an admin replying to them
    userId: { type: String, required: true, index: true },
    senderRole: { type: String, enum: ["user", "admin"], required: true },
    senderName: { type: String, default: "" },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    readByAdmin: { type: Boolean, default: false },
    readByUser: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ChatMessage = mongoose.models.ChatMessage || mongoose.model("ChatMessage", ChatMessageSchema);

export default ChatMessage;
