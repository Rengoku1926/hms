import express from "express";
import dotenv from "dotenv";
import routes from "./routes";
import cors from "cors";
import serverless from "serverless-http";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", routes);

// Only start the server if not running in a serverless environment
if (!process.env.VERCEL_ENV) {
  const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
  app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
}

export const handler = serverless(app);
