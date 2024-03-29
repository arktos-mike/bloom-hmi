import PromiseRouter from 'express-promise-router'
import parseInterval from 'postgres-interval'
import db from '../../db'
// create a new express-promise-router
// this has the same API as the normal express router except
// it allows you to use async functions as route handlers
const router = PromiseRouter();
// export our router to be mounted by the parent application
router.get('/', async (req, res) => {
  const { rows } = await db.query('SELECT * FROM shiftconfig');
  res.status(200).send(rows)
})

router.get('/currentshift', async (req, res) => {
  const { rows } = await db.query('SELECT * FROM shiftdetect(current_timestamp)');
  res.status(200).send(rows)
})

router.post('/getstatinfo', async (req, res) => {
  const { start, end } = req.body;
  const { rows } = await db.query(`SELECT * FROM getstatinfo($1,$2)`, [start, end]);
  rows[0] && rows[0]['stops'].map((row: any) => {
    row[Object.keys(row)[0]].dur = parseInterval(row[Object.keys(row)[0]].dur)
  });
  res.status(200).send(rows)
});

router.post('/getuserstatinfo', async (req, res) => {
  const { id, start, end } = req.body;
  const { rows } = await db.query(`SELECT * FROM getuserstatinfo($1,$2,$3)`, [id, start, end]);
  rows[0] && rows[0]['stops'].map((row: any) => {
    row[Object.keys(row)[0]].dur = parseInterval(row[Object.keys(row)[0]].dur)
  });
  res.status(200).send(rows)
});

router.post('/', async (req, res) => {
  const table = req.body;
  try {
    await db.query('TRUNCATE shiftconfig')
    const data = await db.query(`INSERT INTO shiftconfig select * from json_to_recordset($1) as x(shiftname text, starttime TIMETZ, duration interval, monday BOOLEAN, tuesday BOOLEAN, wednesday BOOLEAN, thursday BOOLEAN, friday BOOLEAN, saturday BOOLEAN, sunday BOOLEAN)`, [JSON.stringify(table)]);
    res.status(200).json({
      message: "notifications.confupdate",
    });
  }
  catch (err) {
    /*console.log(err);*/
    res.status(500).json({
      message: "notifications.dberror",
      error: "Database error!", //Database connection error
    });
  };
});

export default router
