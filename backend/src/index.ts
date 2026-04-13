import { config } from "dotenv";
import https from "https";
import fs from "fs";
// Load env as early as possible
config();

import app from "./app";
import { connectToDatabase } from "./db/connection.js";

const PORT = process.env.PORT || 5000;
const USE_HTTPS = process.env.HTTPS === "true";

connectToDatabase()
  .then(() => {
    if (USE_HTTPS) {
      const options = {
        key: fs.readFileSync(process.env.SSL_KEY_PATH!),
        cert: fs.readFileSync(process.env.SSL_CERT_PATH!),
      };

      https.createServer(options, app).listen(PORT, () => {
        console.log(`HTTPS Server running on https://localhost:${PORT}`);
                console.log(`Server Open & Connected to Database — listening on port ${PORT}`);
      });

    } else {
      app.listen(PORT, () => {
        console.log(`HTTP Server running on http://localhost:${PORT}`);
        console.log(`Server Open & Connected to Database — listening on port ${PORT}`);
      });
    }
  })
  .catch((err) => {
    console.error("DB connection failed:", err);
  });