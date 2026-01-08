import Element from "./element.js";
import ComponentConnector from "./componentConnector.js";
import { ObjectUtil } from '../util/index.js';
import { request } from '../http/index.js';
import { store } from '../store/index.js';
import consts from '../consts/index.js';

const { SHOW_ALERT } = consts.store;

class Component {

    #id;
    #$el;
    #bindStore = {
        props: {},
        data: {},
    };
    #bindProps = {
        parentComponentId: null,
        stateName: null,
        props: {},
        data: {},
    };
    #data = {};
    #dataProxyCache = new WeakMap();
    #dataPathCache = new WeakMap();
    #children = [];
    #methods = {};
    #bindingInstance = {};
    #lifeCycle = {
        mounted() {},
        destroy() {},
    };

    #pendingUpdates = new Map();
    #storeUnsubscribers = [];


    constructor(options) {
        this.#initBindingInstance();
        this.#initComponent(options);
        ComponentConnector.add(this.#$el, this);
        Object.freeze(this.#bindingInstance);
        return this.#bindingInstance;
    }

    #initBindingInstance() {
        const o = this.#bindingInstance;

        this.#defineGetter(o, '$store', () => store);
        this.#defineGetter(o, '$self', () => this.#find(this.#id));
        this.#defineGetter(o, '$props', () => this.#bindProps.data);
        this.#defineGetter(o, '$find', () => this.#find);

        o.$request = request;
        o.$confirm = (message, props) => store.commit(SHOW_ALERT, { ...props, type: 'info', message, isConfirm: true });
        o.$info = (message, props) => store.commit(SHOW_ALERT, { ...props, type: 'info', message });
        o.$warn = (message, props) => store.commit(SHOW_ALERT, { ...props, type: 'warn', message });
        o.$danger = (message, props) => store.commit(SHOW_ALERT, { ...props, type: 'danger', message });
    }

    #initComponent(options) {
        const { id, propsState, props, bindStore,
                data, methods, mounted, destroy,
        } = options;

        if (!id) {
            throw new Error('id is required.');
        }

        this.#id = id;
        this.#$el = document.querySelector(`[component-id="${id}"]`);

        if (!this.#$el) {
            throw new Error(`component with id '${id}' not found in DOM. make sure the component is rendered before initializing.`);
        }

        if (methods) {
            this.#initMethods(methods)
        }

        if (bindStore) {
            this.#initBindStore(bindStore);
        }

        if (props) {
            this.#initProps(propsState, props);
        }

        if (ObjectUtil.isFunction(data)) {
            this.#initComponentData(data);
        }

        if (ObjectUtil.isFunction(mounted)) {
            this.#lifeCycle.mounted = mounted.bind(this.#bindingInstance);
        }

        if (ObjectUtil.isFunction(destroy)) {
            this.#lifeCycle.destroy = destroy.bind(this.#bindingInstance);
        }
    }

    #initBindStore(bindStore) {
        const _initBindStore = () => {
            const bindStoreData = bindStore.call(this.#bindingInstance);

            Object.entries(bindStoreData).forEach(([key, value]) => {
                const [ getterName, watch ] = value;

                this.#bindStore.props[key] = {
                    getterName,
                    watch: watch.bind(this.#bindingInstance),
                };
                this.#bindStore.data[key] = undefined;
            });
        };

        const subscribeStore = () => {
            Object.entries(this.#bindStore.props).forEach(([key, prop]) => {
                const { getterName, watch } = prop;

                const unsubscribers = store._subscribe(getterName, (value) => {
                    this.#bindStore.data[key] = value;
                    watch(value);
                });

                if (ObjectUtil.isFunction(unsubscribers)) {
                    this.#storeUnsubscribers.push(unsubscribers);
                }
            });
        };

        const bindStoreDataAndBindingInstance = () => {
            Object.entries(this.#bindStore.data).forEach(([key, value]) => {
                this.#bindingInstance[key] = value;

                Object.defineProperty(this.#bindingInstance, key, {
                    get: () => {
                        return this.#bindStore.data[key];
                    },
                });
            });
        };

        _initBindStore();
        subscribeStore();
        bindStoreDataAndBindingInstance();
    }

    #initProps(propsState, props) {
        if (!propsState) {
            console.warn(`unknown parent component state. check component '_bind' property value.`, this.#$el);
        }

        const parentComponentDataNames = propsState.split('.');

        if (propsState && (!parentComponentDataNames || parentComponentDataNames.length < 2)) {
            console.error(`unknown parent component id or data name. 'propsState' expression is '{parentComponentId}.{dataName}'. current: '${propsState}'`);
        }

        const [ parentComponentId, dataName ] = parentComponentDataNames;

        this.#bindProps.parentComponentId = parentComponentId;
        this.#bindProps.stateName = dataName;

        const propsObject = props.call(this.#bindingInstance);

        Object.entries(propsObject).forEach(([name, prop]) => {
            this.#bindProps.props[name] = this.#makeBindProp(name, prop);
            this.#bindProps.data[name] = undefined;
        });
    }

    #initMethods(methods) {
        Object.entries(methods)
            .filter(([, method]) => ObjectUtil.isFunction(method))
            .forEach(([methodName, method]) => {
                this.#methods[methodName] = method.bind(this.#bindingInstance);
                this.#bindingInstance[methodName] = method.bind(this.#bindingInstance);
            });
    }

    #initComponentData(data) {
        const dataObject = data.call(this.#bindingInstance, {
            state: this.#setState,
        });
        this.#data = ObjectUtil.copy(dataObject);
        Object.keys(this.#data).forEach(key => this.#bindBindingInstanceToData(this.#data, key));
    }

    #setState(key, o) {
        return {
            [key]: o,
        };
    }

    #makeBindProp(name, prop) {
        const {
            type,
            required = false,
            showIf = [],
            onInit = () => {},
            onUpdate = () => {},
            watch = () => {},
        } = prop ?? {};

        if (prop.default != null && !ObjectUtil.isFunction(prop.default) && (type === Array || type === Object || type === Function)) {
            console.warn(`${name}.default must be a function.`);
        }

        return {
            type,
            required,
            default: prop.default,
            showIf,
            onInit: (value) => {
                this.#showIfElement(showIf, value);
                onInit.call(this.#bindingInstance, value);
            },
            onUpdate: (value) => {
                this.#showIfElement(showIf, value);
                onUpdate.call(this.#bindingInstance, value);
            },
            watch: (value) => {
                watch.call(this.#bindingInstance, value);
            },
        };
    }

    #bindBindingInstanceToData(data, key) {
        Object.defineProperty(this.#bindingInstance, key, {
            get() {
                return data[key];
            },
            set(v) {
                data[key] = v;
            },
        });
    }

    #defineGetter(o, name, getter) {
        Object.defineProperty(o, name, {
            get() {
                return getter();
            },
        });
    }

    #initBoundedStoreData() {
        Object.entries(this.#bindStore.props).forEach(([key, prop]) => {
            const { getterName, watch } = prop;

            const value = store.get(getterName);
            this.#bindStore.data[key] = value;
            watch(value);
        });
    }

    #initChildPropsData() {
        this.#children.forEach(child => {
            const { stateName } = child.#bindProps;
            const { state } = this.#getParentStateData(child);

            if (!state || !ObjectUtil.isObject(state)) {
                console.warn(`state data must be object. '${stateName}: ${state}'`);
                return;
            }
            this.#setStateToChildProps(state, child);
            this.#setDefaultDataToChildProps(state, child);
            this.#validateChildProps(child);
            this.#initialized(child);
        });
    }

    #initialized(child) {
        Object.entries(child.#bindProps.props).forEach(([propName, prop = {}]) => {
            const { onInit, watch } = prop;
            const value = child.#bindProps.data[propName];

            if (onInit && value != null) {
                onInit(value);
            }
            if (watch && value != null) {
                watch(value);
            }
        });
    }

    #getParentStateData(child) {
        const { value, path } = ObjectUtil.findFirstByKey(this.#data, child.#bindProps.stateName);
        return { state: value, path };
    }

    #setStateToChildProps(state, child) {
        Object.keys(child.#bindProps.props).forEach(propName => {
            if (Object.hasOwn(state, propName)) {
                return;
            }
            state[propName] = child.#bindProps.data[propName];
        });

        child.#bindProps.data = state;
    }

    #setDefaultDataToChildProps(state, child) {
        Object.entries(child.#bindProps.props).forEach(([propName, prop = {}]) => {
            const { type } = prop;
            if (state[propName] != null) {
                return;
            }
            if (type === Function) {
                state[propName] = ObjectUtil.isFunction(prop.default) ? prop.default : () => prop.default;
                return;
            }
            state[propName] = ObjectUtil.isFunction(prop.default) ? prop.default() : prop.default;
        });
    }

    #validateChildProps(child) {
        Object.entries(child.#bindProps.props).forEach(([propName, prop]) => {
            const { type } = prop;
            const propValue = child.#bindProps.data[propName];
            this.#validateType(propName, type, propValue);
        });
    }

    #validateType(propName, type, value) {
        if (value == null) {
            return;
        }
        if (type === Array && Array.isArray(value)) {
            return;
        }
        if (type === Object && ObjectUtil.isObject(value)) {
            return;
        }
        if (type === String && typeof value === 'string') {
            return;
        }
        if (type === Number && typeof value === 'number' && !isNaN(value)) {
            return;
        }
        if (type === Boolean && typeof value === 'boolean') {
            return;
        }
        if (type === Function && ObjectUtil.isFunction(value)) {
            return;
        }
        console.warn(`'${propName}' prop is invalid type. expected '${type.name}', but got '${typeof value}'. current value: ${value}.`);
    }

    #bindingDataToChildrenProps() {
        this.#children.forEach(child => {
            const { state, path } = this.#getParentStateData(child);

            if (!state || !ObjectUtil.isObject(state)) {
                return;
            }
            const parentDataProxy = this.#createReactiveProxy(state, child.#bindProps.props);
            ObjectUtil.setValue(this.#data, path, parentDataProxy);
        });
    }

    #createReactiveProxy(state = {}, childProps = {}) {
        const _this = this;

        const _createReactiveProxy = (obj, currentPath = []) => {
            if (!ObjectUtil.isObject(obj)) {
                return obj;
            }
            if (_this.#dataProxyCache.has(obj)) {
                return _this.#dataProxyCache.get(obj);
            }

            const proxy = new Proxy(obj, {
                get(o, key, receiver) {
                    const value = Reflect.get(o, key, receiver);

                    if (ObjectUtil.isObject(value)) {
                        return _createReactiveProxy(value, [...currentPath, key]);
                    }
                    return value;
                },

                set(o, key, newValue, receiver) {
                    if (o === state) {
                        Reflect.set(o, key, newValue, receiver);
                        _this.#processPropAfterUpdatedData(state, childProps, key);
                        return true;
                    }

                    const cachedPath = _this.#dataPathCache.get(o);
                    if (!cachedPath || cachedPath.length === 0) {
                        return true;
                    }

                    const [ propName ] = cachedPath;
                    if (!Object.hasOwn(childProps, propName)) {
                        return true;
                    }

                    Reflect.set(o, key, newValue, receiver);
                    _this.#batchProcessPropAfterUpdatedData(state, childProps, propName);
                    return true;
                },
            });

            _this.#dataPathCache.set(obj, currentPath);
            _this.#dataProxyCache.set(obj, proxy);
            return proxy;
        };

        return _createReactiveProxy(state);
    }

    #batchProcessPropAfterUpdatedData(state, childProps, propName) {
        if (this.#pendingUpdates.has(propName)) {
            return;
        }
        this.#pendingUpdates.set(propName, { state, childProps });

        window.queueMicrotask(() => {
            const updates = new Map(this.#pendingUpdates);
            this.#pendingUpdates.clear();

            updates.forEach((v, _propName) => {
                this.#processPropAfterUpdatedData(v.state, v.childProps, _propName);
            });
        });
    }

    #processPropAfterUpdatedData(state, childProps, propName) {
        if (!Object.hasOwn(childProps, propName)) {
            return;
        }
        const { type, onUpdate, watch, showIf } = childProps[propName];
        const propData = state[propName];

        this.#validateType(propName, type, propData);
        this.#showIfElement(showIf, propData);

        if (onUpdate) {
            onUpdate(propData);
        }
        if (watch) {
            watch(propData);
        }
    }

    #showIfElement(showIf, value) {
        if (!showIf || showIf.length === 0) {
            return;
        }
        showIf.forEach(elementId => {
            if (value) {
                this.#find(elementId).show();
                return;
            }
            this.#find(elementId).hide();
        });
    }

    _bindingData() {
        this.#initBoundedStoreData();
        this.#initChildPropsData();
        this.#bindingDataToChildrenProps();
    }

    _mount() {
        this.#lifeCycle.mounted();
    }

    _destroy() {
        this.#lifeCycle.destroy();
        this.#storeUnsubscribers.forEach(unsubscriber => unsubscriber());
        this.#storeUnsubscribers.length = 0
        this.#children.length = 0;
        this.#pendingUpdates.clear();
        this.#bindProps = {
            data: {},
            props: {},
        };
        this.#bindStore = {
            data: {},
            props: {},
        };
        this.#data = {};
        this.#methods = {};
        this.#id = null;

        if (this.#$el) {
            this.#$el.replaceChildren();
            this.#$el.remove();
            this.#$el = null;
        }
    }

    _getParentComponentElement() {
        return document.querySelector(`[component-id="${this.#bindProps.parentComponentId}"]`);
    }

    _addChildInstance(childComponentInstance) {
        this.#children.push(childComponentInstance);
    }

    #find = (elementId) => {
        return new Element(this.#id, elementId);
    };

}

export default Component;