# app.js line no.79

1. `Date.now()` returns the current timestamp in milliseconds.

2. `1 * 3600000` calculates the number of milliseconds in one hour:

   - 1 hour × 60 minutes × 60 seconds × 1000 milliseconds = 3600000 milliseconds.

3. Adding `3600000` to `Date.now()` creates a new date that is exactly one hour from the current time.

4. The `expires` option is then set to this future date, meaning the cookie will expire exactly one hour after it's created.

# API LIST:

### Auth Router

- POST /auth/signup
- POST /auth/login
- POST /auth/logout

### Profile Router

- GET /profile/view
- PATCH / profile/edit
- PATCH / profile/password

### Connection Router

- POST /request/send/interested/:userId
- POST /request/send/ignored/:userId
- POST /request/review/accepted/:requestId
- POST /request/review/rejected/:requestId

### User Router

- GET /user/connections
- GET /user/request/recieved
- GET /user/feed
