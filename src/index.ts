import express, { Request, Response } from "express";
import mysql from "mysql2/promise";

const app = express();

// Configura EJS como a engine de renderização de templates
app.set("view engine", "ejs");
app.set("views", `${__dirname}/views`);

const connection = mysql.createPool({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "unicesumar",
});

// Middleware para permitir dados no formato JSON
app.use(express.json());
// Middleware para permitir dados no formato URLENCODED
app.use(express.urlencoded({ extended: true }));
// Lista de Categories
app.get("/categories", async function (req: Request, res: Response) {
  const [rows] = await connection.query("SELECT * FROM categories");
  return res.render("categories/index", {
    categories: rows,
  });
});

app.get("/categories/form", async function (req: Request, res: Response) {
  return res.render("categories/form");
});

app.post("/categories/save", async function (req: Request, res: Response) {
  const body = req.body;
  const insertQuery = "INSERT INTO categories (name) VALUES (?)";
  await connection.query(insertQuery, [body.name]);

  res.redirect("/categories");
});

app.post(
  "/categories/delete/:id",
  async function (req: Request, res: Response) {
    const id = req.params.id;
    const sqlDelete = "DELETE FROM categories WHERE id = ?";
    await connection.query(sqlDelete, [id]);

    res.redirect("/categories");
  }
);

// Requisitos Funcionais
// Cadastro de Usuarios
app.get("/users", async function (req: Request, res: Response) {
  const [rows] = await connection.query("SELECT * FROM users");
  return res.render("users/index", {
    users: rows,
  });
});

app.get("/users/add", async function (req: Request, res: Response) {
  return res.render("users/add");
});

app.post("/users", async function (req: Request, res: Response) {
  const { name, email, password, papel, active } = req.body;
  const isActive = active === "on" ? 1 : 0;
  const insertQuery = `
    INSERT INTO users (name, email, password, papel, active, created_at) 
    VALUES (?, ?, ?, ?, ?, NOW())`;
  await connection.query(insertQuery, [name, email, password, papel, isActive]);
  res.redirect("/users");
});

app.post("/users/delete/:id", async function (req: Request, res: Response) {
  const id = req.params.id;
  const deleteQuery = "DELETE FROM users WHERE id = ?";
  await connection.query(deleteQuery, [id]);
  res.redirect("/users");
});


app.get("/users/edit/:id", async function (req: Request, res: Response) {
  const id = req.params.id;
  const [rows] = await connection.query("SELECT * FROM users WHERE id = ?", [id]);
  const user = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;

  if (user) {
    return res.render("users/edit", {
      user,
    });
  } else {
    res.redirect("/users");
  }
});

app.post("/users/update/:id", async function (req: Request, res: Response) {
  const id = req.params.id;
  const { name, email, password, papel, active } = req.body;
  const isActive = active === "on" ? 1 : 0;
  
  const updateQuery = `
    UPDATE users 
    SET name = ?, email = ?, password = ?, papel = ?, active = ? 
    WHERE id = ?`;
    
  await connection.query(updateQuery, [name, email, password, papel, isActive, id]);
  
  res.redirect("/users");
});


// Formulario de Login
app.get("/login", async function (req: Request, res: Response) {
  return res.render("login/index");
});

app.post("/login", async function (req: Request, res: Response) {
  const { email, password } = req.body;
  const query = "SELECT * FROM users WHERE email = ? AND password = ?";
  const [result] = await connection.query(query, [email, password]);

  if (Array.isArray(result) && result.length > 0) {
    res.redirect("/users");
  } else {
    res.redirect("/login");
  }
});

// Requisitos Estaticos
// Pagina Inicial
app.get("/blog", async function (req: Request, res: Response) {
  return res.render("blog/index");
});

app.listen("4000", () => console.log("Server is listening on port 4000"));
