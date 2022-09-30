// ./routes/index.ts
export { updFlagCOM1, updFlagCOM2, resetFlagCOM1, resetFlagCOM2 } from './config'
import config from './config'
import locales from './locales'
import users from './users'
import tags from './tags'
import datetime from './datetime'
import reboot from './reboot'
import shifts from './shifts'
import logs from './logs'
import machine from './machine'
import reports from './reports'
//api.use('/config', config);

export default (api) => {
    api.use('/locales', locales);
    api.use('/config', config);
    api.use('/users', users);
    api.use('/tags', tags);
    api.use('/datetime', datetime);
    api.use('/reboot', reboot);
    api.use('/shifts', shifts);
    api.use('/logs', logs);
    api.use('/machine', machine);
    api.use('/reports', reports);
}
