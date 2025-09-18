# Wrench Buddy - CLAUDE.md

## Project Overview
Next.js 15.5.2 app with **React 19**, **TypeScript**, **Tailwind CSS 4**, and **shadcn/ui**. Professional component architecture with PAGE routing patterns and path aliases.

## Key Dependencies
- **Next.js**: 15.5.2 | **React**: 19.1.0 | **TypeScript**: 5+
- **Tailwind CSS**: 4+ | **shadcn/ui**: New York style, neutral base
- **Zustand**: 5.0.8 | **Lucide React**: 0.542.0 | **date-fns**: 4.1.0
- **AI SDK**: Vercel AI SDK with Google Gemini integration | **@ai-sdk/google**: 2.0.14 | **@ai-sdk/react**: 2.0.46

## Path Alias System

| Alias | Path | Usage |
|-------|------|--------|
| `@` | `./src/` | Root src directory access |
| `@/components` | `./src/components` | All components |
| `@/components/ui` | `./src/components/ui` | shadcn/ui + custom small components |
| `@/components/modules` | `./src/components/modules` | Complex feature components |
| `@/lib` | `./src/lib` | Utilities and configurations |
| `@/hooks` | `./src/hooks` | Custom hooks |
| `@/types` | `./src/types` | TypeScript interfaces |
| `@/app` | `./src/app` | Next.js App Router |

**Usage:**
```typescript
// ✅ Direct component imports
import Button from '@/components/ui/button';
import ImageCard from '@/components/modules/image-card';
import HomePage from '@/components/PAGE/home/index';

// ✅ Utilities and types
import { cn } from '@/lib/utils';
import { User } from '@/types';
import { useLocalStorage } from '@/hooks';
```

**Configured in:** `tsconfig.json`, `components.json`

## Import Order Standards (React 19+)

**🚨 CRITICAL:** No React import needed since React 19+. Follow this exact order:

```typescript
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'

import { format } from 'date-fns'
import { useStore } from 'zustand'

import HomePage from '@/components/PAGE/home/index'
import LibraryPage from '@/components/PAGE/library/index'
import AboutPage from '@/components/PAGE/about/index'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { Sidebar } from './components/Sidebar/Sidebar'
import ImageCard from '@/components/modules/image-card'
import ImageDropzone from '@/components/modules/image-dropzone'
import LibraryGrid from '@/components/modules/library-grid'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'

import { useLocalStorage } from '@/hooks'
import { useImageUpload } from '@/hooks'

import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'

import { User } from '@/types'
import { ImageData } from '@/types'
```

**Import Order Rules:**
- **NO React import** required (React 19+ automatic)
- **NEVER add comments** in import blocks
- **One blank line** between major categories (Next.js, Third-party, Components, Hooks, Utils, Types)
- **Group all components** together without blank lines (PAGE → local → modules → ui)
- **Group same types** together within categories (multiple hooks, multiple utils, etc.)
- **Use path aliases** consistently (@/components, @/types, etc.)

**Import Categories (in order):**
1. Next.js Core (Image, Link, navigation hooks)
2. Third-party libraries (node_modules dependencies)
3. **All Components** (grouped together):
   - PAGE components (@/components/PAGE)
   - Same tree components (./components)
   - Module components (@/components/modules)
   - UI components (@/components/ui)
4. Hooks (@/hooks)
5. Utilities (@/lib)
6. Types (@/types)

## 🗂️ **Professional Folder Structure**

### **Complete App Structure**
```
wrench-buddy/
├── src/
│   ├── app/                           # 📱 Next.js App Router
│   │   ├── layout.tsx                 # Root layout with providers
│   │   ├── page.tsx                   # 🔄 Imports from components/PAGE/home
│   │   ├── library/
│   │   │   └── page.tsx               # 🔄 Imports from components/PAGE/library
│   │   └── api/                       # API routes
│   │       ├── image-edit/
│   │       └── mixer-edit/
│   │
│   ├── components/                    # 🏗️ Component Architecture
│   │   ├── ui/                        # 🎨 shadcn/ui + Custom Small Components
│   │   │   ├── button.tsx             # shadcn Button component
│   │   │   ├── card.tsx               # shadcn Card component
│   │   │   ├── dialog.tsx             # shadcn Dialog component
│   │   │   └── textarea.tsx           # shadcn Textarea component
│   │   │
│   │   ├── modules/                   # 🔧 Complex Feature Components
│   │   │   ├── image-card.tsx         # Complex image display component
│   │   │   ├── image-dropzone.tsx     # File upload with preview
│   │   │   ├── image-many-dropzone.tsx # Multiple file upload
│   │   │   └── library-grid.tsx       # Library display grid
│   │   │
│   │   └── PAGE/                      # 🎯 Page Components (Mirror App Routing)
│   │       ├── home/                  # Corresponds to app/page.tsx
│   │       │   ├── index.tsx          # Main page component
│   │       │   ├── components/        # Page-specific sub-components
│   │       │   │   └── index.tsx      # Hero, Features, etc.
│   │       │   ├── hooks.ts           # Page-specific custom hooks
│   │       │   └── types.ts           # Page-specific TypeScript interfaces
│   │       │
│   │       └── library/               # Corresponds to app/library/page.tsx
│   │           ├── index.tsx          # Main page component
│   │           ├── components/        # Page-specific sub-components
│   │           │   └── index.tsx      # LibraryHeader, LibraryFilters
│   │           ├── hooks.ts           # Page-specific custom hooks
│   │           └── types.ts           # Page-specific TypeScript interfaces
│   │
│   ├── lib/                           # 🔧 Utilities & Configurations
│   │   ├── utils.ts                   # General utilities
│   │   └── tailwind/
│   │       └── utils.ts               # Tailwind-specific utilities
│   │
│   ├── hooks/                         # 🪝 Global custom hooks
│   ├── types/                         # 📝 Global TypeScript definitions
│   └── globals.css                    # 🎨 Global styles with Tailwind
│
├── components.json                    # shadcn/ui configuration
├── tailwind.config.js                # Tailwind configuration
└── package.json                       # Dependencies
```

## 📋 **Developer Guidelines**

### **🔑 Core Architecture Principles**

#### **1. Single Responsibility Pattern**
- **Rule**: Each `app/*/page.tsx` file should contain **ONLY ONE COMPONENT IMPORT**
- **Pattern**: `app/[route]/page.tsx` → `import PageComponent from '@/components/PAGE/[route]/index'`

**✅ Correct Example:**
```typescript
// app/page.tsx (home page)
import HomePage from '@/components/PAGE/home/index';

export default function HomeScreen() {
  return <HomePage />;
}
```

**❌ Incorrect Example:**
```typescript
// app/page.tsx - DON'T DO THIS
import { Button } from '@/components/ui/button';
// ... lots of component logic here
```

#### **2. Mirror App Router Structure in components/PAGE/**
- **Rule**: `components/PAGE/` folder structure must **exactly mirror** the `app/` routing structure (excluding route groups)
- **Purpose**: Makes navigation and component organization predictable

**Next.js App Router to PAGE Component Mapping:**

| App Router | PAGE Component | Notes |
|------------|---------------|-------|
| `app/page.tsx` | `components/PAGE/home/index.tsx` | Root page → home |
| `app/about/page.tsx` | `components/PAGE/about/index.tsx` | Direct mapping |
| `app/blog/[slug]/page.tsx` | `components/PAGE/blog/[slug]/index.tsx` | Include dynamic segments |
| `app/dashboard/settings/page.tsx` | `components/PAGE/dashboard/settings/index.tsx` | Mirror nested structure |
| `app/(auth)/login/page.tsx` | `components/PAGE/login/index.tsx` | Ignore route groups |
| `app/api/users/route.ts` | ❌ No PAGE component | API routes excluded |

#### **3. Page Component Structure**
Each page directory in `components/PAGE/` follows this **mandatory structure**:

```
components/PAGE/[pageName]/
├── index.tsx              # ✅ Main page component (default export)
├── components/            # ✅ Page-specific sub-components
│   └── index.tsx          # ✅ Export sub-components
├── hooks.ts              # ✅ Page-specific custom hooks
└── types.ts              # ✅ Page-specific TypeScript types
```

**Example Implementation:**
```typescript
// components/PAGE/home/index.tsx
import { ImageCard } from '@/components/modules/image-card';
import { useImageUpload } from './hooks';
import { HomePageProps } from './types';
import { Hero, Features } from './components';

export default function HomePage({ className = '' }: HomePageProps) {
  const { uploadImage } = useImageUpload();

  return (
    <div className={`min-h-screen ${className}`}>
      <Hero />
      <Features />
      <ImageCard onUpload={uploadImage} />
    </div>
  );
}
```

#### **4. Component Organization**

**UI Components** (`components/ui/`):
- **Purpose**: shadcn/ui components + small custom reusable components
- **Structure**: Direct file imports (no folders for shadcn components)
- **Examples**: Button, Card, Dialog, Input, Textarea

**Module Components** (`components/modules/`):
- **Purpose**: Complex, feature-rich components with business logic
- **Structure**: Each component in its own file
- **Examples**: ImageCard, ImageDropzone, LibraryGrid, UserProfile

```
components/ui/
├── button.tsx             # shadcn Button
├── card.tsx               # shadcn Card
└── dialog.tsx             # shadcn Dialog

components/modules/
├── image-card.tsx          # Complex image display with actions
├── image-dropzone.tsx      # File upload with preview and validation
└── library-grid.tsx        # Grid layout with filtering and pagination
```

### **🚀 Next.js App Router Best Practices**

#### **File-Based Routing Rules**
1. **Page Files**: Place `page.tsx` files in `app/` directory structure
2. **Layouts**: Use `layout.tsx` for shared layouts
3. **Route Groups**: Use `(groupName)/` for organization without affecting URL
4. **Dynamic Routes**: Use `[param]/page.tsx` for dynamic segments
5. **Import Pattern**: Always import from corresponding `components/PAGE/` directory

#### **Navigation Flow**
```
User Request → app/[route]/page.tsx → components/PAGE/[route]/index.tsx → Render UI
```

#### **Example Route Structure**
```typescript
// app/layout.tsx - Root Layout
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

// app/page.tsx - Home Route
import HomePage from '@/components/PAGE/home/index';
export default function HomeScreen() {
  return <HomePage />;
}

// app/library/page.tsx - Library Route
import LibraryPage from '@/components/PAGE/library/index';
export default function LibraryScreen() {
  return <LibraryPage />;
}
```

### **📚 Component Development Workflow**

#### **Creating New Pages**
1. **Create Route**: Add `page.tsx` file in `app/` directory
2. **Create PAGE Structure**: Create matching directory in `components/PAGE/`
3. **Implement Component**: Build page in `components/PAGE/[name]/index.tsx`
4. **Add Supporting Files**: Create `hooks.ts`, `types.ts`, `components/index.tsx`
5. **Import in Route**: Single import in `app/*/page.tsx` file

#### **Creating New UI Components**
1. **For shadcn/ui**: Use `npx shadcn@latest add [component-name]`
2. **For custom small components**: Add directly to `components/ui/[name].tsx`
3. **Import directly**: No index files needed

#### **Creating New Module Components**
1. **Create File**: `components/modules/[component-name].tsx`
2. **Implement Logic**: Complex business logic and feature implementation
3. **Export Default**: Use default export for the main component

## 🎨 **Tailwind CSS & shadcn/ui Integration**

### **Theme Configuration**
- **Base Color**: Neutral (already configured)
- **Style**: New York (clean, minimal)
- **CSS Variables**: Enabled for easy theming
- **Target Yellow Theme**: Will be configured with shadcn yellow accent

### **Current Color System**
```typescript
// Usage in components
className="bg-background text-foreground"
className="bg-card text-card-foreground"
className="bg-primary text-primary-foreground"
```

### **Utility Integration**
```typescript
import { cn } from '@/lib/utils'

// Combining classes safely
className={cn(
  "bg-background border rounded-lg",
  isActive && "bg-primary text-primary-foreground",
  className
)}
```

## **🧪 Testing with Playwright**

### **Configuration**
- **Target URL**: `http://localhost:3000` (Next.js default)
- **Browser**: Chrome-only for performance
- **Test Location**: `/tests` directory

### **Development Commands**
```bash
# Install Playwright browsers
npx playwright install chrome

# Start Next.js app
npm run dev

# Run tests
npm run test
```

### **Test Structure**
```
tests/
├── components/              # Component-specific tests
├── pages/                   # Page-specific tests
└── screenshots/             # Test screenshots
```

## **Port Management (localhost:3000)**

**IMPORTANT**: Always use port 3000 for Next.js development consistency.

### **When Port 3000 is in Use:**

```bash
# Kill processes on common dev ports
npx kill-port 3000 3001 8080 8081

# Start fresh Next.js dev server
npm run dev
```

### **Testing Configuration**
- Playwright tests configured for `http://localhost:3000`
- Always ensure test configuration uses correct port
- Never change to alternative ports unless absolutely necessary

## **🤖 Gemini AI Integration**

- **API Route**: `/api/gemini-chat` (POST) - sends `{ message: string }`, returns `{ response: string, success: boolean }`
- **Component**: `@/components/modules/gemini-chat` - Simple test button on homepage
- **Environment**: Requires `GOOGLE_GENERATIVE_AI_API_KEY` in `.env.local`
- **Response**: Displays in browser console + alert notification, tested in `tests/gemini-chat.spec.ts`

## **Development Rules**

### **✅ DO:**
- Keep `app/*/page.tsx` files minimal (single import only)
- Mirror `app/` structure exactly in `components/PAGE/`
- Use direct UI component imports: `@/components/ui/button`
- Use module components for complex features: `@/components/modules/image-card`
- Follow 7-tier import order consistently
- Use shadcn/ui components as base for UI consistency
- Test features at `http://localhost:3000`
- Use TypeScript strictly with proper types

### **❌ DON'T:**
- Put business logic directly in `app/*/page.tsx` files
- Use relative imports (always use path aliases)
- Skip the PAGE component structure
- Mix UI and Module component purposes
- Ignore TypeScript errors
- Skip testing protocol
- Hardcode values that should be configurable

### **📱 Mobile-First Development**
- Use Tailwind responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`
- Test components on different screen sizes
- Ensure touch-friendly interactive elements

## **Quick Reference**

**Essential Workflow:**
1. Read CLAUDE.md + package.json
2. `npm run dev` (ensure port 3000)
3. Test at `http://localhost:3000`
4. Monitor terminal + browser console
5. Validate no crashes/errors
6. `npm run lint`

**Success Checklist:**
- [ ] App starts on port 3000 without errors
- [ ] Feature works in browser
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] PAGE component structure followed
- [ ] Import order standards followed
- [ ] Responsive design tested