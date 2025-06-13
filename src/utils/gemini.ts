import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!)

const MAX_RESPONSE_LENGTH = 500 // Maximum number of characters for the response

export async function generateAIResponse(question: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    
    const prompt = `You are a helpful teaching assistant for a statistics and data analysis class. 
    The student has asked the following question. Please provide a clear, concise, and helpful response.
    
    Guidelines:
    - Keep your response under ${MAX_RESPONSE_LENGTH} characters
    - Use plain text only (no markdown, no code blocks)
    - If the question involves code, explain the solution in plain text
    - If the question involves an error message, explain the error and fix in plain text
    - If the text is invalid, reply with "I apologize, but I cannot answer that question."
    - Focus on being clear and concise
    
    Question: ${question}`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Ensure the response is within the character limit
    return text.length > MAX_RESPONSE_LENGTH 
      ? text.substring(0, MAX_RESPONSE_LENGTH - 3) + '...'
      : text
  } catch (error) {
    console.error('Error generating AI response:', error)
    return 'I apologize, but I encountered an error while generating a response. Please try again later.'
  }
} 