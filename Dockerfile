# [START dockerfile]
# Use the official lightweight Node.js 18 image.
# https://hub.docker.com/_/node
FROM node:18.18.2-slim
#FROM node:19-alpine

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
# Copying this separately prevents re-running npm install on every code change.
COPY package*.json ./

# Install dependencies.
# If you add a package-lock.json speed your build by switching to 'npm ci'.
# RUN npm ci --only=production
RUN npm install --production

# Copy local code to the container image.
COPY . ./

# Your app binds to port 8080 so you'll use the EXPOSE instruction to have it mapped by the docker daemon
# https://docs.docker.com/engine/reference/commandline/expose/
# EXPOSE 8080

# Run the web service on container startup.
CMD ["node", "index.js"]

# [END dockerfile]