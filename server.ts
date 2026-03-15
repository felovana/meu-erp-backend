import express, { Request, Response } from 'express';
import cors from 'cors';
import { Client } from 'pg';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();
app.use(express.json());
app.use(cors());

const db = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

db.connect()
    .then(() => console.log("✅ Conectado ao Supabase!"))
    .catch(err => {
        console.error("❌ Erro de conexão (Provavelmente falta a DATABASE_URL local):");
        // Não deixa o processo morrer, apenas avisa
    });


// --- O CRUD UNIVERSAL ---

// 1. LISTAR QUALQUER TABELA
app.get('/:tabela', async (req: Request, res: Response) => {
    const { tabela } = req.params;
    try {
        // Usamos aspas duplas para o Postgres aceitar nomes como "users" ou "products"
        const result = await db.query(`SELECT * FROM "${tabela}"`);
        res.json(result.rows);
    } catch (err: any) {
        res.status(500).send(`Erro ao listar ${tabela}: ` + err.message);
    }
});

// 2. SALVAR/CADASTRAR (Insert Genérico)
app.post('/:tabela', async (req: Request, res: Response) => {
    const { tabela } = req.params;
    const dados = req.body; // Recebe o objeto/array do Angular
    
    const colunas = Object.keys(dados).map(key => `"${key}"`).join(', ');
    const valores = Object.values(dados);
    const placeholders = valores.map((_, i) => `$${i + 1}`).join(', ');

    const sql = `INSERT INTO "${tabela}" (${colunas}) VALUES (${placeholders}) RETURNING *`;

    try {
        const result = await db.query(sql, valores);
        res.status(201).json(result.rows[0]);
    } catch (err: any) {
        res.status(500).send(`Erro ao salvar em ${tabela}: ` + err.message);
    }
});

// 3. EDITAR (Update Genérico)
app.put('/:tabela/:id', async (req: Request, res: Response) => {
    const { tabela, id } = req.params;
    const dados = req.body;
    
    const sets = Object.keys(dados).map((key, i) => `"${key}" = $${i + 1}`).join(', ');
    const valores = Object.values(dados);
    
    const sql = `UPDATE "${tabela}" SET ${sets} WHERE "Id" = $${valores.length + 1}`;

    try {
        await db.query(sql, [...valores, id]);
        res.json({ message: "Atualizado!" });
    } catch (err: any) {
        res.status(500).send(err.message);
    }
});

// 4. DELETAR
app.delete('/:tabela/:id', async (req: Request, res: Response) => {
    const { tabela, id } = req.params;
    try {
        await db.query(`DELETE FROM "${tabela}" WHERE "Id" = $1`, [id]);
        res.json({ message: "Excluído!" });
    } catch (err: any) {
        res.status(500).send(err.message);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 CRUD Universal rodando na porta ${PORT}`));
