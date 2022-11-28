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
//setInterval(async () => {
//    const { rows } = await db.query('SELECT tag, val, updated, link FROM tags ORDER BY tag->>$1', ['name']);
    // Sends message to all connected clients!
//    sse.send(rows, 'tags', 'all');
    //sse.updateInit(["array", "containing", "new", "content"]);
    //sse.serialize(["array", "to", "be", "sent", "as", "serialized", "events"]);
    // All options for sending a message:
//}, 10000);

router.get('/', async (req, res) => {
  const { rows } = await db.query('SELECT tag, val, updated, link FROM tags ORDER BY tag->>$1', ['name']);
  res.status(200).send(rows)
})

router.post('/writeTag', async (req, res) => {
  const { name, value } = req.body;
  try {
    if (value!=null){
    await db.query('UPDATE tags SET val=$1, updated=current_timestamp where tag->>$2=$3 AND val IS DISTINCT FROM $1;', [value, 'name', name]);
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
