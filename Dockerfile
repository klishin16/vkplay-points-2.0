###################
# BUILD FOR PRODUCTION
###################
FROM node:alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./

RUN apk update && apk upgrade \
    && apk add --no-cache alpine-sdk python3 unzip git

RUN npm ci --legacy-peer-deps

COPY . .

# Run the build command which creates the production bundle
RUN npm run build

# Set NODE_ENV environment variable
ENV NODE_ENV production

# Running `npm ci` removes the existing node_modules directory and passing in --only=production ensures that only the production dependencies are installed. This ensures that the node_modules directory is as optimized as possible
RUN npm ci --legacy-peer-deps --omit=dev
RUN npm cache clean --force

###################
# PRODUCTION
###################
FROM node:alpine AS production

# Copy the bundled code from the build stage to the production image
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/build ./build

COPY package*.json ./
COPY .env ./

# Start the server using the production build
CMD [ "node", "build/main.js" ]
