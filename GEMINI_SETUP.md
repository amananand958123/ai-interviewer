# AI Interviewer - Gemini 2.0 Flash Integration

## ✅ **CONFIGURED AND READY**

The AI Interviewer is now configured with:
- **API Key**: Set and ready to use
- **Model**: Gemini 2.0 Flash (Latest experimental model)
- **Status**: Fully functional with dynamic question generation

## Current Configuration
```
API Key: AIzaSyDCnvzJN7S6vl4BNOHILawC35aIW8IY_D8
Model: gemini-2.0-flash-exp
Status: ✅ Active
```

## Features
- **Dynamic Question Generation**: Questions are generated in real-time based on tech stack and difficulty level
- **Contextual Difficulty**: Questions adapt to Basic, Intermediate, or Pro levels
- **Fallback System**: If Gemini API is unavailable, the app falls back to enhanced mock questions
- **Smart Caching**: Questions are generated per session to ensure variety

## Setup Instructions

### 1. Get Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the generated key

### 2. Configure Environment Variables
1. Copy `.env.example` to `.env` in the `client` directory:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your API key:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

### 3. Restart Development Server
```bash
npm run dev
```

## How It Works

### Question Generation Process
1. User selects tech stack (JavaScript, React, Python, etc.) and level (Basic/Intermediate/Pro)
2. System calls Gemini API with a structured prompt
3. Gemini generates 5 relevant interview questions in JSON format
4. Questions are filtered and validated
5. If API fails, system uses enhanced mock questions as fallback

### Question Structure
Each generated question includes:
- **Question Text**: The actual interview question
- **Category**: Topic area (e.g., "Core Concepts", "Best Practices")
- **Difficulty**: Easy, Medium, or Hard
- **Expected Points**: Key concepts the answer should cover
- **Tech Stack**: The technology focus

### Level Mapping
- **Basic**: Only Easy difficulty questions focusing on fundamentals
- **Intermediate**: Mix of Easy and Medium questions covering practical applications
- **Pro**: Medium and Hard questions about advanced topics and system design

## Example Generated Questions

### JavaScript Basic Level
```json
{
  "text": "What are the basic data types in JavaScript?",
  "category": "JavaScript Fundamentals",
  "difficulty": "Easy",
  "expectedPoints": ["Primitive types", "Reference types", "Type checking"]
}
```

### React Pro Level
```json
{
  "text": "How would you implement a custom hook for managing complex state with side effects?",
  "category": "React Advanced Patterns",
  "difficulty": "Hard",
  "expectedPoints": ["Custom hooks", "useEffect", "State management", "Side effects"]
}
```

## Troubleshooting

### API Key Issues
- Ensure API key is correctly set in `.env` file
- Verify the key has proper permissions in Google AI Studio
- Check for any quota limits or billing issues

### Fallback Mode
If Gemini API is unavailable, the app automatically:
- Shows enhanced mock questions based on selected level
- Displays appropriate loading messages
- Logs errors to console for debugging

### Development Mode
Without an API key, the app runs in demo mode with:
- Level-appropriate mock questions
- Proper difficulty distribution
- Realistic question variety

## API Usage and Costs
- Gemini API has generous free tier limits
- Each interview session generates 5 questions (1 API call)
- Questions are cached per session to minimize API calls
- Monitor usage in Google AI Studio dashboard

## Security Notes
- Never commit `.env` files to version control
- API keys should be kept secret and rotated regularly
- Consider implementing rate limiting for production use
