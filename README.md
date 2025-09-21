# Otaku Forum Frontend

A modern, wireframe-style frontend built with React, TypeScript, Vite, shadcn-ui, and Tailwind CSS for the Otaku Forum API. This application provides a complete forum experience with articles, discussions, user profiles, and more.

## Features

### 🎨 Wireframe Design
- Clean, minimalist grayscale design
- Focus on content and functionality
- Responsive mobile-first approach
- Inter font family for excellent readability

### 🔐 Authentication
- User registration and login
- JWT token-based authentication
- Automatic token refresh
- Protected routes and role-based access

### 📝 Articles
- Browse and read articles with categories
- Create, edit, and delete articles (authenticated users)
- Like articles and view statistics
- Rich commenting system with nested replies

### 💬 Forum
- Browse topics by category
- Create and participate in discussions
- Reply to topics with full threading
- Pinned and locked topic support

### 👤 User Profiles
- View user profiles with statistics
- Edit personal information
- Track user's articles and topics
- Avatar and cover image support

### 🔍 Search
- Global search across articles and topics
- Category filtering
- Real-time search suggestions

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with wireframe design system
- **UI Components**: shadcn-ui
- **State Management**: React Context API
- **HTTP Client**: Axios with interceptors
- **Data Fetching**: TanStack Query
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Date Formatting**: date-fns

## Prerequisites

- Node.js 18+ and npm
- Flask Otaku Forum API running on `http://localhost:5000`

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone [your-repo-url]
   cd otaku-forum-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:8080`

## API Integration

The frontend connects to your Flask API at `http://localhost:5000/api/v1`. Make sure your backend:

### CORS Configuration
Configure your Flask API to allow requests from the frontend:

**Development (local):**
```python
from flask_cors import CORS
CORS(app, origins=["http://localhost:8080"])
```

**Production (Vercel):**
```python
CORS(app, origins=["https://your-app.vercel.app"])
```

### Required API Endpoints
The frontend expects all endpoints from your Flask API:

- **Health**: `GET /health`
- **Auth**: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `GET /auth/me`
- **Users**: `GET /users`, `GET /users/<id>`, `PUT /users/me`, `GET /users/leaderboard`
- **Articles**: Full CRUD with likes and filtering
- **Forum**: Topics, replies, categories
- **Comments**: Nested comments with moderation

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn-ui components
│   ├── Layout.tsx      # Main layout wrapper
│   └── PrivateRoute.tsx # Protected route wrapper
├── contexts/           # React Context providers
│   └── AuthContext.tsx # Authentication state
├── hooks/              # Custom React hooks
├── pages/              # Page components
│   ├── Home.tsx        # Landing page
│   ├── Login.tsx       # Authentication
│   ├── Register.tsx    # User registration
│   ├── ArticleDetail.tsx # Article view
│   ├── Forum.tsx       # Forum listing
│   ├── Profile.tsx     # User profiles
│   └── Search.tsx      # Search functionality
├── services/           # API integration
│   └── api.ts          # Axios client & endpoints
├── types/              # TypeScript definitions
└── styles/
    └── index.css       # Wireframe design system
```

## Design System

The application implements a clean wireframe aesthetic:

### Color Palette (HSL)
```css
--background: 0 0% 100%;     /* Pure white */
--foreground: 0 0% 15%;      /* Dark gray text */
--muted: 0 0% 96%;           /* Light gray backgrounds */
--border: 0 0% 90%;          /* Gray borders */
--primary: 0 0% 20%;         /* Dark gray for actions */
```

### Typography
- **Font**: Inter (Google Fonts)
- **Hierarchy**: Consistent heading sizes
- **Readability**: High contrast, optimal line spacing

### Components
All components follow the wireframe principles:
- Clean borders and shadows
- Minimal color usage
- Focus on content hierarchy
- Consistent spacing (4px grid)

## Key Features Implementation

### Authentication Flow
1. User logs in → JWT tokens stored in localStorage
2. Axios interceptor adds `Authorization: Bearer <token>` to requests
3. Automatic token refresh on 401 responses
4. Context provides auth state to all components

### Real-time Features
- Like/unlike articles and comments
- Reply to comments with threading
- Forum topic creation and replies
- User profile updates

### Error Handling
- Toast notifications for user feedback
- Axios interceptors for global error handling
- Form validation with helpful messages
- Network error recovery

## Deployment

### Deploy to Vercel

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Update CORS**
   Configure your Flask API to allow requests from your Vercel domain.

### Environment Variables
For production deployment, you may need to configure:
- API base URL (if different from localhost:5000)
- Authentication settings
- Error tracking services

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview build locally
- `npm run lint` - Run ESLint

### Code Style
- TypeScript strict mode
- ESLint + Prettier configuration
- Consistent import ordering
- Component-first architecture

## Testing with Backend

To test the full integration:

1. **Start your Flask API** on `http://localhost:5000`
2. **Start the frontend** with `npm run dev`
3. **Register a new user** to test authentication
4. **Create articles and topics** to test CRUD operations
5. **Test commenting and replies** for nested functionality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the existing code style
4. Test with the backend API
5. Submit a pull request

## Common Issues

### CORS Errors
- Ensure Flask API has proper CORS configuration
- Check that API is running on correct port (5000)

### Authentication Problems
- Clear localStorage if tokens are corrupted
- Verify JWT secret key matches between frontend/backend

### API Connection Issues
- Confirm API base URL in `src/services/api.ts`
- Check network connectivity to localhost:5000

## License

MIT License - feel free to use this project as a base for your own forum applications.

---

Built with ❤️ for the otaku community