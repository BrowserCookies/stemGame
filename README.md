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

```bash
cp example.env .env
```

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
├── public/           # Static files (HTML, CSS, assets)
├── src/
│   ├── assets/       # Images, fonts, etc.
│   ├── models/       # Data models
│   ├── modules/      # Reusable modules
│   │   └── get.date.time.js
│   └── test/         # Tests
├── server.js         # Express server entry point
├── package.json      # Project dependencies
└── example.env       # Environment variables template
```

## API Endpoints

- `GET /api/date` - Returns current date and time

## Development Notes

- Built with Express.js
- Uses ES modules (`type: "module"` in package.json)
- Environment variables managed with dotenv

## License

ISC

## Author

PGTK11
