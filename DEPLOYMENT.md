# Deployment Guide - Render.com

## Node.js Version Requirement

**IMPORTANT**: This project uses Vite 7.3.1 which requires:
- Node.js 20.19+ or 22.12+

## Environment Variables for Render

Set these in Render Dashboard → Environment:

```
NODE_VERSION=20.19.0
VITE_APP_NAME=CRM Legal Migration
VITE_ENABLE_DEMO_MODE=true
```

## Build Configuration

- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Branch**: `main`

## Auto-Deploy

Every push to `main` branch triggers automatic deployment.

## Demo Users

- **Agente**: `agente1` / `agente123`
- **Cliente**: `cliente1` / `cliente123`
