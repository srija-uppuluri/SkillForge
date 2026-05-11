// Helper functions to make sql.js easier to use like better-sqlite3

function queryAll(db, sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function queryOne(db, sql, params = []) {
  const rows = queryAll(db, sql, params);
  return rows[0] || null;
}

function run(db, sql, params = []) {
  db.run(sql, params);
  const changes = db.getRowsModified();
  const result = db.exec('SELECT last_insert_rowid() as id');
  const lastId = result[0]?.values[0][0] || 0;
  return { changes, lastInsertRowid: lastId };
}

module.exports = { queryAll, queryOne, run };
