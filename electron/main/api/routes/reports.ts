import PromiseRouter from 'express-promise-router'
import parseInterval from 'postgres-interval'
import db from '../../db'
// create a new express-promise-router
// this has the same API as the normal express router except
// it allows you to use async functions as route handlers
const router = PromiseRouter();
// export our router to be mounted by the parent application

router.post('/monthreport', async (req, res) => {
  const { start, end } = req.body;
  //const { rows } = await db.query(`SELECT data.* FROM monthreport($1,$2) as data, jsonb_path_query_array(stops, '$[*] ? (@.*.total > 0)') as res where starts>0 or jsonb_array_length(res)>0`, [start, end]);
  const { rows } = await db.query(`SELECT * FROM monthreport($1,$2)`, [start, end]);
  rows.map((row: any) => {
    row['stops'].map((part: any) => {
      part[Object.keys(part)[0]].dur = parseInterval(part[Object.keys(part)[0]].dur)
    })
  });
  res.status(200).send(rows)
})

router.post('/shiftsreport', async (req, res) => {
  const { start, end } = req.body;
  const { rows } = await db.query(`SELECT * FROM shiftsreport($1,$2)`, [start, end]);
  rows.map((row: any) => {
    row['stops'].map((part: any) => {
      part[Object.keys(part)[0]].dur = parseInterval(part[Object.keys(part)[0]].dur)
    })
  });
  res.status(200).send(rows)
})

router.post('/userreport', async (req, res) => {
  const { id, start, end } = req.body;
  const { rows } = await db.query(`SELECT * FROM userreport($1,$2,$3)`, [id, start, end]);
  rows.map((row: any) => {
    row['stops'].map((part: any) => {
      part[Object.keys(part)[0]].dur = parseInterval(part[Object.keys(part)[0]].dur)
    })
  });
  res.status(200).send(rows)
})

router.post('/usersreport', async (req, res) => {
  const { start, end } = req.body;
  const { rows } = await db.query(`SELECT * FROM usersreport($1,$2)`, [start, end]);
  rows.map((row: any) => {
    row['stops'].map((part: any) => {
      part[Object.keys(part)[0]].dur = parseInterval(part[Object.keys(part)[0]].dur)
    })
  });
  res.status(200).send(rows)
})

export default router
