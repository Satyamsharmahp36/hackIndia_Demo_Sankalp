import { GoogleGenerativeAI } from "@google/generative-ai";
import { toast } from 'react-toastify';

async function detectTaskRequest(question, userData) {
  try {
    if (!userData || !userData.geminiApiKey) {
      return { isTask: false, error: "No Gemini API key available" };
    }

    const genAI = new GoogleGenerativeAI(userData.geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const detectionPrompt = `
    Analyze the following text and determine if it contains a request for a future task, follow-up, or reminder.
    First, respond with "YES" if it's a task request or "NO" if it's not.
    
    If it is a task request, on a new line after "YES", provide a description of the task like with's this all about(maximum 1/3 the orignal task asked) 
    Also if task have come link's then attach that also in the description.
    
    Examples of task requests:
    - "When you get time ping me about the cosmos deployment"
    - "Remind me to check on the server status tomorrow"
    - "I need you to follow up with me about this issue later"
    - "Once you're free, let's discuss the project timeline"
    - "Let's have a call tomorrow"
    - "Can we schedule a meeting next week?"
    
    User message: "${question}"
    `;

    const result = await model.generateContent(detectionPrompt);
    const response = await result.response;
    const responseText = response.text().trim();
    
    const isTask = responseText.toUpperCase().startsWith("YES");
    let taskDescription = "";
    if (isTask) {
      const lines = responseText.split('\n');
      if (lines.length > 1) {
        taskDescription = lines.slice(1).join(' ').trim();
      }
    }

    return { 
      isTask, 
      taskDetails: isTask ? question : null,
      taskDescription: taskDescription || "Task request"
    };
  } catch (error) {
    console.error("Error detecting task:", error);
    return { isTask: false, error: error.message };
  }
}

function generateUniqueTaskId() {
  const now = new Date();
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); 
  const year = now.getFullYear();
  
  return `${seconds}${minutes}${hours}${day}${month}${year}`;
}

async function createTask(taskQuestion, taskDescription, userData, presentData) {
  try {
    const uniqueTaskId = generateUniqueTaskId();
    
    const minimizedPresentData = presentData ? {
      name: presentData.name,
      email: presentData.email,
      mobileNo: presentData.mobileNo,
      prompt: presentData.prompt,
      username: presentData.username
    } : null;

    const response = await fetch(`${import.meta.env.VITE_BACKEND}/create-task`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userData.username,
        taskQuestion: taskQuestion,
        taskDescription: taskDescription,
        uniqueTaskId: uniqueTaskId,
        status: 'inprogress',
        presentUserData: minimizedPresentData
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create task');
    }
    const result = await response.json();
    
    toast.success(`Task added to ${userData.name}'s to-do list!`, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    
    return result;
  } catch (error) {
    console.error('Error creating task:', error);
    toast.error('Failed to add task. Please try again.', {
      position: "top-right",
      autoClose: 3000,
    });
    throw error;
  }
}

export async function getAnswer(question, userData, presentData) {
  try {
    if (!userData || !userData.geminiApiKey) {
      return "No Gemini API key available for this user.";
    }

    const approvedContributions = userData.contributions?.filter(contribution => 
      contribution.status === "approved") || [];

      console.log(approvedContributions)
      const contributionsKnowledgeBase = approvedContributions.length > 0 ? 
      `This is my personal knowledge base of verified information. you can use this to answer the questions
${approvedContributions.map((c, index) => `[${index + 1}] Question: ${c.question}\nAnswer: ${c.answer}`).join('\n\n')}` : 
      'No specific approved contributions yet.';

    const taskDetection = await detectTaskRequest(question, userData);
    
    if (taskDetection.isTask) {
      if (presentData) {
        try {
          const taskResult = await createTask(question, taskDetection.taskDescription, userData, presentData);
          
          const uniqueTaskId = taskResult.task.uniqueTaskId;
          return `I've added this to ${userData.name}'s to-do list with tracking ID ${uniqueTaskId}. ${userData.name} will follow up with you about this task later.`;
          
        } catch (taskError) {
          console.error("Task creation error:", taskError);
          return "I noticed this is a task request, but there was an issue scheduling it.";
        }
      } else {
        return "You are not a registered user of ChatMate, so I can't schedule tasks for you. Please register at https://chat-matee.vercel.app/ and then login with your username to use this feature.";
      }
    }

    const genAI = new GoogleGenerativeAI(userData.geminiApiKey);

    const prompt = `
You are ${userData.name}'s personal AI assistant. Answer based on the following details. Also answer the question's in person like instead of AI the ${userData.name} is answering questions.
If a you don't have data for any information say "I don't have that information. If you have answers to this, please contribute."
Answer questions in a bit elaborate manner and can also add funny things if needed.

Here's ${userData.name}'s latest data:
${userData.prompt || 'No specific context provided'}

And this is daily task of user ${userData.dailyTasks.content}

Question: ${question}

${contributionsKnowledgeBase}
When providing links, give plain URLs like https://github.com/xxxx/

This is the way I want the responses to be ${userData.userPrompt}
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