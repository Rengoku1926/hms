import { Router, Request, Response } from "express";
import prisma from "../prisma/client";
import { authenticateJWT, AuthenticatedRequest } from "../middleware/authMiddleware";

const router = Router();

// POST /api/doctors - Add a new doctor (authenticated users only)
router.post("/doctors", authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, speciality } = req.body;
    if (!name) {
        res.status(400).json({ error: "Doctor name is required." });
        return
    }
    const doctor = await prisma.doctor.create({
      data: { name, speciality },
    });
    res.status(201).json(doctor);
  } catch (error) {
    console.error("Create doctor error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// GET /api/doctors - Retrieve all doctors
router.get("/doctors", async (req: Request, res: Response) => {
  try {
    const doctors = await prisma.doctor.findMany();
    res.json(doctors);
  } catch (error) {
    console.error("Get doctors error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// GET /api/doctors/:id - Get details of a specific doctor
router.get("/doctors/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const doctor = await prisma.doctor.findUnique({ where: { id: Number(id) } });
    if (!doctor) {
      res.status(404).json({ error: "Doctor not found." });
      return 
    }
    res.json(doctor);
  } catch (error) {
    console.error("Get doctor error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// PUT /api/doctors/:id - Update doctor details (authenticated)
router.put("/doctors/:id", authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, speciality } = req.body;
    const doctor = await prisma.doctor.findUnique({ where: { id: Number(id) } });
    if (!doctor) {
      res.status(404).json({ error: "Doctor not found." });
      return 
    }
    const updatedDoctor = await prisma.doctor.update({
      where: { id: Number(id) },
      data: { name: name || doctor.name, speciality: speciality || doctor.speciality },
    });
    res.json(updatedDoctor);
  } catch (error) {
    console.error("Update doctor error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// DELETE /api/doctors/:id - Delete a doctor record (authenticated)
router.delete("/doctors/:id", authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const doctor = await prisma.doctor.findUnique({ where: { id: Number(id) } });
    if (!doctor) {
      res.status(404).json({ error: "Doctor not found." });
      return 
    }
    await prisma.doctor.delete({ where: { id: Number(id) } });
    res.json({ message: "Doctor deleted successfully." });
  } catch (error) {
    console.error("Delete doctor error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
