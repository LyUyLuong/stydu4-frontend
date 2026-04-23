# Stydu4 Frontend Development Guide

## Getting Started

### 1. Setup Environment

Create `.env` file in root directory:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_STRIPE_PUBLIC_KEY=pk_test_your_key_here
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

The app will run on `http://localhost:5173`

## Project Features

### Authentication
- JWT-based authentication with auto-refresh
- Google OAuth2 login integration
- Protected routes for authenticated users
- Persistent login state

### State Management
- Zustand for global state (auth, user info)
- TanStack Query for server state (API data caching)

### Styling
- TailwindCSS utility classes
- Custom component classes
- Responsive design
- Dark mode ready (can be enabled)

### API Integration
- Axios with interceptors
- Auto token refresh
- Error handling
- Request/response logging

## Adding New Features

### Create a New Page

1. Create page component in `src/pages/`:
```jsx
// src/pages/NewPage.jsx
const NewPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1>New Page</h1>
    </div>
  );
};

export default NewPage;
```

2. Add route in `App.jsx`:
```jsx
<Route path="/new-page" element={
  <ProtectedRoute>
    <NewPage />
  </ProtectedRoute>
} />
```

### Add API Service

1. Create service in `src/services/`:
```jsx
// src/services/newService.js
import apiClient from './api';

export const newService = {
  getData: async () => {
    const response = await apiClient.get('/endpoint');
    return response.data;
  },
};
```

2. Use with TanStack Query:
```jsx
const { data, isLoading } = useQuery({
  queryKey: ['dataKey'],
  queryFn: () => newService.getData(),
});
```

## Backend Integration

Ensure Spring Boot backend is running on `http://localhost:8080` with CORS enabled for `http://localhost:5173`.

### Backend CORS Configuration

In Spring Boot `application.yaml`:
```yaml
app:
  cors:
    allowed-origins:
      - http://localhost:5173
      - http://localhost:5500
```

## Deployment

### Build for Production

```bash
npm run build
```

Output will be in `dist/` folder.

### Environment Variables for Production

Update `.env` with production URLs:
```env
VITE_API_BASE_URL=https://api.stydu4.com/api/v1
VITE_STRIPE_PUBLIC_KEY=pk_live_your_production_key
```

### Deploy to Netlify/Vercel

1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in platform settings

## Tips

- Use TanStack Query for all API calls (automatic caching & refetching)
- Use Zustand only for global UI state
- Always wrap API components in `ProtectedRoute` if auth required
- Use `react-hot-toast` for notifications
- Follow TailwindCSS utility-first approach
- Keep components small and reusable

## Troubleshooting

### CORS Errors
- Ensure backend CORS is configured correctly
- Check `withCredentials: true` in axios config

### 401 Unauthorized
- Check if token is stored in localStorage
- Verify token hasn't expired
- Check backend JWT configuration

### API not found (404)
- Verify `VITE_API_BASE_URL` in `.env`
- Check API endpoints in backend
- Ensure backend is running

## Next Steps

- [ ] Add more pages (Tests, Courses, Progress, Profile)
- [ ] Implement test-taking interface
- [ ] Add Stripe payment flow
- [ ] Add file upload for audio/images
- [ ] Add more charts and visualizations
- [ ] Implement real-time features with WebSocket
- [ ] Add PWA support
- [ ] Add internationalization (i18n)
