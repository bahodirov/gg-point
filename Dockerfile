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

# Copy schema.sql to dist so it's available at runtime
RUN cp src/server/db/schema.sql dist/ggpoint/server/schema.sql

# Expose port
EXPOSE 4000

# Start the application
CMD ["npm", "run", "serve:ssr:ggpoint"]
