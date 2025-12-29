export default {
    isEmpty(s) {
        return !s || !s.trim();
    },
    isNotEmpty(s) {
        return !this.isEmpty(s);
    },
    random() {
        return crypto.randomUUID();
    },
}