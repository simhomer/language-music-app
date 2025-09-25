const { Pool } = require('pg');

async function main(){
  const connectionString = process.env.DATABASE_URL || process.env.PG_CONNECTION_STRING;
  if(!connectionString){
    console.error('Missing DATABASE_URL');
    process.exit(1);
  }
  const useSsl = String(process.env.PG_SSL || 'true').toLowerCase() !== 'false';
  const pool = new Pool({ connectionString, ssl: useSsl ? { rejectUnauthorized: false } : false });
  const sqlArg = process.argv.slice(2).join(' ').trim();
  if(!sqlArg){
    console.error('Usage: node run-sql.js "<SQL_STATEMENT>"');
    process.exit(1);
  }
  try{
    const { rows } = await pool.query(sqlArg);
    if(rows && rows.length){
      console.log(JSON.stringify(rows));
    } else {
      console.log('OK');
    }
  }catch(e){
    console.error('SQL error:', e && e.message);
    process.exitCode = 1;
  }finally{
    await pool.end();
  }
}

main();


