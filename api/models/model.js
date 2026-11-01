import mongoose from "mongoose";

// ---------------- User Model ----------------
const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true },
  type: { type: String, enum: ["admin", "client", "user"], default: "user" }, // user = developer
  password: { type: String },
  phone: { type: String },
  location: { type: String },
  bio: { type: String },
  profile: { type: String },
  headline: { type: String },
  rate: { type: String },
  skill: { type: String },
  credit: { type: Number, default: 0 }, // token wallet balance
  isBlocked: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  status: { type: String, default: "active" },
  // Per-user email preferences (all default ON so existing accounts keep today's behaviour)
  emailPrefs: {
    newProjects: { type: Boolean, default: true },
    bids: { type: Boolean, default: true },
    profile: { type: Boolean, default: true },
    loginAlerts: { type: Boolean, default: true }
  },
  createdAt: { type: Date, default: Date.now }
});

export const userModel = mongoose.model("users", userSchema);

// ---------------- Project Model ----------------
const ProjectSchema = new mongoose.Schema({
  clientId: { type: String, required: true },
  title: { type: String, required: true },
  des: { type: String },
  budget: { type: String },
  duration: { type: String },
  status: {
    type: String,
    enum: ["open", "assigned", "in_progress", "awaiting_review", "completed", "cancelled", "blocked"],
    default: "open"
  },
  assignedTo: { type: String, default: null }, // developer userId once a bid is accepted
  assignedBidId: { type: String, default: null },
  deliveryLink: { type: String, default: null },
  deliveryFileUrl: { type: String, default: null },
  deliveryFileName: { type: String, default: null },
  previousStatus: { type: String, default: null },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

export const ProjectModel = mongoose.model("Projects", ProjectSchema);

// ---------------- Bid Model ----------------
const BidSchema = new mongoose.Schema({
  projectId: { type: String, required: true },
  developerId: { type: String, required: true },
  amount: { type: String, required: true }, // developer's quoted price
  duration: { type: String },
  proposal: { type: String },
  tokensUsed: { type: Number, default: 10 },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending"
  },
  createdAt: { type: Date, default: Date.now }
});

export const BidModel = mongoose.model("Bids", BidSchema);

// ---------------- Notification Model ----------------
const NotificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  senderId: { type: String, default: null },
  senderName: { type: String, default: "Zentora" },
  recipientName: { type: String, default: null },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ["bid_received", "bid_accepted", "bid_rejected", "project_assigned", "project_completed", "project_cancelled", "project_blocked", "general", "new_project", "registration", "profile_updated", "account_status", "admin_alert"],
    default: "general"
  },
  relatedProjectId: { type: String, default: null },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export const NotificationModel = mongoose.model("Notifications", NotificationSchema);

// ---------------- Project conversation ----------------
const ProjectMessageSchema = new mongoose.Schema({
  projectId: { type: String, required: true },
  senderId: { type: String, required: true },
  recipientId: { type: String, required: true },
  message: { type: String, required: true },
  deliveryLink: { type: String, default: null },
  deliveryFileUrl: { type: String, default: null },
  deliveryFileName: { type: String, default: null },
  readBy: [{ type: String }],
  readAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});
export const ProjectMessageModel = mongoose.model("ProjectMessages", ProjectMessageSchema);

// ---------------- Plan Model (token packages) ----------------
const PlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  tokens: { type: Number, required: true },
  price: { type: String, required: true },
  description: { type: String },
  status: { type: String, default: "active" },
  createdAt: { type: Date, default: Date.now }
});

export const PlanModel = mongoose.model("Plans", PlanSchema);


// ---------------- Email delivery log ----------------
const EmailLogSchema = new mongoose.Schema({
  type: { type: String, required: true, index: true },      // e.g. "new_project", "bid_accepted"
  to: { type: String, required: true },                     // single recipient only (never a list)
  subject: { type: String },
  status: { type: String, enum: ["sent", "failed", "skipped"], required: true, index: true },
  reason: { type: String, default: null },                  // why skipped / failure message
  dedupeKey: { type: String, default: null, index: true },
  messageId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});
// keep ~90 days of logs automatically
EmailLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

export const EmailLogModel = mongoose.model("EmailLogs", EmailLogSchema);

// ---------------- Global email settings (admin controlled) ----------------
// One document: { key: "email", disabledTypes: ["login_alert", ...], emailsEnabled: true }
const EmailSettingSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: "email" },
  emailsEnabled: { type: Boolean, default: true },
  disabledTypes: [{ type: String }],
  updatedBy: { type: String, default: null },
  updatedAt: { type: Date, default: Date.now }
});

export const EmailSettingModel = mongoose.model("EmailSettings", EmailSettingSchema);
