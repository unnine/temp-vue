import Element from "./element.js";
import ComponentsConnector from "./componentsConnector.js";
import { ObjectUtil } from '../util/index.js';
import { request } from '../http/index.js';
import { store } from '../store/index.js';
import consts from '../consts/index.js';


const { SHOW_ALERT } = consts.store;

const componentsConnector = new ComponentsConnector();

window.addEventListener('load', e => {
    componentsConnector.connect();
    componentsConnector.clear();
}, { once: true });


class Component {

    #id;
    #$el;
    #bindStore = {
        props: {},
        data: {},
    };
    #bindProps = {
        parentComponentId: null,
        name: null,
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
    };

    #pendingUpdates = new Map();


    constructor(options) {
        this.#initBindingInstance();
        this.#initComponent(options);
        componentsConnector.add(this.#$el, this);
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
        o.$confirm = (message) => store.commit(SHOW_ALERT, { type: 'info', message, isConfirm: true });
        o.$info = (message) => store.commit(SHOW_ALERT, { type: 'info', message });
        o.$warn = (message) => store.commit(SHOW_ALERT, { type: 'warn', message });
        o.$danger = (message) => store.commit(SHOW_ALERT, { type: 'danger', message });
    }

    #initComponent(options) {
        const { id, propsState, props, bindStore, data, methods, mounted } = options;

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

        if (typeof data === 'function') {
            this.#initComponentData(data);
        }

        if (typeof mounted === 'function') {
            this.#lifeCycle.mounted = mounted.bind(this.#bindingInstance);
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

                store._subscribe(getterName, (value) => {
                    this.#bindStore.data[key] = value;
                    watch(value);
                });
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
        const parentComponentDataName = propsState.split('.');

        if (propsState && (!parentComponentDataName || parentComponentDataName.length < 2)) {
            console.error(`unknown parent component id or data name. 'propsState' expression is '{parentComponentId}.{dataName}'. current: '${propsState}'`);
        }

        const [ parentComponentId, dataName ] = parentComponentDataName;

        this.#bindProps.parentComponentId = parentComponentId;
        this.#bindProps.name = dataName;

        const propsObject = props.call(this.#bindingInstance);

        Object.entries(propsObject).forEach(([name, prop]) => {
            this.#bindProps.props[name] = this.#makeBindProp(name, prop);
            this.#bindProps.data[name] = null;
        });
    }

    #initMethods(methods) {
        Object.entries(methods)
            .filter(([, method]) => typeof method === 'function')
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
        Object.keys(this.#data).forEach(key => this.#bindStateAndBindingInstance(this.#data, key));
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

        if (prop.default != null && typeof prop.default !== 'function' && (type === Array || type === Object)) {
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

    #bindStateAndBindingInstance(data, key) {
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

    #setValueToChildProps() {
        const baseData = this.#data;

        this.#children.forEach(child => {
            const { name, props } = child.#bindProps;
            const { value } = ObjectUtil.findFirstByKey(baseData, name);

            if (!value) {
                return;
            }

            child.#bindProps.data = value;
            this.#initChildProps(value, props);
        });
    }

    #initChildProps(data, props) {
        Object.entries(props).forEach(([name, prop]) => {
            const { type, onInit, watch } = prop;

            this.#setDefaultData(data, prop, name);
            const value = data[name];
            this.#validateType(name, type, value);

            if (onInit) {
                onInit(value);
            }
            if (watch) {
                watch(value);
            }
        });
    }

    #setDefaultData(data, prop, propName) {
        const { type } = prop;

        if (Object.hasOwn(data, propName)) {
            return;
        }
        if (type === Array || type === Object) {
            data[propName] = typeof prop.default === 'function' ? prop.default() : prop.default;
            return;
        }
        data[propName] = prop.default;
    }

    #bindingDataToChildrenProps() {
        const rootData = this.#data;

        this.#children.forEach(child => {
            const { name, props: childProps } = child.#bindProps;
            const { value: parentData, path: parentDataPath } = ObjectUtil.findFirstByKey(rootData, name);

            if (!parentData) {
                return;
            }

            const parentDataProxy = this.#createReactiveProxy(parentData, childProps);
            ObjectUtil.setValue(rootData, parentDataPath, parentDataProxy);
        });
    }

    #createReactiveProxy(baseData = {}, childProps = {}) {
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
                    if (o === baseData) {
                        Reflect.set(o, key, newValue, receiver);
                        _this.#processPropAfterUpdatedData(baseData, childProps, key);
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
                    _this.#batchProcessPropAfterUpdatedData(baseData, childProps, propName);
                    return true;
                },
            });

            _this.#dataPathCache.set(obj, currentPath);
            _this.#dataProxyCache.set(obj, proxy);
            return proxy;
        };

        return _createReactiveProxy(baseData);
    }

    #batchProcessPropAfterUpdatedData(baseData, childProps, propName) {
        this.#pendingUpdates.set(propName, { baseData, childProps });

        if (this.#pendingUpdates.has(propName)) {
            return;
        }

        queueMicrotask(() => {
            const updates = new Map(this.#pendingUpdates);
            this.#pendingUpdates.clear();

            updates.forEach((v, _propName) => {
                this.#processPropAfterUpdatedData(v.baseData, v.childProps, _propName);
            });
        });
    }

    #processPropAfterUpdatedData(baseData, childProps, propName) {
        if (!Object.hasOwn(childProps, propName)) {
            return;
        }
        const { type, onUpdate, watch, showIf } = childProps[propName];
        const propData = baseData[propName];

        this.#validateType(propName, type, propData);
        this.#showIfElement(showIf, propData);

        if (onUpdate) {
            onUpdate(propData);
        }
        if (watch) {
            watch(propData);
        }
    }

    #validateType(name, type, value) {
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
        if (type === Function && typeof value === 'function') {
            return;
        }
        console.warn(`'${name}' prop is invalid type. expected '${type.name}', but got '${typeof value}'. value: ${value}`);
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

    _bindingComponents() {
        this.#initBoundedStoreData();
        this.#setValueToChildProps();
        this.#bindingDataToChildrenProps();
    }

    _mount() {
        this.#lifeCycle.mounted();
    }

    _getParentComponentElement() {
        return document.querySelector(`[component-id="${this.#bindProps.parentComponentId}"]`);
    }

    _addChildInstance(childComponentInstance) {
        this.#children.push(childComponentInstance);
    }

    #find = function(elementId) {
        return new Element(this.#id, elementId);
    }.bind(this);

}

export default Component;