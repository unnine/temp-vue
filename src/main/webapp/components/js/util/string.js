export default {
    isEmpty(s) {
        if (s == null) {
            return true;
        }
        if (s.trim().length === 0) {
            return true;
        }
        return false;
    },
    isNotEmpty(s) {
        return !this.isEmpty(s);
    },
}