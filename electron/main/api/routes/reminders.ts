import PromiseRouter from 'express-promise-router'
import parseInterval from 'postgres-interval'
import db from '../../db'
// create a new express-promise-router
// this has the same API as the normal express router except
// it allows you to use async functions as route handlers
const router = PromiseRouter();
// export our router to be mounted by the parent application
router.get('/', async (req, res) => {
  const { rows } = await db.query('SELECT * FROM reminders ORDER BY id');
  res.status(200).send(rows)
})

router.get('/active', async (req, res) => {
  const { rows } = await db.query('SELECT * FROM getactualnotifications()');
  res.status(200).send(rows)
})

router.post('/ack/:id', async (req, res) => {
  await db.query('UPDATE reminders SET acknowledged=true where id= $1;', [req.params.id]);
  res.status(200).json({
    message: "Notification acknowledged",
  });
})

router.post('/', async (req, res) => {
  const table = req.body;
  try {
    await db.query('TRUNCATE reminders')
    const data = await db.query(`INSERT INTO reminders select * from json_to_recordset($1) as x(id integer, active boolean, title text, descr text, type smallint, starttime timestamptz, runcondition numeric, nexttime timestamptz, nextrun numeric, acknowledged boolean)`, [JSON.stringify(table)]);
    res.status(200).json({
      message: "notifications.confupdate",
    });
  }
  catch (err) {
    console.log(err);
    res.status(500).json({
      message: "notifications.dberror",
      error: "Database error!", //Database connection error
    });
  };
});

export default router
