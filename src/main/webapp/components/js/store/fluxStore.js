import { ObjectUtil } from '../util/index.js';

export default class FluxStore {

    #state = {};
    #getters = {};
    #mutations = {};
    #subscribers = new Map();
    #pendingPublications = new Set();

    #statePaths = null;
    #proxyCache = new WeakMap();


    constructor({ state, getters, mutations }) {
        this.#initGetters(getters);
        this.#initMutations(mutations);
        this.#initState(state);
    }


    #initGetters(getters) {
        this.#getters = ObjectUtil.copy(getters);
    }

    #initMutations(mutations) {
        this.#mutations = ObjectUtil.copy(mutations);
    }

    #initState(state) {
        this.#state = this.#createReactiveState(ObjectUtil.copy(state));
    }

    #createReactiveState(state, path = []) {
        if (state == null || typeof state !== 'object') {
            return state;
        }

        if (this.#proxyCache.has(state)) {
            return this.#proxyCache.get(state);
        }

        const _this = this;

        const proxy = new Proxy(state, {
            get(o, key, receiver) {
                if (_this.#statePaths) {
                    _this.#statePaths.add([...path, key].join('.'));
                }

                const value = Reflect.get(o, key, receiver);

                if (value != null && ObjectUtil.isObject(value)) {
                    return _this.#createReactiveState(value, [...path, key]);
                }

                return value;
            },
            set(o, key, newValue, receiver) {
                const oldValue = o[key];

                if (oldValue === newValue) {
                    return true;
                }

                const updated = Reflect.set(o, key, newValue, receiver);

                const fullPath = [...path, key].join('.');
                _this.#publish(fullPath, newValue);
                return updated;
            }
        });

        this.#proxyCache.set(state, proxy);
        return proxy;
    }

    _subscribe(getterName, subscriber) {
        if (!Object.hasOwn(this.#getters, getterName)) {
            console.warn(`not found store's getter '${getterName}'`);
            return;
        }

        const subscriberWrappers = new Set();

        const loadStatsPathsByGetter = () => {
            /**
             * call proxy getter for tracking path of state.
             * set the state path corresponding to getterName to #statePaths.
             */
            this.#getters[getterName](this.#state);
        }

        const registerSubscriber = () => {
            this.#statePaths.forEach(keyChain => {
                const wrapper = this.#addGetterSubscriber(getterName, keyChain, subscriber);
                subscriberWrappers.add({ keyChain, wrapper });
            });
        }

        this.#statePaths = new Set();
        loadStatsPathsByGetter();
        registerSubscriber();
        this.#statePaths = null;

        return () => {
            subscriberWrappers.forEach(({ keyChain, wrapper }) => {
                const subscribers = this.#subscribers.get(keyChain);

                if (subscribers) {
                    subscribers.delete(wrapper);
                    if (subscribers.size === 0) {
                        this.#subscribers.delete(keyChain);
                    }
                }
            });
            subscriberWrappers.clear();
        };

    }

    #addGetterSubscriber(getterName, keyChain, subscriber) {
        if (!this.#subscribers.has(keyChain)) {
            this.#subscribers.set(keyChain, new Set());
        }

        const wrapper = () => {
            const value = this.get(getterName);
            subscriber(value);
        };

        this.#subscribers.get(keyChain).add(wrapper);
        return wrapper;
    }

    #publish(keyChain, value) {
        if (this.#isPendingPublication(keyChain)) {
            return;
        }
        this.#pendPublication(keyChain);

        window.queueMicrotask(() => {
            this.#pendingPublications.clear();
            this.#executePublish(keyChain, value);
        });
    };

    #executePublish(keyChain, value) {
        const subscribers = this.#subscribers.get(keyChain);

        if (subscribers) {
            subscribers.forEach(subscriber => subscriber(value));
        }

        const parentKeyChains = this.#getAllParentKeyChains(keyChain);

        parentKeyChains.forEach(parentKeyChain => {
            const parentSubscribers = this.#subscribers.get(parentKeyChain);

            if (parentSubscribers) {
                parentSubscribers.forEach(subscriber => subscriber(value));
            }
        });
    }

    #isPendingPublication(keyChain) {
        const parentKeyChains = this.#getAllParentKeyChains(keyChain);

        for (let parentKeyChain of parentKeyChains) {
            if (this.#pendingPublications.has(parentKeyChain)) {
                return true;
            }
        }
        return this.#pendingPublications.has(keyChain);
    }

    #pendPublication(keyChain) {
        const parentKeyChains = this.#getAllParentKeyChains(keyChain);

        for (let parentKeyChain of parentKeyChains) {
            this.#pendingPublications.add(parentKeyChain);
        }
        this.#pendingPublications.add(keyChain);
    }

    #getAllParentKeyChains(keyChain) {
        const result = [];
        const paths = keyChain.split('.');
        let path;

        while (paths.length > 0) {
            paths.pop();
            path = paths.join('.');

            if (path.trim() === '') {
                continue;
            }
            result.push(path);
        }
        return result;
    }

    get(getterName) {
        if (!Object.hasOwn(this.#getters, getterName)) {
            return;
        }
        const getter = this.#getters[getterName];
        return getter(this.#state);
    }

    commit(mutationKey, value) {
        if (!Object.hasOwn(this.#mutations, mutationKey)) {
            console.warn(`not found mutation handler of '${mutationKey}'`);
            return;
        }
        const mutationHandler = this.#mutations[mutationKey];
        mutationHandler(this.#state, value, this);
    }
}