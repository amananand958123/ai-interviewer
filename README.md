# AI Interviewer

A comprehensive AI-powered interview practice platform featuring real-time speech recognition, coding challenges, and intelligent feedback. Built with React, Node.js, and Google Gemini AI.

## 🚀 Project Status: **PRODUCTION READY**

This is a fully functional, production-ready application with:
- ✅ Complete frontend and backend implementation
- ✅ AI integration with Google Gemini API
- ✅ Real-time code execution and testing
- ✅ User authentication and session management
- ✅ Responsive design for all devices
- ✅ Clean, maintainable codebase
- ✅ No redundant or unused files

## 🎯 Features

### **🎤 Technical Interview Mode**
- AI-powered conversational interviews
- Behavioral, technical, and system design questions
- Real-time speech recognition and transcription
- Natural language processing with Gemini AI
- Progress tracking and performance analytics

### **💻 Coding Test Mode**
- **Multi-Language Support**: JavaScript, Python, Java, C++, Go
- **Smart Language Selection**: 
  - Generic DSA: Choose any language
  - Specific Tech Stack: Language locked to selection
- **Monaco Code Editor**: Syntax highlighting, autocomplete, IntelliSense
- **Real-time Execution**: Live code testing with multiple test cases
- **Performance Metrics**: Time, memory usage, and pass rate tracking
- **Intelligent Analysis**: Post-test scoring and feedback

### **🏠 Home & Navigation**
- Modern glassmorphism UI design
- Dark/light theme support with persistence
- Camera preview with contextual background
- Intuitive navigation between modes

### **📊 Dashboard & Analytics**
- Interview history and session tracking
- Performance metrics and progress visualization
- Detailed analytics with charts and insights
- User profile and settings management

### **🎨 UI/UX Excellence**
- **Responsive Design**: Mobile-first, works on all devices
- **Smooth Animations**: Framer Motion integration
- **Loading States**: Skeleton loaders and progress indicators
- **Real-time Feedback**: Toast notifications and status updates
- **Accessibility**: ARIA labels, keyboard navigation

## 🏗️ Tech Stack

### **Frontend**
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Monaco Editor** for code editing
- **Framer Motion** for animations
- **Zustand** for state management
- **React Hot Toast** for notifications

### **Backend**
- **Node.js** with Express
- **MongoDB** for data persistence
- **JWT** for authentication
- **CORS** for cross-origin requests
- **Google Gemini API** for AI features

### **AI & Integrations**
- **Google Gemini 2.0 Flash** for question generation and responses
- **Web Speech API** for voice recognition
- **Custom Code Execution Engine** for multi-language support

## 📁 Project Structure

```
ai-interviewer/
├── client/                          # Frontend React application
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── Layout.tsx          # Main application layout
│   │   │   ├── CameraPreview.tsx   # Camera handling component
│   │   │   ├── CodeEditor.tsx      # Monaco code editor wrapper
│   │   │   ├── ProtectedRoute.tsx  # Route authentication
│   │   │   └── ...                 # Other components
│   │   ├── pages/                  # Main application pages
│   │   │   ├── Home.tsx           # Landing/home page
│   │   │   ├── CodingTest.tsx     # Coding challenge interface
│   │   │   ├── TechnicalInterview.tsx # Interview mode
│   │   │   ├── Dashboard.tsx      # User dashboard
│   │   │   ├── Login.tsx          # Authentication
│   │   │   └── ...                # Other pages
│   │   ├── stores/                # Zustand state management
│   │   ├── services/              # API service functions
│   │   └── data/                  # Static data and types
│   ├── public/                    # Static assets
│   └── package.json              # Frontend dependencies
├── server/                       # Backend Node.js application
│   ├── routes/                   # API route handlers
│   ├── models/                   # Database models
│   ├── middleware/               # Express middleware
│   ├── config/                   # Configuration files
│   └── index.js                  # Main server file
├── PROJECT_STATUS.md             # Detailed project status
└── README.md                     # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MongoDB database
- Google Gemini API key

### Installation

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd ai-interviewer
   npm install
   cd client && npm install
   ```

2. **Environment Setup**
   ```bash
   # Root .env
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # Server .env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

3. **Start Development**
   ```bash
   # Start backend (from root)
   npm start
   
   # Start frontend (new terminal)
   cd client && npm run dev
   ```

4. **Access Application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001

## 🎮 Usage Guide

### **Getting Started**
1. **Register/Login**: Create an account or sign in
2. **Choose Mode**: Select Technical Interview or Coding Test
3. **Configure**: Set your preferences (tech stack, difficulty)
4. **Start**: Begin your practice session

### **Coding Test**
1. **Select Tech Stack**: Choose JavaScript, Python, Java, C++, Go, or Generic
2. **Choose Difficulty**: Basic, Intermediate, or Pro level
3. **Code**: Use the Monaco editor with full IntelliSense support
4. **Test**: Run your code against multiple test cases
5. **Submit**: Get detailed analysis and scoring

### **Technical Interview**
1. **Start Session**: Begin AI-powered interview
2. **Speak Naturally**: Use voice or text input
3. **Get Feedback**: Receive AI responses and follow-up questions
4. **Review**: Check your transcript and performance

## 🔧 Configuration

### **Environment Variables**
```bash
# Required
GEMINI_API_KEY=your_api_key
MONGODB_URI=mongodb_connection_string
JWT_SECRET=your_jwt_secret

# Optional
PORT=3001
NODE_ENV=development
```

### **Customization**
- **Themes**: Modify theme settings in `client/src/stores/themeStore.ts`
- **Languages**: Add support in `client/src/pages/CodingTest.tsx`
- **Question Banks**: Update in `client/src/data/questionBank.ts`

## 🧪 Testing & Development

### **Development Commands**
```bash
# Frontend development
cd client && npm run dev

# Backend development
npm run dev

# Build for production
cd client && npm run build
```

### **Code Quality**
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Responsive design testing

## 🌐 Browser Support

| Browser | Support | Notes |
|---------|---------|--------|
| Chrome 80+ | ✅ Full | Recommended |
| Edge 80+ | ✅ Full | Recommended |
| Firefox 70+ | ⚠️ Limited | Speech recognition limited |
| Safari 14+ | ⚠️ Limited | Speech recognition limited |

### **Required Permissions**
- 🎤 Microphone access for speech recognition
- 🔊 Audio playback for text-to-speech

## 🚀 Deployment

### **Production Ready**
The application is fully configured for production deployment:

- **Frontend**: Vercel, Netlify, GitHub Pages
- **Backend**: Railway, Render, Heroku
- **Database**: MongoDB Atlas, local MongoDB
- **Environment**: All configs externalized

### **Build Commands**
```bash
# Frontend build
cd client && npm run build

# Backend is ready to deploy as-is
npm start
```

## � Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Input validation and sanitization
- Environment variable protection
- Secure API endpoints

## 🤝 Contributing

### **Development Workflow**
1. Fork the repository
2. Create a feature branch
3. Implement changes with proper testing
4. Follow existing code patterns
5. Submit a pull request

### **Code Standards**
- TypeScript for type safety
- Consistent component structure
- Responsive design principles
- Clean, readable code
- Proper error handling

## 📝 API Documentation

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### **Coding Challenges**
- `POST /api/coding/generate-challenge` - Generate coding questions
- `POST /api/code/execute` - Execute code with test cases

### **Interviews**
- `POST /api/interview/generate-question` - Generate interview questions
- `POST /api/interview/evaluate-response` - Evaluate responses

## 📜 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues, feature requests, or questions:
- Create a GitHub issue
- Check the PROJECT_STATUS.md for detailed implementation notes
- Review the code documentation

---

**🎉 Ready for Production | Built with ❤️ using modern web technologies and AI**
- Comprehensive feedback and scoring

#### **Coding Test Mode**
- Algorithm and data structure challenges
- Monaco Editor with syntax highlighting
- Multi-language support (JavaScript, Python, Java, C++)
- Real-time code execution and testing
- Test case validation and performance metrics
- Code quality assessment

### 🎙️ **Speech & Voice Features**
- Real-time speech-to-text transcription
- Natural text-to-speech responses
- Audio level monitoring
- Voice control commands
- Customizable speech settings (rate, pitch, volume)
- Cross-browser compatibility

### 📊 **Analytics & Insights**
- Performance tracking dashboard
- Skill gap analysis
- Progress visualization with charts
- Session history and trends
- Exportable reports
- Improvement recommendations

### 🎨 **Modern UI/UX**
- Dark/light theme with smooth transitions
- Mobile-first responsive design
- Accessibility compliance (WCAG 2.1 AA)
- Touch-optimized interfaces
- Animated micro-interactions
- Glassmorphism design elements

## Tech Stack

### **Frontend**
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Router** for navigation
- **Monaco Editor** for code editing
- **Recharts** for data visualization
- **Framer Motion** for animations
- **Lucide React** for icons

### **Backend**
- **Node.js** with Express
- **Socket.io** for real-time communication
- **Google Gemini 2.0 Flash** for AI responses
- **Helmet** for security
- **CORS** for cross-origin support
- **Compression** for performance

### **APIs & Services**
- **Web Speech API** for speech recognition
- **SpeechSynthesis API** for text-to-speech
- **Google Gemini 2.0 Flash** for AI conversation
- **Judge0 CE** for code execution (ready for integration)

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Modern browser with Web Speech API support (Chrome, Edge recommended)
- Gemini API key from Google AI Studio

### 1. Clone and Install
\`\`\`bash
cd ai-interviewer
npm install
\`\`\`

### 2. Install Client Dependencies
\`\`\`bash
cd client
npm install
cd ..
\`\`\`

### 3. Environment Setup
\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env` and add your API keys:
\`\`\`env
GEMINI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=http://localhost:3000
\`\`\`

### 4. Run Development Server
\`\`\`bash
npm run dev
\`\`\`

This starts both the backend (port 5000) and frontend (port 3000).

### 5. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Project Structure

\`\`\`
ai-interviewer/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── Layout.tsx
│   │   │   ├── SpeechRecognition.tsx
│   │   │   ├── Transcript.tsx
│   │   │   └── CodeEditor.tsx
│   │   ├── pages/          # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── TechnicalInterview.tsx
│   │   │   ├── CodingTest.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   └── Settings.tsx
│   │   ├── stores/         # Zustand state stores
│   │   │   ├── themeStore.ts
│   │   │   ├── speechStore.ts
│   │   │   └── interviewStore.ts
│   │   └── index.css       # Global styles
│   ├── package.json
│   └── vite.config.ts
├── server/                 # Node.js backend
│   └── index.js           # Express server with Socket.io
├── package.json           # Root package.json
└── README.md
\`\`\`

## Key Features Breakdown

### 🎤 **Speech Recognition System**
- Real-time voice-to-text conversion
- Audio level visualization
- Noise cancellation ready
- Speaker identification for conversations
- Automatic transcript generation

### 🤖 **AI Integration**
- Gemini 2.0 Flash for natural conversations
- Context-aware question generation
- Intelligent response evaluation
- Adaptive difficulty adjustment
- Real-time feedback and coaching

### 💻 **Code Editor Features**
- Monaco Editor with full IntelliSense
- Multi-language syntax highlighting
- Real-time error detection
- Code formatting and auto-completion
- Integrated debugging tools ready

### 📱 **Responsive Design**
- Mobile-first approach
- Touch-optimized controls
- Swipe gestures for navigation
- Adaptive layouts for all screen sizes
- Cross-platform compatibility

### ♿ **Accessibility Features**
- WCAG 2.1 AA compliance
- Screen reader optimization
- Keyboard navigation support
- High contrast mode
- Customizable font sizes

## Usage Guide

### Starting a Technical Interview
1. Navigate to "Technical Interview" from the sidebar
2. Click "Start Interview" to begin
3. Grant microphone permissions when prompted
4. Speak your answers or type them
5. Use voice controls: "next", "skip", "repeat"
6. View real-time transcript on the right panel

### Taking a Coding Test
1. Go to "Coding Test" page
2. Select your preferred programming language
3. Click "Start Coding Test"
4. Read the problem statement
5. Write your solution in the Monaco editor
6. Run tests to validate your code
7. Submit when ready

### Viewing Analytics
1. Visit the "Dashboard" page
2. Review performance metrics and trends
3. Analyze skill breakdowns
4. Export data for external analysis
5. Track improvement over time

## API Endpoints

### Interview Management
- `POST /api/interview/generate-question` - Generate new questions
- `POST /api/interview/evaluate-response` - Evaluate user responses

### Code Execution
- `POST /api/code/execute` - Execute code with test cases

### WebSocket Events
- `transcript-update` - Real-time transcript sharing
- `request-ai-response` - Get AI interviewer responses
- `ai-response` - Receive AI responses

## Browser Compatibility

### Recommended Browsers
- ✅ **Chrome 80+** (Full support)
- ✅ **Microsoft Edge 80+** (Full support)
- ⚠️ **Firefox 70+** (Limited speech recognition)
- ⚠️ **Safari 14+** (Limited speech recognition)

### Required Permissions
- 🎤 **Microphone access** for speech recognition
- 🔊 **Audio playback** for text-to-speech

## Performance Optimizations

### Implemented
- Code splitting with React.lazy
- Image optimization
- CSS minification
- Gzip compression
- Efficient state management
- Debounced API calls

### Planned
- Service Worker for offline support
- CDN integration
- Database query optimization
- Redis caching
- Image lazy loading

## Security Features

- Helmet.js for security headers
- CORS configuration
- Input validation and sanitization
- Rate limiting ready
- Environment variable protection
- XSS protection

## Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Follow code style guidelines
5. Submit a pull request

### Code Standards
- TypeScript for type safety
- ESLint + Prettier for formatting
- Conventional commits
- Component-based architecture
- Responsive design principles

## Deployment

### Production Build
\`\`\`bash
npm run build
\`\`\`

### Deployment Options
- **Frontend**: Vercel, Netlify, GitHub Pages
- **Backend**: Railway, Render, Heroku
- **Database**: MongoDB Atlas, PostgreSQL
- **CDN**: CloudFlare, AWS CloudFront

## License

MIT License - see LICENSE file for details.

## Support

For issues and feature requests, please create a GitHub issue or contact the development team.

---

**Built with ❤️ using modern web technologies and AI**
