import PromiseRouter from 'express-promise-router'
import db from '../../db'

// create a new express-promise-router
// this has the same API as the normal express router except
// it allows you to use async functions as route handlers
const router = PromiseRouter();
// export our router to be mounted by the parent application
router.get('/', async (req, res) => {
  const { rows } = await db.query(`SELECT type, serialno, mfgdate, round(picks) as picks, cloth, motor FROM lifetime`);
  res.status(200).send(rows)
})

export default router
