# Overview

This is a Japanese condominium management regulation AI system designed for property management companies. The application helps automate the process of analyzing meeting minutes, extracting decisions, and generating regulation amendments using OCR technology and AI analysis. The system provides a complete workflow from document upload to final regulation output, with a focus on legal compliance and standardized regulation management.

## Recent Changes (2025-08-18)

✓ **CRITICAL RAG SYSTEM REPAIR**: Fixed corrupted knowledge base - removed incorrect "区分所有法改正内容" documents
✓ **Knowledge Base Restored**: Cleaned up 218 invalid chunks and 8 incorrect documents, restored to 371 proper Mezon d'Optage regulation chunks
✓ **Menu Font Enhancement**: Increased sidebar menu font sizes for better readability (icons 16→20px, text sm→base)
✓ **Active Menu Indicator Fixed**: Enhanced white label indicator with z-index and border-radius for proper visibility
✓ **Navigation Structure Maintained**: 3-tier structure (Version List → Items List → Detail) working with clean RAG data

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript and Vite for fast development
- **UI Components**: Shadcn/ui component library with Radix UI primitives for accessible, modern interfaces
- **Styling**: Tailwind CSS with custom CSS variables for theming and Japanese font support (Inter + Noto Sans JP)
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for type-safe forms

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **API Design**: RESTful API structure with centralized route registration
- **Development**: Hot module reloading with Vite integration for seamless development experience
- **Build Process**: ESBuild for fast production builds

## Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema changes
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Connection**: Connection pooling with @neondatabase/serverless driver

## Core Data Models
- **Users**: Authentication and role-based access control
- **Condominiums**: Property information and management details
- **Documents**: File storage with OCR processing status tracking
- **Decisions**: Extracted meeting decisions with classification
- **Regulations**: Version-controlled regulation documents
- **Activities**: Audit trail and activity logging

## Key Features & Workflows
1. **Document Upload & OCR Processing**: Multi-file upload with automated OCR text extraction and accuracy scoring
2. **Decision Extraction**: AI-powered analysis to identify and classify meeting decisions from OCR text
3. **Regulation Analysis**: Comparison of current regulations against standard templates and legal requirements
4. **AI Revision Generation**: Automated generation of regulation amendment proposals based on extracted decisions
5. **Meeting Minutes Management**: RAG-integrated meeting minutes with PostgreSQL storage, real-time extraction from uploaded documents, tabular display, and individual detail pages with hierarchical navigation
6. **Dashboard Analytics**: Real-time statistics and activity monitoring for management oversight

## External Dependencies

- **Database**: Neon Database (PostgreSQL) for primary data storage
- **File Storage**: Local file system with configurable paths for document storage
- **OCR Services**: External OCR API integration for document text extraction (implementation pending)
- **AI Services**: External AI API for decision extraction and regulation analysis (implementation pending)
- **Session Management**: PostgreSQL-based session storage with connect-pg-simple
- **Development Tools**: Replit integration for cartographer and runtime error overlay