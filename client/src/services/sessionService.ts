const API_URL = 'http://localhost:3001/api';

export interface SessionData {
  sessionId: string;
  mode: 'coding' | 'technical';
  techStack: string;
  level: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  overallScore?: number;
}

// Start a new session
export const startSession = async (mode: 'coding' | 'technical', techStack: string, level: string): Promise<string> => {
  try {
    console.log('🎬 Starting session:', { mode, techStack, level });
    
    const response = await fetch(`${API_URL}/sessions/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        mode,
        techStack,
        level,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to start session: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to start session');
    }

    console.log('✅ Session started successfully:', data.sessionId);
    return data.sessionId;
    
  } catch (error) {
    console.error('❌ Error starting session:', error);
    throw error;
  }
};

// Update session with question/challenge
export const updateSession = async (
  sessionId: string, 
  updates: {
    question?: any;
    response?: string;
    evaluation?: any;
    challenge?: any;
  }
): Promise<void> => {
  try {
    console.log('📝 Updating session:', sessionId, updates);
    
    const response = await fetch(`${API_URL}/sessions/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        sessionId,
        ...updates,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update session: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to update session');
    }

    console.log('✅ Session updated successfully');
    
  } catch (error) {
    console.error('❌ Error updating session:', error);
    throw error;
  }
};

// End session
export const endSession = async (
  sessionId: string, 
  overallScore?: number, 
  finalData?: any
): Promise<void> => {
  try {
    console.log('🏁 Ending session:', sessionId, { overallScore, finalData });
    
    const response = await fetch(`${API_URL}/sessions/end`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        sessionId,
        overallScore,
        finalData,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to end session: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to end session');
    }

    console.log('✅ Session ended successfully');
    
  } catch (error) {
    console.error('❌ Error ending session:', error);
    throw error;
  }
};
