import LocalizedMessage from "./LocalizedMessage";

export default class HistoryData {
    /**
     * A history object containing just a message.
     * @param {LocalizedMessage} message 
     */
    constructor(message) {
        this.message = message;
    }

    /**
     * Generates a localized string.
     * @param {Function} t The i18next translation function.
     * @param {bool} concise Whether to use concise language.
     * @param {bool} verbose Whether to use verbose tile names.
     * @param {bool} spoilers Whether to give spoilers.
     * @returns {string} The localized text associated with this history message.
     */
    getMessage(t, concise, verbose, spoilers) {
        if(!this.message) return "";

        return this.message.generateString(t);
    }

    /** Gets the class that this history message should have. */
    getClassName() {
        if(!this.message || !this.message.key) return "";

        if(this.message.key.indexOf("error") > -1) {
            return "bg-danger text-white";
        }

        return "";
    }
}