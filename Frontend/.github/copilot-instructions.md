# Student Activity & Attendance Tracker - Frontend

## Project Overview
React frontend application for Student Activity & Attendance Tracker system. Built with Vite, TypeScript, and modern React practices.

## Deployment Information
- **Frontend:** Vercel
- **Backend:** Render (https://student-attendence-tracker.onrender.com)
- **Database:** Railway (MySQL)

## Checklist Progress
- [x] Verify that the copilot-instructions.md file in the .github directory is created.
- [x] Clarify Project Requirements - React frontend with TypeScript for Student Attendance Tracker
- [x] Scaffold the Project - Created React app with Vite, TypeScript, and Tailwind CSS
- [x] Customize the Project - Added complete application structure with all components and pages
- [x] Install Required Extensions - No specific extensions required
- [x] Compile the Project - Successfully built without errors
- [x] Create and Run Task - Development server task created and running
- [x] Launch the Project - Application running at http://localhost:5173/
- [x] Ensure Documentation is Complete - README and project documentation updated
- [x] Deploy Frontend to Vercel - Configured with proper build settings
- [x] Configure Backend on Render - CORS configured for Vercel domain
- [x] Database on Railway - MySQL configured and connected

## Project Requirements
- React with TypeScript
- Student management interface
- Attendance tracking system
- Activity logging
- Reports and analytics dashboard
- Authentication system
- Responsive design
- Integration with Node.js/Express/MySQL backend API

## Backend API Integration
- **Production URL:** https://student-attendence-tracker.onrender.com/api/v1
- **Development URL:** http://localhost:3000/api/v1
- **Endpoints:** /students, /attendance, /activities, /reports
- **Authentication:** JWT tokens
- **CORS:** Enabled for Vercel domain

## Environment Variables
Required environment variables for Vercel deployment:
```env
VITE_API_URL=https://student-attendence-tracker.onrender.com/api/v1
VITE_SOCKET_URL=https://student-attendence-tracker.onrender.com
```

## Vercel Deployment Settings
- **Framework Preset:** Vite
- **Build Command:** npm run build
- **Output Directory:** dist
- **Install Command:** npm install
- **Node Version:** 18.x