import PromiseRouter from 'express-promise-router'
import db from '../../db'
// create a new express-promise-router
// this has the same API as the normal express router except
// it allows you to use async functions as route handlers
const router = PromiseRouter();
// export our router to be mounted by the parent application
router.get('/', async (req, res) => {
    const { rows } = await db.query('SELECT tag, val, updated FROM tags ORDER BY tag->>$1', ['name']);
    res.status(200).send(rows)
})

router.post('/filter', async (req, res) => {
    const filter = req.body;
    try {
        const data = await db.query(`SELECT tag, val FROM tags WHERE tag->>$1 = ANY ('{${filter[Object.keys(filter)[0]]}}') ORDER BY tag->>$1`, [Object.keys(filter)[0]]);
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
        console.log(err);
        res.status(500).json({
            message: "notifications.dberror",
            error: "Database error!", //Database connection error
        });
    };
});

export default router 