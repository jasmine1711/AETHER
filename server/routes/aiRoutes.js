import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

// Initialize Gemini AI with error handling
let genAI;
try {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} catch (error) {
  console.error("Failed to initialize Gemini AI:", error);
}

// @route   POST /api/ai/chat (MATCH YOUR FRONTEND CALL)
// @desc    Chat with AI fashion assistant
// @access  Private
router.post("/chat", protect, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || message.trim() === "") {
      return res.status(400).json({ 
        success: false, 
        message: "Message is required" 
      });
    }

    // Check if Gemini API is configured
    if (!process.env.GEMINI_API_KEY || !genAI) {
      console.log("Using fallback AI response (Gemini not configured)");
      return res.status(200).json({
        success: true,
        reply: generateFallbackResponse(message)
      });
    }

    const prompt = `
      You are "Aether", a friendly, knowledgeable, and enthusiastic AI fashion stylist assistant.
      You specialize in fashion advice, styling tips, outfit suggestions, and answering fashion-related questions.
      
      User's question: "${message}"
      
      Provide a helpful, detailed, and encouraging response with practical fashion advice.
      Format your response in a conversational way with emojis.
      Use **bold** for important points.
      
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
        reply: text // ✅ Changed from 'response' to 'reply' to match frontend
      });
    } catch (geminiError) {
      console.error("Gemini API error:", geminiError);
      // If Gemini API fails, use fallback response
      res.status(200).json({
        success: true,
        reply: generateFallbackResponse(message)
      });
    }

  } catch (error) {
    console.error('Error in AI chat:', error);
    res.status(200).json({ 
      success: true,
      reply: "I'm here to help with all your fashion questions! What would you like to know about styling, outfits, or fashion tips? 👗✨"
    });
  }
});

// @route   GET /api/ai/tips
// @desc    Get fashion tips by category
// @access  Private
router.get("/tips", protect, async (req, res) => {
  try {
    const { category } = req.query;
    
    if (!process.env.GEMINI_API_KEY || !genAI) {
      return res.status(200).json({
        success: true,
        tips: getFallbackTips(category)
      });
    }

    const prompt = `Provide 5 quick fashion tips for ${category || "general styling"}. Keep each tip concise and practical. Format as a simple list with emojis.`;
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Split into array of tips
    const tips = text.split('\n').filter(tip => tip.trim().length > 0 && tip.includes('●') || tip.includes('•') || tip.includes('*'));
    
    res.json({ 
      success: true, 
      tips: tips.length > 0 ? tips : getFallbackTips(category)
    });
  } catch (error) {
    console.error("AI tips error:", error);
    res.status(200).json({ 
      success: true, 
      tips: getFallbackTips(category)
    });
  }
});

// Enhanced fallback response function
function generateFallbackResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  // Body type advice
  if (lowerMessage.includes('hourglass')) {
    return "**✨ Hourglass Figure Styling:**\n\n" +
           "Your balanced proportions are perfect for:\n" +
           "• **Belted dresses** to accentuate your waist\n" +
           "• **Wrap tops and dresses** that hug your curves\n" +
           "• **High-waisted bottoms** paired with fitted tops\n" +
           "• **V-necklines** to highlight your décolletage\n\n" +
           "Avoid boxy silhouettes that hide your shape. You look amazing in pieces that celebrate your curves! 💫";
  }
  
  if (lowerMessage.includes('pear')) {
    return "**🍐 Pear Shape Styling:**\n\n" +
           "Balance your silhouette with:\n" +
           "• **Bold patterns and details** on top (ruffles, statement sleeves)\n" +
           "• **A-line skirts** and wide-leg pants\n" +
           "• **Dark, solid colors** on bottom\n" +
           "• **Off-shoulder or boat neck** tops\n\n" +
           "Draw attention upward with eye-catching accessories and necklines! ✨";
  }
  
  if (lowerMessage.includes('apple')) {
    return "**🍎 Apple Shape Styling:**\n\n" +
           "Create definition with:\n" +
           "• **Empire waist** dresses and tops\n" +
           "• **V-necklines** to elongate your torso\n" +
           "• **Structured jackets** and blazers\n" +
           "• **A-line** and trapeze silhouettes\n\n" +
           "Focus on showcasing your beautiful legs and décolletage! 💕";
  }
  
  // Outfit suggestions
  if (lowerMessage.includes('outfit') || lowerMessage.includes('wear') || lowerMessage.includes('date')) {
    if (lowerMessage.includes('date') || lowerMessage.includes('romantic')) {
      return "**💕 Romantic Date Night Outfits:**\n\n" +
             "1. **Elegant:** Silk slip dress + Delicate jewelry + Strappy heels + Clutch\n" +
             "2. **Casual Chic:** Cashmere sweater + Leather leggings + Ankle boots + Statement earrings\n" +
             "3. **Playful:** Floral midi dress + Denim jacket + White sneakers + Crossbody bag\n\n" +
             "Choose what makes you feel confident and comfortable! 🌹";
    }
    
    if (lowerMessage.includes('work') || lowerMessage.includes('office')) {
      return "**💼 Professional Work Outfits:**\n\n" +
             "1. **Classic:** Tailored blazer + Silk blouse + Pencil skirt + Block heels\n" +
             "2. **Modern:** Turtleneck + Wide-leg trousers + Loafers + Minimalist jewelry\n" +
             "3. **Smart Casual:** Blouse + Cropped trousers + Cardigan + Ballet flats\n\n" +
             "Mix and match these pieces for a versatile work wardrobe! 👔";
    }
    
    return "**👗 Outfit Suggestions:**\n\n" +
           "**Casual Day:** White linen shirt + Blue jeans + White sneakers + Brown belt\n\n" +
           "**Office Ready:** Tailored blazer + Silk blouse + Pencil skirt + Block heels\n\n" +
           "**Party Look:** Little black dress + Statement earrings + Strappy heels + Clutch\n\n" +
           "Want more specific suggestions? Tell me about your body type or occasion! ✨";
  }
  
  // Color advice
  if (lowerMessage.includes('color') || lowerMessage.includes('skin tone')) {
    return "**🎨 Color Analysis:**\n\n" +
           "**Warm Skin Tone:**\n• Earth tones (olive, mustard, rust)\n• Warm reds and oranges\n• Cream and camel\n\n" +
           "**Cool Skin Tone:**\n• Jewel tones (emerald, sapphire, ruby)\n• Pure whites and blacks\n• Cool pinks and blues\n\n" +
           "**Neutral Skin Tone:**\n• Almost any color works!\n• Soft pastels and muted tones are especially flattering\n\n" +
           "Want a personalized color palette? Tell me your skin's undertone! 🌈";
  }
  
  // General fashion tips
  if (lowerMessage.includes('tip') || lowerMessage.includes('advice')) {
    return "**🌟 Fashion Tips:**\n\n" +
           "1. **Fit is everything** - Well-fitted clothes always look better than expensive ill-fitting ones\n" +
           "2. **Invest in basics** - Quality white shirts, dark jeans, and blazers are wardrobe foundations\n" +
           "3. **Accessorize wisely** - A statement piece can transform any outfit\n" +
           "4. **Know your proportions** - Balance fitted with loose pieces\n" +
           "5. **Comfort meets style** - Confidence is your best accessory!\n\n" +
           "What specific area would you like tips on? 👗✨";
  }
  
  // Default response
  return "👋 Hi! I'm Aether, your AI fashion stylist. I can help you with:\n\n" +
         "• **Outfit suggestions** for any occasion\n" +
         "• **Body type styling** tips\n" +
         "• **Color analysis** and coordination\n" +
         "• **Fashion trends** and advice\n" +
         "• **Wardrobe organization** ideas\n\n" +
         "What would you like to know about today? 💫✨";
}

function getFallbackTips(category = "general") {
  const tips = {
    general: [
      "🌟 Invest in quality basics - they're the foundation of any wardrobe",
      "👗 Know your body type and dress to celebrate your unique shape",
      "🎨 Build a color palette that complements your skin tone",
      "💎 Accessories can transform any outfit - don't underestimate them!",
      "👠 Comfort is key - you'll always look better when you feel confident"
    ],
    summer: [
      "☀️ Lightweight fabrics like linen and cotton keep you cool",
      "🕶️ A wide-brimmed hat adds style and sun protection",
      "👗 Maxi dresses are effortlessly elegant for summer evenings",
      "🩳 High-waisted shorts pair perfectly with crop tops",
      "👡 Statement sandals can elevate a simple outfit"
    ],
    winter: [
      "🧥 Invest in a quality coat - it's what people see first",
      "🧣 Layering adds both warmth and visual interest",
      "👢 Ankle boots go with almost everything",
      "🧤 Cashmere is worth the investment for its warmth and softness",
      "❄️ Monochrome outfits look sophisticated in winter"
    ]
  };
  
  return tips[category] || tips.general;
}

export default router;