import User from '../models/User.js';
// This assumes your garmentModel will be inside /models.
// You will need to create this file next.
import Garment from '../models/Garment.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const getPersonalSuggestion = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const garments = await Garment.find({ user: req.user.id });
    if (garments.length === 0) {
      return res.status(400).json({ message: "Your wardrobe is empty!" });
    }

    const garmentList = garments.map(g => `- ${g.name} (Category: ${g.category})`).join('\n');

    const prompt = `
      You are "Aether," a world-class AI personal stylist specializing in blending vintage fashion with modern Gen Z pop culture.
      
      **User Profile:**
      - Body Type: ${user.bodyType || 'Not Specified'}
      - Skin Tone: ${user.skinTone || 'Not Specified'}
      - Preferred Styles: ${user.stylePreferences.join(', ') || 'Not Specified'}

      **User's Available Wardrobe:**
      ${garmentList}

      **Your Task:**
      Respond ONLY with a valid JSON array of objects. Do not include any other text or markdown formatting. The structure must be:
      [
        {
          "outfitName": "Catchy Outfit Name",
          "items": ["Item 1", "Item 2", "Item 3"],
          "reasoning": "Empowering explanation on why this works."
        }
      ]
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const suggestions = JSON.parse(text);
    res.status(200).json(suggestions);

  } catch (error) {
    console.error('Error generating style suggestion:', error);
    res.status(500).json({ message: 'Failed to generate suggestions.' });
  }
};

