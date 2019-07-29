import LocalizedMessage from "./LocalizedMessage";

/**
 * Stores a sequence of LocalizedMessages that can later be localized.
 */
export default class LocalizedMessageChain {
    constructor() {
        this.messages = [];
    }

    /**
     * Adds a string or LocalizedMessage to the end of the chain.
     * @param {string|LocalizedMessage} message Message to add.
     */
    appendMessage(message) {
        this.messages.push(message);
        return this;
    }

    /**
     * Adds a string or LocalizedMessage to the start of the chain.
     * @param {string|LocalizedMessage} message Message to add.
     */
    prependMessage(message) {
        this.messages.unshift(message);
        return this;
    }

    /**
     * Creates a LocalizedMessage with the given paramenters and adds it to the end of the chain.
     * @param {string} key The localization key.
     * @param {object} params The parameters used by the localization.
     */
    appendLocalizedMessage(key, params) {
        return this.appendMessage(new LocalizedMessage(key, params));
    }

    /**
     * Creates a LocalizedMessage with the given paramenters and adds it to the end of the chain.
     * @param {string} key The localization key.
     * @param {object} params The parameters used by the localization.
     */
    prependLocalizedMessage(key, params) {
        return this.prependMessage(new LocalizedMessage(key, params));
    }

    /**
     * Returns the string used to represent line breaks within the chain.
     */
    getLineBreakString() {
        return "<br/>";
    }

    /**
     * Adds a line break to the end of the chain.
     */
    appendLineBreak() {
        return this.appendMessage(this.getLineBreakString());
    }

    /**
     * Translates the chain and returns it as an array.
     * @param {Function} t The i18next translation function.
     */
    generateArray(t) {
        let result = [];

        for(let i = 0; i < this.messages.length; i++) {
            if(typeof this.messages[i] === "object") {
                result.push(this.messages[i].generateString(t));
            } else if (typeof this.messages[i] === "string" || typeof this.messages[i] === "number") {
                result.push(this.messages[i]);
            }
        }

        return result;
    }

    /**
     * Translates the chain and concatenates it all together into a single string.
     * @param {Function} t The i18next translation function.
     */
    generateString(t) {
        return this.generateArray(t).join("");
    }
}