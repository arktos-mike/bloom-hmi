// ./routes/index.ts
import config from './config'
import locales from './locales'
import users from './users'
import tags from './tags'
//api.use('/config', config);
export default (api) => {
    api.use('/locales', locales);
    api.use('/config', config);
    api.use('/users', users);
    api.use('/tags', tags);
}