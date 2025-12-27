# 🌱 Antar - Habit Tracking & Self-Discovery

> *"Antar" is Sanskrit for "within" or "inner"*

A minimalist yet powerful habit tracking application focused on self-discovery through consistent practice. Build better habits, track your progress, and grow your inner self with Antar.

![Antar Logo](public/logo-antar.png)

## ✨ Features

### 🎯 Core Functionality
- **Smart Habit Tracking** - Create and manage habits with flexible frequency options (daily, weekly, specific days)
- **Visual Progress** - GitHub-style calendar heatmap to visualize your consistency
- **Streak Tracking** - Build and maintain streaks with automatic calculation
- **Time-of-Day Insights** - Discover your optimal times for habit completion

### 🎮 Gamification
- **XP & Leveling System** - Earn experience points and level up as you complete habits
- **Achievement System** - Unlock badges for milestones and consistency
- **Pet Companion** - Watch your Antar companion grow from seed to forest as you build habits
- **Streak Freezes** - Preserve your streaks when life gets in the way

### 📊 Analytics & Insights
- **Comprehensive Dashboard** - View your completion rates, active streaks, and XP at a glance
- **Detailed Analytics** - Track trends, category breakdowns, and time patterns
- **Mood & Energy Correlation** - Understand how your state affects habit completion
- **Performance Insights** - AI-powered recommendations based on your patterns

### 🎨 Beautiful UI
- **Material Design 3** - Modern, clean interface inspired by Google's Material Design
- **Dark/Light Mode** - Seamless theme switching with system preference support
- **Smooth Animations** - Delightful micro-interactions powered by Framer Motion
- **Fully Responsive** - Optimized for mobile, tablet, and desktop

### 👥 Social Features
- **Accountability Partners** - Connect with friends for mutual support
- **Shared Visibility** - Choose which habits to share with your partners
- **Encouragement System** - Send reactions and support to your partners

### 📚 Templates & Routines
- **Pre-built Templates** - Start with proven habit routines (Morning Energizer, Evening Wind-Down, etc.)
- **Custom Templates** - Save and share your own habit combinations
- **Habit Stacking** - Chain habits together for powerful routines

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: Shadcn/UI, Radix UI
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **State Management**: Zustand + React Query
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and Yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Antar
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**
   - Run the SQL schema from `scripts/001_create_schema.sql` in your Supabase SQL Editor
   - Run `scripts/002_create_profile_trigger.sql` to enable automatic profile creation
   - Run `scripts/003_fix_rls_policies.sql` to configure Row Level Security

5. **Run the development server**
   ```bash
   yarn dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Philosophy

Antar is more than a habit tracker—it's a tool for self-discovery. Every habit you track is a mirror reflecting your commitment to growth. The app encourages:

- **Consistency over perfection** - Small daily actions compound into significant change
- **Self-awareness** - Track not just what you do, but how you feel
- **Gentle progress** - Celebrate every step forward, no matter how small
- **Inner growth** - Build habits that align with your values and goals

## 🎯 Key Differentiators

- **Philosophy-grounded** - Built on principles of mindfulness and self-discovery
- **Gamification done right** - Motivating without being childish
- **Data-driven insights** - Understand your patterns and optimize your routine
- **Privacy-first** - Your data stays yours, with optional social features
- **Beautiful UX** - Thoughtful animations and micro-interactions throughout

## 📱 Mobile Support

Antar is fully responsive and optimized for mobile devices:
- Touch-friendly interface
- Swipe gestures for quick actions
- Mobile-optimized forms and inputs
- Progressive Web App (PWA) ready

## 🔒 Security

- Row Level Security (RLS) policies on all database tables
- Input sanitization to prevent XSS attacks
- Secure authentication via Supabase Auth
- No sensitive data logging
- Environment variables properly secured

## 🎨 Design System

Built with Material Design 3 principles:
- **Primary Color**: Material Blue 600
- **Secondary Color**: Material Indigo
- **Accent Color**: Material Purple
- **Typography**: Inter (headings), JetBrains Mono (stats)
- **Spacing**: 8px grid system
- **Border Radius**: 12px for cards, 8px for buttons

## 📝 License

This project is private and proprietary.

## 👨‍💻 Creator

**Pranshu Rastogi**

Built with ❤️ for personal growth and self-discovery.

---

**Start your journey today. Every habit is a step toward the person you want to become.** 🌱

