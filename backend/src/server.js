import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("MedSync Backend Running");
});

app.listen(5000, () => {
  console.log("Backend running on port 5000");
});