# builds from node LTS (currently 12.16.2) on Alpine Linux
FROM node:16-alpine
# Create app directory
WORKDIR /home/node/app
# Change ownership to non-root user
RUN chown node:node /home/node/app
# Set user to non-root "node"
USER node
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY --chown=node:node package.json ./
COPY --chown=node:node yarn.lock ./
RUN yarn
# If you are building your code for production
# RUN npm ci --only=production
# Copy over app source
COPY --chown=node:node . ./
# Set environment variables
ENV NODE_ENV production
# Build application
RUN npm run build
# Expose port
EXPOSE 4000
# Run default node app on startup
CMD [ "npm","run","start"]
