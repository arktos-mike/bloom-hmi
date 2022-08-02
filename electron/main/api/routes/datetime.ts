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
    const { unix, iso } = req.body;
    try {
        switch (process.platform) {
            case 'linux':
                //sudo.exec("date -s @" + unix + " && fake-hwclock save force", options, (error, data, getter) => {
                sudo.exec("timedatectl set-ntp false && date -s @" + unix, options, (error, data, getter) => {
                    if (!error) {
                        res.status(200).json({
                            message: "notifications.dtupdate",
                            dt: iso,
                        });
                    }
                });
                break;
            case 'win32':
                sudo.exec("powershell -command \"$T = [datetime]::Parse(\\\"" + iso + "\\\"); Set-Date -Date $T\"", options, (error, data, getter) => {
                    if (!error) {
                        res.status(200).json({
                            message: "notifications.dtupdate",
                            dt: iso,
                        });
                    }
                });
                break;
        }

    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: "Could not set system date/time", 
            message: "notifications.servererror",
        });
    };
})
export default router 