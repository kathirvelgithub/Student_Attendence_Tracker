# Student Activity & Attendance Tracker - Frontend

A modern, production-ready React frontend application for managing student records, tracking attendance, and logging activities in educational institutions. Built with TypeScript, Vite, and Tailwind CSS.

## 🌐 Live Deployment

- **Backend API**: [https://student-attendence-tracker.onrender.com](https://student-attendence-tracker.onrender.com)
- **API Endpoints**: `https://student-attendence-tracker.onrender.com/api/v1`

📖 **[Vercel Deployment Guide](./VERCEL_DEPLOYMENT.md)** - Complete step-by-step guide for deploying to Vercel

## 🚀 Features

### Core Functionality
- **Dashboard**: Real-time statistics, charts, and activity overview
- **Student Management**: Complete CRUD operations with search and filtering
- **Attendance Tracking**: Daily attendance marking with visual calendar interface
- **Activity Logging**: Record student participation in academic, sports, cultural activities
- **Reports & Analytics**: Comprehensive reports with data visualization using Recharts
- **Responsive Design**: Mobile-first design that works on all devices
- **Modern UI/UX**: Clean, intuitive interface with Tailwind CSS

### Technical Features
- **TypeScript**: Full type safety across the application
- **Authentication**: JWT-based authentication with protected routes
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Form Validation**: Client-side validation with detailed error feedback
- **API Integration**: Axios-based API client with interceptors
- **Hot Module Reload**: Fast development with Vite HMR

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS for responsive design
- **Routing**: React Router DOM for navigation
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React for modern icons
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios for API communication
- **State Management**: React hooks and context

## 📁 Project Structure

```
Frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   └── Layout.tsx       # Main layout with navigation
│   ├── pages/               # Application pages
│   │   ├── Dashboard.tsx    # Main dashboard
│   │   ├── Students.tsx     # Student management
│   │   ├── Attendance.tsx   # Attendance tracking
│   │   ├── Activities.tsx   # Activity logging
│   │   ├── Reports.tsx      # Reports and analytics
│   │   ├── Rankings.tsx     # Rankings and leaderboards
│   │   └── Login.tsx        # Authentication
│   ├── services/            # API service layer
│   │   ├── api.ts           # Axios configuration
│   │   └── index.ts         # API endpoints
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts         # Application types
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Utility functions
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── .github/                 # GitHub configuration
├── package.json             # Dependencies and scripts
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── README.md                # Project documentation
```

## 🚦 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Backend API (deployed at https://student-attendence-tracker.onrender.com)

### Installation

1. **Navigate to the Frontend directory**
   ```bash
   cd Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   ```
   # Production (Render deployment)
   VITE_API_URL=https://student-attendence-tracker.onrender.com/api/v1
   
   # Or use local backend for development
   # VITE_API_URL=http://localhost:3000/api/v1
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 🎨 UI Components

### Dashboard
- **Statistics Cards**: Key metrics overview
- **Charts**: Attendance trends and activity distribution
- **Top Students**: Performance leaderboard

### Student Management
- **Student List**: Searchable and filterable table
- **CRUD Operations**: Add, edit, delete students
- **Bulk Operations**: Import/export functionality

### Attendance Tracking
- **Date Picker**: Select attendance date
- **Quick Actions**: Mark present/absent/late with buttons
- **Summary**: Real-time attendance statistics

### Activities
- **Activity Cards**: Visual activity overview
- **Filtering**: By type, status, and date
- **Points System**: Activity scoring and tracking

### Reports
- **Multiple Report Types**: Attendance, activities, performance
- **Data Visualization**: Charts and graphs
- **Export Options**: PDF and Excel export

### Rankings
- **Multiple Leaderboards**: Attendance and activity rankings
- **Achievements**: Badge system for student accomplishments
- **Performance Metrics**: Comprehensive scoring

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Production Backend (Render Deployment)
VITE_API_URL=https://student-attendence-tracker.onrender.com/api/v1
VITE_SOCKET_URL=https://student-attendence-tracker.onrender.com

# For Local Development (uncomment to use local backend)
# VITE_API_URL=http://localhost:3000/api/v1
# VITE_SOCKET_URL=http://localhost:3000
```

### API Integration

The frontend communicates with the backend through a centralized API service layer:

- **API Configuration**: `src/services/api.ts` - Axios instance with interceptors
- **API Endpoints**: `src/services/index.ts` - All API endpoint definitions
- **Base URL**: Configurable via `VITE_API_URL` environment variable
- **Timeout**: 10 seconds for all API requests
- **Authentication**: JWT token automatically attached to requests

#### Available API Services

```typescript
// Students API
studentsApi.getAll()
studentsApi.getById(id)
studentsApi.create(data)
studentsApi.update(id, data)
studentsApi.delete(id)

// Attendance API
attendanceApi.getAll()
attendanceApi.getByDate(date)
attendanceApi.mark(data)
attendanceApi.getByStudent(studentId)

// Activities API
activitiesApi.getAll()
activitiesApi.getById(id)
activitiesApi.create(data)
activitiesApi.update(id, data)
activitiesApi.delete(id)
activitiesApi.getStudentActivities(studentId)

// Reports API
reportsApi.getAttendanceReport(filters)
reportsApi.getActivityReport(filters)
reportsApi.getSummaryReport(filters)
```

### Authentication

The application uses JWT token-based authentication:

- **Token Storage**: localStorage (`token` and `user` keys)
- **Auto-attach**: Token automatically attached to all API requests
- **Auto-redirect**: Unauthorized requests redirect to login page
- **Demo Mode**: Supports demo token for development without backend

**Demo Credentials:**
- Username: `admin`
- Password: `admin123`

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: Full feature set with sidebar navigation
- **Tablet**: Responsive layout with collapsible sidebar
- **Mobile**: Touch-friendly interface with mobile-optimized navigation

## 🎯 Key Pages & Components

### Pages

1. **Dashboard** (`src/pages/Dashboard.tsx`)
   - Real-time statistics cards (students, attendance, activities)
   - Attendance trends chart
   - Recent activities list
   - Quick action buttons

2. **Students** (`src/pages/Students.tsx`)
   - Student list with search and filtering
   - Add/Edit/Delete student modals
   - Student details view
   - Bulk operations support

3. **Attendance** (`src/pages/Attendance.tsx`)
   - Date picker for attendance tracking
   - Visual student grid
   - Quick mark present/absent/late
   - Real-time attendance summary

4. **Activities** (`src/pages/Activities.tsx`)
   - Activity cards with filtering
   - Add activity modal with validation
   - Activity types: Academic, Sports, Cultural, Other
   - Points and status tracking

5. **Reports** (`src/pages/Reports.tsx`)
   - Attendance reports with charts
   - Activity distribution analysis
   - Summary reports with export
   - Date range filtering

### Reusable Components

- **Layout** (`src/components/Layout.tsx`) - Main app layout with navigation
- **Modals** - Add/Edit/Delete modals for students and activities
- **Forms** - Controlled forms with validation
- **LoadingSpinner** - Loading state indicator
- **ErrorBanner** - Error message display
- **EmptyState** - No data placeholder

## 🧪 Development

### Development Workflow

```bash
# Start development server with HMR
npm run dev

# Run in a different port
npm run dev -- --port 3000

# Build for production
npm run build

# Preview production build locally
npm run preview

# Type checking
npm run type-check
```

### Code Quality

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting with React rules
- **Prettier**: Code formatting (if configured)
- **Component Structure**: Functional components with hooks
- **State Management**: React hooks (useState, useEffect)

### Performance Optimization

- **Code Splitting**: Automatic route-based splitting with React Router
- **Lazy Loading**: Component lazy loading where applicable
- **Memoization**: React.memo for expensive components
- **Build Optimization**: Vite's built-in optimizations
- **Asset Optimization**: Image and resource compression

## 🚀 Deployment

### Build for Production

```bash
# Create optimized production build
npm run build

# Output will be in the 'dist' directory
```

### Deploy to Hosting Platforms

#### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

#### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

#### GitHub Pages

```bash
# Build with correct base path
npm run build -- --base=/Student_Attendence_Tracker/

# Deploy dist folder to gh-pages branch
```

### Environment Variables for Production

Make sure to set environment variables in your hosting platform:

```env
VITE_API_URL=https://student-attendence-tracker.onrender.com/api/v1
VITE_SOCKET_URL=https://student-attendence-tracker.onrender.com
```

## 🤝 Integration with Backend

This frontend integrates with the Student Attendance Tracker backend API deployed on Render.

### Backend Information

- **Repository**: `../Backend/`
- **Production URL**: https://student-attendence-tracker.onrender.com
- **API Base**: https://student-attendence-tracker.onrender.com/api/v1
- **Technology**: Node.js + Express + MySQL

### API Endpoints Used

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/students` | GET, POST, PUT, DELETE | Student CRUD operations |
| `/attendance` | GET, POST | Attendance tracking |
| `/activities` | GET, POST, PUT, DELETE | Activity management |
| `/reports` | GET | Generate reports |
| `/streaks` | GET | Student streaks |

### CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:5173` (development)
- Your production frontend domain

## 📊 Performance Metrics

- **Build Time**: ~5-10 seconds
- **Bundle Size**: ~500KB (minified + gzipped)
- **First Paint**: <1 second
- **Time to Interactive**: <2 seconds
- **Lighthouse Score**: 90+

### Optimization Features

- **Tree Shaking**: Remove unused code
- **Code Splitting**: Route-based lazy loading
- **Asset Compression**: Gzip/Brotli compression
- **Image Optimization**: Lazy loading images
- **Caching Strategy**: Efficient browser caching

## 🐛 Troubleshooting

### Common Issues

**1. API Connection Errors**
```
Error: Network Error or CORS blocked
```
**Solution:**
- Verify backend is running and accessible
- Check CORS configuration in backend
- Confirm `VITE_API_URL` in `.env` is correct
- Check browser console for specific CORS errors

**2. Build Errors**
```
TypeScript compilation errors
```
**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run build
```

**3. Vite Development Server Issues**
```
Error: Port 5173 already in use
```
**Solution:**
```bash
# Use different port
npm run dev -- --port 3000

# Or kill existing process
# Windows: taskkill /F /IM node.exe
# Linux/Mac: killall node
```

**4. Environment Variables Not Loading**
```
API calls going to wrong URL
```
**Solution:**
- Restart dev server after changing `.env`
- Ensure `.env` file is in root directory
- Check variable name starts with `VITE_`
- Clear browser cache

**5. Activity Form Validation Errors**
```
400 Bad Request when submitting activity
```
**Solution:**
- Ensure all required fields are filled
- Activity type must be: academic, sports, cultural, or other
- Status must be: completed, pending, or cancelled
- Points must be between 0-1000
- Date must be in YYYY-MM-DD format

## 🔒 Security

- **Authentication**: JWT tokens with expiration
- **XSS Protection**: React's built-in XSS prevention
- **HTTPS**: All production API calls over HTTPS
- **Input Validation**: Client-side and server-side validation
- **Secure Storage**: Sensitive data in localStorage (consider httpOnly cookies for production)

## 📚 Learning Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Recharts Documentation](https://recharts.org/)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write clean, readable code
- Add comments for complex logic
- Test thoroughly before submitting PR
- Follow existing code style and structure

## 🙏 Acknowledgments

- Built with React 18 and TypeScript
- Styled with Tailwind CSS
- Icons by Lucide React
- Charts powered by Recharts
- Backend API deployed on Render

---

**Built with ❤️ by Kathir**

**Tech Stack**: React 18 | TypeScript | Vite | Tailwind CSS | Axios | Recharts