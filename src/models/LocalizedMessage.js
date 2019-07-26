export default class LocalizedMessage {
    constructor(key, params = {}) {
        this.key = key;
        this.params = params;
    }

    generateString(t) {
        return t(this.key, this.params);
    }
}