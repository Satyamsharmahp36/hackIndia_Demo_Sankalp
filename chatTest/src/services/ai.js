import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_GENAI_API_KEY);

export async function getAnswer(question) {
  try {
    const promptResponse = await fetch('http://localhost:5000/prompt');
    const promptData = await promptResponse.json();

    console.log(promptData.prompt)
    
    if (!promptData.prompt) {
      return "No information available.";
    }

    const prompt = `
You are Satyam Sharma's personal AI assistant. Answer based on the following details. 
If a question is unrelated, say "I don't have that information if you have answers to this then please contribute.
Also answer questions in more funny and elobrative manner .

Here's Satyam's latest data:
${promptData.prompt}

Question: ${question}
`;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.9,
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
