# Waymore Funnel Explorer

A comprehensive web application for analyzing user conversion funnels with advanced analytics, split testing capabilities, and multiple visualization types.

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **bun** package manager
- **Git**

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd waymore-funnel-explorer-main

# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
# or
bun dev
```

Navigate to `http://localhost:5173` to view the application.

## 📚 Documentation

This project includes comprehensive documentation organized in a structured format:

### 📖 [Documentation Index](docs/README.md)
Complete documentation hub with organized guides, API docs, and technical resources.

### 🎯 Quick Access
- **[Quick Start Guide](docs/guides/QUICK_START_GUIDE.md)** - Get up and running in 5 minutes
- **[Development Handover](docs/guides/DEVELOPMENT_HANDOVER.md)** - Complete project overview
- **[Component Architecture](docs/architecture/COMPONENT_ARCHITECTURE.md)** - Technical deep dive
- **[API Integration Guide](docs/api/API_INTEGRATION_GUIDE.md)** - External API integration

### 📁 Documentation Structure
```
docs/
├── guides/          # Getting started and user guides
├── api/            # API documentation and integration
├── architecture/   # Technical architecture
└── development/    # Development resources
```

[View full documentation structure →](docs/README.md)

## 🎯 Features

### Core Functionality
- **Funnel Creation & Management** - Create and edit conversion funnels with detailed step configurations
- **Advanced Analytics** - Real-time calculation of conversion rates, drop-off analysis, and performance metrics
- **Multiple Visualizations** - Sankey diagrams, step flow charts, and detailed analytics views
- **Split Testing Support** - A/B testing and multivariate testing capabilities
- **AI-Powered Features** - AI-assisted funnel generation and condition building
- **Responsive Design** - Mobile-friendly interface with modern UI/UX

### Visualization Types
- **Sankey Diagrams** - Interactive flow visualization with zoom and pan
- **Step Flow Charts** - Step-by-step conversion analysis
- **Drop-off Analysis** - Detailed performance insights and recommendations
- **Unified View** - Combined visualization dashboard

## 🛠 Technology Stack

### Frontend
- **React 18.3.1** - Modern React with hooks and functional components
- **TypeScript 5.5.3** - Type-safe development
- **Vite 5.4.1** - Fast build tool and development server

### UI/UX
- **shadcn/ui** - Modern component library built on Radix UI
- **Tailwind CSS 3.4.11** - Utility-first CSS framework
- **Framer Motion 12.12.1** - Animation library
- **Lucide React 0.462.0** - Icon library

### Data Visualization
- **D3.js 7.9.0** - Core visualization library
- **D3-Sankey 0.12.3** - Sankey diagram implementation
- **Recharts 2.12.7** - React charting library
- **Nivo 0.98.0** - React visualization components

### State Management
- **TanStack Query 5.56.2** - Server state management
- **React Hook Form 7.53.0** - Form handling
- **Zod 3.23.8** - Schema validation

## 📁 Project Structure

```
waymore-funnel-explorer-main/
├── src/
│   ├── components/                  # React components
│   │   ├── dashboard/              # Dashboard components
│   │   ├── funnel/                 # Funnel-specific components
│   │   │   ├── step-condition-builder/  # Condition building UI
│   │   │   ├── step-edit-sidebar/       # Step editing interface
│   │   │   └── visualizations/          # Visualization components
│   │   ├── layout/                 # Layout components
│   │   ├── navigation/             # Navigation components
│   │   └── ui/                     # Reusable UI components
│   ├── hooks/                      # Custom React hooks
│   ├── pages/                      # Page components
│   ├── services/                   # API and service layer
│   ├── types/                      # TypeScript type definitions
│   └── utils/                      # Utility functions
├── docs/                           # Documentation
│   ├── README.md                   # Documentation index
│   ├── guides/                     # Getting started guides
│   ├── api/                        # API documentation
│   ├── architecture/               # Technical architecture
│   └── development/                # Development resources
├── public/                         # Static assets
└── README.md                       # Project overview
```

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run build:dev    # Build for development
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Environment Variables
Create a `.env` file in the root directory:
```env
# API Configuration
VITE_API_KEY=your-api-key-here
VITE_API_BASE_URL=https://connect.waymore.io/api/v1

# Development Settings
VITE_API_DELAY_SAVE_MIN_MS=600
VITE_API_DELAY_SAVE_MAX_MS=1500
```

## 📊 Example Funnels

The application comes with 7 pre-configured example funnels:

1. **E-commerce Conversion Funnel** - Product discovery to purchase (7.56% conversion)
2. **SaaS Onboarding Funnel** - Landing page to subscription (3.13% conversion)
3. **Mobile App Engagement Funnel** - App store to monetization (2.35% conversion)
4. **Customer Support Funnel** - Support page to resolution (13.13% resolution)
5. **Content Marketing Funnel** - Content discovery to conversion (0.07% conversion)
6. **Product Purchase Dropoff Funnel** - Cart abandonment analysis
7. **B2B Lead Qualification Funnel** - Lead generation to qualification

## 🔌 API Integration

### Current State
The application currently uses a sophisticated mock API service that provides realistic data and comprehensive calculations.

### External API
The application is designed to integrate with the **Waymore External API**:
- **Funnel Calculation**: `POST /funnels/{funnelId}/calculate`
- **Events Catalog**: `GET /events`

See [API Integration Guide](API_INTEGRATION_GUIDE.md) for detailed integration instructions.

## 🧪 Testing

### Manual Testing Checklist
- [ ] Create a new funnel
- [ ] Add/remove funnel steps
- [ ] Configure step conditions
- [ ] View funnel analysis
- [ ] Test different visualizations
- [ ] Verify responsive design
- [ ] Check accessibility

### Automated Testing
```bash
# Unit tests (when implemented)
npm test

# E2E tests (when implemented)
npm run test:e2e
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deployment Options
- **Static Hosting**: Netlify, Vercel, GitHub Pages
- **Container Deployment**: Docker, Kubernetes
- **CDN Deployment**: Cloudflare, AWS CloudFront

## 🤝 Contributing

### Development Workflow
1. **Read Documentation**: Review the comprehensive documentation
2. **Set Up Environment**: Follow the quick start guide
3. **Make Changes**: Follow the component architecture guidelines
4. **Test Changes**: Use the testing checklist
5. **Submit Changes**: Create pull requests with proper documentation

### Code Standards
- **TypeScript**: Strict typing for all components
- **React**: Functional components with hooks
- **Styling**: Tailwind CSS with shadcn/ui components
- **Testing**: Comprehensive test coverage
- **Documentation**: Clear documentation and examples

## 📈 Roadmap

### Phase 1: Foundation (Current)
- ✅ Core funnel functionality
- ✅ Basic visualizations
- ✅ Mock API integration
- ✅ Responsive design

### Phase 2: Enhancement (Next 3 months)
- 🔄 Real API integration
- 🔄 Advanced analytics
- 🔄 Performance optimization
- 🔄 Enhanced visualizations

### Phase 3: Advanced Features (6-12 months)
- 📋 AI/ML integration
- 📋 Collaboration features
- 📋 Advanced testing capabilities
- 📋 Enterprise features

### Phase 4: Scale & Optimize (12+ months)
- 📋 Microservices architecture
- 📋 Advanced caching
- 📋 Global deployment
- 📋 Advanced security features

## 🆘 Support

### Documentation
- **[Documentation Index](docs/README.md)** - Complete documentation hub
- **[Quick Start Guide](docs/guides/QUICK_START_GUIDE.md)** - Get started quickly
- **[Development Handover](docs/guides/DEVELOPMENT_HANDOVER.md)** - Complete project overview
- **[Component Architecture](docs/architecture/COMPONENT_ARCHITECTURE.md)** - Component details
- **[API Integration](docs/api/API_INTEGRATION_GUIDE.md)** - API integration guide

### Resources
- **React Documentation**: https://react.dev/
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com/

### Issues
Create GitHub issues for:
- Bug reports
- Feature requests
- Documentation improvements
- Integration questions

## 📄 License

This project is proprietary software. All rights reserved.

---

**Built with ❤️ by the Waymore Team**
