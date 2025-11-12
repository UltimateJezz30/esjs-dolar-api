import express from "express";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 10000;

let cache = {
  dolar_BCV: null,
  euro_BCV: null,
  fecha_actualizacion: null,
  ultima_consulta: null,
};

async function obtenerTasasBCV() {
  try {
    const res = await fetch("https://www.bcv.org.ve/");
    const html = await res.text();
    const $ = cheerio.load(html);

    const tasaDolar = $("#dolar .centrado").first().text().trim();
    const tasaEuro = $("#euro .centrado").first().text().trim();

    if (!tasaDolar || !tasaEuro) {
      throw new Error("No se pudieron extraer las tasas del HTML del BCV.");
    }

    const fecha = new Date().toLocaleString("es-VE", {
      timeZone: "America/Caracas",
    });

    cache = {
      dolar_BCV: tasaDolar,
      euro_BCV: tasaEuro,
      fecha_actualizacion: fecha,
      ultima_consulta: new Date(),
    };

    console.log(`✅ Tasas actualizadas: USD=${tasaDolar}, EUR=${tasaEuro}`);
    return cache;
  } catch (err) {
    console.error("❌ Error extrayendo tasas del BCV:", err.message);
    throw err;
  }
}

function esDiaHabil() {
  const hoy = new Date();
  const dia = hoy.getDay();
  return dia >= 1 && dia <= 5;
}

function iniciarActualizacionDiaria() {
  console.log("📅 Programando actualización diaria (lunes a viernes a las 8:00 AM)");

  if (esDiaHabil()) obtenerTasasBCV();

  setInterval(async () => {
    const horaActual = new Date().toLocaleString("es-VE", {
      timeZone: "America/Caracas",
      hour12: false,
    });
    const hora = new Date(horaActual).getHours();

    if (esDiaHabil() && hora === 8) {
      console.log("⏰ Ejecutando actualización diaria del BCV...");
      await obtenerTasasBCV();
    }
  }, 60 * 60 * 1000); 

app.get("/", async (req, res) => {
  try {

    if (!cache.dolar_BCV || !cache.euro_BCV) {
      console.log("⚙️ No hay caché, extrayendo tasas iniciales...");
      await obtenerTasasBCV();
    }

    res.json({
      fuente: "Banco Central de Venezuela (https://www.bcv.org.ve/)",
      dolar_BCV: cache.dolar_BCV,
      euro_BCV: cache.euro_BCV,
      fecha_actualizacion: cache.fecha_actualizacion,
      ultima_consulta: new Date().toLocaleString("es-VE", {
        timeZone: "America/Caracas",
      }),
    });
  } catch (err) {
    res.status(500).json({
      error: "Error obteniendo tasas del BCV",
      detalle: err.message,
    });
  }
});

app.get("/estado", (req, res) => {
  res.json({
    estado: "OK",
    cache,
    servidor: "API BCV Express Render",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  iniciarActualizacionDiaria();
});
