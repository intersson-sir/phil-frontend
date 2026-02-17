# Phil Frontend - Negative Link Tracker CRM

Internal CRM system for tracking and managing negative links across social media platforms.

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

```bash
# Clone the repository (when backend is ready)
# git clone <repository-url>
# cd phil-frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
phil-frontend/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout with dark theme
│   ├── page.tsx             # Dashboard page
│   ├── platform/
│   │   └── [slug]/
│   │       └── page.tsx     # Dynamic platform page
│   └── globals.css          # Global styles and theme
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── dashboard/           # Dashboard-specific components
│   ├── platform/            # Platform page components
│   ├── layout/              # Layout components (Header)
│   └── shared/              # Reusable components (badges, icons)
├── lib/
│   ├── api/                 # API layer
│   │   ├── config.ts        # API configuration
│   │   ├── mock-data.ts     # Mock data generator
│   │   ├── links.ts         # Links CRUD operations
│   │   └── stats.ts         # Statistics API
│   ├── utils/               # Utility functions
│   └── constants.ts         # App constants
├── types/                   # TypeScript type definitions
├── hooks/                   # Custom React hooks
└── public/                  # Static assets
```

## 🎨 Features

### MVP Features (Implemented)

- ✅ **Dashboard** - Overview with statistics and platform cards
- ✅ **Platform Pages** - Detailed view for each platform (Facebook, Twitter/X, YouTube, Reddit, Other)
- ✅ **Links Table** - Full-featured table with sorting and actions (Desktop)
- ✅ **Link Cards** - Mobile-optimized card view
- ✅ **Filters** - Filter by status, priority, manager, date range, and search
- ✅ **Bulk Actions** - Mass update status and assign managers
- ✅ **CRUD Operations** - Create, read, update, and delete links
- ✅ **Activity Chart** - 30-day activity timeline
- ✅ **Dark Theme** - OSINT-style dark theme with red accents
- ✅ **Responsive Design** - Fully responsive mobile and desktop layouts

### Data Model

```typescript
interface NegativeLink {
  id: string;
  url: string;
  platform: 'facebook' | 'twitter' | 'youtube' | 'reddit' | 'other';
  type: 'post' | 'comment' | 'video' | 'article';
  status: 'active' | 'removed' | 'in_work' | 'pending';
  detected_at: string;
  removed_at?: string;
  priority: 'low' | 'medium' | 'high';
  manager?: string;
  notes?: string;
}
```

## 🔌 Backend Integration

### Current State: Mock API

The application currently uses **mock data** stored in memory. All API calls are simulated with realistic delays.

### Switching to Real Backend

To connect to Django REST Framework backend:

1. **Set environment variables** (create `.env.local`):

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_USE_MOCK=false
```

2. **Uncomment API calls** in `lib/api/*.ts`:

The codebase is structured so that each API function has:
- Mock implementation (currently active)
- Real API implementation (commented out with TODO markers)

Example from `lib/api/links.ts`:

```typescript
export async function getLinks(filters?: FilterParams): Promise<NegativeLink[]> {
  if (USE_MOCK) {
    // Mock implementation...
  }

  // TODO: Uncomment when backend is ready
  // const response = await fetch(`${API_BASE_URL}/api/links/`, {
  //   method: 'GET',
  //   headers: { 'Content-Type': 'application/json' },
  // });
  // return response.json();
}
```

3. **Expected Django REST API Endpoints**:

```
GET    /api/links/                    # List links with filters
GET    /api/links/:id/                # Get single link
POST   /api/links/                    # Create new link
PATCH  /api/links/:id/                # Update link
DELETE /api/links/:id/                # Delete link
POST   /api/links/bulk-update-status/ # Bulk status update
POST   /api/links/bulk-assign-manager/# Bulk manager assignment
GET    /api/stats/dashboard/          # Dashboard statistics
GET    /api/stats/platform/:platform/ # Platform statistics
```

## 🎨 Design System

### Color Scheme

- **Background**: Almost black (`oklch(0.08 0 0)`)
- **Cards**: Dark gray (`oklch(0.12 0 0)`)
- **Primary/Accents**: Red (`oklch(0.55 0.22 27.3)`)
- **Text**: Light (`oklch(0.98 0 0)`)

### Status Colors

- **Active**: Red (urgent attention needed)
- **Removed**: Gray (archived)
- **In Work**: Yellow (in progress)
- **Pending**: Blue (needs review)

### Priority Colors

- **High**: Red
- **Medium**: Orange
- **Low**: Green

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Library**: shadcn/ui
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Mobile Adaptations

- Tables transform into cards
- Filters open in bottom sheet/drawer
- Simplified navigation
- Touch-optimized interactions

## 🐳 Docker Support (Future)

When backend is ready, the project can be containerized:

```dockerfile
# Example Dockerfile structure
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Docker Compose integration:

```yaml
services:
  frontend:
    build: ./phil-frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
      - NEXT_PUBLIC_USE_MOCK=false
    depends_on:
      - backend
```

## 📝 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Adding New Platforms

1. Add platform to `types/index.ts`:
```typescript
export type Platform = 'facebook' | 'twitter' | 'youtube' | 'reddit' | 'other' | 'newplatform';
```

2. Add platform config in `lib/constants.ts`:
```typescript
{ value: 'newplatform', label: 'New Platform', icon: 'icon-name' }
```

3. Add icon mapping in `components/shared/platform-icon.tsx`

### Customizing Theme

Edit CSS variables in `app/globals.css`:

```css
.dark {
  --background: oklch(0.08 0 0);
  --primary: oklch(0.55 0.22 27.3);
  /* ... */
}
```

## 🔒 Security Notes

- Never commit `.env.local` with real credentials
- Mock data is for development only
- Implement authentication when connecting to real backend
- Use HTTPS in production
- Sanitize user inputs

## 📄 License

Internal use only. All rights reserved.

## 🤝 Contributing

This is an internal project. For questions or improvements, contact the development team.

---

**Current Status**: ✅ MVP Complete - Ready for Backend Integration

**Next Steps**:
1. Backend API implementation (Django REST Framework)
2. Authentication & authorization
3. Real-time updates (WebSocket)
4. Advanced filtering and search
5. Export functionality (CSV, PDF)
6. Notifications system
