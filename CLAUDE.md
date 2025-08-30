# Image Editor with AI Chat

## 🎯 Project Overview
**Next.js 15** application with AI-powered image editing using Fal AI and OpenRouter APIs

## 🛠 Tech Stack
- **Framework**: Next.js 15 + App Router + TypeScript
- **UI**: Tailwind CSS + shadcn/ui + Lucide React icons
- **State Management**: Zustand + LocalStorage persistence
- **File Handling**: react-dropzone with drag & drop
- **AI APIs**: Fal AI (`@fal-ai/client`) + OpenRouter (`openai` SDK)

## 🔐 Environment Variables
```bash
FAL_KEY=your_fal_ai_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
SITE_URL=http://localhost:3000  # Optional
```

## 📁 Project Structure
```
nano-banana-app/
├── src/
│   ├── app/
│   │   ├── page.tsx                           # Main portal page with 3 navigation tiles
│   │   ├── editor/
│   │   │   └── page.tsx                       # Fal AI editor page with dropzone & prompt
│   │   ├── editor-openrouter/
│   │   │   └── page.tsx                       # OpenRouter chat page with image analysis
│   │   ├── library/
│   │   │   └── page.tsx                       # Library page with image grid
│   │   └── api/
│   │       ├── image-edit/
│   │       │   └── route.ts                   # Fal AI image editing API endpoint
│   │       └── openrouter-edit/
│   │           └── route.ts                   # OpenRouter image chat API endpoint
│   ├── components/
│   │   ├── ui/                                # shadcn/ui components (button, card, textarea, dialog)
│   │   └── modules/                           # Custom components
│   │       ├── image-dropzone.tsx             # File upload dropzone with preview
│   │       ├── library-grid.tsx               # Responsive image grid layout
│   │       └── image-card.tsx                 # Individual image card with metadata
│   ├── lib/
│   │   ├── utils.ts                           # Tailwind utility functions (cn)
│   │   ├── store/
│   │   │   └── image-store.ts                 # Zustand store for image state management
│   │   └── storage/
│   │       └── localStorage.ts                # LocalStorage utilities for persistence
│   └── types/
│       └── image.ts                           # TypeScript interfaces for image data
├── tests/
│   ├── testing-assets/                        # Test images and files for API testing
│   │   └── formula-1.png                      # Example test image for OpenRouter/Fal testing
│   ├── test-api-integration.mjs               # Fal AI end-to-end integration test  
│   ├── test-fal-connection.mjs                # Fal AI direct connection test
│   ├── test-openrouter-connection.mjs         # OpenRouter direct connection test
│   └── test-openrouter-integration.mjs        # OpenRouter end-to-end integration test
├── public/                                    # Static assets
├── next.config.ts                             # Next.js configuration
└── package.json                               # Dependencies and scripts (includes openai SDK)
```

## 🚀 COMPLETED FEATURES

### 📺 **Application Pages**
- **Portal**: Landing page with 3 navigation tiles (Editor, Editor OpenRouter, Library)  
- **Fal AI Editor**: Image upload + editing with drag & drop
- **OpenRouter Editor**: Chat interface with image analysis and generation
- **Library**: Grid view of edited images with metadata management

### 🎨 **UI/UX**
- **Responsive Design**: Mobile-first (1-5 column grid)
- **Glass Morphism**: Gradient backgrounds with backdrop blur
- **File Upload**: Drag & drop with validation (PNG, JPG, GIF, WebP, BMP, TIFF, max 10MB)
- **Interactive Elements**: Hover effects, loading states, smooth transitions

### 🔧 **Core Technical Features**
- **State Management**: Zustand store with LocalStorage persistence
- **Image Display**: Generated images from OpenRouter (base64/data URI support)
- **Error Handling**: Comprehensive error system with retry functionality
- **Memory Management**: Proper blob URL cleanup
- **Type Safety**: Full TypeScript implementation

## 🛡️ **Enhanced Error Handling**

### Finish Reason Detection
- ✅ **Content Filter Detection**: `finish_reason: "content_filter"` → "Content Prohibited" 
- ✅ **Length Limits**: `finish_reason: "length"` → "Response Too Long"
- ✅ **Model Issues**: Other finish reasons → Categorized errors
- ✅ **Success Detection**: `finish_reason: "stop"` → Normal processing

### Error Types & UI
- **Authentication** (Yellow): API key issues
- **Rate Limit** (Blue): Too many requests  
- **Network** (Orange): Connection problems
- **Content Filter** (Purple): Policy violations (non-retryable)
- **Length Limit** (Indigo): Response truncated
- **Model Issues** (Pink): AI processing errors

### Error Features
- **Smart Retry**: Only for recoverable errors
- **Expandable Details**: Technical info with error codes
- **Context Help**: Specific guidance per error type
- **Graceful Degradation**: UI stays functional after errors

## 🧪 **Development & Testing**

### Commands
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run lint         # Run ESLint
```

### API Testing (.mjs files)
```bash
node tests/test-fal-connection.mjs           # Test Fal AI
node tests/test-openrouter-connection.mjs    # Test OpenRouter
node tests/test-api-integration.mjs          # Full integration tests
```

## 🤖 **AI Integration**

### Fal AI (Image Editing)
- **Endpoint**: `/api/image-edit` 
- **Model**: `fal-ai/nano-banana/edit`
- **Purpose**: Direct image transformation
- **Output**: Edited image file (URL)

### OpenRouter (Chat & Generation)  
- **Endpoint**: `/api/openrouter-edit`
- **Model**: `google/gemini-2.5-flash-image-preview:free`
- **Purpose**: Image analysis, chat, and generation
- **Output**: Text response + generated images (base64)
- **Features**: Supports both image analysis AND image generation

### Key Technical Achievements
- **Image Generation Display**: Properly extracts and displays generated images from OpenRouter
- **Finish Reason Handling**: Content filter detection with user-friendly messages  
- **Comprehensive Logging**: Essential console.log statements for API debugging
- **Error Recovery**: Retry mechanisms with appropriate UX
- **Type Safety**: Proper TypeScript interfaces replacing `any` types
- **Hydration Fix**: Suppressed browser extension conflicts

## 🔄 **Data Flow**
1. **Upload** → Dropzone → Blob URL → Zustand + LocalStorage
2. **Process** → API call → Error handling → Display results/images
3. **Display** → Generated images + text responses with proper error states
4. **Persist** → LocalStorage management with cleanup