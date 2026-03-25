import express from "express";
import { 
  getPersonalSuggestion, 
  getBodyTypeAdvice,
  generateOutfitFromEvent 
} from "../controllers/styleController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// @route   POST /api/style/personal-suggestion
// @desc    Get personalized outfit suggestions
// @access  Private
router.post("/personal-suggestion", protect, getPersonalSuggestion);

// @route   GET /api/style/body-type/:bodyType
// @desc    Get styling advice for specific body type
// @access  Private
router.get("/body-type/:bodyType", protect, getBodyTypeAdvice);

// @route   POST /api/style/event-outfit
// @desc    Generate outfit for specific event
// @access  Private
router.post("/event-outfit", protect, generateOutfitFromEvent);

export default router;