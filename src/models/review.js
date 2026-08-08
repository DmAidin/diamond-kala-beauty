import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, trim: true, maxlength: 1000, default: "" },
  },
  { timestamps: true }
);

// one review per user per product
ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

const Review = mongoose.models.Review || mongoose.model("Review", ReviewSchema);

export default Review;
