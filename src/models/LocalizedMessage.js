/**
 * Stores a localization key and parameters for later translation.
 */
export default class LocalizedMessage {
    /**
     * 
     * @param {String} key The localization key.
     * @param {Object} params The parameters used by the localization.
     */
    constructor(key, params = {}) {
        this.key = key;
        this.params = params;
    }

    /**
     * Returns the localized string.
     * @param {Function} t The i18next translation function.
     */
    generateString(t) {
        return t(this.key, this.params);
    }
}