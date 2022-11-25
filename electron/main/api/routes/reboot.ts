import PromiseRouter from 'express-promise-router'
import sudo from 'sudo-prompt'
const options = {
    name: 'Electron',
};
// create a new express-promise-router
// this has the same API as the normal express router except
// it allows you to use async functions as route handlers
const router = PromiseRouter();
// export our router to be mounted by the parent application
router.post('/', async (req, res) => {
    try {
        switch (process.platform) {
            case 'linux':
                sudo.exec("reboot", options, (error, data, getter) => {
                    if (!error) {
                        res.status(200).json({
                            message: "notifications.reboot",
                        });
                    }
                });
                break;
            case 'win32':
                sudo.exec("powershell -command \"Restart-Computer\"", options, (error, data, getter) => {
                    if (!error) {
                        res.status(200).json({
                            message: "notifications.reboot",
                        });
                    }
                    else {
                        res.status(500).json({
                            error: "Could not reboot",
                            message: "notifications.servererror",
                        });
                    }
                });
                break;
        }

    }
    catch (err) {
        /*console.log(err);*/
        res.status(500).json({
            error: "Could not reboot",
            message: "notifications.servererror",
        });
    };
})
export default router
