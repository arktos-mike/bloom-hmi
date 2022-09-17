import PromiseRouter from 'express-promise-router'
import parseTimestampTz from 'postgres-date'
import range from 'postgres-range'
import db from '../../db'
// create a new express-promise-router
// this has the same API as the normal express router except
// it allows you to use async functions as route handlers
const router = PromiseRouter();
// export our router to be mounted by the parent application

router.get('/user', async (req, res) => {
  const { rows } = await db.query(`SELECT id, name FROM userlog WHERE upper_inf(timestamp) AND role=$1`,['weaver']);
  res.status(200).send(rows)
})

router.post('/userlog', async (req, res) => {
  const { start, end } = req.body;
  const { rows } = await db.query(`SELECT * FROM userlog WHERE tstzrange($1,$2,'[)') && timestamp ORDER BY timestamp DESC`, [start, end]);
  rows.map((row: any) => {
    row['timestamp'] = range.parse(row['timestamp'], parseTimestampTz)
  });
  res.status(200).send(rows)
})

router.post('/userlog/delete', async (req, res) => {
  const { start, end } = req.body;
  const { rows } = await db.query(`DELETE FROM userlog WHERE tstzrange($1,$2,'[]') @> timestamp`, [start, end]);
  rows.map((row: any) => {
    row['timestamp'] = range.parse(row['timestamp'], parseTimestampTz)
  });
  res.status(200).send(rows)
})

router.post('/startstops', async (req, res) => {
  const { start, end } = req.body;
  const { rows } = await db.query(`SELECT timestamp,modecode,picks FROM modelog WHERE tstzrange($1,$2,'[)') && timestamp ORDER BY timestamp DESC`, [start, end]);
  rows.map((row: any) => {
    row['timestamp'] = range.parse(row['timestamp'], parseTimestampTz)
  });
  res.status(200).send(rows)
})

router.post('/startstops/delete', async (req, res) => {
  const { start, end } = req.body;
  const { rows } = await db.query(`DELETE FROM modelog WHERE tstzrange($1,$2,'[]') @> timestamp`, [start, end]);
  rows.map((row: any) => {
    row['timestamp'] = range.parse(row['timestamp'], parseTimestampTz)
  });
  res.status(200).send(rows)
})
export default router
