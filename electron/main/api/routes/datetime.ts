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

router.get('/', async (req, res) => {
  try {
    switch (process.platform) {
      case 'linux':
        //sudo.exec("date -s @" + unix + " && fake-hwclock save force", options, (error, data, getter) => {
        sudo.exec("timedatectl", options, (error, data, getter) => {
          let ntp_status = false
          let ntp_server = ''
          if (!error) {
            let lines = data?.toString().split('\n');
            lines?.forEach(function (line) {
              let parts = line.replace(/^[ ]+/g, "").split(':');
              if (parts[0] == 'NTP service') {
                ntp_status = parts[1].replace(/^[ ]+/g, "") == 'active' ? true : false;
                sudo.exec("cat /etc/systemd/timesyncd.conf | grep ^NTP= | cut -f2- -d=", options, (error, data, getter) => {
                  if (!error && data) {
                    ntp_server = data?.toString().replace(/\n/g, '');
                    res.status(200).json({
                      server: ntp_server,
                      sync: ntp_status
                    });
                  }
                });
              }
            });
          }
        });
        break;
      case 'win32':
        res.status(200).json({
          server: '',
          sync: true
        });
        break;
    }

  }
  catch (err) {
    /*console.log(err);*/
    res.status(500).json({
      error: "Could not get sync data",
    });
  };
})

router.post('/', async (req, res) => {
  const { unix, iso, sync, tz, ntp } = req.body;
  try {
    switch (process.platform) {
      case 'linux':
        //sudo.exec("date -s @" + unix + " && fake-hwclock save force", options, (error, data, getter) => {
        sudo.exec("timedatectl set-timezone '" + tz + "' && sed -i \"s/\\(NTP *= *\\).*/\\1" + ntp + "/\" /etc/systemd/timesyncd.conf && systemctl restart systemd-timesyncd.service && timedatectl set-ntp " + sync + " && date -s @" + unix, options, (error, data, getter) => {
          if (!error) {
            res.status(200).json({
              message: "notifications.dtupdate",
              dt: iso,
              tz: tz,
              sync: sync,
              ntp: ntp
            });
          }
          if (error) {
            res.status(500).json({
              error: error
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
    /*console.log(err);*/
    res.status(500).json({
      error: "Could not set system date/time",
      message: "notifications.servererror",
    });
  };
})
export default router
