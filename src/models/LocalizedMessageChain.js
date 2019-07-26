import LocalizedMessage from "./LocalizedMessage";

export default class LocalizedMessageChain {
    constructor() {
        this.messages = [];
    }

    appendMessage(message) {
        this.messages.push(message);
        return this;
    }

    prependMessage(message) {
        this.messages.unshift(message);
        return this;
    }

    appendLocalizedMessage(key, params) {
        return this.appendMessage(new LocalizedMessage(key, params));
    }

    prependLocalizedMessage(key, params) {
        return this.prependMessage(new LocalizedMessage(key, params));
    }

    generateString(t) {
        let result = "";

        for(let i = 0; i < this.messages.length; i++) {
            if(typeof this.messages[i] === "object") {
                result += this.messages[i].generateString(t);
            } else if (typeof this.messages[i] === "string" || typeof this.messages[i] === "number") {
                result += this.messages[i];
            }
        }

        return result;
    }

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
}