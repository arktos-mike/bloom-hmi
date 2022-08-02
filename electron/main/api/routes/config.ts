import PromiseRouter from 'express-promise-router'
import db from '../../db'
// create a new express-promise-router
// this has the same API as the normal express router except
// it allows you to use async functions as route handlers
const router = PromiseRouter();
// export our router to be mounted by the parent application
router.get('/', async (req, res) => {
    const { rows } = await db.query('SELECT * FROM hwconfig')

    let mobj, obj
    let conf
    mobj = {}
    for (let row of rows) {
        obj = {}
        for (let prop in row) {
            if (prop == 'name') {
                conf = row[prop]
                mobj = Object.assign(mobj, { [conf]: {} })
            }
            else if (prop == 'data') {
                obj = Object.assign(obj, row[prop])
            }
        }
        mobj[conf] = obj
    }
    res.status(200).send(mobj)
})

router.post('/update', async (req, res) => {
    const { opIP } = req.body;
    try {
        await db.query('UPDATE hwconfig set data = jsonb_set(data, $2, $3) where name=$1', ['ipConf','{opIP, address}', '"'+opIP.address+'"']);
        await db.query('UPDATE hwconfig set data = jsonb_set(data, $2, $3) where name=$1', ['ipConf','{opIP, netmask}', '"'+opIP.netmask+'"']);
        res.status(200).json({
            message: "notifications.confupdate",
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: "notifications.dberror",
            error: "Database error while updating config!", //Database connection error
        });
    };
});

export default router 