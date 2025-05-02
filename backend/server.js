// server.mjs

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import pkg from "pg";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

const { Pool } = pkg;
const {
  DATABASE_URL,
  PGHOST,
  PGDATABASE,
  PGUSER,
  PGPASSWORD,
  PGPORT = 5432,
  PORT = 1337,
  JWT_SECRET
} = process.env;

// Postgres connection pool setup using provided snippet.
const pool = new Pool(
  DATABASE_URL
    ? { 
        connectionString: DATABASE_URL, 
        ssl: { require: true } 
      }
    : {
        host: PGHOST || "ep-ancient-dream-abbsot9k-pooler.eu-west-2.aws.neon.tech",
        database: PGDATABASE || "neondb",
        user: PGUSER || "neondb_owner",
        password: PGPASSWORD || "npg_jAS3aITLC5DX",
        port: Number(PGPORT),
        ssl: { require: true }
      }
);

const app = express();

// Enable CORS for all requests.
app.use(cors());
// Log incoming requests using morgan.
app.use(morgan("combined"));
// Parse JSON bodies for all endpoints.
app.use(express.json());

/*
  Utility function to generate a URL-friendly slug from a title.
  It converts text to lower case, replaces spaces with dashes, and removes unwanted characters.
*/
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")     // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-")   // Replace multiple - with single -
    .replace(/^-+/, "")       // Trim - from start of text
    .replace(/-+$/, "");      // Trim - from end of text
}

/*
  JWT authentication middleware to verify admin access.
  It looks for a Bearer token in the Authorization header and verifies it using JWT_SECRET.
  Only proceeds if the token payload contains is_admin set to true.
*/
function verifyAdminJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7, authHeader.length);
    try {
      const decoded = jwt.verify(token, JWT_SECRET || "defaultsecret");
      req.user = decoded;
      // Only allow if is_admin flag is true.
      if (decoded && decoded.is_admin) {
        return next();
      } else {
        return res.status(401).json({ message: "Unauthorized: Admin access required" });
      }
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
  } else {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }
}

/*
  GET /recipes
  Retrieves a list of recipe summaries with optional filtering by category_id and pagination (using page and limit).
*/
app.get("/recipes", async (req, res) => {
  const { category_id, page, limit } = req.query;
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 10;
  const offset = (pageNum - 1) * limitNum;

  try {
    let query = `SELECT id, title, slug, short_description, thumbnail_url, is_featured FROM recipes`;
    const values = [];
    if (category_id) {
      query += " WHERE category_id = $1";
      values.push(category_id);
    }
    query += " ORDER BY created_at DESC";
    query += " LIMIT $" + (values.length + 1) + " OFFSET $" + (values.length + 2);
    values.push(limitNum, offset);

    const result = await pool.query(query, values);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

/*
  GET /recipes/:id
  Fetches full details for a specific recipe identified by id.
*/
app.get("/recipes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const query = `SELECT * FROM recipes WHERE id = $1`;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching recipe by ID:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

/*
  GET /recipes/search
  Searches recipes using a query string that matches title or short_description.
*/
app.get("/recipes/search", async (req, res) => {
  const { query: searchQuery } = req.query;
  if (!searchQuery) {
    return res.status(400).json({ message: "Missing search query parameter" });
  }
  try {
    // ILIKE is used for case-insensitive search.
    const sql = `SELECT id, title, slug, short_description, thumbnail_url, is_featured FROM recipes
                 WHERE title ILIKE $1 OR short_description ILIKE $1`;
    const values = [`%${searchQuery}%`];
    const result = await pool.query(sql, values);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error searching recipes:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

/*
  GET /recipe_categories
  Retrieves all available recipe categories.
*/
app.get("/recipe_categories", async (req, res) => {
  try {
    const result = await pool.query(`SELECT id, name, description FROM recipe_categories`);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching recipe categories:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

/*
  POST /contacts
  Accepts a contact form submission and inserts the record into the contacts table.
  Generates a unique id and a submitted_at timestamp.
*/
app.post("/contacts", async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: "Name, email, and message are required" });
  }
  try {
    const id = uuidv4();
    const submitted_at = new Date().toISOString();
    const query = `
      INSERT INTO contacts (id, name, email, message, submitted_at)
      VALUES ($1, $2, $3, $4, $5) RETURNING *`;
    const values = [id, name, email, message, submitted_at];
    const result = await pool.query(query, values);
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error inserting contact:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

/*
  POST /subscriptions
  Accepts an email address for subscription and inserts it into the subscriptions table.
  Generates a unique id and a subscribed_at timestamp.
*/
app.post("/subscriptions", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  try {
    const id = uuidv4();
    const subscribed_at = new Date().toISOString();
    const query = `
      INSERT INTO subscriptions (id, email, subscribed_at)
      VALUES ($1, $2, $3) RETURNING *`;
    const values = [id, email, subscribed_at];
    const result = await pool.query(query, values);
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    // Unique violation error code in Postgres is 23505.
    if (error.code === "23505") {
      return res.status(400).json({ message: "Email already subscribed" });
    }
    console.error("Error inserting subscription:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

/*
  GET /site_settings
  Retrieves global site configuration settings from the site_settings table.
*/
app.get("/site_settings", async (req, res) => {
  try {
    const result = await pool.query(`SELECT id, key, value FROM site_settings`);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching site settings:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

/*
  POST /auth/login
  Authenticates an admin user using provided email and password.
  Securely compares the submitted password with the stored hashed password using bcrypt.
  On successful authentication, a JWT token is generated with payload including the is_admin flag.
*/
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  
  try {
    const query = `SELECT * FROM users WHERE email = $1`;
    const result = await pool.query(query, [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Authentication failed. Invalid credentials." });
    }
    
    const user = result.rows[0];
    
    // Securely compare provided password with the stored hashed password using bcrypt.
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ message: "Authentication failed. Invalid credentials." });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email, is_admin: user.is_admin },
      JWT_SECRET || "defaultsecret",
      { expiresIn: "1h" }
    );
    
    return res.status(200).json({ token });
    
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

/*
  POST /recipes (Admin Only)
  Allows an admin to create a new recipe.
  Automatically generates id, slug, created_at, and updated_at.
  Ingredients and instructions arrays are stringified to store as JSON.
*/
app.post("/recipes", verifyAdminJWT, async (req, res) => {
  const {
    title,
    short_description,
    full_description,
    image_url,
    thumbnail_url,
    ingredients,
    instructions,
    cooking_time_minutes,
    prep_time_minutes,
    serving_size,
    difficulty,
    category_id,
    is_featured
  } = req.body;
  
  if (
    !title ||
    !short_description ||
    !full_description ||
    !image_url ||
    !thumbnail_url ||
    !ingredients ||
    !instructions ||
    cooking_time_minutes === undefined ||
    prep_time_minutes === undefined ||
    !difficulty ||
    !category_id
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  
  try {
    const id = uuidv4();
    const slug = slugify(title);
    const created_at = new Date().toISOString();
    const updated_at = created_at;
    const query = `
      INSERT INTO recipes 
      (id, title, slug, short_description, full_description, image_url, thumbnail_url, ingredients, instructions, cooking_time_minutes, prep_time_minutes, serving_size, difficulty, category_id, is_featured, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`;
    const values = [
      id,
      title,
      slug,
      short_description,
      full_description,
      image_url,
      thumbnail_url,
      JSON.stringify(ingredients),
      JSON.stringify(instructions),
      cooking_time_minutes,
      prep_time_minutes,
      serving_size || null,
      difficulty,
      category_id,
      is_featured || false,
      created_at,
      updated_at
    ];
    const result = await pool.query(query, values);
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating recipe:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

/*
  PUT /recipes/:id (Admin Only)
  Allows an admin to update an existing recipe.
  Accepts any updatable field; if the title is updated, the slug is recalculated.
  The updated_at field is automatically refreshed.
*/
app.put("/recipes/:id", verifyAdminJWT, async (req, res) => {
  const { id } = req.params;
  const fields = [
    "title",
    "short_description",
    "full_description",
    "image_url",
    "thumbnail_url",
    "ingredients",
    "instructions",
    "cooking_time_minutes",
    "prep_time_minutes",
    "serving_size",
    "difficulty",
    "category_id",
    "is_featured"
  ];
  const updates = [];
  const values = [];
  let index = 1;
  for (const key of fields) {
    if (req.body[key] !== undefined) {
      if (key === "title") {
        // If title is updated, recalc slug.
        updates.push(`slug = $${index + 1}`);
        values.push(slugify(req.body[key]));
        index++;
      }
      updates.push(`${key} = $${index}`);
      if (key === "ingredients" || key === "instructions") {
        values.push(JSON.stringify(req.body[key]));
      } else {
        values.push(req.body[key]);
      }
      index++;
    }
  }
  if (updates.length === 0) {
    return res.status(400).json({ message: "No valid fields provided for update" });
  }
  
  const query = `
    UPDATE recipes SET ${updates.join(", ")}, updated_at = $${index} WHERE id = $${index + 1} RETURNING *`;
  values.push(new Date().toISOString(), id);
  try {
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error updating recipe:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

/*
  DELETE /recipes/:id (Admin Only)
  Deletes the specified recipe from the database.
*/
app.delete("/recipes/:id", verifyAdminJWT, async (req, res) => {
  const { id } = req.params;
  try {
    const query = `DELETE FROM recipes WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    return res.status(200).json({ message: "Recipe deleted successfully" });
  } catch (error) {
    console.error("Error deleting recipe:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

const port = PORT || 1337;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});