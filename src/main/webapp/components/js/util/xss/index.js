const DOMPurify = window.DOMPurify;

delete window.DOMPurify;

export default {
    escape(s) {
        return DOMPurify.sanitize(s);
    },
}