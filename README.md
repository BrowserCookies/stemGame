# STEM Game

A web-based educational game focused on STEM topics.

⚠️ **Status: Still in Development** ⚠️

This project is currently under active development and not yet ready for production use.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/BrowserCookies/stemGame.git
cd stemGame
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

4. Start the development server:

```bash
npm start
# or
node server.js
```

The server will run on `http://localhost:3000` by default.

## Project Structure

```
stemGame/
├── public/                   # Static frontend (index.html + assets)
├── src/
│   ├── clients/              # External clients (redis, etc.)
│   ├── controllers/          # Express route handlers
│   ├── middleware/           # Express middleware (auth, etc.)
│   ├── models/               # Mongoose models (User, Course)
│   ├── modules/              # Helper modules and AI provider logic
│   ├── routes/               # Express route definitions
│   └── endpoint-docs.md      # Auto-generated endpoint reference (this repo)
│
├── server.js                 # Express server entry point
├── package.json              # Project dependencies
├── example.env               # Environment variables template
└── README.md                 # Project readme (this file)
```

API endpoint reference has moved to: [src/endpoint-docs.md](src/endpoint-docs.md)

Local test script (git-ignored): `src/test/test_endpoints.js` — used to exercise endpoints during development.

## Development Notes

- Built with Express.js
- Uses ES modules (`type: "module"` in package.json)
- Environment variables managed with dotenv

## License

ISC

## Author

PGTK11
