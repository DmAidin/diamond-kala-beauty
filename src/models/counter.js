import mongoose from "mongoose";

// Backs sequential, human-readable order numbers (DK-YYMMDD-0001) — one
// counter document per calendar day, incremented atomically so concurrent
// checkouts never collide.
const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.models.Counter || mongoose.model("Counter", CounterSchema);

export default Counter;
