# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Vue 3 + Vite web application for displaying scenic spots, primarily focused on Nanhua Temple (南华寺). The application serves as a modern, responsive platform for showcasing various media content including images, videos, and mixed media presentations.

## Core Architecture

### Page Type System
The application uses a dynamic page type system that renders different components based on API-driven page configurations:

- **VIDEO_ONLY**: Pages with video-only content
- **IMAGE_ONLY**: Pages with image gallery slideshows  
- **MIXED**: Pages with both banner carousels and grid layouts
- **SCENIC_SPOT**: Specialized scenic spot pages
- **GALLERY**: Image gallery pages
- **Default**: Fallback for unspecified page types

### Component Structure
- `src/views/page.vue`: Main dynamic page component that routes to appropriate sub-components
- `src/components/VideoOnlyPage.vue`: Handles video-only presentations
- `src/components/ImageOnlyPage.vue`: Manages image slideshow functionality
- `src/components/MixedPage.vue`: Combines banner carousels with grid layouts
- `src/components/DefaultPage.vue`: Fallback component for undefined page types

### API Integration
- API configuration in `src/api/config.js` with environment-based URL switching
- Base URL defaults to `http://127.0.0.1:3000` for both development and production
- Dynamic page data fetched via `/pages/{id}` endpoint
- Rich media item structure with file metadata and display settings

### Routing System
- `/`: Home page (nhs.vue)
- `/page/*`: Dynamic pages that fetch configuration from API
- `/video/:id`: Video player view

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Key Dependencies

- **Vue 3**: Core framework with Composition API
- **Vue Router 4**: Client-side routing
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Swiper**: Touch slider component for carousels
- **Video.js**: HTML5 video player
- **Axios**: HTTP client for API requests
- **Masonry Layout**: Grid layout library
- **Vue Waterfall Plugin**: Image grid layouts

## Media Handling

The application handles complex media structures with:
- File metadata (size, type, upload info)
- Display properties (order, cover status, thumbnails)
- Media type distinction (image/video)
- Cloud storage integration (Aliyun OSS)

## API Data Structure

Pages contain rich configuration including:
- Header/footer settings with styling
- Content data with media items and layout settings
- Style settings (theme, colors, fonts)
- Section-based content organization
- Banner carousel configurations

## Environment Notes

- Development and production both use local API server by default
- No specific test commands configured in package.json
- No linting configuration detected