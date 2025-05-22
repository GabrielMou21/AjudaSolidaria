const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, '../banco.db');

// Criar conexão com o banco
const db = new sqlite3.Database(dbPath);

// Adaptar para interface compatível com os controllers
const pool = {
  query: (sql, params) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        resolve([rows]);
      });
    });
  },
  getConnection: () => {
    return {
      beginTransaction: () => Promise.resolve(),
      query: (sql, params) => {
        return new Promise((resolve, reject) => {
          db.run(sql, params, function(err) {
            if (err) reject(err);
            resolve([{insertId: this.lastID, affectedRows: this.changes}]);
          });
        });
      },
      commit: () => Promise.resolve(),
      rollback: () => Promise.resolve(),
      release: () => {}
    };
  }
};

module.exports = { db, pool };
