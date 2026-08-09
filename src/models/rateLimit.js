import mongoose from "mongoose";

// One document per (key, window). TTL index auto-deletes it once the
// window expires, so this collection never grows unbounded.
const RateLimitSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
});

RateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RateLimit = mongoose.models.RateLimit || mongoose.model("RateLimit", RateLimitSchema);

export default RateLimit;
