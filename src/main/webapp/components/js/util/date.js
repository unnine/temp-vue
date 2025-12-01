const luxon = window.luxon;


export default {
    now() {
        return luxon.DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss');
    },
}