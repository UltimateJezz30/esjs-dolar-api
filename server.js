import express from "express";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 10000;

async function obtenerTasasBCV() {
  const url = "https://www.bcv.org.ve/";
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);

  const dolar = $("#dolar .centrado").first().text().trim();
  const euro = $("#euro .centrado").first().text().trim();

  return {
    fuente: "Banco Central de Venezuela (BCV)",
    fecha_actualizacion: new Date().toLocaleString("es-VE", { timeZone: "America/Caracas" }),
    tasa_dolar_bcv: dolar || "No disponible",
    tasa_euro_bcv: euro || "No disponible"
  };
}

app.get("/", async (req, res) => {
  try {
    const tasas = await obtenerTasasBCV();
    res.json(tasas);
  } catch (err) {
    console.error("Error al obtener tasas:", err);
    res.status(500).json({ error: "No se pudieron obtener las tasas del BCV" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});
