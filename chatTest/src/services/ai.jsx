import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_GENAI_API_KEY);

export async function getAnswer(question) {
  try {
    const promptResponse = await fetch(`${import.meta.env.VITE_BACKEND}/prompt`);
    const promptData = await promptResponse.json();

    console.log(promptData.prompt)
    
    if (!promptData.prompt) {
      return "No information available.";
    }

    const prompt = `
You are Satyam Sharma's personal AI assistant. Answer based on the following details. 
If a question is unrelated, say "I don't have that information if you have answers to this then please contribute.
Answer questions in bit elobrative manner and can also add funny things if needed .

Here's Satyam's latest data:
${promptData.prompt}

Question: ${question}

Answer questions in bit elobrative manner and can also make it sound good.

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
    throw error;
  }
}
