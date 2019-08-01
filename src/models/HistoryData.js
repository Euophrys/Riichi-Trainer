import LocalizedMessage from "./LocalizedMessage";

export default class HistoryData {
    /**
     * 
     * @param {LocalizedMessage} message 
     */
    constructor(message) {
        this.message = message;
    }

    getMessage(t, concise, verbose, spoilers) {
        if(!this.message) return "";

        return this.message.generateString(t);
    }

    getClassName() {
        if(!this.message || !this.message.key) return "";

        if(this.message.key.indexOf("error") > -1) {
            return "bg-danger text-white";
        }

        return "";
    }
}