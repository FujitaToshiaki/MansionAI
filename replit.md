# Overview

マンション管理AIツールプラットフォーム。マンション管理業協会とオプテージの共同研究開発向け。5つのAI機能（01規約改訂AI・02長期修繕計画AI・03業務相談Bot・04議事録作成AI・05総会議案書AI）と適正評価セルフチェックを提供するプラットフォーム。

## Recent Changes (2026-03-25)

✓ **サイドバー全面再構築**: 8メニューから「管理AIプラットフォーム」構成に。1サブメニューの項目はダイレクトリンク化（物件管理など）
✓ **9テーブル新規追加**: long_term_plans, repair_items, repair_history, consultation_logs, meeting_recordings, proposals, action_items, evaluation_checks, evaluation_items_master
✓ **condominiums テーブル拡張**: structure_type, floors, management_type, reserve_fund_balance など11カラム追加
✓ **プレースホルダーページ18画面**: 適正評価(3), 02長計(5), 03相談Bot(2), 04議事録(4), 05議案書(4)
✓ **基本 CRUD API**: 全新テーブル向けの GET/POST/PATCH エンドポイント追加
✓ **タスク計画 #1〜#8**: 7機能実装タスク + デモデータ投入タスクをプロジェクトに登録済み

## Recent Changes (2025-08-26)

✓ **PDF Export Enhancement**: Implemented native PDF generation using browser print dialog with monochrome design optimization
✓ **User Interface Updates**: Changed user identity from "田中 太郎" to "修繕 未来" with female avatar across entire system
✓ **OCR Processing Refinement**: Removed specific AI model references (Gemini 2.5 Pro) for generic "AI" branding
✓ **Print Layout Optimization**: Removed all color elements and borders for professional monochrome PDF output
✓ **Proposal Document Generation**: Enhanced議案書creation with comprehensive R7 legal reform context and scrollable preview

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