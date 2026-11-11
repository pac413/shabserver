# Shabbat Server

## Brief Technical Summary

**We are supporting GraphQL endpoints and some limited REST API endpoints.**

**Framework**: [Node Express](https://expressjs.com/)

**Language**: Javascript

**Database**: Mongo

**Cache**: Redis

## Development setup

### Local Environment

- [Install node](https://nodejs.org/en/)

  Requirement: Node version - 12

- [Install mongodb and run mongod](https://docs.mongodb.com/manual/administration/install-community/)

  Requirement: MongoDB version >= 4.4

  After download and install, you need to run mongodb with at least one replica set.

  Here are the [detailed steps](https://docs.mongodb.com/manual/tutorial/deploy-replica-set/#procedure).

  In the [3rd step](https://docs.mongodb.com/manual/tutorial/deploy-replica-set/#initiate-the-replica-set) of the above procedure, just run one replica set only for your local development.

  ```bash
  rs.initiate()
  ```

  After you have created replica set successfully, you need to run the following command in `mongo` shell.

  ```bash
  db.adminCommand({ setFeatureCompatibilityVersion: "4.4" })
  ```

- [Install redis and run redis](https://redis.io/topics/quickstart)

- If you are setting up the project for the first time, you need to add proper environment variables to `.env` file.

  - You can copy most of the variables from `.env.dev`.

  - There are some sensitive variables like AWS credentials which were not included in the repository so you can ask Yehudah about that.

- Install npm packages

  ```bash
  npm install
  ```

- Finally, you can import the mock data to your mongodb.

  ```bash
  IMPORT=all npm run local
  ```

- Setup localazy

  - Install `localazy` cli from [here](https://localazy.com/docs/cli/installation).
  - Request the Read/Write key for `localazy`.
  - Export those keys into `localazy.keys.json` file.

    `localazy upload -k localazy.keys.json`

- After import process is finished, you can finally run your server.

  ```bash
  npm run dev
  ```

### Using docker

You can also setup environment with docker.

- [Install Docker](https://docs.docker.com/get-docker/)

- Run docker-compose

  ```bash
  docker-compose up -d
  ```

## Add to your hosts file

```bash
127.0.0.1       local.server.shabbat.com
127.0.0.1       local.client.shabbat.com
```

### Test Users

These users were imported with import process by default and you can use this for local/staging environment.

- yehudah@shabbat.com | Shabbat1!
- shlomo@shabbat.com | Shabbat1!

## Useful Application

- Insomnia (for queries and mutations)
- Altair GraphQL Client (for testing subscriptions)

## API health-checks

- GraphQL

```
/graphql?query=%7B__typename%7D
```

- REST

```
/api/healthcheck
```
