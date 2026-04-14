# Customer Portal Vue.js Application Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Installation and Setup](#installation-and-setup)
5. [Configuration](#configuration)
6. [Architecture Overview](#architecture-overview)
7. [Authentication System](#authentication-system)
8. [Routing System](#routing-system)
9. [Internationalization (i18n)](#internationalization-i18n)
10. [State Management](#state-management)
11. [API Integration](#api-integration)
12. [Components Overview](#components-overview)
13. [Pages Overview](#pages-overview)
14. [Services Layer](#services-layer)
15. [Styling and UI](#styling-and-ui)
16. [Deployment](#deployment)
17. [Troubleshooting](#troubleshooting)

---

## 1. Project Overview

The Customer Portal is a modern web application built with Vue.js 3 that provides customers with a comprehensive interface to interact with LMG Tech System services. The application offers property browsing, booking management, user profile management, and multi-language support.

### Key Features
- **User Authentication**: Secure login and registration with JWT tokens
- **Property Management**: Browse properties by category with search functionality
- **Booking System**: Create and manage property bookings
- **Multi-language Support**: English, Amharic (አማርኛ), and Afaan Oromoo support
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Protected Routes**: Authentication-based route protection
- **Real-time Updates**: Dynamic content loading and state management

### Target Audience
- Property customers seeking to browse and book accommodations
- Users who need to manage their booking history
- Customers requiring profile management and account settings

---

## 2. Technology Stack

### Frontend Framework
- **Vue.js 3**: Progressive JavaScript framework with Composition API
- **Vite**: Fast build tool and development server
- **Vue Router 4**: Official routing library for Vue.js
- **Pinia 3**: State management library for Vue.js

### UI and Styling
- **Tailwind CSS 4**: Utility-first CSS framework
- **PostCSS**: CSS processing tool
- **Autoprefixer**: CSS vendor prefixing tool

### HTTP and API
- **Axios 1.13.1**: HTTP client for API requests
- **JWT Authentication**: Token-based authentication system

### Internationalization
- **Vue-i18n 9.14.5**: Internationalization plugin for Vue.js

### Development Tools
- **ESLint**: Code linting (implied through Vite setup)
- **Hot Module Replacement**: Fast development with Vite

---

## 3. Project Structure

```
customer-portal-vuejs/
├── public/                          # Static assets
│   └── favicon.ico
├── src/
│   ├── assets/                      # Application assets
│   ├── components/                  # Reusable Vue components
│   │   ├── HelloWorld.vue          # Example component
│   │   ├── LoginForm.vue           # Login form component
│   │   ├── RegisterForm.vue        # Registration form component
│   │   ├── Navbar.vue              # Navigation bar component
│   │   └── customerService.js      # Customer service utilities
│   ├── i18n/                       # Internationalization files
│   │   ├── index.js                # i18n configuration
│   │   ├── en.json                 # English translations
│   │   ├── am.json                 # Amharic translations
│   │   └── om.json                 # Oromo translations
│   ├── layout/                     # Layout components
│   │   └── DashboardLayout.vue     # Main dashboard layout
│   ├── pages/                      # Page components
│   │   ├── LoginPage.vue           # Login page
│   │   ├── RegisterPage.vue        # Registration page
│   │   ├── DashboardPage.vue       # User dashboard
│   │   ├── CustomerProfile.vue     # User profile page
│   │   ├── CustomerProperties.vue  # Properties browsing page
│   │   ├── BookingPage.vue         # Booking creation page
│   │   ├── CustomerBookings.vue    # User's bookings
│   │   └── AllBookings.vue         # All bookings (admin view)
│   ├── router/                     # Routing configuration
│   │   └── index.js                # Router setup and routes
│   ├── services/                   # API service layer
│   │   ├── api.js                  # Axios configuration
│   │   ├── customerService.js      # Customer API calls
│   │   ├── bookingService.js       # Booking API calls
│   │   └── propertyService.js      # Property API calls
│   ├── App.vue                     # Root Vue component
│   ├── main.js                     # Application entry point
│   ├── authState.js                # Authentication state management
│   └── style.css                   # Global styles
├── index.html                      # HTML template
├── package.json                    # Project dependencies
├── vite.config.js                  # Vite configuration
└── README.md                       # Project documentation
```

---

## 4. Installation and Setup

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager
- Git (for version control)

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd customer-portal-vuejs
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   - The API base URL is configured in `src/services/api.js`
   - Default API endpoint: `https://lmgtech-4.onrender.com`

4. **Start Development Server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

5. **Build for Production**
   ```bash
   npm run build
   ```

6. **Preview Production Build**
   ```bash
   npm run preview
   ```

---

## 5. Configuration

### API Configuration
The application connects to a NestJS backend API hosted on Render. Configuration is centralized in `src/services/api.js`:

```javascript
const api = axios.create({
  baseURL: "https://lmgtech-4.onrender.com",
  withCredentials: true,
});
```

### Internationalization Setup
Language files are stored in `src/i18n/`:
- `en.json`: English translations
- `am.json`: Amharic translations
- `om.json`: Oromo translations

Default language is English, with automatic persistence in localStorage.

### Router Configuration
Uses hash-based routing for compatibility with static hosting:
```javascript
const router = createRouter({
  history: createWebHashHistory(),
  routes,
});
```

---

## 6. Architecture Overview

### Application Architecture
The application follows a component-based architecture with clear separation of concerns:

1. **Entry Point** (`main.js`): Initializes Vue app with plugins
2. **Root Component** (`App.vue`): Main application wrapper with navigation
3. **Router**: Handles client-side routing and route protection
4. **Pages**: Top-level components representing different views
5. **Components**: Reusable UI elements
6. **Services**: API communication layer
7. **State Management**: Centralized state with Pinia stores

### Data Flow
1. User interacts with UI components
2. Components trigger actions or API calls through services
3. Services communicate with backend API
4. Responses update local state via Pinia stores
5. UI re-renders based on state changes

### State Management Strategy
- **Authentication State**: Managed in `authState.js` with reactive refs
- **Component State**: Local state using Vue 3 Composition API
- **Global State**: Pinia stores for shared state (when needed)

---

## 7. Authentication System

### Authentication Flow
1. **Registration**: Users can register with email/password or Google OAuth
2. **Login**: JWT token-based authentication
3. **Token Storage**: JWT stored in localStorage
4. **Auto-logout**: Automatic logout on token expiration
5. **Route Protection**: Protected routes check for valid tokens

### Authentication State
Managed through reactive variables in `authState.js`:
- `authToken`: Current JWT token
- `user`: User profile information
- `isAuthenticated`: Computed boolean for authentication status
- `userName`: Computed user display name

### Security Features
- JWT token validation with expiration checks
- Automatic token attachment to API requests
- Secure token storage in localStorage
- Route guards for protected pages

---

## 8. Routing System

### Route Structure
The application uses a nested routing structure:

**Public Routes:**
- `/`: Property browsing page
- `/login`: User login
- `/register`: User registration

**Protected Routes (under `/app`):**
- `/app/dashboard`: User dashboard
- `/app/booking`: Create new booking
- `/app/property`: Browse properties
- `/app/profile`: User profile management
- `/app/my-bookings`: User's booking history
- `/app/all-bookings`: All bookings (admin view)

### Route Guards
Authentication-based route protection:
```javascript
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  if (to.meta.requiresAuth && !token) {
    return next("/login");
  }
  next();
});
```

### Navigation Features
- Hash-based routing for static hosting compatibility
- Programmatic navigation with Vue Router
- Active route highlighting
- Breadcrumb navigation support

---

## 9. Internationalization (i18n)

### Supported Languages
- **English (en)**: Default language
- **Amharic (አማርኛ) (am)**: Ethiopian language
- **Afaan Oromoo (om)**: Ethiopian regional language

### Implementation
- Vue-i18n plugin integration
- JSON-based translation files
- Language persistence in localStorage
- Dynamic language switching
- API header synchronization (`Accept-Language`)

### Usage in Components
```vue
<template>
  <h1>{{ $t('welcome') }}</h1>
  <button @click="changeLang">{{ $t('login') }}</button>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>
```

### Language Switching
Users can switch languages through a dropdown in the top navigation bar. The selected language is automatically saved and applied to all subsequent API requests.

---

## 10. State Management

### Pinia Integration
The application uses Pinia for centralized state management, though most state is currently managed locally within components.

### Authentication State
Reactive authentication state is managed in `authState.js`:
- Token management
- User profile data
- Authentication status computation
- Auto-logout functionality

### Local Component State
Most component state is managed locally using Vue 3's Composition API:
- Form data
- UI state (loading, errors)
- Component-specific data

### Future State Management
The Pinia setup allows for easy expansion to global stores for:
- User preferences
- Application settings
- Cached API data
- Shopping cart functionality (if needed)

---

## 11. API Integration

### API Architecture
The application communicates with a NestJS backend API through dedicated service modules:

- **api.js**: Axios configuration and interceptors
- **customerService.js**: Customer-related API calls
- **bookingService.js**: Booking management APIs
- **propertyService.js**: Property browsing APIs

### HTTP Client Configuration
Axios instance with:
- Base URL configuration
- Automatic JWT token attachment
- Language header synchronization
- Error handling and interceptors

### API Endpoints
Key API endpoints include:
- `POST /customer/register`: User registration
- `POST /customer/login`: User authentication
- `GET /properties`: Property listings
- `POST /bookings`: Create booking
- `GET /customer/bookings`: User's bookings

### Error Handling
- Centralized error handling in service layer
- User-friendly error messages
- Network error recovery
- Authentication error handling (token refresh)

---

## 12. Components Overview

### Reusable Components
- **LoginForm.vue**: Authentication form with validation
- **RegisterForm.vue**: User registration form
- **Navbar.vue**: Main navigation component
- **HelloWorld.vue**: Example component (can be removed)

### Component Patterns
- Composition API usage
- Reactive data management
- Event emission for parent communication
- Scoped styling with Tailwind CSS

### Component Communication
- Props for parent-to-child data flow
- Emits for child-to-parent communication
- Provide/Inject for deep component communication (when needed)

---

## 13. Pages Overview

### Public Pages
- **LoginPage**: User authentication interface
- **RegisterPage**: New user registration
- **CustomerProperties**: Property browsing (public access)

### Protected Pages
- **DashboardPage**: User welcome dashboard
- **BookingPage**: Create new property bookings
- **CustomerProfile**: User profile management
- **CustomerBookings**: Personal booking history
- **AllBookings**: Complete booking overview (admin)

### Page Layout
Most protected pages use the `DashboardLayout.vue` wrapper, which provides:
- Consistent navigation
- User profile dropdown
- Language selector
- Responsive design

---

## 14. Services Layer

### Service Organization
Each service module handles a specific domain:

**customerService.js:**
- User registration and login
- Profile management
- Customer data operations

**bookingService.js:**
- Booking creation and management
- Booking history retrieval
- Booking status updates

**propertyService.js:**
- Property listing and search
- Category-based filtering
- Property details retrieval

### Service Patterns
- Async/await for API calls
- Consistent error handling
- TypeScript-ready structure (can be enhanced)
- Modular design for easy testing

### API Response Handling
- Standardized response format
- Error message extraction
- Data transformation for UI consumption

---

## 15. Styling and UI

### CSS Framework
**Tailwind CSS** provides:
- Utility-first approach
- Responsive design utilities
- Dark mode support (configurable)
- Custom component styling

### Global Styles
- Custom CSS variables for theming
- Font and typography setup
- Base component styles
- Responsive breakpoints

### Component Styling
- Scoped styles for component isolation
- Tailwind utility classes
- Custom CSS for complex layouts
- Mobile-first responsive design

### UI Patterns
- Card-based layouts
- Form styling with validation states
- Loading states and animations
- Error state handling

---

## 16. Deployment

### Build Process
```bash
npm run build
```
Generates optimized production build in `dist/` directory.

### Deployment Platforms
- **Vercel**: Recommended for Vue.js applications
- **Netlify**: Static site hosting with form handling
- **Render**: Full-stack deployment (matches backend)
- **GitHub Pages**: Free static hosting

### Environment Variables
For production deployment, configure:
- API base URL
- OAuth credentials (if used)
- Analytics tracking (optional)

### Build Optimization
- Code splitting with Vite
- Asset optimization
- Tree shaking for unused code
- Minification and compression

---

## 17. Troubleshooting

### Common Issues

**Authentication Problems:**
- Check JWT token in localStorage
- Verify API endpoint connectivity
- Check token expiration

**Routing Issues:**
- Ensure hash-based routing for static hosting
- Check route meta properties
- Verify route guard logic

**API Errors:**
- Check network connectivity
- Verify API base URL
- Check request headers (Authorization, Accept-Language)

**i18n Issues:**
- Verify translation file syntax
- Check language code consistency
- Clear localStorage for language reset

### Development Tips
- Use Vue DevTools for debugging
- Check browser console for errors
- Use Vite's HMR for fast development
- Test on multiple browsers and devices

### Performance Optimization
- Lazy load route components
- Optimize images and assets
- Minimize bundle size
- Use Vue's production build

---

## Conclusion

This Customer Portal Vue.js application provides a robust, scalable foundation for property management and booking services. The modular architecture, modern technology stack, and comprehensive feature set make it suitable for production deployment with proper backend integration.

### Future Enhancements
- Add unit and integration tests
- Implement progressive web app (PWA) features
- Add real-time notifications
- Enhance accessibility (WCAG compliance)
- Add more payment integration options
- Implement advanced search and filtering

### Support
For technical support or questions about this application, please refer to the project repository or contact the development team.

---

*Documentation generated on April 4, 2026*
*Application Version: 1.0.0*</content>
<parameter name="filePath">c:\Users\lg\Desktop\INTER GK\Customer portal Vue.js\DOCUMENTATION.md