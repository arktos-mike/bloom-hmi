import PromiseRouter from 'express-promise-router'
// create a new express-promise-router
// this has the same API as the normal express router except
// it allows you to use async functions as route handlers
const router = PromiseRouter();
// export our router to be mounted by the parent application
router.post('/', async (req, res) => {

})
export default router 