# 🚀 API Playground

A beautiful, modern web app for testing REST APIs with shareable links and request history. Built with Next.js, Tailwind CSS, and shadcn/ui.

![API Playground](https://img.shields.io/badge/Status-MVP%20Complete-green)

## ✨ Features

### 🎯 Core MVP Features
- **🔧 API Request Panel**: Test any public REST API with full control over:
  - HTTP methods (GET, POST, PUT, PATCH, DELETE, etc.)
  - Request URL and headers
  - Request body (JSON, XML, text)
- **📊 Response Panel**: View formatted responses with:
  - Status codes with color coding
  - Response headers
  - JSON formatting
  - Response time and size metrics
  - Copy and download functionality
- **🔗 Shareable Links**: Generate shareable URLs that include complete request configuration
- **📚 Request History**: Local storage of last 10 requests with ability to reload any previous request
- **🌙 Dark Mode**: Toggle between light and dark themes
- **📱 Responsive Design**: Works great on desktop and mobile

### 🎨 UI/UX
- **Modern Design**: Clean, minimal interface inspired by Postman
- **Fast Performance**: Built on Next.js 15 with optimized components
- **Beautiful Components**: Using shadcn/ui for consistent, accessible design
- **Smooth Interactions**: Hover states, transitions, and loading indicators

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** and visit `http://localhost:3001` (or the port shown in terminal)

## 🏗️ Project Structure

```
api-playground/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.jsx            # Main playground page
│   │   ├── layout.jsx          # Root layout
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── playground/         # Core playground components
│   │   │   ├── Playground.jsx  # Main playground container
│   │   │   ├── RequestPanel.jsx
│   │   │   ├── ResponsePanel.jsx
│   │   │   └── HistoryPanel.jsx
│   │   ├── ui/                 # shadcn/ui components
│   │   └── layout/
│   │       └── ThemeToggle.jsx
│   ├── lib/
│   │   ├── share-encoding.js   # URL encoding/decoding
│   │   ├── storage.js          # localStorage wrapper
│   │   └── utils.js           # Utility functions
│   └── styles/
└── public/
```

## 🎯 How to Use

### Making Requests
1. **Select HTTP Method**: Choose from GET, POST, PUT, PATCH, DELETE, etc.
2. **Enter URL**: Type the API endpoint you want to test
3. **Add Headers** (optional): Click the Headers tab to add custom headers
4. **Add Body** (optional): For POST/PUT requests, add your request body
5. **Send Request**: Click the Send button to execute

### Sharing Requests
1. Configure your request
2. Click the **Share** button in the header
3. Copy the generated URL
4. Share with others - they'll see your exact request configuration

### Using History
1. Click the **History** button to open the history panel
2. See your last 10 requests with status codes and timestamps
3. Click the reload icon to restore any previous request
4. Use the trash icon to remove individual items or clear all history

## 🔧 Tech Stack

- **Frontend**: Next.js 15, React 19
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Language**: JavaScript (for faster development)

## 🚀 Deployment

This project is ready to deploy on:

### Vercel (Recommended)
```bash
npm run build
# Deploy to Vercel
```

### Other Platforms
```bash
npm run build
npm start
```

## 🛣️ Roadmap (V1+)

- [ ] **GraphQL Support**: Query editor with variables
- [ ] **Authentication**: User accounts and private playgrounds
- [ ] **Collections**: Save and organize API requests
- [ ] **Documentation Generator**: Auto-generate API docs from saved requests
- [ ] **Templates**: Pre-built request templates for popular APIs
- [ ] **Environments**: Variable management for different environments
- [ ] **Team Collaboration**: Share collections with team members

## Roadmap (V2)
- [ ] **Generated DOCS design by AI**: Create your own documentation page with whatever design you have from AI with your request collections

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

<!-- 
Generated docs design reference:
  - https://clerk.com/docs/reference/nextjs/overview
 -->