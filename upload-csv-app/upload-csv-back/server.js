const express = require('express');
const cors = require('cors');

const multer = require('multer');
const fs = require("fs");
const csv = require("csv-parser");

const app = express();
const PORT = 7000;
const upload = multer({ dest: 'uploads/' });
const pool = require("./db");

app.use(cors({
  origin: "http://localhost:3000"
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is running');
});

app.post('/upload', upload.single('file'), async (req, res) => {
  console.log('File received:', req.file);

  const results = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => {
      results.push(data);
    })
    .on('end', async () => {
      // await pool.query("DELETE FROM tbl_data"); //testing
      await insertToDB(results);

      res.json({
        success: true,
        rowsInserted: results.length,
      });
    });
});

app.get("/data", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";

    const offset = (page - 1) * limit;

    const searchQuery = `WHERE name LIKE $1 OR email LIKE $1 OR body LIKE $1`; // postid and id?
    const searchValue = `%${search}%`;

    const fullQuery = `
      SELECT * FROM tbl_data ${search ? searchQuery : ""} 
      ORDER BY id
      LIMIT ${search ? '$2' : '$1'} OFFSET ${search ? '$3' : '$2'}`;
    const fullValue = search ? [searchValue, limit, offset] : [limit, offset];
    const result = await pool.query(fullQuery, fullValue);
          console.log("FULL RESULT:", result.rows);

    const count = await getTotalRows(search, searchQuery, searchValue);
    
    res.json({
      data: result.rows,
      count,
      page,
      totalPages: Math.ceil(count/limit)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

app.get("/checkDuplicates", async (req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(*) FROM tbl_data WHERE duplicateId IS NOT NULL");
    res.json(result.rows[0].count);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

app.get("/checkConflicts", async (req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(*) FROM tbl_data WHERE conflictId IS NOT NULL");
    res.json(result.rows[0].count);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});

async function insertToDB(data) {
  for (const row of data) {
    // check if row is duplicated or conflicted before inserting
    const exist = await checkRow(row);
    if(!exist) {
      await pool.query(
        "INSERT INTO tbl_data(postid,id,name,email,body) VALUES($1, $2, $3, $4, $5)",
        [row.postId, row.id, row.name, row.email, row.body]
      );
    }
      
  }
}

async function checkRow(row) {
  const existingRow = await pool.query(`SELECT * FROM tbl_data WHERE id = ${row.id}`);
  if(existingRow.rows[0] != null) {
    const rowInfo = existingRow.rows[0];
    if( rowInfo.name === row.name && rowInfo.email === row.email && rowInfo.body === row.body ) {
      await pool.query(`UPDATE tbl_data SET duplicateId = ${rowInfo.id} WHERE id = ${rowInfo.id}`);
    } else {
      await pool.query(`UPDATE tbl_data SET conflictId = ${rowInfo.id} WHERE id = ${rowInfo.id}`);
    }
  // if ID exists and contents are the same, update duplicateId
  // if ID exists and contents are not the same, update conflictId
    return true;
  } else {
    return false;
  }
}

async function getTotalRows(search, searchQuery, searchValue) {
  const countQuery = `SELECT COUNT(*) FROM tbl_data ${search ? searchQuery : ""}`;
  const countValue = search ? [searchValue] : [];
  const countResult = await pool.query(countQuery, countValue);
  const count = parseInt(countResult.rows[0].count);
  return count;
}