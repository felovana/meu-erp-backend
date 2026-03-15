const express = require('express');
const cors = require('cors');
const { Client } = require('pg');

const app = express();
app.use(express.json());
app.use(cors());

const db = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

db.connect()
    .then(() => console.log("Conectado ao Supabase com sucesso!"))
    .catch(err => console.error("Erro de conexão:", err));

// Listar (Read)
app.get('/products', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM "products"');
        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Cadastrar (POST)
app.post('/products', async (req, res) => {
    const { Name, Price } = req.body;
    try {
        const sql = 'INSERT INTO "products" ("Name", "Price") VALUES ($1, $2) RETURNING *';
        const result = await db.query(sql, [Name, Price]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Editar (PUT)
app.put('/products/:id', async (req, res) => {
    const { id } = req.params;
    const { Name, Price } = req.body;
    try {
        const sql = 'UPDATE "products" SET "Name" = $1, "Price" = $2 WHERE "Id" = $3';
        await db.query(sql, [Name, Price, id]);
        res.json({ message: "Atualizado com sucesso" });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Deletar (DELETE)
app.delete('/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const sql = 'DELETE FROM "products" WHERE "Id" = $1';
        await db.query(sql, [id]);
        res.json({ message: "Excluído com sucesso" });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
