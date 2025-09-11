# Tourism Platform

A full-stack tourism platform built with Node.js, Express, and vanilla JavaScript.

## Features

- User authentication and authorization
- Tour management and booking system
- Review system for tours
- Responsive web interface
- SQLite database integration

## Tech Stack

- **Backend**: Node.js, Express.js, SQLite3
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Authentication**: JWT, bcryptjs
- **Build Tool**: Vite

## Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)
- Git

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tourism-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   Edit `.env` with your configuration.

4. **Run the application**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000`

## Project Structure

```
├── server/          # Backend code
├── js/             # Frontend JavaScript
├── styles/         # CSS files
├── index.html      # Main HTML file
└── package.json    # Dependencies
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Environment Variables

Copy `env.example` to `.env` and configure:

```env
PORT=3000
JWT_SECRET=your_secret_key
DATABASE_URL=./server/database.sqlite
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request
