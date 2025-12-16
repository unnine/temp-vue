import constants from "../consts/index.js";

export default {
    state: {
        alert: {
            show: false,
            type: 'info',
            message: null,
            isConfirm: false,
        },
    },
    getters: {
        [constants.store.GLOBAL_ALERT](state) {
            return state.alert;
        },
    },
    mutations: {
        [constants.store.SHOW_ALERT](state, { type, message, isConfirm = false }) {
            state.alert = {
                show: true,
                type,
                message,
                isConfirm,
            };
        },
        [constants.store.HIDE_ALERT](state) {
            state.alert = {
                show: false,
                type: 'info',
                message: null,
                isConfirm: false,
            };
        },
    },
}