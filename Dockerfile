###########
# BUILDER #
###########

# pull official base image
FROM node:current-alpine as builder

# install webp, sharp & gifsicle stuff
RUN apk update && \
        apk upgrade && \
        apk add ca-certificates ffmpeg libwebp libwebp-tools automake autoconf build-base && \
        rm -rf /var/cache/*

# set work directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm install --silent

# add app
COPY . ./
RUN ls

RUN dos2unix /app/entrypoint.sh
RUN chmod +x "/app/entrypoint.sh"
ENTRYPOINT ["/app/entrypoint.sh"]
