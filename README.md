# Joker Card Game

A multiplayer card game where players strategically pass cards to collect matching sets while avoiding the Joker card.

## Features

- Create or join game rooms with unique room codes
- Real-time multiplayer gameplay
- Interactive card selection for passing and requesting
- Visual feedback for game events
- Responsive design for desktop and mobile

## Deployment

### Frontend Deployment on Render.com

1. Create a new account or log in to [Render.com](https://render.com)
2. Click on "New" and select "Blueprint" to use the render.yaml configuration
3. Connect your GitHub repository
4. Render will automatically deploy your static site

### Manual Deployment

If not using the Blueprint option:

1. Create a new "Static Site" on Render
2. Connect your GitHub repository
3. Configure the build:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
4. Add the environment variable: `VITE_BASE_PATH=/`
5. Deploy

### WebSocket Server (Future Implementation)

When you implement the WebSocket server:

1. Create a new "Web Service" on Render
2. Connect to the same repository
3. Configure:
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `node server/index.js` (adjust based on your server file)
4. Deploy

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Technologies

- React
- TypeScript
- Vite
- Tailwind CSS
- Socket.io (for WebSocket communication)
- Framer Motion (for animations)
- ShadCN UI Components
