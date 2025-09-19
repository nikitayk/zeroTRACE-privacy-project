# 🎨 Domain Selector Interface

A beautiful, modern, and responsive domain selection interface for the zeroTrace AI adaptive learning system. This component provides an engaging user experience with smooth animations, progress tracking, and mobile-responsive design.

## ✨ Features

### 🎯 **Visual Design**
- **Gradient Cards**: Each domain has a unique gradient background with hover effects
- **Animated Icons**: Custom SVG icons for each learning domain
- **Progress Indicators**: Real-time progress bars with color-coded feedback
- **Streak Tracking**: Visual indicators for study streaks with star icons
- **Background Patterns**: Subtle geometric patterns for visual depth

### 🎭 **Animations & Interactions**
- **Framer Motion**: Smooth entrance animations with staggered card reveals
- **Hover Effects**: Scale and shadow transitions on card hover
- **Loading States**: Animated loading spinners and progress indicators
- **Selection Feedback**: Visual feedback when domains are selected
- **Responsive Transitions**: Smooth animations across all screen sizes

### 📱 **Mobile Responsive**
- **Grid Layout**: Responsive grid that adapts from 1 column (mobile) to 2 columns (desktop)
- **Touch Friendly**: Optimized touch targets and interactions
- **Flexible Spacing**: Adaptive padding and margins for different screen sizes
- **Readable Typography**: Scalable text that remains readable on all devices

### 📊 **Progress Tracking**
- **Visual Progress Bars**: Animated progress bars with percentage indicators
- **Color-Coded Feedback**: Green (80%+), Yellow (60-79%), Orange (40-59%), Red (<40%)
- **Topic Counters**: Shows completed vs total topics for each domain
- **Accuracy Metrics**: Displays average accuracy when available
- **Streak Indicators**: Visual streak counters with appropriate colors

## 🎨 Design System

### Color Palette
```css
/* Domain-specific gradients */
DSA Programming: blue-500 → purple-600
UPSC Preparation: green-500 → teal-600  
JEE Preparation: orange-500 → red-600
Developer Skills: indigo-500 → pink-600

/* Progress colors */
Excellent (80%+): text-green-500
Good (60-79%): text-yellow-500
Fair (40-59%): text-orange-500
Needs Work (<40%): text-red-500

/* Streak colors */
High (7+ days): text-yellow-400
Medium (3-6 days): text-orange-400
Low (1-2 days): text-gray-400
```

### Typography
- **Headings**: Bold, large text with proper hierarchy
- **Body Text**: Readable font sizes with good line height
- **Labels**: Smaller, muted text for secondary information
- **Numbers**: Bold, colored text for important metrics

### Spacing & Layout
- **Consistent Padding**: 6-8 units for card content
- **Grid Gaps**: 6-8 units between cards
- **Margins**: Proper spacing for visual breathing room
- **Border Radius**: 2xl (16px) for modern, rounded appearance

## 🚀 Usage

### Basic Implementation
```tsx
import DomainSelector from './components/DomainSelector';

function App() {
  const handleDomainSelect = (domainId: string) => {
    console.log('Selected domain:', domainId);
    // Navigate to learning interface
  };

  return (
    <DomainSelector 
      onDomainSelect={handleDomainSelect}
      onBack={() => history.back()}
    />
  );
}
```

### With Adaptive Learning Hook
```tsx
import { useAdaptiveLearning } from './hooks/useAdaptiveLearning';
import DomainSelector from './components/DomainSelector';

function LearningApp() {
  const { 
    learningInterface, 
    selectDomain, 
    isInitialized 
  } = useAdaptiveLearning();

  const handleDomainSelect = async (domainId: string) => {
    if (isInitialized) {
      await selectDomain(domainId);
      // Navigate to learning session
    }
  };

  return (
    <DomainSelector 
      onDomainSelect={handleDomainSelect}
      learningInterface={learningInterface}
    />
  );
}
```

## 📱 Responsive Behavior

### Mobile (< 768px)
- Single column layout
- Larger touch targets
- Reduced padding for space efficiency
- Simplified animations for performance

### Tablet (768px - 1024px)
- Two column grid
- Balanced spacing
- Full animation suite
- Optimized for touch and mouse

### Desktop (> 1024px)
- Two column grid with maximum width
- Enhanced hover effects
- Full feature set
- Optimized for mouse interactions

## 🎭 Animation Details

### Entrance Animations
```tsx
// Card entrance
initial={{ opacity: 0, y: 20, scale: 0.95 }}
animate={{ opacity: 1, y: 0, scale: 1 }}
transition={{ delay: index * 0.1, duration: 0.3 }}

// Header entrance
initial={{ opacity: 0, y: -20 }}
animate={{ opacity: 1, y: 0 }}
```

### Hover Effects
```tsx
// Card hover
whileHover={{ 
  scale: 1.02,
  transition: { duration: 0.2 }
}}

// Progress bar animation
initial={{ width: 0 }}
animate={{ width: `${progressPercentage}%` }}
transition={{ delay: 0.5, duration: 0.8 }}
```

### Loading States
```tsx
// Loading spinner
<div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />

// Selection overlay
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  className="fixed inset-0 bg-black/50 backdrop-blur-sm"
/>
```

## 🎨 Customization

### Domain Configuration
```tsx
const DomainStyles = {
  custom_domain: {
    gradient: 'from-custom-500 to-custom-600',
    bg: 'bg-gradient-to-br from-custom-500 to-custom-600',
    hover: 'hover:from-custom-600 hover:to-custom-700',
    shadow: 'shadow-custom-500/25',
    border: 'border-custom-500/20'
  }
};
```

### Icon Customization
```tsx
const DomainIcons = {
  custom_domain: (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
      {/* Custom SVG path */}
    </svg>
  )
};
```

### Progress Colors
```tsx
const getProgressColor = (percentage: number) => {
  if (percentage >= 90) return 'text-emerald-500';
  if (percentage >= 80) return 'text-green-500';
  if (percentage >= 70) return 'text-yellow-500';
  if (percentage >= 60) return 'text-orange-500';
  return 'text-red-500';
};
```

## 🔧 Technical Implementation

### Dependencies
```json
{
  "framer-motion": "^10.0.0",
  "react": "^18.0.0",
  "typescript": "^5.0.0"
}
```

### Key Components
- **DomainSelector**: Main component with full functionality
- **DomainSelectorDemo**: Demo component for testing
- **useAdaptiveLearning**: Hook for adaptive learning integration
- **Types**: TypeScript interfaces for type safety

### Performance Optimizations
- **Lazy Loading**: Components load only when needed
- **Memoization**: Prevents unnecessary re-renders
- **Animation Optimization**: Uses transform properties for smooth animations
- **Image Optimization**: SVG icons for crisp display at any size

## 🧪 Testing

### Visual Testing
```tsx
// Test different progress states
const testDomains = [
  { progress: 0, expected: 'text-red-500' },
  { progress: 50, expected: 'text-orange-500' },
  { progress: 75, expected: 'text-yellow-500' },
  { progress: 90, expected: 'text-green-500' }
];
```

### Interaction Testing
```tsx
// Test domain selection
fireEvent.click(domainCard);
expect(onDomainSelect).toHaveBeenCalledWith('dsa_programming');

// Test back navigation
fireEvent.click(backButton);
expect(onBack).toHaveBeenCalled();
```

### Responsive Testing
```tsx
// Test mobile layout
window.innerWidth = 375;
fireEvent.resize(window);
expect(screen.getByTestId('domain-grid')).toHaveClass('grid-cols-1');

// Test desktop layout
window.innerWidth = 1024;
fireEvent.resize(window);
expect(screen.getByTestId('domain-grid')).toHaveClass('grid-cols-2');
```

## 🎯 Accessibility

### Keyboard Navigation
- Tab navigation through all interactive elements
- Enter/Space key support for domain selection
- Escape key support for modal dismissal

### Screen Reader Support
- Proper ARIA labels for all interactive elements
- Semantic HTML structure
- Descriptive alt text for icons

### Color Contrast
- WCAG AA compliant color combinations
- High contrast mode support
- Color-blind friendly design

## 🚀 Future Enhancements

### Planned Features
- **Dark/Light Mode Toggle**: Theme switching capability
- **Custom Animations**: User-configurable animation preferences
- **Advanced Analytics**: Detailed progress visualization
- **Social Features**: Sharing achievements and progress
- **Offline Support**: Cached content for offline learning

### Performance Improvements
- **Virtual Scrolling**: For large domain lists
- **Progressive Loading**: Load content as needed
- **Bundle Optimization**: Reduce initial load time
- **Caching Strategy**: Intelligent content caching

---

**Note**: This component is designed to integrate seamlessly with the zeroTrace AI adaptive learning system while maintaining the privacy-first approach and modern design standards.
