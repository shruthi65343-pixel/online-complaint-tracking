require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

// Connect Database immediately for standalone server
connectDB();

const PORT = process.env.PORT || 5000;

let server = null;
if (!process.env.VERCEL) {
  server = app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` ResolveTrack Backend running on http://localhost:${PORT}`);
    console.log(` Health endpoint: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
}

module.exports = { app, server };
