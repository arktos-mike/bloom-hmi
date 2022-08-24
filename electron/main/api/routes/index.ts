// ./routes/index.ts
export { updFlag, resetFlag } from './config'
import config from './config'
import locales from './locales'
import users from './users'
import tags from './tags'
import datetime from './datetime'
import reboot from './reboot'
//api.use('/config', config);

export default (api) => {
    api.use('/locales', locales);
    api.use('/config', config);
    api.use('/users', users);
    api.use('/tags', tags);
    api.use('/datetime', datetime);
    api.use('/reboot', reboot);
}