import React, { useState, useEffect } from 'react';

// Placeholder Card Component for a Garment
const GarmentCard = ({ garment }) => (
    <div className="border rounded-lg p-4 shadow-sm text-center bg-white">
        <img src={garment.imageUrl || 'https://placehold.co/200x200/F3F4F6/9CA3AF?text=Garment'} alt={garment.name} className="w-full h-48 object-cover rounded-md mb-2" />
        <h3 className="font-semibold">{garment.name}</h3>
        <p className="text-sm text-gray-500">{garment.category}</p>
    </div>
);

// Placeholder Card Component for an AI Outfit Suggestion
const OutfitCard = ({ outfit }) => (
    <div className="border rounded-lg p-6 shadow-md bg-white transition-transform hover:scale-105">
        <h3 className="text-xl font-bold mb-2 text-indigo-600">{outfit.outfitName}</h3>
        <p className="text-sm font-medium text-gray-700 mb-3">Items: {outfit.items.join(', ')}</p>
        <p className="text-gray-600 bg-gray-50 p-3 rounded-md">{outfit.reasoning}</p>
    </div>
);


const WardrobePage = () => {
    // State for managing user's style profile
    const [profile, setProfile] = useState({
        bodyType: 'Hourglass',
        skinTone: 'Warm',
        stylePreferences: 'Minimalist',
    });
    
    // State for user's garments and AI suggestions
    const [garments, setGarments] = useState([]);
    const [outfits, setOutfits] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // TODO: Fetch user profile and garments from the backend on component mount
    useEffect(() => {
        // Example data
        setGarments([
            { id: 1, name: 'White Linen Shirt', category: 'Top', imageUrl: 'https://placehold.co/200x200/FFFFFF/333333?text=Linen+Shirt' },
            { id: 2, name: 'Dark Wash Jeans', category: 'Bottom', imageUrl: 'https://placehold.co/200x200/374151/FFFFFF?text=Jeans' },
            { id: 3, name: 'Brown Leather Belt', category: 'Accessory', imageUrl: 'https://placehold.co/200x200/78350F/FFFFFF?text=Belt' },
            { id: 4, name: 'White Sneakers', category: 'Shoes', imageUrl: 'https://placehold.co/200x200/FFFFFF/333333?text=Sneakers' },
        ]);
    }, []);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleGetSuggestions = async () => {
        setIsLoading(true);
        // TODO: Replace with actual API call to your backend
        // Your backend will then call the Gemini API with the full context
        console.log("Fetching suggestions for profile:", profile, "and garments:", garments);

        // Simulate API call delay
        setTimeout(() => {
            const exampleResponse = [
              {
                "outfitName": "Sunset Casual",
                "items": ["White Linen Shirt", "Dark Wash Jeans", "Brown Leather Belt", "White Sneakers"],
                "reasoning": "This classic look flatters a Hourglass shape by creating a balanced silhouette. The warm tones of the belt complement your Warm skin tone perfectly, aligning with your Minimalist style."
              },
              {
                "outfitName": "Chic Weekend",
                "items": ["White Linen Shirt", "Brown Leather Belt", "White Sneakers"],
                "reasoning": "A relaxed yet put-together outfit. The linen shirt offers a breezy feel, perfect for a casual outing, while the belt cinches the waist to highlight your figure."
              },
            ];
            setOutfits(exampleResponse);
            setIsLoading(false);
        }, 2000);
    };

    return (
        <div className="container mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Your Personalized Wardrobe</h1>
            
            {/* Style Profile Section */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-2xl font-semibold mb-4">My Style Profile</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="bodyType" className="block text-sm font-medium text-gray-700">Body Type</label>
                        <select name="bodyType" value={profile.bodyType} onChange={handleProfileChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm">
                            <option>Hourglass</option>
                            <option>Pear</option>
                            <option>Apple</option>
                            <option>Rectangle</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="skinTone" className="block text-sm font-medium text-gray-700">Skin Tone</label>
                        <select name="skinTone" value={profile.skinTone} onChange={handleProfileChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm">
                            <option>Warm</option>
                            <option>Cool</option>
                            <option>Neutral</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="stylePreferences" className="block text-sm font-medium text-gray-700">Preferred Style</label>
                        <select name="stylePreferences" value={profile.stylePreferences} onChange={handleProfileChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm">
                            <option>Minimalist</option>
                            <option>Bohemian</option>
                            <option>Classic</option>
                            <option>Trendy</option>
                            <option>Sporty</option>
                        </select>
                    </div>
                </div>
                {/* TODO: Add a "Save Profile" button that makes an API call */}
            </div>

            {/* My Garments Section */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold">My Garments</h2>
                     {/* TODO: Create an AddItemPage and link it here */}
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700">Add New Item</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {garments.map(g => <GarmentCard key={g.id} garment={g} />)}
                </div>
            </div>

            {/* AI Stylist Section */}
            <div className="text-center mb-8 bg-indigo-50 p-8 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4">AI Stylist</h2>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">Ready for some style inspiration? Let our AI analyze your wardrobe and profile to create unique outfits just for you.</p>
                <button 
                    onClick={handleGetSuggestions}
                    disabled={isLoading}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-indigo-700 disabled:bg-indigo-300 transition-all"
                >
                    {isLoading ? 'Thinking...' : 'Get Suggestions'}
                </button>
            </div>

            {/* Outfit Suggestions */}
            {outfits.length > 0 && (
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Your Outfits</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {outfits.map((outfit, index) => <OutfitCard key={index} outfit={outfit} />)}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WardrobePage;
