# Cleaning App Frontend - Angular

Complete Angular frontend application for the professional cleaning management system.

## Features

- **Authentication**: Login with worker name and code
- **Work Tracking**: Start/stop work sessions with timer
- **Apartment Selection**: Select apartments with visual grid
- **Task Management**: Interactive checklist with progress tracking
- **Inventory Logging**: Track cleaning supplies usage
- **Issue Reporting**: Report maintenance issues with image upload
- **Work Summary**: View detailed work session summaries
- **Multi-language**: Hebrew/English with RTL support
- **Mobile-first**: Responsive design optimized for mobile devices

## Tech Stack

- Angular 19.x (Standalone Components)
- TypeScript 5.7.x
- RxJS for reactive programming
- Functional route guards and HTTP interceptors
- LocalStorage for token management

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── login/              # Login component
│   │   ├── main/               # Main dashboard
│   │   ├── apartment-selection/ # Apartment grid selector
│   │   ├── work-tracking/       # Work timer and controls
│   │   ├── task-checklist/      # Task list with inventory
│   │   ├── inventory/           # Inventory logs
│   │   ├── issues/              # Issue reporting
│   │   └── summary/             # Work summary
│   ├── guards/
│   │   └── auth.guard.ts       # Route protection
│   ├── interceptors/
│   │   └── auth.interceptor.ts # JWT token injection
│   ├── models/
│   │   └── types.ts            # TypeScript interfaces
│   ├── services/
│   │   ├── api.service.ts      # HTTP API calls
│   │   ├── auth.service.ts     # Authentication
│   │   ├── work.service.ts     # Work session management
│   │   └── translation.service.ts # i18n
│   ├── app.component.ts
│   ├── app.config.ts
│   └── app.routes.ts
├── index.html
├── main.ts
└── styles.css                  # Global styles from original HTML
```

## Installation

1. Install dependencies:
```bash
npm install
```

## Development Server

Run the development server:
```bash
npm start
```

Navigate to `http://localhost:4200/`

## API Configuration

The app connects to the Next.js backend at `http://localhost:3001/api`

To change the API URL, edit `src/app/services/api.service.ts`:
```typescript
private baseUrl = 'http://localhost:3001/api';
```

## Build

Build for production:
```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Key Features Implementation

### Authentication Flow
1. User enters name and code
2. API validates and returns JWT token
3. Token stored in localStorage
4. HTTP interceptor adds token to all requests
5. Auth guard protects main routes

### Work Session Management
1. Select apartment from grid
2. Request geolocation (optional)
3. Start work session - timer begins
4. Complete tasks with inventory tracking
5. End work session - navigate to summary

### Task Checklist
- Grouped by categories (Living room, Kitchen, Bathroom, Bedroom)
- Checkbox to mark completion
- Expandable inventory logging for tasks
- Progress bar showing completion percentage
- Real-time updates

### Inventory Tracking
- Track usage per task
- Record quantity and unit
- Low stock warnings
- Complete usage history

### Issue Reporting
- Select category (maintenance, cleaning, supplies, safety, other)
- Text description
- Image upload with preview
- Associated with current work session

### Summary View
- Worker and apartment info
- Start/end time and duration
- Tasks completed percentage
- Inventory used
- Issues reported
- Clean work indicator

## Styling

The app uses the exact CSS from the original HTML file:
- Purple/gradient color scheme
- RTL support for Hebrew
- Mobile-first responsive design
- Smooth animations and transitions
- Touch-optimized buttons and inputs

## Language Support

Toggle between Hebrew (RTL) and English (LTR):
- Click language toggle button in header
- Direction and content automatically update
- Preference saved to localStorage

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- PWA-ready structure

## Future Enhancements

- Offline support with Service Worker
- Push notifications for reminders
- Advanced analytics dashboard
- Export reports to PDF
- Photo compression before upload
- Signature capture for work completion

## License

ISC
