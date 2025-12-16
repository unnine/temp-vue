import FluxStore from './fluxStore.js';
import alert from './alert.js';

const collect = (...modules) => {
    return modules.reduce((store, module) => {
        store.state = {
            ...store.state,
            ...module.state,
        };
        store.getters = {
            ...store.getters,
            ...module.getters,
        };
        store.mutations = {
            ...store.mutations,
            ...module.mutations,
        };
        return store;
    }, {
        state: {},
        getters: {},
        mutations: {},
    });
}

const instance = new FluxStore(collect(
    alert,
));

export const store = instance;