// 1. FORÇA BRUTA: Ignora erros de certificado SSL (Essencial para o Render)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const express = require('express');
const cors = require('cors');
const { Client } = require('pg'); // Driver do Postgres

const app = express();
app.use(express.json());
app.use(cors());

// 2. CONEXÃO SEGURA (Separando os dados para evitar erro de senha na URL)
const db = new Client({
    host: 'aws-1-sa-east-1.pooler.supabase.com',
    port: 6543, // Porta do Pooler que o Render aceita
    user: 'postgres.vwgalzllrdlfbuwdgapc', // Seu usuário completo do Supabase
    password: process.env.DB_PASSWORD,    // Vamos cadastrar no Render
    database: 'postgres',
    ssl: {
        rejectUnauthorized: false
    }
});

db.connect()
    .then(() => console.log("✅ AGORA FOI! CONECTADO AO SUPABASE COM SUCESSO!"))
    .catch(err => console.error("❌ ERRO DE SENHA OU CONEXÃO NO BANCO:", err));

// 3. LISTAR (Read)
app.get('/products', async (req, res) => {
    try {
        // No Postgres/Supabase, nomes com iniciais Maiúsculas precisam de aspas duplas ""
        const result = await db.query('SELECT "Id", "Name", "Price" FROM products');
        res.json(result.rows); // Os dados sempre ficam em .rows
    } catch (err) {
        console.error("Erro ao buscar:", err);
        res.status(500).send("Erro no banco: " + err.message);
    }
});

// 4. CADASTRAR (Create)
app.post('/products', async (req, res) => {
    const { Name, Price } = req.body;
    try {
        const sql = 'INSERT INTO products ("Name", "Price") VALUES ($1, $2) RETURNING *';
        const result = await db.query(sql, [Name, Price]);
        res.status(201).json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// 5. EDITAR (Update)
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

// 6. EXCLUIR (Delete)
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

// 7. PORTA DINÂMICA (O Render usa a porta 10000)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
