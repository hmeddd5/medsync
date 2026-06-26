import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import patientsRoutes from "./routes/patientsRoutes.js";
import appointmentsRoutes from "./routes/appointmentsRoutes.js";
import consultationsRoutes from "./routes/consultationsRoutes.js";
import prescriptionsRoutes from "./routes/prescriptionsRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientsRoutes);
app.use("/api/appointments", appointmentsRoutes);
app.use("/api/consultations", consultationsRoutes);
app.use("/api/prescriptions", prescriptionsRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "MedSync API running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});