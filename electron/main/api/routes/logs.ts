import PromiseRouter from 'express-promise-router'
import parseTimestampTz from 'postgres-date'
import range from 'postgres-range'
import db from '../../db'
// create a new express-promise-router
// this has the same API as the normal express router except
// it allows you to use async functions as route handlers
const router = PromiseRouter();
// export our router to be mounted by the parent application

router.get('/getRolls', async (req, res) => {
  const { rows } = await db.query(`SELECT count(*) FROM clothlog WHERE not upper_inf(timestamp) and timestamp && tstzrange(lower((SELECT timestamp WHERE upper_inf(timestamp) and event=0)),current_timestamp(3),'[)') AND event=$1`, [1]);
  res.status(200).send(rows[0].count)
})

router.post('/clothlogchange', async (req, res) => {
  try {
    const { event, meters } = req.body;
    await db.query(`UPDATE clothlog SET timestamp = tstzrange(lower(timestamp),current_timestamp(3),'[)')` + ((event == 0) ? `` : `, meters=$2`) + `WHERE upper_inf(timestamp) AND event=$1`, event == 0 ? [event] : [event, meters])
    await db.query(`INSERT INTO clothlog VALUES(tstzrange(current_timestamp(3),NULL,'[)'),$1,$2)`, [event, event == 0 ? meters : null])
    res.status(200).json({
      message: "notifications.confupdate",
    });
  } catch (err) {
    /*console.log(err);*/
    res.status(500).json({
      message: "notifications.dberror",
      error: "Database error occurred!", //Database connection error
    });
  };
})

router.post('/clothlog', async (req, res) => {
  const { start, end } = req.body;
  const { rows } = await db.query(`SELECT * FROM clothlog WHERE tstzrange($1,$2,'[)') && timestamp ORDER BY timestamp DESC`, [start, end]);
  rows.map((row: any) => {
    row['timestamp'] = range.parse(row['timestamp'], parseTimestampTz)
  });
  res.status(200).send(rows)
})

router.post('/clothlog/delete', async (req, res) => {
  const { start, end } = req.body;
  const { rows } = await db.query(`DELETE FROM clothlog WHERE tstzrange($1,$2,'[]') @> timestamp`, [start, end]);
  rows.map((row: any) => {
    row['timestamp'] = range.parse(row['timestamp'], parseTimestampTz)
  });
  res.status(200).send(rows)
})

router.get('/user', async (req, res) => {
  const { rows } = await db.query(`SELECT id, name, lower(timestamp) as logintime FROM userlog WHERE upper_inf(timestamp) AND role=$1`, ['weaver']);
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
