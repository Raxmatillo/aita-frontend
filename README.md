# AITA Frontend - Visual Vocabulary Learning Platform

Modern React frontend built with Vite, TailwindCSS, and Framer Motion.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Backend API running on http://localhost:8000

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env if your backend runs on a different URL
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open browser:**
   Navigate to http://localhost:3000

## 📁 Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── Header.jsx
│   ├── WordCard.jsx
│   ├── StudentTable.jsx
│   ├── ModalQuiz.jsx
│   └── ProtectedRoute.jsx
├── pages/            # Page components
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   └── Library.jsx
├── services/         # API integration
│   └── api.js
├── App.jsx           # Main app component
├── main.jsx          # Entry point
└── index.css         # Global styles

```

## 🎨 Features

✅ **Authentication**
- JWT-based login system
- Automatic token refresh
- Protected routes

✅ **Dashboard**
- Class management (create, view, delete)
- Student management (add, edit, delete)
- Real-time student statistics
- Interactive quiz modal

✅ **Quiz System**
- Random image questions with 3 options
- Animated correct/wrong feedback
- Auto-advance to next question
- Score tracking

✅ **Vocabulary Library**
- Grid and list view modes
- Search and filter by category
- Image upload with preview
- Category management

✅ **Animations**
- Framer Motion animations
- Smooth transitions
- Interactive hover effects
- Loading states

## 🎯 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🔌 API Integration

The frontend connects to Django REST Framework backend via Axios.

### API Endpoints Used:
- `POST /api/auth/login/` - Teacher login
- `GET /api/auth/me/` - Get user profile
- `GET /api/classes/` - List classes
- `POST /api/classes/` - Create class
- `GET /api/students/` - List students
- `POST /api/students/` - Add student
- `GET /api/vocabularies/` - List vocabularies
- `POST /api/vocabularies/` - Add vocabulary
- `GET /api/test/{student_id}/random/` - Get random question
- `POST /api/test/{student_id}/answer/` - Submit answer
- `GET /api/results/{student_id}/` - Get student results

## 🎨 Styling

Built with **TailwindCSS 4.x** featuring:
- Custom color palette (primary blues)
- Responsive design
- Dark mode ready
- Custom animations
- Component utility classes

## 📦 Key Dependencies

- **React 19.x** - UI library
- **Vite 7.x** - Build tool
- **TailwindCSS 4.x** - Styling
- **Framer Motion 11.x** - Animations
- **React Router DOM 6.x** - Routing
- **Axios 1.x** - HTTP client
- **Lucide React** - Icons

## 🔐 Authentication Flow

1. User logs in with username/password
2. Backend returns JWT access & refresh tokens
3. Tokens stored in localStorage
4. Axios interceptor adds token to requests
5. Auto-refresh on 401 errors
6. Logout clears tokens and redirects

## 🎭 Component Overview

### Header
- Navigation links
- User profile display
- Logout button

### StudentTable
- Display students with statistics
- Action buttons (quiz, edit, delete)
- Progress bars and badges

### ModalQuiz
- Full-screen modal
- Random question display
- Multiple choice options
- Animated feedback
- Score tracking

### WordCard
- Visual vocabulary display
- Hover effects
- Category labels

## 🚀 Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Deploy dist/ folder to your hosting service
```

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly interfaces
- Adaptive layouts

## 🎨 Customization

### Change Primary Color
Edit `tailwind.config.js`:
```javascript
colors: {
  primary: {
    500: '#your-color',
    600: '#your-darker-color',
    // ...
  }
}
```

### Add Custom Animation
Edit `index.css`:
```css
@keyframes yourAnimation {
  /* keyframes */
}
```

## 🐛 Troubleshooting

**API Connection Issues:**
- Check backend is running on port 8000
- Verify CORS settings in Django
- Check .env file configuration

**Build Errors:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear cache: `rm -rf .vite`

**Authentication Issues:**
- Clear localStorage: Open DevTools > Application > Local Storage
- Check token expiration
- Verify backend JWT settings

## 📄 License

This project is part of the AITA platform.

---

**Built with ❤️ using React, Vite, and TailwindCSS**