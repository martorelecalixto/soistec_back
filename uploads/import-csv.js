import express from "express";
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";
import { getPool } from "./db.js";
import sql from "mssql";

const app = express();
app.use(express.json());
const upload = multer({ dest: "uploads/" });

let cacheUltimoUpload = []; // armazena dados temporariamente até o usuário confirmar

// 🔹 1. Upload e pré-visualização
app.post("/upload-csv", upload.single("file"), (req, res) => {
  const filePath = req.file.path;
  const resultados = [];

  fs.createReadStream(filePath)
    .pipe(csv({ separator: ";" }))
    .on("data", (row) => resultados.push(row))
    .on("end", () => {
      fs.unlinkSync(filePath); // apaga o arquivo
      cacheUltimoUpload = resultados;
      res.json({ sucesso: true, dados: resultados });
    })
    .on("error", (err) => {
      console.error("Erro ao ler CSV:", err);
      res.status(500).json({ sucesso: false, erro: err.message });
    });
});

// 🔹 2. Confirmação e gravação no banco
app.post("/confirmar-importacao", async (req, res) => {
  try {
    const pool = await getPool();
    const dados = req.body.dados;

    let inseridos = 0;
    for (const linha of dados) {
      await pool
        .request()
        .input("venda_id", sql.VarChar, linha.venda_id)
        .input("pax_nome", sql.VarChar, linha.pax_nome)
        .input("tarifa", sql.Decimal(10, 2), linha.tarifa)
        .input("taxa", sql.Decimal(10, 2), linha.taxa)
        .query(
          "INSERT INTO vendas_importadas (venda_id, pax_nome, tarifa, taxa) VALUES (@venda_id, @pax_nome, @tarifa, @taxa)"
        );
      inseridos++;
    }

    res.json({ sucesso: true, inseridos });
  } catch (err) {
    console.error("Erro ao gravar:", err);
    res.status(500).json({ sucesso: false, erro: err.message });
  }
});

//app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
