import PromiseRouter from 'express-promise-router'
import SSE from "express-sse";
export const sse = new SSE();
import db from '../../db'
// create a new express-promise-router
// this has the same API as the normal express router except
// it allows you to use async functions as route handlers
const router = PromiseRouter();
// export our router to be mounted by the parent application

router.get('/events', sse.init);
setInterval(async () => {
  const mon = await db.query('SELECT tag, val, updated, link FROM tags WHERE tag->>$1=$2', ['group', 'monitoring']);
  // Sends message to all connected clients!
  sse.send(mon.rows, 'tags', 'monitoring');
  const rolls = await db.query(`SELECT count(*) FROM clothlog WHERE not upper_inf(timestamp) and timestamp && tstzrange(lower((SELECT timestamp FROM clothlog WHERE upper_inf(timestamp) and event=0)),current_timestamp(3),'[)') AND event=$1`, [1]);
  sse.send(rolls.rows[0].count, 'rolls', 'pieces');
  //sse.updateInit(["array", "containing", "new", "content"]);
  //sse.serialize(["array", "to", "be", "sent", "as", "serialized", "events"]);
  // All options for sending a message:
}, 1000);

router.get('/', async (req, res) => {
  const { rows } = await db.query('SELECT tag, val, updated, link FROM tags ORDER BY tag->>$1', ['name']);
  res.status(200).send(rows)
})

router.post('/writeTag', async (req, res) => {
  const { name, value } = req.body;
  try {
    if (value != null) {
      const { rows } = await db.query('UPDATE tags SET val=$1, updated=current_timestamp where tag->>$2=$3 AND val IS DISTINCT FROM $1 RETURNING *;', [value, 'name', name]);
      if (rows[0]) {
        sse.send(rows, 'tags', name);
      }
      res.status(200).send({
        message: "Writing data to tag",
        body: { name, value },
      })
    } else {
      res.status(500).send({
        error: "Null value or no link",
        body: { name, value },
      })
    }
  } catch (err) {
    /*console.log(err);*/
    res.status(500).json({
      message: "notifications.dberror",
      error: "Database error!", //Database connection error
    });
  }
})

router.post('/filter', async (req, res) => {
  const filter = req.body;
  try {
    const data = await db.query(`SELECT tag, val, updated, link FROM tags WHERE tag->>$1 = ANY ('{${filter[Object.keys(filter)[0]]}}') ORDER BY tag->>$1`, [Object.keys(filter)[0]]);
    const arr = data.rows;
    if (arr.length == 0) {
      return res.status(400).json({
        error: "No such tags",
      });
    } else {
      res.status(200).send(arr);
    }
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
