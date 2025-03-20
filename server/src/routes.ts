import { Router } from "express";
import authRoutes from "./routes/authRoutes"
import patientRoutes from "./routes/patientRoutes"
import doctorRoutes from "./routes/doctorRoutes"
import mappingRoutes from "./routes/mappingRoutes"

const router = Router();

router.use(authRoutes);
router.use(patientRoutes);
router.use(doctorRoutes)
router.use(mappingRoutes)

export default router;
