import PromiseRouter from 'express-promise-router'
import db from '../../db'
import sudo from 'sudo-prompt'
const options = {
  name: 'Electron',
};
export let updFlagCOM1 = false;
export let updFlagCOM2 = false;
export let updFlagTCP1 = false;
export let updFlagConn = false;
export const resetFlagCOM1 = () => {
  updFlagCOM1 = false;
}
export const resetFlagCOM2 = () => {
  updFlagCOM2 = false;
}
export const resetFlagTCP1 = () => {
  updFlagTCP1 = false;
}
export const resetFlagConn = () => {
  updFlagConn = false;
}
// create a new express-promise-router
// this has the same API as the normal express router except
// it allows you to use async functions as route handlers
const router = PromiseRouter();

const maskToPrefixLength = (mask: string) => {
  return mask.split('.')
    .reduce((c, o) => c - Math.log2(256 - +o), 32);
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
  try {
    if (req.body.opIP) {

      const { opIP } = req.body;

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
          console.log(maskToPrefixLength(opIP.netmask))
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
    else if (req.body.opCOM1) {

      const { opCOM1 } = req.body;
      await db.query('UPDATE hwconfig set data = jsonb_set(data, $2, $3) where name=$1', ['comConf', '{opCOM1, path}', '"' + opCOM1.path + '"']);
      await db.query('UPDATE hwconfig set data = jsonb_set(data, $2, $3) where name=$1', ['comConf', '{opCOM1, scan}', opCOM1.scan]);
      await db.query('UPDATE hwconfig set data = jsonb_set(data, $2, $3) where name=$1', ['comConf', '{opCOM1, timeout}', opCOM1.timeout]);
      await db.query('UPDATE hwconfig set data = jsonb_set(data, $2, $3) where name=$1', ['comConf', '{opCOM1, conf, baudRate}', opCOM1.conf.baudRate]);
      await db.query('UPDATE hwconfig set data = jsonb_set(data, $2, $3) where name=$1', ['comConf', '{opCOM1, conf, dataBits}', opCOM1.conf.dataBits]);
      await db.query('UPDATE hwconfig set data = jsonb_set(data, $2, $3) where name=$1', ['comConf', '{opCOM1, conf, stopBits}', opCOM1.conf.stopBits]);
      await db.query('UPDATE hwconfig set data = jsonb_set(data, $2, $3) where name=$1', ['comConf', '{opCOM1, conf, parity}', '"' + opCOM1.conf.parity + '"']);
      updFlagCOM1 = true;
      res.status(200).json({
        message: "notifications.confupdate",
      });
    }
    else if (req.body.opCOM2) {
      const { opCOM2 } = req.body;
      await db.query('UPDATE hwconfig set data = jsonb_set(data, $2, $3) where name=$1', ['comConf', '{opCOM2, path}', '"' + opCOM2.path + '"']);
      await db.query('UPDATE hwconfig set data = jsonb_set(data, $2, $3) where name=$1', ['comConf', '{opCOM2, scan}', opCOM2.scan]);
      await db.query('UPDATE hwconfig set data = jsonb_set(data, $2, $3) where name=$1', ['comConf', '{opCOM2, timeout}', opCOM2.timeout]);
      await db.query('UPDATE hwconfig set data = jsonb_set(data, $2, $3) where name=$1', ['comConf', '{opCOM2, conf, baudRate}', opCOM2.conf.baudRate]);
      await db.query('UPDATE hwconfig set data = jsonb_set(data, $2, $3) where name=$1', ['comConf', '{opCOM2, conf, dataBits}', opCOM2.conf.dataBits]);
      await db.query('UPDATE hwconfig set data = jsonb_set(data, $2, $3) where name=$1', ['comConf', '{opCOM2, conf, stopBits}', opCOM2.conf.stopBits]);
      await db.query('UPDATE hwconfig set data = jsonb_set(data, $2, $3) where name=$1', ['comConf', '{opCOM2, conf, parity}', '"' + opCOM2.conf.parity + '"']);
      updFlagCOM2 = true;
      res.status(200).json({
        message: "notifications.confupdate",
      });
    }
    else if (req.body.rtu1) {
      const { rtu1 } = req.body;
      await db.query('UPDATE hwconfig set data = jsonb_set(data, $2, $3) where name=$1', ['rtuConf', '{rtu1, com}', '"' + rtu1.com + '"']);
      await db.query('UPDATE hwconfig set data = jsonb_set(data, $2, $3) where name=$1', ['rtuConf', '{rtu1, sId}', rtu1.sId]);
      await db.query('UPDATE hwconfig set data = jsonb_set(data, $2, $3) where name=$1', ['rtuConf', '{rtu1, swapBytes}', rtu1.swapBytes]);
      await db.query('UPDATE hwconfig set data = jsonb_set(data, $2, $3) where name=$1', ['rtuConf', '{rtu1, swapWords}', rtu1.swapWords]);
      updFlagCOM1 = true;
      updFlagCOM2 = true;
      res.status(200).json({
        message: "notifications.confupdate",
      });
    }
    else if (req.body.tcp1) {
      const { tcp1 } = req.body;
      await db.query('UPDATE hwconfig set data = jsonb_set(data, $2, $3) where name=$1', ['ipConf', '{tcp1, ip}', '"' + tcp1.ip + '"']);
      await db.query('UPDATE hwconfig set data = jsonb_set(data, $2, $3) where name=$1', ['ipConf', '{tcp1, port}', '"' + tcp1.port + '"']);
      await db.query('UPDATE hwconfig set data = jsonb_set(data, $2, $3) where name=$1', ['ipConf', '{tcp1, sId}', tcp1.sId]);
      await db.query('UPDATE hwconfig set data = jsonb_set(data, $2, $3) where name=$1', ['ipConf', '{tcp1, swapBytes}', tcp1.swapBytes]);
      await db.query('UPDATE hwconfig set data = jsonb_set(data, $2, $3) where name=$1', ['ipConf', '{tcp1, swapWords}', tcp1.swapWords]);
      updFlagTCP1 = true;
      res.status(200).json({
        message: "notifications.confupdate",
      });
    }
    else if (req.body.conn) {
      const { conn } = req.body;
      await db.query('UPDATE hwconfig set data = jsonb_set(data, $2, $3) where name=$1', ['connConf', '{conn}', '"' + conn + '"']);
      updFlagConn = true;
      res.status(200).json({
        message: "notifications.confupdate",
      });
    }
  }
  catch (err) {
    /*console.log(err);*/
    res.status(500).json({
      message: "notifications.dberror",
      error: "Database error while updating config!", //Database connection error
    });
  };
});

export default router
