import { PlanModel, userModel } from "../models/model.js";

// Public: list active token plans (shown on Pricing / UserPlans page)
export const listPlans = async (req, res) => {
    try {
        const result = await PlanModel.find({ status: "active" }).sort({ tokens: 1 });
        res.json({ code: 200, success: true, message: "Plans fetched", result, error: false });
    } catch (err) {
        res.json({ code: 500, success: false, message: "Internal Server Error", result: "", error: true });
    }
};

// Admin: create a token plan
export const createPlan = async (req, res) => {
    try {
        const { name, tokens, price, description } = req.body;
        const plan = new PlanModel({ name, tokens, price, description });
        const result = await plan.save();
        res.json({ code: 200, success: true, message: "Plan created", result, error: false });
    } catch (err) {
        res.json({ code: 500, success: false, message: "Internal Server Error", result: "", error: true });
    }
};

// Admin: update plan details or active/inactive status
export const updatePlan = async (req, res) => {
    try {
        const { planId, name, tokens, price, description, status } = req.body;
        const plan = await PlanModel.findByIdAndUpdate(
            planId,
            { name, tokens, price, description, status },
            { new: true, runValidators: true }
        );
        if (!plan) return res.json({ code: 404, success: false, message: "Plan not found", result: "", error: true });
        res.json({ code: 200, success: true, message: "Plan updated", result: plan, error: false });
    } catch (err) {
        res.json({ code: 500, success: false, message: "Internal Server Error", result: "", error: true });
    }
};

// Developer "buys" a plan -> tokens credited to their wallet.
// NOTE: no real payment gateway is wired up yet - this just credits tokens directly.
// Plug Razorpay/Stripe here later and only call this after a verified successful payment.
export const buyPlan = async (req, res) => {
    try {
        const developerId = req.user.id;
        const { planId } = req.body;
        const plan = await PlanModel.findById(planId);
        if (!plan) {
            return res.json({ code: 404, success: false, message: "Plan not found", result: "", error: true });
        }
        const user = await userModel.findByIdAndUpdate(developerId, { $inc: { credit: plan.tokens } }, { new: true });
        const safeUser = user.toObject();
        delete safeUser.password;
        res.json({ code: 200, success: true, message: `${plan.tokens} tokens added to your wallet`, result: safeUser, error: false });
    } catch (err) {
        res.json({ code: 500, success: false, message: "Internal Server Error", result: "", error: true });
    }
};
