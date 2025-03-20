import express from "express";
import dotenv from "dotenv";
import routes from "./routes";
import cors from "cors"
import serverless from "serverless-http";

dotenv.config();


const app = express();
app.use(cors())

// Middleware to parse JSON
app.use(express.json());

// Mount all routes under the /api prefix
app.use("/api", routes);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT,'0.0.0.0', () => console.log(`Server running on port ${PORT}`));
