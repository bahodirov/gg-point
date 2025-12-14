FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy application files
COPY . .

# Build SSR application
RUN npm run build:ssr

# Expose port
EXPOSE 4000

# Start the application
CMD ["npm", "run", "serve:ssr:ggpoint"]
