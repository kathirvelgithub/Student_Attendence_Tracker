# Student Activity & Attendance Tracker - Frontend

A modern React frontend application for managing student records, tracking attendance, and logging activities in educational institutions.

## 🚀 Features

- **Dashboard**: Comprehensive overview with statistics, charts, and recent activities
- **Student Management**: Complete CRUD operations for student records
- **Attendance Tracking**: Daily attendance marking with visual interface
- **Activity Logging**: Record and manage student participation in various activities
- **Reports & Analytics**: Detailed reports with data visualization
- **Rankings & Leaderboards**: Student performance rankings and achievements
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI/UX**: Clean, intuitive interface built with Tailwind CSS

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
- Backend API running on http://localhost:3000

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
   VITE_API_URL=http://localhost:3000/api/v1
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

### API Integration
The frontend communicates with the backend API through the service layer. All API endpoints are defined in `src/services/index.ts`.

### Environment Variables
- `VITE_API_URL`: Backend API base URL (default: http://localhost:3000/api/v1)

### Authentication
The application uses JWT token-based authentication stored in localStorage.

**Demo Credentials:**
- Username: `admin`
- Password: `admin123`

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: Full feature set with sidebar navigation
- **Tablet**: Responsive layout with collapsible sidebar
- **Mobile**: Touch-friendly interface with mobile navigation

## 🎯 Features Overview

### Completed Features
- ✅ User authentication and authorization
- ✅ Responsive layout with navigation
- ✅ Dashboard with statistics and charts
- ✅ Student management (CRUD operations)
- ✅ Attendance tracking interface
- ✅ Activity logging and management
- ✅ Reports with data visualization
- ✅ Rankings and leaderboards
- ✅ Modern UI with Tailwind CSS

### Future Enhancements
- 🔄 Real-time updates with WebSockets
- 📱 Progressive Web App (PWA) features
- 🔔 Push notifications
- 📊 Advanced analytics
- 🎨 Theme customization
- 🌐 Internationalization (i18n)

## 🧪 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style
- **TypeScript**: Strongly typed for better development experience
- **ESLint**: Code linting and formatting
- **Component Structure**: Functional components with hooks
- **CSS**: Tailwind CSS for styling

## 🤝 Integration with Backend

This frontend is designed to work with the Student Attendance Tracker backend API. Make sure the backend server is running before starting the frontend development server.

**Backend Repository**: `../Backend/`
**API Documentation**: Available at backend `/api/docs` endpoint

## 📊 Performance

- **Fast Development**: Vite's hot module replacement (HMR)
- **Optimized Build**: Tree-shaking and code splitting
- **Lazy Loading**: Route-based code splitting
- **Caching**: Efficient asset caching strategies

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Issues**
   - Ensure backend server is running on port 3000
   - Check CORS configuration in backend
   - Verify API_URL in .env file

2. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
   - Check TypeScript errors: `npm run build`

3. **Development Server Issues**
   - Clear Vite cache: `rm -rf node_modules/.vite`
   - Restart development server

## 📄 License

MIT License - see LICENSE file for details

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**