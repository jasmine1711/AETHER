import express from "express";
import { getPersonalSuggestion } from "../controllers/styleController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// @route   POST /api/style/personal-suggestion
// @desc    Get personalized outfit suggestions from AI
// @access  Private
router.post("/personal-suggestion", protect, getPersonalSuggestion);

export default router;  // ✅ ESM export
