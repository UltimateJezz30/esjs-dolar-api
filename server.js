import express from "express";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Ruta del archivo que contiene la tasa oficial BCV del Dólar y Euro
const bcvPath = path.join(__dirname, "datos/ve/v1/dolares/oficial/index.json");

app.get("/api/bcv", (req, res) => {
  try {
    const json = JSON.parse(readFileSync(bcvPath, "utf8"));
    res.json(json);
  } catch (err) {
    res.status(500).json({ error: "No se pudo leer el archivo del BCV." });
  }
});

app.listen(PORT, () => {
  console.log("✅ API BCV corriendo en puerto:", PORT);
});
