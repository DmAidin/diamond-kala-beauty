import mongoose from "mongoose";

// One row per person who asked to be told when a specific product is back
// in stock. `notifiedAt` is set once we've emailed them for a given
// restock, so the same person isn't emailed twice for the same wait.
const notifyRequestSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    notifiedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// the same person shouldn't be able to queue up multiple identical requests
// for the same still-unnotified wait on the same product
notifyRequestSchema.index({ productId: 1, email: 1, notifiedAt: 1 });

export default mongoose.models.NotifyRequest || mongoose.model("NotifyRequest", notifyRequestSchema);
