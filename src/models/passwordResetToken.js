import mongoose from "mongoose";

const PasswordResetTokenSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
});

// auto-delete expired tokens
PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PasswordResetToken =
  mongoose.models.PasswordResetToken || mongoose.model("PasswordResetToken", PasswordResetTokenSchema);

export default PasswordResetToken;
