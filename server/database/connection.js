const mysql2 = require("mysql2");
require("dotenv").config();

const useLocalhost = process.env.USE_LOCALHOST === "true";

const connectionParams = useLocalhost
  ? {
      user: "root",
      host: "localhost",
      password: "Manvita@2006",
      database: "EcommerceDB",
      connectionLimit: 10,
    }
  : {
      user: process.env.DB_SERVER_USER,
      host: process.env.DB_SERVER_HOST,
      password: process.env.DB_SERVER_PASSWORD,
      database: process.env.DB_SERVER_DATABASE,
      connectionLimit: 10,
    };

const pool = mysql2.createPool(connectionParams);

pool.getConnection((err, connection) => {
  if (err) console.log("❌ DB Connection Failed:", err.message);
  else {
    console.log("✅ DB Connection Done");
    connection.release();
  }
});

module.exports = pool;
