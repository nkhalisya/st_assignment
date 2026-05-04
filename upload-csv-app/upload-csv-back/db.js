const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "db_upload_csv",
  password: "",
  port: 5432
});

module.exports = pool;