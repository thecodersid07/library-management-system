const express = require("express");
const pool = require("./db");

const app = express();

// Allows Express to read JSON request bodies
app.use(express.json());

const libraries = [
  {
    id: 1,
    name: "Central Library",
    location: "Main Campus",
  },
  {
    id: 2,
    name: "Engineering Library",
    location: "Engineering Block",
  },
  {
    id: 3,
    name: "Medical Library",
    location: "Medical Block",
  },
];

const books = [
  {
    id: 1,
    title: "Clean Code",
    author: "Robert Martin",
  },
  {
    id: 2,
    title: "Atomic Habits",
    author: "James Clear",
  },
  {
    id: 3,
    title: "DBMS Concepts",
    author: "Korth",
  },
];

// ========================================
// BOOK APIs
// ========================================
app.get("/api/books/:id", async (req, res) => {
  try {
    const bookId = Number(req.params.id);

    if (!Number.isInteger(bookId) || bookId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid book ID",
      });
    }

    const result = await pool.query(
      `SELECT
         books.id,
         books.title,
         books.author,
         libraries.name AS library_name
       FROM books
       JOIN libraries
       ON books.library_id = libraries.id
       WHERE books.id = $1`,
      [bookId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// GET one book by ID from PostgreSQL

// ========================================
// LIBRARY APIs
// ========================================

// GET all libraries
app.get("/api/libraries", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM libraries");

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Database error",
    });
  }
});

// GET one library by ID
app.get("/api/libraries/:id", async (req, res) => {
  try {
    const libraryId = Number(req.params.id);

    if (!Number.isSafeInteger(libraryId) || libraryId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid library ID",
      });
    }

    const result = await pool.query("SELECT * FROM libraries WHERE id = $1", [
      libraryId,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Library not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Database error",
    });
  }
});

// CREATE a new library
app.post("/api/libraries", async (req, res) => {
  try {
    const { name, location } = req.body;

    if (
      typeof name !== "string" ||
      typeof location !== "string" ||
      !name.trim() ||
      !location.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Name and location are required",
      });
    }

    const result = await pool.query(
      `INSERT INTO libraries (name, location)
       VALUES ($1, $2)
       RETURNING *`,
      [name.trim(), location.trim()],
    );

    return res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Database error",
    });
  }
});

// UPDATE a library
app.patch("/api/libraries/:id", async (req, res) => {
  try {
    const libraryId = Number(req.params.id);
    const { name, location } = req.body;

    const result = await pool.query(
      `UPDATE libraries
       SET name = COALESCE($1, name),
           location = COALESCE($2, location)
       WHERE id = $3
       RETURNING *`,
      [name ?? null, location ?? null, libraryId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Library not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// DELETE a library
app.delete("/api/libraries/:id", async (req, res) => {
  try {
    const libraryId = Number(req.params.id);

    const result = await pool.query(
      "DELETE FROM libraries WHERE id = $1 RETURNING *",
      [libraryId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Library not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Library deleted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

app.get("/api/books", async (req, res) => {
  try {
    const result = await pool.query(`SELECT
    books.id,
    books.title,
    books.author,
    libraries.name AS library_name
 FROM books
 JOIN libraries
 ON books.library_id = libraries.id
 ORDER BY books.id`);

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
