###########
# BUILDER #
###########

# pull official base image
FROM node:15.9.0-alpine3.10 as builder

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
