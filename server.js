/* const express = require('express');
//const mysql = require('mysql2');
const cors = require('cors');
const { Client } = require('pg');

const app = express();
app.use(express.json());
app.use(cors()); //Libera Para o Angular Acessar

const db = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});
db.connect()
    .then(() => console.log("Conectado ao Superbase (Postgress)!"))
    .catch(err => console.error("Erro de conexão:", err));

//Listar (Read)
app.get('/products', (req, res)=> {
    db.query('SELECT * FROM products', (err, result) => {
        res.send(result);
    });
});

//Cadastrar (POST)
app.post('/products', (req, res) => {
    const { Name, Price } = req.body;
    db.query('INSERT INTO products (Name, Price) VALUES (?, ?)', [Name, Price], (err, result) => {
        if (err) {
            console.error("Erro ao inserir no banco:", err);
            return res.status(500).send(err);
        }
        res.status(201).send(result);
    });
});

//Editar (PUT)
app.put('/products/:id', (req, res) => {
    const { id } = req.params;
    const { Name, Price } = req.body;
    db.query('UPDATE products SET Name = ?, Price = ? WHERE Id = ?', [Name, Price, id], (err, result) => res.json(result))
});

//Deletar (DELETE)
app.delete('/products/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM products WHERE Id = ?', [id], (err, result) => res.json(result));
});

app.listen(3000, () => console.log("Servidor Node Rodando na Porta 3000")); */

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
    .then(() => console.log("Conectado ao Supabase (Postgres)!"))
    .catch(err => console.error("Erro de conexão:", err));

/* // Listar (Read) - Ajustado: result.rows e aspas na tabela
app.get('/products', (req, res) => {
    db.query('SELECT * FROM "products"', (err, result) => {
        if (err) return res.status(500).send(err);
        res.send(result.rows); // O Angular precisa do .rows
    });
}); */

// Listar (Read) - Versão moderna com Async/Await
app.get('/products', async (req, res) => {
    try {
      // O Postgres é rigoroso: use aspas duplas se a tabela começar com Maiúscula
      const result = await db.query('SELECT * FROM "products"'); 
      res.json(result.rows); // No Postgres, os dados SEMPRE estão em .rows
    } catch (err) {
      console.error("Erro na consulta:", err);
      res.status(500).send("Erro ao buscar dados no banco");
    }
});


// Cadastrar (POST) - Ajustado: $1, $2 e aspas nas colunas
app.post('/products', (req, res) => {
    const { Name, Price } = req.body;
    const sql = 'INSERT INTO "products" ("Name", "Price") VALUES ($1, $2)';
    db.query(sql, [Name, Price], (err, result) => {
        if (err) {
            console.error("Erro ao inserir:", err);
            return res.status(500).send(err);
        }
        res.status(201).send(result);
    });
});

// Editar (PUT) - Ajustado: $1, $2, $3 e aspas
app.put('/products/:id', (req, res) => {
    const { id } = req.params;
    const { Name, Price } = req.body;
    const sql = 'UPDATE "products" SET "Name" = $1, "Price" = $2 WHERE "Id" = $3';
    db.query(sql, [Name, Price, id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});

// Deletar (DELETE) - Ajustado: $1 e aspas
app.delete('/products/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM "products" WHERE "Id" = $1';
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});

// Ajuste para o Render usar a porta correta
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor Node Rodando na Porta ${PORT}`));
