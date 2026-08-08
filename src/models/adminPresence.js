import mongoose from "mongoose";

const AdminPresenceSchema = new mongoose.Schema(
  {
    adminId: { type: String, required: true, unique: true },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const AdminPresence = mongoose.models.AdminPresence || mongoose.model("AdminPresence", AdminPresenceSchema);

export default AdminPresence;
