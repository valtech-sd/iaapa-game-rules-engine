# builds from node LTS (currently 12.16.2) on Alpine Linux
FROM node:16-alpine
# Create app directory
WORKDIR /home/node/app
# Change ownership to non-root user
RUN chown node:node /home/node/app
# Set user to non-root "node"
USER node
# Expose port
EXPOSE 3333/udp