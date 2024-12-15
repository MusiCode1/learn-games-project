# ארכיטקטורת הפרויקט

## היררכיית קומפוננטות 🌳

```
App
├── Layout/
│   ├── Header
│   │   ├── Navigation
│   │   │   ├── NavigationItem[]
│   │   │   └── SearchBar
│   │   └── UserMenu
│   │       ├── UserProfile
│   │       └── Settings
│   └── Footer
├── Main Content/
│   ├── Dashboard
│   │   ├── StatisticsPanel
│   │   ├── ActivityFeed
│   │   └── Notifications
│   └── Sidebar
│       ├── FilterPanel
│       └── QuickActions
└── Pages/
    ├── HomePage
    ├── AnalyticsPage
    └── SettingsPage
```

## זרימת מידע 🔄

### State Management
```
Redux Store
├── Authentication/
│   ├── State: { user, isAuthenticated, token }
│   └── Actions:
│       ├── LOGIN_REQUEST
│       ├── LOGIN_SUCCESS
│       ├── LOGIN_FAILURE
│       └── LOGOUT
│
├── UI/
│   ├── State: { theme, sidebarOpen, currentPage }
│   └── Actions:
│       ├── TOGGLE_THEME
│       ├── TOGGLE_SIDEBAR
│       └── SET_CURRENT_PAGE
│
└── Data/
    ├── State: { items, loading, error }
    └── Actions:
        ├── FETCH_ITEMS
        ├── ADD_ITEM
        └── UPDATE_ITEM
```

## זרימת מידע בין קומפוננטות 📲

### Header
- ⬇️ מקבל מידע על המשתמש מ-Redux (authentication state)
- ⬆️ שולח פעולות ניווט ל-Redux (UI state)
- ⬅️ מעביר props לקומפוננטות Navigation ו-UserMenu

### Dashboard
- ⬇️ מקבל נתונים סטטיסטיים מהשרת דרך Redux
- ⬆️ מעדכן את המצב הגלובלי בעת שינויים
- ➡️ מזרים מידע לקומפוננטות משנה (StatisticsPanel, ActivityFeed)

### FilterPanel
- ⬆️ שולח עדכוני פילטרים ל-Redux
- ⬇️ מקבל את מצב הפילטרים הנוכחי
- ➡️ משפיע על תצוגת הנתונים ב-Dashboard

## API Endpoints 🌐

```
/api
├── /auth
│   ├── POST /login
│   ├── POST /logout
│   └── GET /me
│
├── /data
│   ├── GET /items
│   ├── POST /items
│   └── PUT /items/:id
│
└── /settings
    ├── GET /user-settings
    └── PUT /user-settings
```

## תהליכים עיקריים 🔄

1. **תהליך התחברות**:
   ```
   UserMenu -> LOGIN_REQUEST -> API -> LOGIN_SUCCESS -> App (re-render)
   ```

2. **עדכון נתונים**:
   ```
   Dashboard -> FETCH_ITEMS -> API -> UPDATE_STATE -> Components Update
   ```

3. **שינוי הגדרות**:
   ```
   Settings -> UPDATE_SETTINGS -> API -> Update Redux -> Reflect Changes
   ```

## שימוש בקומפוננטות 🔧

### NavigationItem
```typescript
<NavigationItem 
  to="/path"
  icon="icon-name"
  label="תווית"
  onClick={() => {}}
/>
```

### StatisticsPanel
```typescript
<StatisticsPanel
  data={statsData}
  period="daily"
  onRefresh={() => {}}
/>
```

## מדריך לפיתוח 📝

1. כל קומפוננטה חדשה צריכה:
   - להיות ממוקמת בתיקייה המתאימה
   - לכלול תיעוד PropTypes/TypeScript
   - להשתמש ב-Hooks הרלוונטיים
   - לעקוב אחר עקרונות ה-Design System

2. ניהול State:
   - השתמש ב-Redux לstate גלובלי
   - השתמש ב-React.useState לstate מקומי
   - הימנע מ-prop drilling

3. Performance:
   - השתמש ב-React.memo לקומפוננטות כבדות
   - יישם code splitting בעזרת React.lazy
   - אופטימיזציה של re-renders

## הערות נוספות 📌

- כל שינוי בארכיטקטורה דורש עדכון של מסמך זה
- יש לעקוב אחר הנחיות ה-Code Review
- מומלץ להשתמש בכלי התיעוד האוטומטיים