# base (node 10.16 is a LTS)
FROM node:12.16 AS base
WORKDIR /application
COPY package.json /application/

# developmentDependencies
FROM base AS developmentDependencies
WORKDIR /application
RUN npm install --loglevel=error

# development
FROM developmentDependencies AS development
ARG NODE_ENV=development
# ENV variables are available to the running conatiners
ENV NODE_ENV $NODE_ENV
# node will be listening in this port 
ARG PORT=8080
ENV PORT $PORT
#COPY . /application/
COPY --from=developmentDependencies /application/node_modules /application/node_modules
WORKDIR /application
# When container starts it will run the npm local script 
CMD ["./wait-for-it.sh", "mongodb:27017", "--", "./wait-for-it.sh", "redis:6379", "--", "npm", "run", "local"]