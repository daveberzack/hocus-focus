# Hocus Focus

A fast-paced, impressionistic seek-and-find game where players paint hidden pictures to reveal clues and find targets within time limits.

## 🎮 Game Overview

Hocus Focus is a daily puzzle game where players:
- Receive a clue about what to find in a hidden picture
- Paint the canvas by swiping to reveal blocks of color
- Gradually uncover details until they can identify and click the target
- Earn up to 5 stars based on completion time
- Track their progress and win streaks

## 🏗️ Project Structure

### **Core Application Files**

#### **`index.html`**
Main HTML file with semantic structure and accessibility features:
- Progressive Web App setup with manifest and service worker
- Semantic HTML5 elements (`<main>`, `<section>`, `<nav>`, etc.)
- ARIA labels and roles for screen reader compatibility
- Responsive viewport configuration
- Game canvas and UI containers

#### **`manifest.json`**
Progressive Web App manifest defining:
- App metadata (name, description, icons)
- Display preferences and theme colors
- Installability configuration

#### **`sw.js`**
Service Worker for offline functionality and caching

### **Styles**

#### **`styles/styles.css`**
Main stylesheet containing:
- Responsive design for mobile and desktop
- Game UI styling (timer, buttons, modals)
- Canvas and board layout
- Animation and transition effects

### **Core JavaScript Modules (`scripts/`)**

#### **Application Core**

**`main.js`** - Application entry point and initialization
- Service worker registration
- UI event handlers and game flow control
- Window resize handling and responsive layout
- Integration of all game components

**`game.js`** - Main game logic and state management
- Game initialization and challenge loading
- Win/lose conditions and scoring
- Timer management and star calculation
- User interaction handling

#### **Helper Files**

**`config.js`** - Centralized configuration management
- Environment detection (development vs production)
- API endpoints and base URLs
- Game settings (max stars, penalty time, etc.)
- Cache and network configuration
- Tutorial challenge IDs

**`errors.js`** - Custom error handling system
- `AppError` base class with timestamps and error codes
- Specialized error types: `ChallengeNotFoundError`, `NetworkError`, `DatabaseError`, `ValidationError`
- User-friendly error message generation
- Development vs production error display

**`network.js`** - Robust network utilities
- `fetchWithRetry()` with exponential backoff
- Request timeout handling
- Automatic retry logic (avoids retrying 4xx errors)
- JSON parsing with error handling
- GET/POST convenience methods

**`cache.js`** - Intelligent caching system
- In-memory cache with TTL (Time To Live) expiration
- `ChallengeCache` with hit/miss tracking
- Fallback to expired data when fresh fetch fails
- Cache statistics and performance monitoring

**`validation.js`** - Comprehensive input validation
- Game result validation with proper constraints
- Challenge ID and date format validation
- String sanitization for XSS prevention
- Analytics data validation and sanitization

**`data.js`** - Refactored data management (Main API interface)
- **Challenge Loading**: Tutorial progression, daily challenges, test challenges
- **Database Operations**: IndexedDB for local storage with fallbacks
- **Analytics**: User behavior tracking with graceful failure handling
- **Game Results**: Save/retrieve player progress and statistics
- **Error Recovery**: Graceful handling of network failures
- **Modular Architecture**: Broken into focused, testable functions

#### **Game Components**

**`canvas.js`** - Canvas rendering and management
- HTML5 Canvas setup and configuration
- Drawing context management
- Pixel manipulation and rendering

**`pixelPainter.js`** - Core painting mechanics
- Brush system and painting algorithms
- Color revelation and detail levels
- Touch/mouse input handling
- Progressive image unveiling

**`cursor.js`** - Input handling and cursor management
- Mouse and touch event processing
- Cursor position tracking
- Input state management

**`winContent.js`** - Victory screen and post-game UI
- Win animation and celebration effects
- Score display and star rating
- Social sharing functionality
- Post-game action buttons

**`stats.js`** - Statistics and progress tracking
- Performance analytics and visualization
- Win streak calculation
- Historical data display
- Progress charts and graphs

**`utils.js`** - Shared utility functions
- View management and navigation
- Device detection (touch vs desktop)
- Date formatting and manipulation
- Common helper functions

**`tutorials.js`** - Tutorial system and onboarding
- Step-by-step game introduction
- Interactive tutorial challenges
- Progress tracking through tutorial stages

### **Data and Content**

#### **`data/`** - Game content and challenges
**`challenges.json`** - Challenge definitions containing:
- Puzzle metadata (clue, date, credit information)
- Hit areas (clickable target regions)
- Time goals for star ratings
- Tutorial and before-game messages

#### **`data/images/`** - Challenge images
- JPEG files for puzzle images
- Named with unique identifiers matching challenge data

#### **`img/`** - UI assets and icons
**`icons/`** - App icons for various platforms and sizes
**`themes/`** - Themed backgrounds and visual elements
- UI elements (buttons, logos, help icons)
- Game interface graphics

### **Tools and Utilities**

#### **`create/`** - Challenge creation tools
- **`index.html`** - Challenge creation interface
- **`script.js`** - Creation tool logic
- **`styles.css`** - Creation tool styling
- **`hitArea.js`** - Hit area definition tools

#### **`editor/`** - Challenge editing tools
- **`index.html`** - Challenge editing interface
- **`script.js`** - Editing functionality
- **`styles.css`** - Editor styling
- **`hitArea.js`** - Hit area editing tools

### **Testing and Development**

#### **`test-simple.html`** - Module integration tests
- Verifies all refactored modules import correctly
- Tests basic functionality of each component
- Validates error handling and configuration

## 🛠️ Development Setup

1. **Local Development Server**:
   ```bash
   python3 -m http.server 8000
   # Navigate to http://localhost:8000
   ```

2. **Module Testing**:
   ```bash
   # Open test-simple.html to verify module integration
   # All modules should import and function correctly
   ```

3. **Production Deployment**:
   - Ensure API server is running for full functionality
   - App gracefully handles offline mode with cached data
   - Service worker provides offline capability

## 📱 Progressive Web App Features

- **Installable**: Can be installed on mobile devices and desktop
- **Offline Support**: Service worker caches resources for offline play
- **Responsive**: Optimized for all screen sizes
- **Fast Loading**: Efficient resource management and caching

## 🎯 Game Features

- **Daily Challenges**: New puzzle every day
- **Tutorial System**: Progressive onboarding for new players
- **Statistics Tracking**: Win streaks, performance analytics
- **Social Sharing**: Share scores and challenge friends
- **Accessibility**: Full screen reader support and keyboard navigation
- **Cross-Platform**: Works on mobile, tablet, and desktop

## 🔧 Technical Stack

- **Frontend**: Vanilla JavaScript (ES6 modules), HTML5 Canvas, CSS3
- **Storage**: IndexedDB for local data persistence
- **Architecture**: Modular ES6 with professional error handling
- **PWA**: Service Worker, Web App Manifest
- **Accessibility**: ARIA labels, semantic HTML, keyboard navigation


        open -n -a /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --args --user-data-dir="/tmp/chrome_dev_test" --disable-web-security

