import express from "express";

import {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
} from "../controllers/patientsController.js";

import {
  authenticateToken,
  authorizeRoles,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST"),
  getPatients
);

router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST"),
  getPatientById
);

router.post(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "RECEPTIONIST"),
  createPatient
);

router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("ADMIN", "RECEPTIONIST"),
  updatePatient
);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("ADMIN"),
  deletePatient
);

export default router;