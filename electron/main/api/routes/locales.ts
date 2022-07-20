import PromiseRouter from 'express-promise-router'
import db from '../../db'
// create a new express-promise-router
// this has the same API as the normal express router except
// it allows you to use async functions as route handlers
const router = PromiseRouter();
// export our router to be mounted by the parent application

router.get('/lng', async (req, res) => {
    const { rows } = await db.query('SELECT locale FROM locales WHERE selected=true');
    res.status(200).send({ lng: rows[0].locale })
})

router.get('/', async (req, res) => {
    const { rows } = await db.query('SELECT locale FROM locales');
    res.status(200).send(rows)
})

router.get('/translations', async (req, res) => {
    const { rows } = await db.query('SELECT * FROM locales');
    let mobj, obj
    let locale
    mobj = {}
    for (let row of rows) {
        obj = {}
        for (let prop in row) {
            if (prop == 'locale') {
                locale = row[prop]
                mobj = Object.assign(mobj, { [locale]: {} })
            }
            else if (prop == 'translation') {
                obj = Object.assign(obj, { [prop]: row[prop] })
            }
        }
        mobj[locale] = obj
    }
    res.status(200).send(mobj)
})

router.post('/translations', async (req, res) => {
    const { rows } = await db.query('SELECT translation FROM locales WHERE locale=$1',[req.query.lng]);
    res.status(200).send(rows[0][<string>req.query.ns])
})

router.patch('/:locale', async (req, res) => {
    await db.query('UPDATE locales SET selected = CASE WHEN locale = $1 THEN true ELSE false END;', [req.params.locale]);
    res.status(200).send({ lng: req.params.locale })
})

export default router 