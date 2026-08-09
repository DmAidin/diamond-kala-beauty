import mongoose from "mongoose";

// One document per calendar day. Incremented once per browser session (not
// per page navigation) so this approximates daily *visits*, not raw page
// loads — see the VisitTracker component for how the once-per-session
// guard works.
const PageViewSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // "YYYY-MM-DD"
  count: { type: Number, default: 0 },
});

const PageView = mongoose.models.PageView || mongoose.model("PageView", PageViewSchema);

export default PageView;
