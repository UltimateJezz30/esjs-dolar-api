import express from "express";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 10000;

async function obtenerTasasBCV() {
  try {
    const response = await fetch("https://www.bcv.org.ve/");
    const html = await response.text();
    const $ = cheerio.load(html);
    const tasaDolar = $("#dolar .centrado").first().text().trim();
    const tasaEuro = $("#euro .centrado").first().text().trim();

    if (!tasaDolar || !tasaEuro) {
      throw new Error("No se pudieron extraer las tasas del HTML del BCV.");
    }

    return {
      fuente: "Banco Central de Venezuela (https://www.bcv.org.ve/)",
      dolar_BCV: tasaDolar,
      euro_BCV: tasaEuro,
      fecha_actualizacion: new Date().toLocaleString("es-VE", {
        timeZone: "America/Caracas",
      }),
    };
  } catch (error) {
    console.error("Error extrayendo tasas del BCV:", error.message);
    throw error;
  }
}

app.get("/", async (req, res) => {
  try {
    const tasas = await obtenerTasasBCV();
    res.json(tasas);
  } catch (err) {
    res.status(500).json({
      error: "Error obteniendo tasas del BCV",
      detalle: err.message,
    });
  }
});

app.get("/tasas", async (req, res) => {
  try {
    const tasas = await obtenerTasasBCV();
    res.json(tasas);
  } catch (err) {
    res.status(500).json({
      error: "Error obteniendo tasas del BCV",
      detalle: err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ API BCV ejecutándose en el puerto ${PORT}`);
});
