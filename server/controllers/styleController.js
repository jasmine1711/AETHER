import User from '../models/User.js';
import Garment from '../models/Garment.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const getPersonalSuggestion = async (req, res) => {
  try {
    const { bodyType, event, timeOfDay, specificItem } = req.body;
    
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const garments = await Garment.find({ user: req.user.id });
    if (garments.length === 0) {
      return res.status(400).json({ message: "Your wardrobe is empty! Add some garments first." });
    }

    // Prepare garment details with categories
    const garmentList = garments.map(g => 
      `- ${g.name} (Category: ${g.category}, Color: ${g.color || 'Not specified'}, Style: ${g.style || 'Not specified'})`
    ).join('\n');

    const prompt = `
      You are "Aether," a world-class AI personal stylist specializing in creating personalized, fashionable outfits.
      
      **User Profile:**
      - Body Type: ${bodyType || user.bodyType || 'Not Specified'}
      - Skin Tone: ${user.skinTone || 'Not Specified'}
      - Preferred Styles: ${user.stylePreferences?.join(', ') || 'Not Specified'}
      ${event ? `- Event: ${event}` : ''}
      ${timeOfDay ? `- Time of Day: ${timeOfDay}` : ''}
      ${specificItem ? `- Specific Item to Include: ${specificItem}` : ''}

      **Body Type Styling Guidelines:**
      ${getBodyTypeTips(bodyType || user.bodyType)}

      **User's Available Wardrobe:**
      ${garmentList}

      **Your Task:**
      Generate ${req.body.numberOfOutfits || 3} complete outfit suggestions. For each outfit:
      1. Use ONLY items from the user's wardrobe
      2. Create a search-friendly description for AI image generation
      3. Consider the event, time of day, and body type
      4. Provide styling tips

      Respond ONLY with a valid JSON array of objects. Do not include any other text or markdown formatting.

      **Response Structure:**
      [
        {
          "outfitName": "Catchy Outfit Name (e.g., 'Urban Minimalist Evening')",
          "items": ["Item 1 from wardrobe", "Item 2 from wardrobe", "Item 3 from wardrobe"],
          "reasoning": "Explanation of why this works for the user's body type and occasion",
          "stylingTips": ["Tip 1", "Tip 2", "Tip 3"],
          "imagePrompt": "Detailed, realistic photography prompt for AI image generation of this outfit on a model with ${bodyType || user.bodyType || 'average'} body type. Include lighting, background, and style details.",
          "formalityLevel": "Casual/Smart Casual/Business Casual/Formal",
          "season": "Spring/Summer/Fall/Winter/All-season"
        }
      ]
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const suggestions = JSON.parse(text);
    
    // Enhance suggestions with generated images
    const enhancedSuggestions = await Promise.all(
      suggestions.map(async (suggestion, index) => {
        try {
          // You can integrate with DALL-E, Stable Diffusion, or another image generation API here
          // For now, we'll return a placeholder structure
          return {
            ...suggestion,
            imageUrl: await generateOutfitImage(suggestion.imagePrompt),
            id: Date.now() + index,
            userRating: null,
            isSaved: false
          };
        } catch (error) {
          console.error(`Error generating image for outfit ${index}:`, error);
          return {
            ...suggestion,
            imageUrl: null,
            id: Date.now() + index,
            userRating: null,
            isSaved: false
          };
        }
      })
    );

    res.status(200).json({
      success: true,
      suggestions: enhancedSuggestions,
      meta: {
        bodyType: bodyType || user.bodyType,
        event: event || 'General',
        timeOfDay: timeOfDay || 'Anytime',
        totalOutfits: enhancedSuggestions.length
      }
    });

  } catch (error) {
    console.error('Error generating style suggestion:', error);
    
    // Provide fallback suggestions if AI fails
    if (error.message.includes('JSON')) {
      const fallbackSuggestions = generateFallbackSuggestions(req.user.id, garments);
      return res.status(200).json({
        success: true,
        suggestions: fallbackSuggestions,
        note: "AI response format issue, showing curated suggestions"
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to generate suggestions.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getBodyTypeAdvice = async (req, res) => {
  try {
    const { bodyType } = req.params;
    
    const prompt = `
      As a fashion expert, provide detailed styling advice for someone with a ${bodyType} body type.
      Include:
      1. Best clothing silhouettes
      2. Areas to emphasize
      3. Areas to balance
      4. Recommended necklines
      5. Recommended waist treatments
      6. Fabric recommendations
      7. Patterns to try/avoid
      
      Format the response in a structured JSON format with clear sections.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const advice = JSON.parse(text);
    res.status(200).json({
      success: true,
      bodyType,
      advice
    });

  } catch (error) {
    console.error('Error generating body type advice:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to generate body type advice.'
    });
  }
};

export const generateOutfitFromEvent = async (req, res) => {
  try {
    const { event, timeOfDay, dressCode, weather } = req.body;
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const garments = await Garment.find({ user: req.user.id });
    
    const prompt = `
      Create an outfit for: ${event}
      Time: ${timeOfDay}
      Dress Code: ${dressCode}
      Weather: ${weather}
      User's Body Type: ${user.bodyType}
      User's Style: ${user.stylePreferences?.join(', ')}
      
      From these available items: ${garments.map(g => g.name).join(', ')}
      
      Provide a complete outfit with accessories.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    res.status(200).json({
      success: true,
      outfit: response.text()
    });

  } catch (error) {
    console.error('Error generating event outfit:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to generate event outfit.'
    });
  }
};

// Helper Functions
function getBodyTypeTips(bodyType) {
  const tips = {
    'hourglass': 'Emphasize waist, balanced proportions, fitted silhouettes',
    'triangle': 'Add volume to shoulders, wear darker bottoms, A-line skirts',
    'inverted triangle': 'Balance shoulders with fuller bottoms, V-neck tops',
    'rectangle': 'Create curves with peplums, belts, layered looks',
    'apple': 'Empire waistlines, flowy tops, structured jackets',
    'pear': 'Draw attention upward, fitted tops, A-line or full skirts'
  };
  
  return tips[bodyType?.toLowerCase()] || 'Focus on balanced proportions and personal comfort';
}

async function generateOutfitImage(prompt) {
  // This is where you'd integrate with an image generation API
  // Options: OpenAI DALL-E, Stability AI, Midjourney API, etc.
  
  // Example with OpenAI DALL-E (uncomment and configure if using):
  /*
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: `Fashion photography: ${prompt}. Professional model wearing outfit, full body shot, clean background, studio lighting, realistic, high detail`,
    n: 1,
    size: "1024x1024",
    quality: "standard"
  });
  
  return response.data[0].url;
  */
  
  // For now, return a placeholder or use a service like Unsplash with search
  // Example using Unsplash (requires unsplash-js and API key):
  /*
  const unsplash = createApi({ accessKey: process.env.UNSPLASH_ACCESS_KEY });
  const searchTerm = extractSearchTerms(prompt);
  const result = await unsplash.search.getPhotos({
    query: searchTerm,
    orientation: 'portrait',
    perPage: 1
  });
  return result.response.results[0].urls.regular;
  */
  
  // Fallback: Return a placeholder URL with search terms
  const searchTerms = prompt.toLowerCase().split(' ').slice(0, 5).join('+');
  return `https://source.unsplash.com/600x900/?fashion,outfit,${searchTerms}`;
}

function generateFallbackSuggestions(userId, garments) {
  // Simple algorithm to create outfits based on categories
  const tops = garments.filter(g => ['Top', 'T-Shirt', 'Blouse', 'Sweater'].includes(g.category));
  const bottoms = garments.filter(g => ['Bottom', 'Pants', 'Jeans', 'Skirt', 'Shorts'].includes(g.category));
  const shoes = garments.filter(g => ['Shoes', 'Sneakers', 'Boots', 'Heels', 'Flats'].includes(g.category));
  const accessories = garments.filter(g => ['Accessory', 'Bag', 'Belt', 'Jewelry', 'Hat'].includes(g.category));
  
  const suggestions = [];
  
  // Create 2-3 simple combinations
  for (let i = 0; i < Math.min(3, tops.length, bottoms.length, shoes.length); i++) {
    const top = tops[i % tops.length];
    const bottom = bottoms[i % bottoms.length];
    const shoe = shoes[i % shoes.length];
    const accessory = accessories[i % accessories.length] || null;
    
    suggestions.push({
      outfitName: `Curated Look ${i + 1}`,
      items: [
        top.name,
        bottom.name,
        shoe.name,
        ...(accessory ? [accessory.name] : [])
      ],
      reasoning: `A balanced outfit combining your ${top.category.toLowerCase()} with ${bottom.category.toLowerCase()} and ${shoe.category.toLowerCase()}.`,
      stylingTips: [
        "Ensure proper fit for your body type",
        "Consider adding layers for dimension",
        "Accessorize to complete the look"
      ],
      imagePrompt: `Full body fashion photography of ${top.name} with ${bottom.name} and ${shoe.name}, clean studio background`,
      formalityLevel: "Casual",
      season: "All-season",
      imageUrl: `https://source.unsplash.com/600x900/?fashion,${top.name.split(' ')[0]},${bottom.name.split(' ')[0]}`,
      id: Date.now() + i,
      userRating: null,
      isSaved: false
    });
  }
  
  return suggestions;
}