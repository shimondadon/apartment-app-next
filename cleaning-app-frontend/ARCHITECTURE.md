# Component Architecture & Data Flow

## 🏗️ Component Tree

```
app-root (AppComponent)
└── router-outlet
    ├── app-login (LoginComponent)
    │   ├── LoginForm (ReactiveFormsModule)
    │   └── Language Toggle
    │
    └── app-main (MainComponent)
        ├── Header
        │   ├── Title
        │   ├── Worker Name
        │   └── Language Toggle
        │
        └── Tab Navigation
            ├── Work Tab
            │   └── app-work-tracking
            │       ├── Status Badge
            │       ├── Timer Display
            │       ├── app-apartment-selection
            │       │   └── Apartment Grid
            │       └── app-task-checklist
            │           ├── Progress Bar
            │           └── Category > Tasks
            │               └── Inventory Form
            │
            ├── Inventory Tab
            │   └── app-inventory
            │       ├── Inventory Log
            │       └── Low Stock Warnings
            │
            ├── Issues Tab
            │   └── app-issues
            │       ├── Category Selector
            │       ├── Description Input
            │       └── Image Upload
            │
            └── Summary Tab
                └── app-summary
                    ├── Session Details
                    ├── Tasks Completed
                    ├── Inventory Used
                    └── Issues Reported
```

## 🔄 Data Flow

### Authentication Flow
```
User Input → LoginComponent
    ↓
AuthService.login()
    ↓
ApiService.post('/auth/login')
    ↓
JWT Token Response
    ↓
AuthService stores token → localStorage
    ↓
Router.navigate(['/main'])
    ↓
AuthGuard checks token → Allow access
```

### Work Session Flow
```
Select Apartment → ApartmentSelectionComponent
    ↓
Click "Start Work" → WorkTrackingComponent
    ↓
Request Geolocation → WorkService
    ↓
WorkService.startWork()
    ↓
ApiService.post('/work/start')
    ↓
WorkSession Created
    ↓
WorkService.currentSession$ (BehaviorSubject)
    ├→ Timer starts
    ├→ TaskChecklistComponent subscribes
    └→ UI updates
```

### Task Completion Flow
```
Check Task → TaskChecklistComponent
    ↓
task.completed = true
    ↓
If hasInventory → Expand inventory form
    ↓
Fill inventory details
    ↓
Click "Save" → completeTask()
    ↓
ApiService.post('/tasks/complete')
    ↓
Update local state
    ↓
Progress bar updates
```

### Issue Reporting Flow
```
Select Category → IssuesComponent
    ↓
Write Description
    ↓
Upload Images (optional)
    ↓
Click "Submit" → submitIssue()
    ↓
Create FormData with files
    ↓
ApiService.post('/issues/report')
    ↓
Success → Reset form
```

## 📡 Service Architecture

### ApiService (HTTP Layer)
```typescript
ApiService
├── login(credentials)
├── getApartments()
├── startWork(request)
├── endWork(sessionId)
├── getCurrentSession(workerId)
├── getTasks()
├── completeTask(request)
├── reportIssue(formData)
└── getSummary(sessionId)
```

### AuthService (Authentication)
```typescript
AuthService
├── currentWorker$: BehaviorSubject<Worker | null>
├── login(credentials)
├── logout()
├── getToken()
├── setToken(token)
├── getCurrentWorker()
└── isAuthenticated()
```

### WorkService (Session Management)
```typescript
WorkService
├── currentSession$: BehaviorSubject<WorkSession | null>
├── timer$: BehaviorSubject<number>
├── startWork(request)
├── endWork(sessionId)
├── loadCurrentSession(workerId)
├── formatTime(seconds)
└── requestLocation()
```

### TranslationService (i18n)
```typescript
TranslationService
├── currentLanguage$: BehaviorSubject<Language>
├── translations: Map<key, {he, en}>
├── toggleLanguage()
├── setLanguage(language)
└── translate(key)
```

## 🔒 Security Layer

### HTTP Interceptor Flow
```
Component makes HTTP request
    ↓
AuthInterceptor intercepts
    ↓
Check for token in AuthService
    ↓
If token exists:
    Add Authorization: Bearer <token>
    ↓
Forward request to API
    ↓
Response returns
    ↓
Component receives response
```

### Route Guard Flow
```
User navigates to /main
    ↓
AuthGuard.canActivate()
    ↓
Check AuthService.isAuthenticated()
    ↓
If authenticated:
    return true → Allow navigation
If not authenticated:
    Router.navigate(['/login']) → Redirect
```

## 🎨 State Management

### Component State
Each component manages its own local state:
- Form inputs (reactive forms)
- UI toggles (expanded tasks, etc.)
- Loading indicators

### Shared State (Services)
Global state shared via services:
- **AuthService**: Current worker, authentication status
- **WorkService**: Current session, timer
- **TranslationService**: Current language

### State Persistence
LocalStorage used for:
- JWT token (`cleaning_app_token`)
- Worker data (`cleaning_app_worker`)
- Language preference (`app_language`)

## 📱 Responsive Behavior

### Mobile-First Approach
```css
/* Base styles for mobile */
.container { max-width: 600px; }
.apartment-grid { grid-template-columns: 1fr 1fr; }

/* Tablet and up */
@media (min-width: 768px) {
  .apartment-grid { grid-template-columns: repeat(3, 1fr); }
}
```

### Touch Optimization
- Large tap targets (44px minimum)
- Active states for visual feedback
- No hover effects (mobile-friendly)
- Optimized form inputs for mobile keyboards

## 🌍 RTL/LTR Support

### Dynamic Direction
```typescript
// TranslationService
private applyDirection(direction: 'rtl' | 'ltr'): void {
  document.documentElement.setAttribute('dir', direction);
  document.documentElement.setAttribute('lang', direction === 'rtl' ? 'he' : 'en');
}
```

### CSS Direction-Aware
```css
[dir="rtl"] .task-item.has-inventory {
  border-right-width: 6px;
}

[dir="ltr"] .task-item.has-inventory {
  border-left-width: 6px;
}
```

## 🔄 Reactive Programming

### Observable Patterns
```typescript
// Service exposes BehaviorSubject as Observable
public currentSession$ = this.currentSessionSubject.asObservable();

// Component subscribes
this.workService.currentSession$.subscribe(session => {
  this.currentSession = session;
});

// Service updates value
this.currentSessionSubject.next(newSession);
// → All subscribers notified automatically
```

## 📊 Performance Considerations

### Standalone Components
- Tree-shakable
- Lazy-loadable
- No NgModule overhead

### Change Detection
- OnPush strategy where applicable
- Unsubscribe on component destroy
- Minimal DOM manipulation

### Asset Optimization
- CSS in single file (no component CSS)
- Minimal external dependencies
- Optimized build for production

---

**Architecture**: Modern Angular (Standalone Components)
**State Management**: Service-based with RxJS
**Styling**: Global CSS with CSS Variables
**i18n**: Service-based translation
