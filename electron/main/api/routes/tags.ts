import PromiseRouter from 'express-promise-router'
import parseInterval from 'postgres-interval'
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
  const info = await db.query('SELECT * FROM getpartialinfo();');
  info.rows[0]['shift'] && info.rows[0] && (info.rows[0]['shift']['shiftdur'] = parseInterval(info.rows[0]['shift']['shiftdur']))
  await sse.send(info.rows[0], 'info', 'all');
  //sse.updateInit(["array", "containing", "new", "content"]);
  //sse.serialize(["array", "to", "be", "sent", "as", "serialized", "events"]);
 }, 1000);

router.get('/full', async (req, res) => {
  const info = await db.query('SELECT * FROM getcurrentinfo();');
  info.rows[0]['userinfo'] && await info.rows[0]['userinfo']['stops'].map((row: any) => {
    row[Object.keys(row)[0]].dur = parseInterval(row[Object.keys(row)[0]].dur)
  });
  info.rows[0] && await info.rows[0]['shiftinfo']['stops'].map((row: any) => {
    row[Object.keys(row)[0]].dur = parseInterval(row[Object.keys(row)[0]].dur)
  });
  info.rows[0] && await info.rows[0]['dayinfo']['stops'].map((row: any) => {
    row[Object.keys(row)[0]].dur = parseInterval(row[Object.keys(row)[0]].dur)
  });
  info.rows[0] && await info.rows[0]['monthinfo']['stops'].map((row: any) => {
    row[Object.keys(row)[0]].dur = parseInterval(row[Object.keys(row)[0]].dur)
  });
  info.rows[0]['shift'] && (info.rows[0]['shift']['shiftdur'] = parseInterval(info.rows[0]['shift']['shiftdur']))
  info.rows[0]['userinfo'] && (info.rows[0]['userinfo']['runtime'] = parseInterval(info.rows[0]['userinfo']['runtime']))
  info.rows[0]['userinfo'] && (info.rows[0]['userinfo']['workdur'] = parseInterval(info.rows[0]['userinfo']['workdur']))
  info.rows[0]['shift'] && (info.rows[0]['shiftinfo']['runtime'] = parseInterval(info.rows[0]['shiftinfo']['runtime']))
  info.rows[0] && (info.rows[0]['dayinfo']['runtime'] = parseInterval(info.rows[0]['dayinfo']['runtime']))
  info.rows[0] && (info.rows[0]['monthinfo']['runtime'] = parseInterval(info.rows[0]['monthinfo']['runtime']))
  info.rows[0] && (info.rows[0]['lifetime']['motor'] = parseInterval(info.rows[0]['lifetime']['motor']))
  res.status(200).send(info.rows[0])
})

router.get('/', async (req, res) => {
  const { rows } = await db.query('SELECT tag, (round(val::numeric,(tag->>$2)::integer)) as val, updated, link FROM tags ORDER BY tag->>$1', ['name', 'dec']);
  res.status(200).send(rows)
})

router.post('/writeTag', async (req, res) => {
  const { name, value } = req.body;
  try {
    if (value != null) {
      const { rows } = await db.query('UPDATE tags SET val=$1, updated=current_timestamp where tag->>$2=$3 AND val IS DISTINCT FROM $1 RETURNING tag, (round(val::numeric,(tag->>$4)::integer)) as val, updated, link ;', [value, 'name', name, 'dec']);
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
    const data = await db.query(`SELECT tag, (round(val::numeric,(tag->>$2)::integer)) as val, updated, link FROM tags WHERE tag->>$1 = ANY ('{${filter[Object.keys(filter)[0]]}}') ORDER BY tag->>$1`, [Object.keys(filter)[0], 'dec']);
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
