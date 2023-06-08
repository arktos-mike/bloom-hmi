import PromiseRouter from 'express-promise-router'
import parseInterval from 'postgres-interval'
import db from '../../db'
import { usbPath } from './'
import fs from 'fs';
import { join } from 'path'

// create a new express-promise-router
// this has the same API as the normal express router except
// it allows you to use async functions as route handlers
const router = PromiseRouter();
// export our router to be mounted by the parent application

router.post('/saveReport', async (req, res) => {
  try {
    const { blob, fileName } = req.body;
    if ((blob.length === 0) || (usbPath == null)) {
      res.status(400).json({
        message: "notifications.servererror",
        error: "Can't save report to file",
      });
    }
    else {
      const { rows } = await db.query(`SELECT data->'opIP'->'name' as name FROM hwconfig where name = $1`, ['ipConf'])
      const serverName = rows[0]['name']
      const buffer = await blob.arrayBuffer();
      fs.writeFileSync(join(usbPath, serverName.replace(' ', '_') + '_' + fileName.replace(' ', '_')), Buffer.from(buffer));
      res.status(200).json({
        message: "notifications.datasaved",
        filePath: join(usbPath, serverName.replace(' ', '_') + '_' + fileName.replace(' ', '_'))
      });
    }
  } catch (err) {
    /*console.log(err);*/
    res.status(500).json({
      message: "notifications.servererror",
      error: "Server error occurred"
    });
  };
})

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
