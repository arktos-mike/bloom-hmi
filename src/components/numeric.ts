/**
 * Layout: numeric
 */
import i18n from 'i18next';

export default (locale: string) => {
    return {
        layout: {
            default: ["1 2 3", "4 5 6", "7 8 9", `- 0 ${i18n.t('decimalSeparator', { lng: locale })}`, "{bksp} {enter}"],
            shift: ["1 2 3", "4 5 6", "7 8 9", `- 0 ${i18n.t('decimalSeparator', { lng: locale })}`, "{bksp} {enter}"],
        }
    }
};