import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!)

const MAX_RESPONSE_LENGTH = 500 // Maximum number of characters for the response

export async function generateAIResponse(question: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    
    const prompt = `You are a helpful teaching assistant for a statistics and data analysis class.
    The student has asked the following question. Please provide a detailed and thorough response that fully explains the concepts involved.
    Feel free to include examples and analogies to help illustrate your points. Take the time to break down complex ideas into understandable pieces.
    
    Guidelines:
    - Keep your response under ${MAX_RESPONSE_LENGTH} characters
    - Use plain text with appropriate line breaks for readability
    - Start new paragraphs for new ideas or examples
    - Use blank lines between major sections
    - If the question involves code, explain the solution in plain text with clear steps
    - If the question involves an error message, explain the error and fix in plain text
    - If the text is invalid, reply with "I apologize, but I cannot answer that question."
    - Focus on being clear and concise
    
    Question: ${question}`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Format response with line breaks and ensure it's within character limit
    const formattedText = text
      .replace(/([.!?])\s+/g, '$1\n\n') // Add line breaks after sentences
      .replace(/\n{3,}/g, '\n\n') // Remove excess line breaks
    
    return formattedText.length > MAX_RESPONSE_LENGTH 
      ? formattedText.substring(0, MAX_RESPONSE_LENGTH - 3) + '...'
      : formattedText
  } catch (error) {
    console.error('Error generating AI response:', error)
    return 'I apologize, but I encountered an error while generating a response. Please try again later.'
  }
}