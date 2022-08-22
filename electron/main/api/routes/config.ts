import PromiseRouter from 'express-promise-router'
import db from '../../db'
import sudo from 'sudo-prompt'
const options = {
    name: 'Electron',
};
// create a new express-promise-router
// this has the same API as the normal express router except
// it allows you to use async functions as route handlers
const router = PromiseRouter();

const maskToPrefixLength = (mask: string) => {
    return 24;
}

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
        await db.query('UPDATE hwconfig set data = jsonb_set(data, $2, $3) where name=$1', ['ipConf', '{opIP, address}', '"' + opIP.ip_address + '"']);
        await db.query('UPDATE hwconfig set data = jsonb_set(data, $2, $3) where name=$1', ['ipConf', '{opIP, netmask}', '"' + opIP.netmask + '"']);

        switch (process.platform) {
            case 'linux':
                sudo.exec("ip addr flush dev eth0 && ifconfig eth0 " + opIP.ip_address + " netmask " + opIP.netmask + " && ip route add default via " + opIP.gateway_ip + " dev eth0", options, (error, data, getter) => {
                    if (!error) {
                        res.status(200).json({
                            message: "notifications.confupdate",
                        });
                    }
                });
                break;
            case 'win32':
                sudo.exec("powershell -command \"Remove-NetIPAddress -InterfaceAlias Ethernet -Confirm:$false; Remove-NetRoute -InterfaceAlias Ethernet -Confirm:$false; New-NetIPAddress -InterfaceAlias Ethernet -AddressFamily IPv4 " + opIP.ip_address + " -PrefixLength " + maskToPrefixLength(opIP.netmask) + " -DefaultGateway " + opIP.gateway_ip + " -Type Unicast  -Confirm:$false\"", options, (error, data, getter) => {
                    if (!error) {
                        res.status(200).json({
                            message: "notifications.confupdate",
                        });
                    }
                    else {
                        res.status(500).json({
                            error: "Could not change opIP",
                            message: "notifications.servererror",
                        });
                    }
                });
                break;
        }
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