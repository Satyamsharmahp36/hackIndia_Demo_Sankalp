import { GoogleGenerativeAI } from "@google/generative-ai";

export async function getAnswer(question, userData) {
  try {
    // const userResponse = await fetch(`${import.meta.env.VITE_BACKEND}/verify-user/${userId}`);
    // const userData = await userResponse.json();

    if (!userData || !userData.geminiApiKey) {
      return "No Gemini API key available for this user.";
    }

    // Create Generative AI instance with user's API key
    const genAI = new GoogleGenerativeAI(userData.geminiApiKey);

    // Use the user's prompt or a default prompt
    const prompt = `
You are ${userData.name}'s personal AI assistant. Answer based on the following details. Also answer the question's in person like instead of AI the  ${userData.name} is answering questions
If a you don't have data for any information say "I don't have that information. If you have answers to this, please contribute."
Answer questions in a bit elaborate manner and can also add funny things if needed.

Here's ${userData.name}'s latest data:
${userData.prompt || 'No specific context provided'}

Question: ${question}

Answer questions in a bit elaborate manner and make it sound good.
When providing links, give plain URLs like  https://github.com/xxxx/
`;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.8,
      },
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating answer:", error);
    
    // Provide a more user-friendly error message
    if (error.message.includes('API key')) {
      return "There was an issue with the API key. Please check your Gemini API configuration.";
    }
    
    return "Sorry, I couldn't generate a response at this time.";
  }
}

export async function updatePrompt(content, userId) {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND}/update-prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, userId }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update prompt');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating prompt:', error);
    throw error;
  }
}