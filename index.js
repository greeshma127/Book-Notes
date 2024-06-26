import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app=express();
const port=3000;

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "books",
    password: "yourpassword",
    port: 5432,
  });

db.connect();

var books=[];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/",async(req,res)=>{
    const result=await db.query("SELECT * FROM book_data ORDER BY id DESC");
    const items=result.rows;
    //console.log(items);
    res.render("index.ejs",{items:items,});
});

app.get("/add",(req,res)=>{
    res.render("add.ejs");
})

app.post("/add", async (req, res) => {
    const { title, author, isbn, date, review, note } = req.body;
    try {
        // Insert values into the table, excluding the 'id' column
        const query = {
            text: "INSERT INTO book_data (title, author, isbn, date, review, note) VALUES ($1, $2, $3, $4, $5, $6)",
            values: [title, author, isbn, date, review, note]
        };
        await db.query(query);
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error inserting data");
    }
});

app.get("/view/:id",async(req,res)=>{
    const bookId = req.params.id;
    try {
        const result = await db.query("SELECT * FROM book_data WHERE id = $1", [bookId]);
        const book = result.rows[0]; // Assuming only one book matches the ID
        if (book) {
            res.render("view.ejs", { book: book });
        } else {
            res.status(404).send("Book not found");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching book details");
    }
});

app.get("/edit/:id", async (req, res) => {
    const bookId = req.params.id;
    try {
        const result = await db.query("SELECT * FROM book_data WHERE id = $1", [bookId]);
        const book = result.rows[0]; // Assuming only one book matches the ID
        if (book) {
            res.render("edit.ejs", { book: book });
        } else {
            res.status(404).send("Book not found");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching book details");
    }
});


app.post("/edit/:id", async (req, res) => {
    const id = req.params.id;
    const { title, author, review, isbn, note } = req.body;
    try {
        // Update values in the table based on book ID
        const query = {
            text: "UPDATE book_data SET title = $1, author = $2, review = $3, note = $4, isbn=$5 WHERE id = $6",
            values: [title, author, review, note,isbn, id]
        };
        await db.query(query);
        res.redirect(`/view/${id}`); // Redirect to view updated book
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating data");
    }
});

app.post("/delete/:id", async (req, res) => {
    const id = req.params.id;
    try {
        // Delete the book from the database based on id
        await db.query("DELETE FROM book_data WHERE id = $1", [id]);
        res.redirect("/"); // Redirect to the home page or another appropriate page after deletion
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting data");
    }
});

app.get("/about",(req,res)=>{
    res.render("about.ejs");
})

app.listen(port,()=>{
    console.log(`Server running at port ${port}`);
});