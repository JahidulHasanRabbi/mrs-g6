# Project Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm (comes with Node.js)
- Git

## 1. Clone the Repository

```bash
git clone <repository-url>
cd mrs-g6
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Environment Setup

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Or create it manually with the following content:

```env
# API Configuration
BASEURL=https://staging-api.kinggroup44.com

# Authentication Configuration
AUTHGUARD=false
REDIRECTURL=https://example.com/login

# Social Media URLs
FACEBOOK_URL=https://facebook.com/
YOUTUBE_URL=https://youtube.com/
INSTAGRAM_URL=https://instagram.com/
TWITTER_URL=https://twitter.com/
```

### Environment Variables Explained

- `BASEURL`: Backend API endpoint
- `AUTHGUARD`: Enable/disable authentication guard (true/false)
- `REDIRECTURL`: URL to redirect when authentication fails
- `NEXT_PUBLIC_*`: Public URLs for social media links

## 4. Run the Development Server

```bash
npm run dev
```

The application will be available at:
- Local: http://localhost:3000
- Network: http://192.168.0.130:3000 (or your local IP)

## 5. Build for Production

```bash
npm run build
```

## 6. Start Production Server

```bash
npm start
```

## Project Structure

```
mrs-g6/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin panel pages
│   ├── api/               # API client and utilities
│   ├── components/        # React components
│   ├── contexts/          # React contexts
│   └── ...
├── public/                # Static assets
├── .env.local            # Environment variables (create this)
├── next.config.js        # Next.js configuration
└── package.json          # Dependencies
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, you can specify a different port:

```bash
PORT=3001 npm run dev
```

### Clear Cache

If you encounter build issues, try clearing the cache:

```bash
rm -rf .next
npm run build
```

### Module Not Found Errors

If you see module resolution errors:

1. Delete `node_modules` and reinstall:
```bash
rm -rf node_modules
npm install
```

2. Clear Next.js cache:
```bash
rm -rf .next
```

## API Documentation

API documentation is available in `postman/API Documentation for MRS - G6.md`

## Authentication

### Member Authentication

Access the member area by navigating to:
```
http://localhost:3000/auth?id=<member_id>&o=<token>
```

### Admin Authentication

Access the admin panel at:
```
http://localhost:3000/admin/login
```

## Features

- Member Portal (Home, Profile, Lucky Spin, Mart, VIP Details)
- Admin Panel (Dashboard, Lucky Spin Management, Redemption Mall, VIP Tiers)
- Authentication & Authorization
- Token-based API integration
- Responsive design

## Support

For issues or questions, please refer to the API documentation or contact the development team.
