###################
# BUILD FOR LOCAL DEVELOPMENT
###################
FROM node:alpine AS development

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

# Install app dependencies using the `npm ci` command instead of `npm install`
RUN npm ci --legacy-peer-deps

COPY . .


###################
# BUILD FOR PRODUCTION
###################
FROM node:alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./

# In order to run `npm run build` we need access to the Nest CLI which is a dev dependency. In the previous development stage we ran `npm ci` which installed all dependencies, so we can copy over the node_modules directory from the development image
COPY --from=development /usr/src/app/node_modules ./node_modules

COPY . .

# Run the build command which creates the production bundle
RUN npm run build

# Set NODE_ENV environment variable
ENV NODE_ENV production

# Running `npm ci` removes the existing node_modules directory and passing in --only=production ensures that only the production dependencies are installed. This ensures that the node_modules directory is as optimized as possible
RUN npm ci --legacy-peer-deps --omit=dev && npm cache clean --force

USER node

###################
# PRODUCTION
###################
FROM node:alpine AS production

# Copy the bundled code from the build stage to the production image
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/build ./build

# Start the server using the production build
CMD [ "node", "build/main.js" ]
