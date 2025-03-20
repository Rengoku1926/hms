"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
// Middleware to parse JSON
app.use(express_1.default.json());
// Mount all routes under the /api prefix
app.use("/api", routes_1.default);
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
