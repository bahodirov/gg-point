# Deployment Guide - GGPoint

This guide will help you deploy your Angular SSR application to various hosting platforms.

## 🔧 Pre-Deployment Checklist

Before deploying, ensure:

- [ ] All environment variables are set
- [ ] Telegram bot username is configured
- [ ] Meta tags and SEO settings are correct
- [ ] Sitemap URLs are updated with your domain
- [ ] Analytics tracking is set up (if needed)
- [ ] All images are optimized
- [ ] Test the production build locally

## 🏗️ Build for Production

```bash
# Install dependencies
npm install --legacy-peer-deps

# Build SSR application
npm run build:ssr

# Test locally
npm run serve:ssr:ggpoint
```

Visit `http://localhost:4000` to verify the build works correctly.

## 🚀 Deployment Options

### Option 1: Vercel (Recommended for Angular SSR)

Vercel provides excellent support for Angular SSR applications with automatic deployments.

#### Steps:

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Configure Build Settings** (if needed)
   - Build Command: `npm run build:ssr`
   - Output Directory: `dist/ggpoint`
   - Install Command: `npm install --legacy-peer-deps`

5. **Set Environment Variables** (in Vercel Dashboard)
   - Add any required environment variables

6. **Deploy to Production**
   ```bash
   vercel --prod
   ```

#### Automatic Deployments:
- Connect your Git repository to Vercel
- Every push to main branch will auto-deploy

---

### Option 2: Firebase Hosting

Firebase Hosting with Cloud Functions supports Angular SSR.

#### Steps:

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase**
   ```bash
   firebase init
   ```
   
   Select:
   - Functions
   - Hosting

4. **Configure firebase.json**
   ```json
   {
     "hosting": {
       "public": "dist/ggpoint/browser",
       "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
       "rewrites": [
         {
           "source": "**",
           "function": "ssr"
         }
       ]
     },
     "functions": {
       "source": "dist/ggpoint/server"
     }
   }
   ```

5. **Deploy**
   ```bash
   firebase deploy
   ```

---

### Option 3: DigitalOcean App Platform

DigitalOcean App Platform supports Node.js applications.

#### Steps:

1. **Push code to GitHub/GitLab**

2. **Create New App** in DigitalOcean

3. **Configure App**
   - Source: Your repository
   - Build Command: `npm run build:ssr`
   - Run Command: `npm run serve:ssr:ggpoint`

4. **Set Environment Variables**
   - NODE_ENV=production

5. **Deploy**

---

### Option 4: Heroku

Heroku supports Node.js applications with easy deployments.

#### Steps:

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login**
   ```bash
   heroku login
   ```

3. **Create Heroku App**
   ```bash
   heroku create ggpoint
   ```

4. **Add Procfile** (create in root)
   ```
   web: npm run serve:ssr:ggpoint
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

---

### Option 5: VPS (Ubuntu/Debian)

Deploy to your own Virtual Private Server.

#### Steps:

1. **Connect to Server**
   ```bash
   ssh user@your-server-ip
   ```

2. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Install PM2** (Process Manager)
   ```bash
   sudo npm install -g pm2
   ```

4. **Clone Repository**
   ```bash
   git clone <your-repo-url> /var/www/ggpoint
   cd /var/www/ggpoint
   ```

5. **Install Dependencies & Build**
   ```bash
   npm install --legacy-peer-deps
   npm run build:ssr
   ```

6. **Start with PM2**
   ```bash
   pm2 start npm --name "ggpoint" -- run serve:ssr:ggpoint
   pm2 save
   pm2 startup
   ```

7. **Configure Nginx** (create `/etc/nginx/sites-available/ggpoint`)
   ```nginx
   server {
       listen 80;
       server_name ggpoint.uz www.ggpoint.uz;

       location / {
           proxy_pass http://localhost:4000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

8. **Enable Site**
   ```bash
   sudo ln -s /etc/nginx/sites-available/ggpoint /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

9. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d ggpoint.uz -d www.ggpoint.uz
   ```

---

### Option 6: Docker

Containerize your application for any cloud provider.

#### Steps:

1. **Create Dockerfile** (in root)
   ```dockerfile
   FROM node:20-alpine

   WORKDIR /app

   COPY package*.json ./
   RUN npm install --legacy-peer-deps

   COPY . .
   RUN npm run build:ssr

   EXPOSE 4000

   CMD ["npm", "run", "serve:ssr:ggpoint"]
   ```

2. **Create .dockerignore**
   ```
   node_modules
   dist
   .git
   .env
   ```

3. **Build Image**
   ```bash
   docker build -t ggpoint .
   ```

4. **Run Container**
   ```bash
   docker run -p 4000:4000 ggpoint
   ```

5. **Deploy to Docker Hub**
   ```bash
   docker tag ggpoint yourusername/ggpoint
   docker push yourusername/ggpoint
   ```

---

## 🔐 Environment Variables

If you need environment variables, create `.env` file:

```env
NODE_ENV=production
PORT=4000
TELEGRAM_BOT_USERNAME=ggpoint_bot
API_URL=https://api.ggpoint.uz
```

## 📊 Post-Deployment

### 1. Verify Deployment
- [ ] Check all pages load correctly
- [ ] Test SSR (View Page Source should show content)
- [ ] Verify meta tags are present
- [ ] Test language switching
- [ ] Test theme toggle
- [ ] Verify Telegram links work
- [ ] Check mobile responsiveness

### 2. Configure Domain
- Point your domain to hosting provider
- Set up DNS records
- Enable SSL certificate
- Configure redirects (www to non-www or vice versa)

### 3. Submit to Search Engines
```bash
# Submit sitemap to Google
https://www.google.com/webmasters/tools/submit-url

# Submit to Yandex (popular in Uzbekistan)
https://webmaster.yandex.com/
```

### 4. Monitor Performance
- Set up Google Analytics
- Configure error tracking (Sentry)
- Monitor uptime (UptimeRobot)
- Check Lighthouse scores

## 🔄 Continuous Deployment

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm install --legacy-peer-deps
        
      - name: Build SSR
        run: npm run build:ssr
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 🛠️ Troubleshooting

### SSR Not Working
- Verify `server.ts` exists
- Check build output in `dist/ggpoint/server/`
- Ensure Node.js version is compatible (v18+)

### Blank Page on Deployment
- Check browser console for errors
- Verify all assets are loading correctly
- Check `base href` in `index.html`

### Slow Load Times
- Enable compression (gzip/brotli)
- Optimize images
- Enable caching headers
- Use CDN for static assets

### Translation Files Not Loading
- Verify `assets/i18n/` folder is included in build
- Check file paths in translate configuration
- Ensure files are accessible at runtime

## 📝 Maintenance

### Regular Updates
```bash
# Update dependencies
npm update

# Rebuild
npm run build:ssr

# Redeploy
```

### Backup Strategy
- Regular database backups (if using)
- Git repository backups
- Server configuration backups

---

**Need Help?**  
Contact: info@ggpoint.uz  
Telegram: @ggpoint_bot

**Last Updated**: December 13, 2025
