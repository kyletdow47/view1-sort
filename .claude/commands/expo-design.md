---
description: Expo and React Native UI design best practices for native mobile apps. Use when building mobile UI or planning native app features.
---

# Expo App Design Skill

You are an expert in Expo and React Native UI for building native mobile experiences.

## Project Setup
- Use Expo SDK 52+ with Expo Router for file-based navigation
- Use `npx create-expo-app` with the latest template
- Prefer Expo managed workflow — only eject if you need a native module unavailable in Expo

## Navigation (Expo Router)
```
app/
├── _layout.tsx          # Root layout (Stack or Tabs)
├── (tabs)/
│   ├── _layout.tsx      # Tab navigator
│   ├── index.tsx        # Home tab
│   ├── gallery.tsx      # Gallery tab
│   └── settings.tsx     # Settings tab
├── gallery/[id].tsx     # Dynamic route
└── modal.tsx            # Modal route
```
- Use `<Stack>` for hierarchical navigation, `<Tabs>` for top-level sections
- Max 5 tabs — use "More" tab if needed
- Deep link support: define `scheme` in `app.json`

## Styling
- Use `StyleSheet.create()` for type-safe, optimized styles
- Or use NativeWind (Tailwind for React Native) for utility-first approach
- Platform-specific styles: `Platform.select({ ios: {}, android: {} })`
- Avoid inline styles in render — extract to StyleSheet
- Use `useColorScheme()` for dark mode support

## Components
- Use `<Pressable>` over `<TouchableOpacity>` (newer, more flexible)
- `<FlatList>` for long lists — never map arrays in ScrollView for dynamic content
- `<Image>` with `expo-image` for caching and progressive loading
- `<SafeAreaView>` or `useSafeAreaInsets()` for notch/status bar handling
- `<KeyboardAvoidingView>` for forms — `behavior="padding"` on iOS

## Layout Rules
- Use Flexbox (default in RN) — `flexDirection: 'column'` is default (not row)
- Standard spacing: 4, 8, 12, 16, 24, 32 (same as web, but in density-independent pixels)
- Touch targets: minimum 44x44 points (Apple HIG) / 48x48 dp (Material)
- Bottom nav bar: 49pt (iOS) / 56dp (Android)
- Status bar height: use `Constants.statusBarHeight` from `expo-constants`

## Typography
- Use system fonts by default — or load custom fonts with `expo-font`
- iOS: SF Pro (system). Android: Roboto (system)
- Scale text sizes: caption(12), body(14-16), subtitle(18), title(22-28), hero(32+)
- Line height: ~1.4-1.5x font size for body text
- Never use fixed widths for text containers — let text wrap

## Gestures & Animation
- Use `react-native-gesture-handler` for complex gestures (swipe, pinch, pan)
- Use `react-native-reanimated` for 60fps animations on the UI thread
- Shared Element Transitions: `react-native-reanimated` layout animations
- Spring animations feel more natural than duration-based for most UI
```ts
import Animated, { useSharedValue, withSpring } from 'react-native-reanimated';

const scale = useSharedValue(1);
scale.value = withSpring(1.1, { damping: 15, stiffness: 150 });
```

## Platform Conventions
**iOS:**
- Large titles in navigation headers
- Swipe-back gesture for navigation
- Haptic feedback on important actions (`expo-haptics`)
- Bottom sheets for options (not alert dialogs)

**Android:**
- Material You / Material 3 design language
- FAB (Floating Action Button) for primary action
- Back button in header left
- Bottom sheets and snackbars for feedback

## Performance
- Use `expo-image` instead of `<Image>` for caching and blur placeholders
- `FlatList` with `getItemLayout` for fixed-height items (skip measurement)
- Avoid re-renders: `React.memo`, `useCallback`, extract list items to components
- Offload heavy work to `expo-task-manager` or web workers
- Use `hermes` engine (enabled by default in Expo SDK 50+)

## Testing
- Unit: Jest + React Native Testing Library
- E2E: Detox or Maestro
- Test on both iOS simulator and Android emulator
- Test with different text sizes (accessibility settings)

## Checklist
1. Safe area insets handled on all screens
2. Keyboard avoidance on all form screens
3. Dark mode support with `useColorScheme()`
4. Touch targets >= 44pt
5. FlatList for any dynamic list > 20 items
6. Loading states for async data
7. Error states with retry actions
8. Offline handling (show cached data or offline message)
