# Step 1: Build the React application
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Step 2: Serve the built static files using Nginx
FROM nginx:alpine

# Configure Nginx to serve on port 3000 (compliant with AI Studio environment constraints)
RUN sed -i 's/listen\( \)*80;/listen 3000;/' /etc/nginx/conf.d/default.conf

# Support React Router/SPA routing by fall-back to index.html
RUN sed -i '/location \/ {/a \        try_files $uri $uri/ /index.html;' /etc/nginx/conf.d/default.conf

# Copy build artifacts to Nginx public folder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
