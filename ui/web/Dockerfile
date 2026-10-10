# Use an official, stable Node runtime environment
FROM node:20-alpine

WORKDIR /app/web

COPY web/package*.json ./

RUN npm install

COPY web/ ./

COPY shared/ ../shared/

# Expose the local Vite development server port
EXPOSE 5173

# Execute the runtime script
CMD ["npm", "run", "dev", "--", "--host"]