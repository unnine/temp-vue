import constants from "../consts/index.js";

const defaultValue = () => ({
    show: false,
    type: 'info',
    message: null,
    isConfirm: false,
    onOk: () => {},
    onCancel: () => {},
});

export default {
    state: {
        alert: {
            ...defaultValue(),
        },
    },
    getters: {
        [constants.store.GLOBAL_ALERT](state) {
            return state.alert;
        },
    },
    mutations: {
        [constants.store.SHOW_ALERT](state, props) {
            state.alert = {
                ...defaultValue(),
                ...props,
                show: true,
            };
        },
        [constants.store.HIDE_ALERT](state) {
            state.alert = {
                ...defaultValue(),
            };
        },
    },
}