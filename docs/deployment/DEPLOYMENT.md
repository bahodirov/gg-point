# Deployment Guide - GGPoint

This guide will help you deploy your Angular SSR application with PostgreSQL database to various hosting platforms.

## 🔧 Pre-Deployment Checklist

Before deploying, ensure:

### Application
- [ ] All environment variables are set
- [ ] Telegram bot username is configured
- [ ] Meta tags and SEO settings are correct
- [ ] Sitemap URLs are updated with your domain
- [ ] Analytics tracking is set up (if needed)
- [ ] All images are optimized
- [ ] Test the production build locally

### Database & Security
- [ ] PostgreSQL database is set up
- [ ] Database credentials are secured
- [ ] Strong SESSION_SECRET is generated
- [ ] Default admin password is changed
- [ ] SSL/TLS certificates are obtained
- [ ] Firewall rules are configured
- [ ] Database backups are configured
- [ ] Rate limiting is tested
- [ ] Security headers are verified

## 🏗️ Build for Production

```bash
# Install dependencies
npm install --legacy-peer-deps

# Create .env file with production settings
cp .env.example .env
# Edit .env with your production values

# Build SSR application
npm run build:ssr

# Test locally
npm run serve:ssr:ggpoint
```

Visit `http://localhost:4000` to verify the build works correctly.

## 🗄️ Database Setup

### PostgreSQL Installation

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Create Database:**
```bash
sudo -u postgres psql
```
```sql
CREATE DATABASE ggpoint;
CREATE USER ggpoint_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE ggpoint TO ggpoint_user;
\q
```

**Configure Environment:**
```env
DATABASE_URL=postgresql://ggpoint_user:your_secure_password@localhost:5432/ggpoint
SESSION_SECRET=your-random-32-character-secret
NODE_ENV=production
PORT=4000
```

**Run Migration:**

The database schema and data migration will run automatically when you start the server. For detailed migration instructions, see [DATABASE_MIGRATION.md](./DATABASE_MIGRATION.md).

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

### Option 5: VPS (Ubuntu/Debian) - Complete Production Setup

Deploy to your own Virtual Private Server with PostgreSQL and full security configuration.

#### Prerequisites
- Ubuntu 20.04+ or Debian 11+
- Root or sudo access
- Domain name configured to point to your server

#### Steps:

**1. Connect to Server**
```bash
ssh user@your-server-ip
```

**2. Update System**
```bash
sudo apt update && sudo apt upgrade -y
```

**3. Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**4. Install PostgreSQL**
```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**5. Configure PostgreSQL**
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE ggpoint;
CREATE USER ggpoint_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE ggpoint TO ggpoint_user;
\q
```

**6. Configure PostgreSQL for Remote Access** (if needed)

Edit `/etc/postgresql/14/main/postgresql.conf`:
```
listen_addresses = 'localhost'  # Only local for security
```

Edit `/etc/postgresql/14/main/pg_hba.conf`:
```
# Allow local connections
local   all             all                                     peer
host    ggpoint         ggpoint_user    127.0.0.1/32           md5
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

**7. Install PM2** (Process Manager)
```bash
sudo npm install -g pm2
```

**8. Clone Repository**
```bash
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www
git clone <your-repo-url> /var/www/ggpoint
cd /var/www/ggpoint
```

**9. Configure Environment**
```bash
cp .env.example .env
nano .env
```

Add your production settings:
```env
# Database
DATABASE_URL=postgresql://ggpoint_user:your_secure_password@localhost:5432/ggpoint

# Security
SESSION_SECRET=generate-a-random-32-character-string
NODE_ENV=production

# Application
PORT=4000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=10
UPLOAD_RATE_LIMIT_MAX=20

# Upload
UPLOAD_DIR=public/uploads
MAX_FILE_SIZE=5242880
MAX_IMAGE_WIDTH=1920
THUMBNAIL_WIDTH=300
```

**10. Install Dependencies & Build**
```bash
npm install --legacy-peer-deps
npm run build:ssr
```

**11. Create PM2 Ecosystem File**

Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'ggpoint',
    script: 'npm',
    args: 'run serve:ssr:ggpoint',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    error_file: '/var/log/pm2/ggpoint-error.log',
    out_file: '/var/log/pm2/ggpoint-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
```

**12. Start with PM2**
```bash
# Create log directory
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

**13. Install and Configure Nginx**
```bash
sudo apt install nginx -y
```

Create `/etc/nginx/sites-available/ggpoint`:
```nginx
# HTTP redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name ggpoint.uz www.ggpoint.uz;
    return 301 https://$server_name$request_uri;
}

# HTTPS configuration
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ggpoint.uz www.ggpoint.uz;

    # SSL certificates (will be added by Certbot)
    ssl_certificate /etc/letsencrypt/live/ggpoint.uz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ggpoint.uz/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logs
    access_log /var/log/nginx/ggpoint-access.log;
    error_log /var/log/nginx/ggpoint-error.log;

    # Static files
    location /uploads/ {
        alias /var/www/ggpoint/public/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Proxy to Node.js application
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90;
    }
}
```

**14. Enable Site**
```bash
sudo ln -s /etc/nginx/sites-available/ggpoint /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**15. Setup SSL with Let's Encrypt**
```bash
sudo apt-get install certbot python3-certbot-nginx -y
sudo certbot --nginx -d ggpoint.uz -d www.ggpoint.uz
```

**16. Configure Firewall**
```bash
# Install UFW if not already installed
sudo apt install ufw -y

# Allow SSH (important! do this first)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow PostgreSQL only from localhost (secure)
# If you need remote access, replace 'localhost' with specific IP
sudo ufw allow from 127.0.0.1 to any port 5432

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

**17. Set Up Database Backups**

Create backup script `/usr/local/bin/backup-ggpoint.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/ggpoint"
DATE=$(date +%Y%m%d-%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U ggpoint_user ggpoint > $BACKUP_DIR/db-$DATE.sql

# Compress
gzip $BACKUP_DIR/db-$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "db-*.sql.gz" -mtime +7 -delete

echo "Backup completed: db-$DATE.sql.gz"
```

Make executable and add to crontab:
```bash
sudo chmod +x /usr/local/bin/backup-ggpoint.sh
sudo crontab -e
```

Add daily backup at 2 AM:
```
0 2 * * * /usr/local/bin/backup-ggpoint.sh
```

**18. Set Up Monitoring**

```bash
# Install monitoring tools
sudo apt install htop iotop nethogs -y

# View PM2 logs
pm2 logs ggpoint

# Monitor PM2 processes
pm2 monit

# View Nginx logs
sudo tail -f /var/log/nginx/ggpoint-access.log
sudo tail -f /var/log/nginx/ggpoint-error.log

# View PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

**19. Post-Deployment Security Checklist**

- [ ] Change default admin password immediately
- [ ] Verify HTTPS is working (visit https://yourdomain.com)
- [ ] Test rate limiting (try multiple failed logins)
- [ ] Check security headers: https://securityheaders.com/
- [ ] Verify database backups are running
- [ ] Test image upload functionality
- [ ] Review firewall rules
- [ ] Monitor application logs for errors
- [ ] Test admin panel functionality
- [ ] Verify API endpoints are working

**20. Maintenance Commands**

```bash
# Update application
cd /var/www/ggpoint
git pull
npm install --legacy-peer-deps
npm run build:ssr
pm2 restart ggpoint

# View application logs
pm2 logs ggpoint --lines 100

# Monitor application
pm2 monit

# Database maintenance
sudo -u postgres psql -d ggpoint -c "VACUUM ANALYZE;"

# Restart services
pm2 restart ggpoint
sudo systemctl restart nginx
sudo systemctl restart postgresql

# Check disk space
df -h

# Check memory usage
free -h

# Check running processes
pm2 list
```

---

### Option 6: Docker (with PostgreSQL)

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
Contact: info@gg-point.uz  
Telegram: @ggpoint_bot

**Last Updated**: December 13, 2025
