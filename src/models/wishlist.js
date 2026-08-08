import mongoose from "mongoose";

const WishlistSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    productIds: { type: [String], default: [] },
  },
  { timestamps: true }
);

const Wishlist = mongoose.models.Wishlist || mongoose.model("Wishlist", WishlistSchema);

export default Wishlist;
