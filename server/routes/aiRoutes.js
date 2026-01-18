// routes/aiRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @route   POST /api/ai/assistant
// @desc    Chat with AI fashion assistant
// @access  Private
router.post("/assistant", protect, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        success: false, 
        message: "Message is required" 
      });
    }

    const prompt = `
      You are "Aether", a friendly, knowledgeable, and enthusiastic AI fashion stylist assistant.
      You specialize in fashion advice, styling tips, outfit suggestions, and answering fashion-related questions.
      
      User's question: "${message}"
      
      Provide a helpful, detailed, and encouraging response with practical fashion advice.
      Format your response in a conversational but organized way with emojis.
      Use markdown-style formatting with **bold** for important points.
      
      If the user asks about:
      - Body types (hourglass, pear, apple, rectangle, inverted triangle): Give specific styling tips
      - Outfit suggestions: Provide 2-3 complete outfit ideas
      - Colors: Advise based on skin tones (warm/cool/neutral)
      - Occasions: Suggest appropriate outfits
      - Fashion tips: Share practical advice
      
      Keep your response under 300 words but make it comprehensive.
      Be encouraging and positive!
    `;

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      res.status(200).json({
        success: true,
        response: text
      });
    } catch (geminiError) {
      // If Gemini API fails, use our own AI logic
      console.log('Using fallback AI response');
      res.status(200).json({
        success: true,
        response: generateFallbackResponse(message)
      });
    }

  } catch (error) {
    console.error('Error in AI chat:', error);
    res.status(200).json({ 
      success: true,
      response: "I'm here to help with all your fashion questions! What would you like to know about styling, outfits, or fashion tips? 👗✨"
    });
  }
});

function generateFallbackResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  // Add the same response logic from frontend
  if (lowerMessage.includes('outfit') || lowerMessage.includes('wear')) {
    return "**Outfit Suggestions:**\n\n" +
           "👗 **Casual Day:** White linen shirt + Blue jeans + White sneakers + Brown belt\n" +
           "💼 **Office:** Tailored blazer + Silk blouse + Pencil skirt + Block heels\n" +
           "🎉 **Party:** Little black dress + Statement earrings + Strappy heels + Clutch\n\n" +
           "Want more specific suggestions? Tell me about your body type or occasion!";
  }
  
  // Add more responses as needed...
  
  return "I'd love to help you with fashion advice! Could you tell me more about:\n" +
         "• Your body type\n• The occasion\n• Your personal style\n• Any specific items you're working with?";
}

export default router;