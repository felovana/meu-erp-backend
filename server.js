// FORÇA BRUTA: Ignora o erro de certificado SSL (Self-signed) no Node.js
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const express = require('express');
const cors = require('cors');
const { Client } = require('pg'); // Driver do Postgres (Supabase)

const app = express();
app.use(express.json());
app.use(cors());

// Conexão com a DATABASE_URL do Render (Cofre) usando SSL flexível
const db = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

db.connect()
    .then(() => console.log("✅ CONECTADO AO SUPABASE COM SUCESSO!"))
    .catch(err => console.error("❌ ERRO DE CONEXÃO NO BANCO:", err));

// 1. LISTAR (Read)
app.get('/products', async (req, res) => {
    try {
        // No Postgres, colunas com iniciais Maiúsculas precisam de aspas duplas
        const result = await db.query('SELECT "Id", "Name", "Price" FROM products');
        res.json(result.rows); // Os dados SEMPRE vêm em .rows
    } catch (err) {
        console.error("Erro ao buscar:", err);
        res.status(500).send("Erro no banco: " + err.message);
    }
});

// 2. CADASTRAR (Create)
app.post('/products', async (req, res) => {
    const { Name, Price } = req.body;
    try {
        const sql = 'INSERT INTO products ("Name", "Price") VALUES ($1, $2) RETURNING *';
        const result = await db.query(sql, [Name, Price]);
        res.status(201).json(result.rows[0]); // Retorna o item criado
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// 3. EDITAR (Update)
app.put('/products/:id', async (req, res) => {
    const { id } = req.params;
    const { Name, Price } = req.body;
    try {
        const sql = 'UPDATE products SET "Name" = $1, "Price" = $2 WHERE "Id" = $3';
        await db.query(sql, [Name, Price, id]);
        res.json({ message: "Atualizado com sucesso!" });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// 4. EXCLUIR (Delete)
app.delete('/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const sql = 'DELETE FROM products WHERE "Id" = $1';
        await db.query(sql, [id]);
        res.json({ message: "Excluído com sucesso!" });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Porta dinâmica para o Render (Ele usa a 10000 internamente)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
