# Error Handling

## Graphql API error handling

We handle Graphql errors following the `apollo-server`'s graphql error handling practice [here](https://www.apollographql.com/docs/apollo-server/data/errors/).

To display and format errors returned to the frontend, we hook all the errors from graphql endpoints and localize them and respond back.

- [Here](src/server/apollo/errors.js), you can find `errorPlugin` which localizes the error messages.

- [Here](src/errors/errorCodes.js), we need to list all the possible error codes here and localized error messages in [locale](src/locales)

i.e.

```js
import {
  AuthenticationError,
  ForbiddenError,
  UserInputError, 
} from 'apollo-server-express'
import { ERROR_CODES } from 'Errors'

...
throw new AuthenticationError(ERRORS_BY_CODE.UNAUTHORISED)
throw new ForbiddenError(ERRORS_BY_CODE.FORBIDDEN_EMAIL)
throw new UserInputError(ERRORS_BY_CODE.INVALID_FEED_ID, {
  feedItemId: 'uuid',
})
...
```

## REST API error handling

We use REST API for authentication and registration.

- *Unauthenticated Error* - **401**
  
  - When `login`, `registration` fails, we return unauthenticated error.

  - When attached `token` in the header is not valid, we return unauthenticated error.

  ***Implementation***

  ```js
  import { ERROR_CODES } from 'Errors'
  import { respondUnauthenticatedError } from 'Errors/rest'

  ...
  // Return default unauthenticated error message
  respondUnauthenticatedError(req, res)

  // Return custom unauthenticated error message
  respondUnauthenticatedError(req, res, ERROR_CODES.UNAUTHENTICATED_ADMIN)
  ```

- *Forbidden Error* - **403**
  
  When you are trying to access the forbidden resources - `profile`, `feed`, etc, we return forbidden error.

  ***Implementation***

  ```js
  import { ERROR_CODES } from 'Errors'
  import { respondForbiddenError } from 'Errors/rest'

  ...
  // Return default forbidden error message
  respondForbiddenError(req, res)

  // Return custom forbidden error message
  respondForbiddenError(req, res, ERROR_CODES.FORBIDDEN_PROFILE)
  ```

- *Invalid Request Error* - **400**
  
  When you are trying to request with invalid params, we return invalid request error.

  ***Implementation***

  ```js
  import { ERROR_CODES } from 'Errors'
  import { respondInvalidRequestError } from 'Errors/rest'

  ...
  // Return invalid request error message
  respondInvalidRequestError(req, res, ERROR_CODES.INVALID_EMAIL)
  ```

- *Internal Server Error* - **500**
  
  When unexpected error happens while running the server process, we return internal server error.

  ***Implementation***

  ```js
  import { respondInternalServerError } from 'Errors/rest'

  ...
  // Return internal server error message
  respondInternalServerError(req, res)
  ```

- *Other Customer Error* - **ANY**

  When we face other types of errors except the above ones, we could return custom response.

  ***Implementation***

  ```js
  import { ERROR_CODES } from 'Errors'
  import { respondError } from 'Errors/rest'

  ...
  // Return conflict error message
  respondError(req, res, 409, ERROR_CODES.EMAIL_CONFLICT)
  ```
