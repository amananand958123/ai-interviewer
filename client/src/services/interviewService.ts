// import { useInterviewStore } from '../stores/interviewStore';

const API_URL = 'http://localhost:3001/api';

// Note: Fallback questions removed - all questions are now API-generated

export const startSession = async (techStack: string, level: string) => {
  console.log('🚀 Starting session with backend:', { techStack, level })
  
  try {
    const response = await fetch(`${API_URL}/sessions/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        mode: 'technical',
        techStack,
        level,
      }),
    });

    console.log('📡 Session start response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Session start failed:', errorText)
      throw new Error('Failed to start session');
    }

    const data = await response.json();
    console.log('✅ Session start response:', data)
    return data.sessionId;
  } catch (error) {
    console.error('❌ Error starting session:', error);
    const fallbackId = `interview-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log('🔄 Using fallback session ID:', fallbackId)
    return fallbackId;
  }
};

export const endSession = async (sessionId: string, overallScore?: number) => {
  if (!sessionId) return;

  try {
    await fetch(`${API_URL}/sessions/end`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        sessionId,
        overallScore,
      }),
    });
  } catch (error) {
    console.error('Error ending session:', error);
  }
};

export const updateSession = async (sessionId: string, question: any, response?: string, evaluation?: any) => {
  if (!sessionId) return;

  try {
    await fetch(`${API_URL}/sessions/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        sessionId,
        question,
        response,
        evaluation,
      }),
    });
  } catch (error) {
    console.error('Error updating session:', error);
  }
};

export const generateQuestion = async (techStack: string, level: string, previousQuestions: string[], sessionId: string) => {
  console.log('🌐 Attempting to generate question via API...')
  console.log('📋 Request params:', { techStack, level, previousQuestions: previousQuestions.length, sessionId })
  
  // Check if API_URL is configured
  if (!API_URL) {
    console.error('❌ API_URL not configured')
    throw new Error('API URL not configured')
  }
  
  const requestBody = {
    type: 'technical',
    difficulty: level,
    category: techStack,
    previousQuestions,
    sessionId,
  }
  
  console.log('📤 Sending API request to:', `${API_URL}/interview/generate-question`)
  console.log('📦 Request body:', requestBody)
  
  const response: Response = await fetch(`${API_URL}/interview/generate-question`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(requestBody),
  });

  console.log('📡 API Response status:', response.status, response.statusText)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
    console.error('❌ API Error Response:', errorData)
    
    // Handle specific error types
    if (response.status === 429) {
      throw new Error(`Rate limited: ${errorData.message || 'Please wait before generating another question'}`)
    } else if (response.status === 503) {
      throw new Error(`AI service unavailable: ${errorData.message || 'Please try again later'}`)
    } else {
      throw new Error(`API request failed: ${response.status} - ${errorData.message || 'Unknown error'}`)
    }
  }

  const responseData = await response.json();
  console.log('✅ API Response data:', responseData)
  
  if (!responseData.question) {
    throw new Error('Invalid response: missing question field')
  }
  
  return responseData;
};

export const evaluateResponse = async (question: string, response: string, sessionId: string) => {
  const evaluationResponse = await fetch(`${API_URL}/interview/evaluate-response`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      question,
      response,
      type: 'technical',
      sessionId,
    }),
  });

  if (!evaluationResponse.ok) {
    return null;
  }

  return evaluationResponse.json();
};
<<<<<<< HEAD

export const correctGrammar = async (text: string): Promise<string> => {
  try {
    const response = await fetch(`${API_URL}/correct-grammar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      console.warn('Grammar correction failed, using original text');
      return text; // Return original text if correction fails
    }

    const data = await response.json();
    return data.correctedText || text;
  } catch (error) {
    console.error('Error correcting grammar:', error);
    return text; // Return original text if there's an error
  }
};
=======
>>>>>>> c538edd751c2e8f7c7773b287e3f6c83f630f35e
