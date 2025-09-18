# My Expo App - CLAUDE.md

## Project Overview
React Native Expo app with **Reanimated 4.1.0**, **@gorhom/bottom-sheet**, **Expo Router**, and **NativeWind**. Professional component architecture with path aliases.

## Key Dependencies
- **Expo SDK**: 54.0.2 | **React Native**: 0.81.4
- **React Native Reanimated**: 4.1.0 | **@gorhom/bottom-sheet**: 5.2.6
- **Expo Router** | **NativeWind** | **babel-plugin-module-resolver**: 5.0.2

## State Management

**Overview**: Dream Pie uses **Zustand** for global state with domain-specific stores, plus **React useState** for local component state.

**Architecture**:
- **Zustand Stores**: Global state via `useAppStores()` hook - navigationStore for BottomSheet refs
- **Local State**: Components use `useState` for UI-specific state
- **Mock Data**: Static data imported from `@/mockData` directory
- **Type Safety**: Full TypeScript integration with Dream Pie types

**Zustand BottomSheet Control Pattern**:
```typescript
// Register BottomSheet refs globally for cross-component control
import { useAppStores } from '@/stores'

export const useBottomSheets = () => {
  const { navigation } = useAppStores()
  const poseLibraryRef = useRef<BottomSheetLib>(null)

  // Register ref with Zustand on mount
  useEffect(() => {
    navigation.setPoseLibraryRef(poseLibraryRef)
  }, [])

  // Control via Zustand refs from anywhere
  const handleClose = () => {
    navigation.poseLibraryRef?.current?.close()
  }

  return { poseLibraryRef, handleClose }
}
```

**Benefits**:
- **Global Control**: Any component can control BottomSheets via Zustand refs
- **Type Safety**: Full TypeScript support with proper ref types
- **Clean Architecture**: Centralized ref management
- **Predictable**: Clear separation between global (Zustand) and local (useState) state

**See**: `_ZUSTAND.md` for complete store architecture documentation


## Path Alias System

| Alias | Path | Usage |
|-------|------|--------|
| `@` | `./` (root) | Root directory access |
| `@/components` | `./components` | All components |
| `@/components/ui` | `./components/ui` | UI component library |
| `@/components/PAGE` | `./components/PAGE` | Page components |
| `@/assets` | `./assets` | Static assets |
| `@/app` | `./app` | App directory |
| `@/types` | `./types` | TypeScript interfaces |
| `@/mockData` | `./mockData` | Mock data files |

**Usage:**
```typescript
// ✅ CRITICAL: "index" folder needs explicit /index
import IndexPage from '@/components/PAGE/index/index';

// ✅ Other folders auto-resolve
import ExplorePage from '@/components/PAGE/explore';

// ❌ FAILS: Metro can't resolve this
import IndexPage from '@/components/PAGE/index';

// ✅ Direct component imports - No index files needed
import Button from '@/components/ui/Button/Button';
import Card from '@/components/ui/Card/Card';
import { User, Post } from '@/types';
import { mockUsers } from '@/mockData';
```

**Configured in:** `babel.config.js`, `metro.config.js`, `tsconfig.json`

## Code Style

**Prettier Configuration:** `prettier.config.js` - No semicolons (`semi: false`)
- `npm run format` - Auto-format code without semicolons
- `npm run lint` - Check formatting and code quality

**🚨 CRITICAL RULE:** "index" folder needs explicit `/index` filename:
```typescript
// ✅ WORKS: Metro can't auto-resolve "index" folder
import IndexPage from '@/components/PAGE/index/index';

// ❌ FAILS: Metro bundler issue
import IndexPage from '@/components/PAGE/index';
```

**🛠️ Troubleshooting:**
```bash
# Clear cache and restart
npm start -- --reset-cache --clear

# Check TypeScript
npx tsc --noEmit
```

## Import Order Standards (React 19+)

**🚨 CRITICAL:** No React import needed since React 19+. Follow this exact order:

```typescript
// 1. React Native Core & Expo
import { View, Text, StyleSheet } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'

// 2. Third-party libraries (node_modules dependencies)
import Animated from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'

// 3. PAGE components (other pages)
import PoseLibraryContent from '@/components/PAGE/pose-library'
import ExplorePage from '@/components/PAGE/explore'

// 4. Same tree components (local to current page)
import { Top } from './components/Top'
import { Bottom } from './components/Bottom/Bottom'

// 5. UI components (@/components/ui)
import PageHeader from '@/components/ui/PageHeader/PageHeader'
import Button from '@/components/ui/Button/Button'

// 6. Hooks
import { useBottomSheets } from './hooks/useBottomSheets'
import { useAnimationControls } from '@/hooks'

// 7. Constants, Types, Mock Data
import { ICON_FAMILY_NAME } from '@/components/ui/icons/constants'
import { User } from '@/types'
import { mockUsers } from '@/mockData'
```

**Import Order Rules:**
- **NO React import** required (React 19+ automatic)
- **Group related imports** with descriptive comments
- **Use path aliases** consistently (@/components, @/types, etc.)
- **Maintain separation** between each tier with blank lines

### 🚀 **React Native Reanimated 4.x Gesture API**

**IMPORTANT**: This project uses **Reanimated 4.1.0** which requires the **new Gesture API**. The old `useAnimatedGestureHandler` API has been **removed** and will cause crashes.

#### **✅ Correct Gesture Implementation (Reanimated 4.x)**
```typescript
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  runOnJS 
} from 'react-native-reanimated';

const gesture = Gesture.Pan()
  .onStart(() => {
    scale.value = withSpring(1.05);
  })
  .onUpdate((event) => {
    translateX.value = event.translationX;
  })
  .onEnd(() => {
    scale.value = withSpring(1);
    translateX.value = withSpring(0);
    if (onPress) {
      runOnJS(onPress)();
    }
  });

return <GestureDetector gesture={gesture}>{content}</GestureDetector>;
```

#### **🎯 Gesture Types and Methods**
```typescript
// Pan Gesture - Touch and drag interactions
const panGesture = Gesture.Pan()
  .onStart(() => {})      // Gesture begins
  .onUpdate((event) => {}) // Active dragging (replaces onActive)
  .onEnd(() => {});       // Gesture ends

// Tap Gesture - Single touch interactions  
const tapGesture = Gesture.Tap()
  .onStart(() => {})
  .onEnd(() => {});

// Long Press Gesture - Extended touch
const longPressGesture = Gesture.LongPress()
  .minDuration(500)
  .onStart(() => {})
  .onEnd(() => {});

// Combined Gestures
const combinedGesture = Gesture.Race(panGesture, tapGesture);
```

#### **🔧 Migration Guide: Old API → New API**
```typescript
// OLD (Reanimated 2.x/3.x) ❌
useAnimatedGestureHandler({
  onStart: () => {},
  onActive: (event) => {},  // ❌ onActive removed
  onEnd: () => {}
});

// NEW (Reanimated 4.x) ✅
Gesture.Pan()
  .onStart(() => {})
  .onUpdate((event) => {})  // ✅ onUpdate replaces onActive
  .onEnd(() => {});
```

#### **❌ Deprecated Implementation (Will Crash)**
```typescript
// DON'T USE - This will cause TypeError in Reanimated 4.x
import { useAnimatedGestureHandler } from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';

const gestureHandler = useAnimatedGestureHandler({
  onStart: () => { /* ... */ },
  onActive: (event) => { /* ... */ },
  onEnd: () => { /* ... */ },
});

return <PanGestureHandler onGestureEvent={gestureHandler}>{content}</PanGestureHandler>;
```

#### **📝 Real Implementation Example: Interactive Card**
```typescript
// components/ui/Card/Card.tsx - Production Implementation
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

export const Card = ({ interactive = false, onPress, children }) => {
  const scale = useSharedValue(1);
  const rotateY = useSharedValue(0);
  const translateX = useSharedValue(0);

  // ✅ New Gesture API Implementation
  const gesture = Gesture.Pan()
    .onStart(() => {
      if (interactive) {
        scale.value = withSpring(1.05);
      }
    })
    .onUpdate((event) => {
      if (interactive) {
        translateX.value = event.translationX * 0.1;
        rotateY.value = interpolate(event.translationX, [-100, 100], [-5, 5]);
      }
    })
    .onEnd(() => {
      if (interactive) {
        scale.value = withSpring(1);
        translateX.value = withSpring(0);
        rotateY.value = withSpring(0);
        if (onPress) {
          runOnJS(onPress)();
        }
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { rotateY: `${rotateY.value}deg` },
    ],
  }));

  const content = (
    <Animated.View style={interactive ? animatedStyle : undefined}>
      {children}
    </Animated.View>
  );

  return interactive ? (
    <GestureDetector gesture={gesture}>{content}</GestureDetector>
  ) : (
    content
  );
};
```

### 🖼️ **expo-image Best Practices**

**CRITICAL**: Use `useImage()` hook to prevent Android crashes with rapid image loading changes.

#### **✅ Correct expo-image Implementation**
```typescript
import { Image, useImage } from 'expo-image'

export default function MyComponent({ imageSource }) {
  const image = useImage(imageSource)  // Manages loading safely

  return (
    {image && <Image source={image} style={{...}} contentFit="cover" />}
  )
}
```

#### **❌ Dangerous Implementation (Causes Android Crashes)**
```typescript
// DON'T USE - Rapid source changes crash Android
<Image source={pose.imageUrl} style={{...}} contentFit="cover" />
```

#### **Why useImage() Prevents Crashes**
- **Race Condition Prevention**: Manages image loading pipeline internally
- **Memory Safety**: Auto-cleanup on component unmount
- **Android Stability**: Handles rapid prop changes without resource conflicts
- **Loading State**: Returns `null` until image fully loaded

**Rule**: Always use `useImage()` when image sources change frequently (selections, carousels, rapid UI updates).

## 🗂️ **Professional Folder Structure**

### **Complete App Structure**
```
my-expo-app/
├── app/                           # 📱 Expo Router - App Directory
│   ├── _layout.tsx                # Root layout with providers
│   ├── (tabs)/                    # Tab group routing
│   │   ├── _layout.tsx            # Tab navigation layout
│   │   ├── index.tsx              # 🔄 Imports from components/PAGE/index
│   │   └── explore.tsx            # 🔄 Imports from components/PAGE/explore
│   └── modal.tsx                  # Modal screen
│
├── components/                    # 🏗️ Component Architecture
│   ├── ui/                        # 🎨 Reusable UI Components
│   │   ├── Button/
│   │   │   └── Button.tsx         # Component implementation with default export
│   │   ├── Card/
│   │   │   └── Card.tsx           # Component implementation with default export
│   │   ├── AnimatedBox/
│   │   │   └── AnimatedBox.tsx    # Component implementation with default export
│   │   └── BottomSheet/
│   │       └── BottomSheet.tsx    # Component implementation with default export
│   │
│   └── PAGE/                      # 🎯 Page Components (Mirror Routing Structure)
│       ├── index/                 # Corresponds to app/(tabs)/index.tsx
│       │   ├── index.tsx          # Main page component
│       │   ├── components/        # Page-specific sub-components
│       │   │   └── index.tsx      # AnimationControls, FeatureList
│       │   ├── hooks.ts           # Page-specific custom hooks
│       │   └── types.ts           # Page-specific TypeScript interfaces
│       │
│       └── explore/               # Corresponds to app/(tabs)/explore.tsx
│           ├── index.tsx          # Main page component
│           ├── components/        # Page-specific sub-components
│           │   └── index.tsx      # InteractiveStar, FeatureShowcase
│           ├── hooks.ts           # Page-specific custom hooks
│           └── types.ts           # Page-specific TypeScript interfaces
│
├── shared/                        # 🔧 Shared utilities
│   └── constants/                 # App constants
├── hooks/                         # 🪝 Global custom hooks
├── assets/                        # 🖼️ Static assets
├── global.css                     # 🎨 Global styles
└── package.json                   # 📦 Dependencies
```

## 📋 **Developer Guidelines**

### **🔑 Core Architecture Principles**

#### **1. Single Responsibility Pattern**
- **Rule**: Each `app/` route file should contain **ONLY ONE COMPONENT IMPORT**
- **Pattern**: `app/(tabs)/[route].tsx` → `import PageComponent from '@/components/PAGE/[route]/index'`

**✅ Correct Example:**
```typescript
// app/(tabs)/index.tsx
import IndexPage from '@/components/PAGE/index/index';

export default function IndexScreen() {
  return <IndexPage />;
}
```

**❌ Incorrect Example:**
```typescript
// app/(tabs)/index.tsx - DON'T DO THIS
import { View, Text } from 'react-native';
// ... lots of component logic here
```

#### **2. Mirror Routing Structure in components/PAGE/**
- **Rule**: `components/PAGE/` folder structure must **exactly mirror** the `app/` routing structure
- **Purpose**: Makes navigation and component organization predictable

**Routing Structure Mapping:**
```
app/(tabs)/index.tsx        →  components/PAGE/index/
app/(tabs)/explore.tsx      →  components/PAGE/explore/
app/(tabs)/profile.tsx      →  components/PAGE/profile/
app/modal.tsx              →  components/PAGE/modal/
app/[id].tsx               →  components/PAGE/[id]/
```

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
// components/PAGE/index/index.tsx
import { View } from 'react-native';
import { useAnimationControls } from './hooks';
import { AnimationControls } from './components';
import { IndexPageProps } from './types';

export default function IndexPage({ className = '' }: IndexPageProps) {
  const animations = useAnimationControls();

  return (
    <View className={`flex-1 ${className}`}>
      <AnimationControls animations={animations} />
    </View>
  );
}
```

#### **4. UI Component Organization**
- **Location**: `components/ui/`
- **Structure**: Each component in its own folder with TypeScript file and default export
- **Purpose**: Reusable components shared across multiple pages

```
components/ui/
├── Button/
│   └── Button.tsx         # Component implementation with default export
├── Card/
│   └── Card.tsx           # Component implementation with default export
├── AnimatedBox/
│   └── AnimatedBox.tsx    # Component implementation with default export
└── BottomSheet/
    └── BottomSheet.tsx    # Component implementation with default export
```

### **🚀 Expo Router Best Practices**

#### **File-Based Routing Rules**
1. **Route Files**: Place in `app/` directory
2. **Layouts**: Use `_layout.tsx` for nested layouts
3. **Route Groups**: Use `(groupName)/` for organization without affecting URL
4. **Dynamic Routes**: Use `[param].tsx` for dynamic segments
5. **Import Pattern**: Always import from corresponding `components/PAGE/` directory

#### **Navigation Flow**
```
User Request → app/[route].tsx → components/PAGE/[route]/index.tsx → Render UI
```

#### **Example Route Structure**
```typescript
// app/(tabs)/_layout.tsx - Tab Layout
export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="explore" options={{ title: 'Explore' }} />
    </Tabs>
  );
}

// app/(tabs)/index.tsx - Home Route
import IndexPage from '@/components/PAGE/index/index';
export default function IndexScreen() {
  return <IndexPage />;
}
```

### **📚 Component Development Workflow**

#### **Creating New Pages**
1. **Create Route**: Add file in `app/` directory
2. **Create Page Structure**: Create matching directory in `components/PAGE/`
3. **Implement Component**: Build page in `components/PAGE/[name]/index.tsx`
4. **Add Supporting Files**: Create `hooks.ts`, `types.ts`, `components/index.tsx`
5. **Import in Route**: Single import in `app/` route file

#### **Creating New UI Components**
1. **Create Folder**: `components/ui/[ComponentName]/`
2. **Create Component File**: `[ComponentName].tsx` with default export
3. **No index files needed** - Import directly from component file

## 📊 **Mock Data Architecture**

### **🏗️ Folder Structure**

This project implements a comprehensive, well-typed mock data system that follows TypeScript best practices and clear data lifecycle documentation.

```
my-expo-app/
├── types/                     # TypeScript interfaces
│   ├── users/
│   │   ├── user.ts           # User interface and related types
│   │   ├── userActivity.ts   # User activity tracking types
│   │   └── index.ts          # Export all user types
│   ├── content/
│   │   ├── post.ts           # Social media post types
│   │   ├── comment.ts        # Comment types
│   │   └── index.ts          # Export all content types
│   └── index.ts              # Main type exports
│
├── mockData/                  # Mock data (mirrors types structure)
│   ├── users/
│   │   ├── users.ts          # User mock data with lifecycle comments
│   │   ├── userActivity.ts   # User activity mock data
│   │   └── index.ts          # Export all user mock data
│   ├── content/
│   │   ├── posts.ts          # Social media posts mock data
│   │   ├── comments.ts       # Comments mock data
│   │   └── index.ts          # Export all content mock data
│   └── index.ts              # Main mock data exports
```

### **🎯 Data Lifecycle Documentation**

Every mock data file includes a mandatory header documenting the complete data lifecycle:

```typescript
/**
 * MOCK DATA LIFECYCLE - [Data Model Name]
 *
 * WHEN CREATED: [Description of when this data is generated]
 * WHERE CREATED: [Component/service that creates this data]
 *
 * WHEN USED: [Description of when this data is consumed]
 * WHERE USED: [Components/pages that use this data]
 *
 * HOW DATA EVOLVES:
 * - CREATE: [How new items are added]
 * - READ: [How data is fetched/displayed]
 * - UPDATE: [How data is modified]
 * - DELETE: [How data is removed]
 *
 * RELATIONSHIPS: [Data dependencies and connections]
 */
```

### **🔗 Path Aliases for Mock Data**

The project includes dedicated path aliases for the mock data system:

| Alias | Path | Usage |
|-------|------|--------|
| `@/types` | `./types` | TypeScript interfaces |
| `@/mockData` | `./mockData` | Mock data files |

**Note:** Import examples follow the standardized Import Order Standards (see above).

### **📝 Mock Data Guidelines for AI Agents**

#### **When to Create Mock Data**
- **User Request**: When user explicitly asks for mock data
- **Testing Features**: When implementing/testing functionality that requires data
- **Demo Purposes**: When showcasing app features
- **Development**: When components need sample data for development

#### **How to Create Mock Data**
1. **Create Types First**: Always define TypeScript interfaces in `types/` before creating mock data
2. **Follow Structure**: Mirror the exact folder structure between `types/` and `mockData/`
3. **Add Lifecycle Comments**: Include the mandatory lifecycle documentation header
4. **Use Helper Functions**: Create utility functions for data access (getById, filter, etc.)
5. **Keep It Simple**: Avoid overly complex data structures unless specifically requested

#### **Mock Data Creation Checklist**
- [ ] TypeScript interface defined in `types/`
- [ ] Mock data file created in corresponding `mockData/` folder
- [ ] Lifecycle documentation header included
- [ ] Data relationships documented
- [ ] Helper functions provided (if applicable)
- [ ] Export statements added to index files
- [ ] Path aliases used correctly

#### **Example Implementation Pattern**

**1. Define Types:**
```typescript
// types/users/user.ts
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
}
```

**2. Create Mock Data:**
```typescript
// mockData/users/users.ts
/**
 * MOCK DATA LIFECYCLE - Users
 * [Complete lifecycle documentation]
 */

import { User } from '@/types/users';

export const mockUsers: User[] = [
  // Simple, realistic data
];

export const getUserById = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id);
};
```

**3. Use in Components:**
```typescript
// Component usage
import { mockUsers } from '@/mockData';
// Use mockUsers in component
```

### **🚨 Important Rules**

#### **✅ DO:**
- Keep mock data simple and focused on the task at hand
- Include lifecycle documentation headers
- Follow the established folder structure exactly
- Create helper functions for common operations
- Use TypeScript interfaces consistently
- Document data relationships clearly

#### **❌ DON'T:**
- Create overly complex mock data structures
- Skip lifecycle documentation
- Mix different data models in the same file
- Ignore the folder structure patterns
- Create mock data without corresponding types
- Use relative imports (always use path aliases)

## Colors

**Files:** `shared/theme/colors.ts` + `tailwind.config.js` (sync both)

**DO:**
- `import { brandColors } from '@/shared/theme'`
- `className="bg-background text-textPrimary"`

**DON'T:**
- Hardcode hex values
- Use `#FFFFFF` → use `brandColors.card`
- Use `#000000` → use `brandColors.textPrimary`

*See `shared/theme/colors.ts` or `tailwind.config.js` for all available colors*

## Current Features

### **Home Tab (`components/PAGE/index/`)**
- **Advanced Animations**: 10 animation types (scale, rotate, bounce, shake, fade, color, spin, slide, flip, pulse)
- **Bottom Sheet**: Multi-snap point modal (25%, 50%, 90%) with gesture handling displaying typed mock data
- **Mock Data Display**: Users and posts with proper TypeScript typing
- **Reusable Components**: Uses `Button` and `Card` from UI library
- **Custom Hooks**: `useAnimationControls` for animation management

### **Explore Tab (`components/PAGE/explore/`)**
- **Interactive Cards**: Tap-to-expand feature showcase cards
- **Animated Star**: Interactive star with counter and reset functionality
- **Feature Documentation**: Detailed information about app capabilities
- **User Journey**: Step-by-step app navigation guide

### **UI Component Library (`components/ui/`)**
- **Button**: 6 variants (primary, secondary, success, warning, danger, info) with animations
- **Card**: Interactive cards with gesture support and variant styling
- **AnimatedBox**: Versatile animated container with multiple animation types
- **BottomSheet**: Reusable wrapper for @gorhom/bottom-sheet with predefined settings
- **Icon**: Professional icon system with 15+ icon families (Feather, MaterialIcons, FontAwesome, etc.)
- **PageHeader**: Standard header component with title and optional right icon for navigation

### **PageHeader Usage (`components/ui/PageHeader/`)**

**🚨 MANDATORY**: Always use `PageHeader` component instead of built-in navigation headers. Never use `headerShown: true` in Expo Router configurations.

**Standard Implementation**:
```typescript
import PageHeader from '@/components/ui/PageHeader/PageHeader'
import { ICON_FAMILY_NAME } from '@/components/ui/Icon/Icon'
import { router } from 'expo-router'

// In page component
const handleSettingsPress = () => {
  router.push('/settings')
}

<PageHeader
  title="Page Title"
  rightIcon={{
    name: 'settings',
    family: ICON_FAMILY_NAME.Feather,
    onPress: handleSettingsPress,
  }}
/>
```

**Rules**:
- Always set `headerShown: false` in Expo Router layouts
- Include `PageHeader` at the top of each page component
- Use consistent Settings icon placement across all tab screens

### **BottomSheet Component (`components/ui/BottomSheet/`)**

**🚨 MANDATORY**: When implementing new BottomSheets, **ALWAYS** consult `_BOTTOM_SHEET_INSTRUCTION.md` for complete usage patterns, modal vs regular sheet selection, and proper configuration.

**Overview**: Professional wrapper for @gorhom/bottom-sheet with dual-mode support (regular/modal), configurable scroll behavior, and comprehensive TypeScript integration.

**Key Modes**:
- **Regular BottomSheet**: Persistent UI elements (pose library, mini player, quick actions)
- **Modal BottomSheet**: Full overlays (paywalls, forms, detail views, confirmation dialogs)

**Essential Props**:
- `isModal?: boolean` (default: false) - Toggle between regular/modal modes
- `scrollView?: boolean` (default: true) - ScrollView vs View container
- `snapPoints?: string[]` (default: ['50%', '90%']) - Height percentages
- `index?: number` (default: 0) - Initial snap point
- `enablePanDownToClose?: boolean` (default: true) - Pan gesture to close

**Import Pattern**:
```typescript
import BottomSheet from '@/components/ui/BottomSheet/BottomSheet'
import BottomSheetLib, { BottomSheetModal } from '@gorhom/bottom-sheet'

// Refs for different modes
const sheetRef = useRef<BottomSheetLib>(null)        // Regular
const modalRef = useRef<BottomSheetModal>(null)      // Modal
```

**Quick Usage Examples**:
```typescript
// Regular BottomSheet (persistent)
<BottomSheet
  ref={sheetRef}
  isModal={false}
  snapPoints={['30%', '60%', '95%']}
  index={1}>
  <YourContent />
</BottomSheet>

// Modal BottomSheet (overlay)
<BottomSheet
  ref={modalRef}
  isModal={true}
  scrollView={true}>
  <YourModalContent />
</BottomSheet>
```

**Control Methods**:
```typescript
// Regular Sheet
sheetRef.current?.expand()        // Go to highest snap point
sheetRef.current?.collapse()      // Go to lowest snap point
sheetRef.current?.close()         // Hide completely

// Modal Sheet
modalRef.current?.present()       // Show modal
modalRef.current?.dismiss()       // Hide modal
```

**📚 Detailed Documentation**: See `_BOTTOM_SHEET_INSTRUCTION.md` for:
- Complete prop reference and usage patterns
- When to use Regular vs Modal modes
- ScrollView vs View configuration guide
- Real implementation examples from the codebase
- Advanced customization and troubleshooting

### **Icon Component (`components/ui/icons/`)**

**Overview**: Professional icon system with 15+ icon families from @expo/vector-icons with full TypeScript support.

**Import Pattern**:
```typescript
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import { ICON_FAMILY_NAME } from '@/components/ui/Icon/Icon';
```

**Basic Usage**:
```typescript
// Static icon
<Icon
  family={ICON_FAMILY_NAME.Feather}
  name="home"
  size={24}
  color="white"
/>

// Interactive icon button
<IconButton
  family={ICON_FAMILY_NAME.Ionicons}
  name="heart"
  onPress={() => console.log('Pressed')}
  color="red"
/>
```

**Available Families**: Feather, MaterialIcons, FontAwesome5/6, AntDesign, Ionicons, Entypo, and more. See [icons.expo.fyi](https://icons.expo.fyi) for all available icons.

## **Port Management (localhost:8081)**

**IMPORTANT**: Always use port 8081 for development and testing consistency.

### **When Port 8081 is in Use:**

### **Method 1: Kill All Ports (Recommended)**

```bash
# Kill all processes on ports 8081-8087
npx kill-port 8081 8083 8084 8085 8086 8087

# Then start fresh on default port 8081
npm start -- --reset-cache
```

### **Method 2: Check What's Using the Port**

```bash
# Check which processes are using port 808x
netstat -ano | findstr :808

# Kill specific process by PID if needed
# Note: Replace XXXX with actual PID from netstat output
```

### **Method 3: Alternative Port Check**

```bash
# Check if port 8081 specifically is free
netstat -ano | findstr :8081
```

### **Testing Configuration**

- Playwright tests are configured for `http://localhost:8081`
- Always ensure `playwright.config.ts` uses `baseURL: "http://localhost:8081"`
- Never change to alternative ports unless absolutely necessary

### **Common Issues**

- Multiple background bash processes can leave ports occupied
- Use `npx kill-port` to clean up all development ports at once
- Always start fresh with `npm start -- --reset-cache` after cleaning ports

## AI Agent Development Protocol

**MANDATORY 6-Step Workflow:**

1. **📋 Read Configuration:** CLAUDE.md + package.json
2. **🛠️ Clean Environment:**
   ```bash
   npx kill-port 8081 8083 8084 8085 8086 8087
   npm start -- --reset-cache
   ```
3. **🔍 Test Manually:** Visit `http://localhost:8081`, verify functionality
4. **📊 Monitor Logs:** Watch terminal + browser console for errors
5. **✅ Validation Checklist:**
   - [ ] App starts on port 8081 without errors
   - [ ] Feature works as intended
   - [ ] No console errors
   - [ ] No regressions
6. **🔧 Quality Check:**
   ```bash
   npm run lint
   npm run format
   ```

**Common Issues:**
- Port conflicts: Use `npx kill-port` command above
- Gesture errors: Use new `Gesture.Pan()` API, not `useAnimatedGestureHandler`
- Import errors: Check path aliases, clear Metro cache

**Testing & Quality:**
```bash
npm run test          # Run tests
npm run lint          # Check code quality
npm run format        # Fix formatting
```

**Platform:**
```bash
npm run android       # Android
npm run ios          # iOS
npm run web          # Web browser
```

## Development Rules

### **UI Component Rules:**
- **No index.tsx files** in `components/ui/` folders
- **Direct imports** from component files: `@/components/ui/Button/Button`
- **Default exports** required in all UI component files
- Component file name must match folder name

### **Page Component Rules (UNCHANGED):**
- Each `app/` route file contains **ONLY ONE COMPONENT IMPORT**
- Pattern: `app/(tabs)/[route].tsx` → `import PageComponent from '@/components/PAGE/[route]/index'`
- `components/PAGE/` folder structure must **exactly mirror** the `app/` routing structure
- **Critical**: Index folder needs explicit `/index` in import path

**✅ DO:**
- Keep `app/` routes minimal (single import only)
- Mirror `app/` structure exactly in `components/PAGE/`
- Use direct UI component imports: `@/components/ui/Button/Button`
- **CRITICAL:** Index folder needs explicit path: `@/components/PAGE/index/index`
- Use `Gesture.Pan()` + `GestureDetector` (Reanimated 4.x)
- Use `onUpdate()` instead of `onActive()`
- Import gestures from `react-native-gesture-handler`
- Follow 6-step AI Agent Development Protocol
- Test all features manually at `http://localhost:8081`
- Use theme colors: `import { brandColors } from '@/shared/theme'`
- Sync both `shared/theme/colors.ts` & `tailwind.config.js`

**❌ DON'T:**
- Put business logic in `app/` route files
- Use relative imports
- **NEVER:** Use index files for UI components (old pattern)
- **NEVER:** `@/components/PAGE/index` (fails Metro resolution)
- **NEVER:** `useAnimatedGestureHandler` (removed in 4.x)
- **NEVER:** Import gestures from `react-native-reanimated`
- Skip testing protocol
- Ignore console errors
- Hardcode color hex values
- Use `#FFFFFF` (use `brandColors.card`)
- Use `#000000` for text (use `brandColors.textPrimary`)

### **Import Standards:**
- **NO React import** required (React 19+ automatic)
- **Follow 7-tier import order** (see Import Order Standards)
- **Use path aliases consistently**
- **Group related imports with comments**
- **Direct component imports:** `@/components/ui/Button/Button`
- **Critical:** Index folder needs explicit `/index` path


## Quick Reference

**Essential Workflow:**
1. Read CLAUDE.md + package.json
2. `npx kill-port 8081 8083 8084 8085 8086 8087 && npm start -- --reset-cache`
3. Test at `http://localhost:8081`
4. Monitor terminal + browser console
5. Validate no crashes/errors
6. `npm run lint && npm run format`

**Success Checklist:**
- [ ] App starts on port 8081 without errors
- [ ] Feature works in browser
- [ ] No console errors
- [ ] No regressions
- [ ] Code passes linting
- [ ] Architecture patterns followed
- [ ] Theme colors used (no hardcoded hex)
- [ ] Testing verification completed