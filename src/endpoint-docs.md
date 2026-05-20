# Endpoint Documentation

This document lists the backend endpoints in this project and example responses captured during testing.

**GET /api/date**

- Description: Returns current server date/time.
- Auth: none
- Example response:

```json
{ "dateTime": "2026-05-20 23:31:33" }
```

**POST /db/set-user?userData=BASE64**

- Description: Creates a user from base64-encoded JSON passed in `userData` query param. Example JSON should contain `firstName`, `lastName`, `username`, `email`, `password`.
- Auth: none
- Example request: `POST /db/set-user?userData=<base64-of-{"username":"...","password":"..."}>`
- Example response:

```json
{ "payload": true, "authString": "<base64-authString>" }
```

**GET /db/get-user?auth=AUTHSTRING**

- Description: Returns user by `authString` (cached in Redis if found).
- Auth: none
- Example responses:

User not found (404 text):

```
User not found
```

Or found (JSON user object) — example not available in sample run.

**POST /api/auth/register**

- Description: Register a new user.
- Body: JSON { username, email, password, firstName?, lastName? }
- Auth: none
- Example response:

```json
{ "message": "User registered successfully." }
```

**POST /api/auth/login**

- Description: Login a user (username or email as `identifier`) and receive a JWT token.
- Body: JSON { identifier, password }
- Auth: none
- Example response:

```json
{
  "message": "Login successful.",
  "token": "<JWT_TOKEN>",
  "user": { "id": "...", "username": "...", "email": "...", "color": "#..." }
}
```

**GET /api/auth/me**

- Description: Returns authenticated user's public profile.
- Auth: Bearer token required in `Authorization` header.
- Example response:

```json
{
  "_id": "6a0e1a25980434b6a5808696",
  "username": "apitest1779309093576",
  "email": "apitest1779309093576@example.com",
  "updates": [],
  "verifiedEmail": false,
  "color": "#3f51b5"
}
```

**POST /api/course/suggest**

- Description: Ask AI to suggest a short course outline based on supplied answers.
- Body: JSON (freeform answers object)
- Auth: none
- Example response (mock provider):

```json
{
  "success": true,
  "suggestion": {
    "title": "Intro to Practical JavaScript",
    "outline": [
      { "level": 1, "title": "Basics", "tasks": ["Variables", "Control flow"] },
      {
        "level": 2,
        "title": "DOM & Events",
        "tasks": ["DOM selection", "Event handling"]
      }
    ],
    "raw": { "mocked": true, "prompt": "..." }
  }
}
```

**POST /api/course/generate**

- Description: Create a new `Course` document and generate a full gamified course map in the background.
- Body: JSON { title?, prompt?, answers }
- Auth: Bearer token required (must be logged-in). The `createdBy` field will be set from the token.
- Response: Immediately returns the created course id. Generation proceeds in background and updates the Course document's `generatedMap` and `status`.
- Example response:

```json
{ "success": true, "courseId": "6a0e1a25980434b6a5808697" }
```

**GET /api/course/status/:id**

- Description: Returns generation status for a Course.
- Auth: none
- Example response:

```json
{
  "success": true,
  "status": "completed",
  "updatedAt": "2026-05-20T20:31:33.998Z",
  "createdAt": "2026-05-20T20:31:33.961Z"
}
```

**GET /api/course/:id**

- Description: Returns full Course document including `generatedMap` (once generation completes).
- Auth: none
- Example response (abridged):

```json
{
  "success": true,
  "course": {
    "_id": "6a0e1a25980434b6a5808697",
    "title": "Intro to Practical JavaScript",
    "answers": { "q1": "web dev", "level": "beginner" },
    "status": "completed",
    "createdBy": "6a0e1a25980434b6a5808696",
    "generatedMap": {
      "title": "Intro to Practical JavaScript",
      "outline": [
        {
          "level": 1,
          "title": "Basics",
          "tasks": ["Variables", "Control flow"]
        },
        {
          "level": 2,
          "title": "DOM & Events",
          "tasks": ["DOM selection", "Event handling"]
        }
      ],
      "raw": { "mocked": true, "prompt": "..." }
    }
  }
}
```

**Static files**

- The server serves `public/` as static files. Visiting `/` returns `public/index.html` (React CDN-based homepage).

---

**Caching & Test Script**

- Cache keys and TTLs:
  - `user:<authString>` — cached sanitized user for legacy lookups (set on register/login/me and updated by model hooks). TTL: 3600s.
  - `userId:<id>` — cached sanitized user keyed by user id (used by `GET /api/auth/me`). TTL: 3600s.
  - `course:<id>` — cached Course document (set after generation completes or fails). TTL: 3600s.

- Notes:
  - `GET /api/auth/me` now prefers the `userId:<id>` cache and returns the cached sanitized user when present; it will refresh the cache from DB if missing.
  - Legacy `GET /db/get-user` will use `user:<authString>` cache; the auth controller and model hooks ensure the cache is populated.
  - Generated `Course` documents are cached under `course:<id>` after generation finishes or fails; `GET /api/course/status/:id` will read cache when available.

- Test script:
  - An automated test script is available at `src/test/test_endpoints.js` (this path is git-ignored / local). It exercises the main endpoints and was used to capture the example responses in this document.

If you'd like, I can expand this file with request examples (curl), add authentication examples (how to set `Authorization` header), or generate an OpenAPI spec. Which would you prefer next?
