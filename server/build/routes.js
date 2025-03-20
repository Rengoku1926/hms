"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const patientRoutes_1 = __importDefault(require("./routes/patientRoutes"));
const doctorRoutes_1 = __importDefault(require("./routes/doctorRoutes"));
const mappingRoutes_1 = __importDefault(require("./routes/mappingRoutes"));
const router = (0, express_1.Router)();
router.use(authRoutes_1.default);
router.use(patientRoutes_1.default);
router.use(doctorRoutes_1.default);
router.use(mappingRoutes_1.default);
exports.default = router;
