import { Pool } from 'pg'
import * as dotenv from 'dotenv' 
dotenv.config()

const pool = new Pool({
  user: process.env['PGUSER'] || 'postgres',
  host: process.env['PGHOST'] || 'localhost',
  database: process.env['PGDATABASE'] || 'bloomhmi',
  password: process.env['PGPASSWORD'] || '123456',
  port: process.env['PGPORT'] ||5432,
});
pool.on('connect', () => {
  //console.log('Connection to the DB is successful.');
});
const query = (text, params?, callback?) => pool.query(text, params, callback);
export default { query }