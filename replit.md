# Overview

This is a Japanese condominium management regulation AI system designed for property management companies. The application helps automate the process of analyzing meeting minutes, extracting decisions, and generating regulation amendments using OCR technology and AI analysis. The system provides a complete workflow from document upload to final regulation output, with a focus on legal compliance and standardized regulation management.

## Recent Changes (2025-08-16)

✓ **Standard Regulation Management Complete**: Implemented 3-tier navigation structure (Version List → Items List → Detail)
✓ **RAG Integration Verified**: regulation_revisions table contains 15 改正項目, knowledge_documents has 5 documents with 160 chunks
✓ **Navigation Structure Fixed**: Proper routing hierarchy from 改正版一覧 (令和6年度改訂, 令和3年度改訂, 平成29年度改訂) to detailed items
✓ **API Error Resolution**: Fixed PostgreSQL parameter syntax and integer parsing for regulation revision endpoints
✓ **Sidebar Simplification**: Removed complex submenu structure, consolidated to single "標準管理規約" menu item

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