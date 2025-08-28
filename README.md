# QRF Agent Performance Dashboard

A comprehensive React-based dashboard for call center agent performance analytics and workforce optimization.

## Features

- **Agent Performance Tracking**: Monitor key metrics like handle time, efficiency, and productivity
- **CSV Data Import**: Upload and analyze call center interaction data
- **Performance Tiers**: Automatic classification (Gold/Silver/Bronze) based on performance
- **Filtering & Sorting**: Filter by queue, media type, and agent with multiple sort options
- **Coaching Insights**: Identify agents who may benefit from additional training
- **Real-time Calculations**: Dynamic metric calculations with formula transparency

## Quick Start

### Development

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

### Data Format

The dashboard expects CSV files with these columns:
- `Queue`: Call queue identifier
- `Media Type`: Type of interaction (voice, chat, etc.)
- `Abandoned`: YES/NO flag
- `Total Handle`: Handle time in seconds
- `Total Queue`: Queue time in seconds  
- `Users - Interacted`: Agent identifier
- `Date`: Interaction date

## Deployment to Netlify

### Option 1: GitHub Integration (Recommended)

1. **Push to GitHub**: Create a new repository and push your code
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git push -u origin main
   ```

2. **Connect to Netlify**:
   - Go to [netlify.com](https://netlify.com) and sign up/login
   - Click "New site from Git"
   - Choose GitHub and authorize
   - Select your repository
   - Netlify will auto-detect the settings from `netlify.toml`

3. **Deploy**: Netlify will automatically build and deploy your site

### Option 2: Manual Deploy

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop the `dist` folder to deploy

## Configuration

The project includes:
- **Vite** for fast development and building
- **TypeScript** for type safety
- **Netlify configuration** (`netlify.toml`) for seamless deployment
- **Automatic redirects** for SPA routing

## Performance Metrics

The dashboard calculates several key performance indicators:

- **Efficiency Score**: Comparison to team average handle time
- **Productivity Rate**: Percentage of assigned interactions handled
- **Utilization Rate**: Percentage of time spent actively handling calls
- **Versatility Score**: Coverage across different queues

## Browser Support

Modern browsers supporting ES2020+ features.