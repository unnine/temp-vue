import Element from "./element.js";
import { ObjectUtil } from '../util/index.js';
import { request } from '../http/index.js';
import { store } from '../store/index.js';
import consts from '../consts/index.js';

const { SHOW_ALERT } = consts.store;

const componentsConnector = new class ComponentsConnector {

    #$components = [];
    #instances = new WeakMap();


    add($component, instance) {
        this.#$components.push($component)
        this.#instances.set($component, instance);
    }

    connect() {
        this.#connectChildrenToParent();
        this.#bindingParentAndChildrenComponents();
        this.#mount();
    }

    #connectChildrenToParent() {
        this.#$components.forEach($component => {
            if (!this.#instances.has($component)) {
                return;
            }

            const componentInstance = this.#instances.get($component);
            const $parentComponent = componentInstance._getParentComponentElement();

            if (!$parentComponent) {
                return;
            }

            const parentComponentInstance = this.#instances.get($parentComponent);
            parentComponentInstance._addChildInstance(componentInstance);
        });
    }

    #bindingParentAndChildrenComponents() {
        this.#$components.forEach($component => {
            if (!this.#instances.has($component)) {
                return;
            }
            const instance = this.#instances.get($component);
            instance._bindingComponents();
        });
    }

    #mount() {
        this.#$components.forEach($component => {
            if (!this.#instances.has($component)) {
                return;
            }
            const instance = this.#instances.get($component);
            instance._mount();
        });
    }

    clear() {
        this.#$components.forEach($component => this.#instances.delete($component));
        this.#$components = [];
    }
};

window.addEventListener('load', e => {
    componentsConnector.connect();
    componentsConnector.clear();
});

class Component {

    #id;
    #$el;
    #bindStore = {};
    #storeData = {};
    #bindProps = {
        parentComponentId: null,
        name: null,
        props: {},
        data: {},
    };
    #data = {};
    #children = [];
    #methods = {};
    #bindingInstance = {};
    #lifeCycle = {
        mounted() {},
    };


    constructor(options) {
        this.#initBindingInstance();
        this.#initComponent(options);
        componentsConnector.add(this.#$el, this);
        Object.freeze(this.#bindingInstance);
        return this.#bindingInstance;
    }

    #initBindingInstance() {
        const o = this.#bindingInstance;

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
        const { id, propsTarget, props, bindStore, data, methods, mounted } = options;

        if (!id) {
            throw new Error('id is required.');
        }

        this.#id = id;
        this.#$el = document.querySelector(`[component-id="${id}"]`);

        if (!this.#$el) {
            throw new Error(`component with id '${id}' not found in DOM. make sure the component is rendered before initializing.`);
        }

        if (bindStore) {
            this.#initBindStore(bindStore);
        }

        if (props) {
            this.#initProps(propsTarget, props);
        }

        if (methods) {
            this.#initMethods(methods)
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

                this.#bindStore[key] = {
                    getterName,
                    watch: watch.bind(this.#bindingInstance),
                };
                this.#storeData[key] = undefined;
            });
        };

        const subscribeStore = () => {
            Object.entries(this.#bindStore).forEach(([key, props]) => {
                const { getterName, watch } = props;

                store._subscribe(getterName, (value) => {
                    this.#storeData[key] = value;
                    watch(value);
                });
            });
        };

        const bindStoreDataAndBindingInstance = () => {
            Object.entries(this.#storeData).forEach(([key, value]) => {
                this.#bindingInstance[key] = value;

                Object.defineProperty(this.#bindingInstance, key, {
                    get: () => {
                        return this.#storeData[key];
                    },
                });
            });
        };

        _initBindStore();
        subscribeStore();
        bindStoreDataAndBindingInstance();
    }

    #initProps(propsTarget, props) {
        const parentComponentDataName = propsTarget.split('.');

        if (propsTarget && (!parentComponentDataName || parentComponentDataName.length < 2)) {
            console.error(`unknown parent component id or data name. 'propsTarget' expression is '{parentComponentId}.{dataName}'. current: '${propsTarget}'`);
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
        Object.entries(this.#bindStore).forEach(([key, value]) => {
            const { getterName, watch } = value;

            this.#storeData[key] = store.get(getterName);
            watch(value);
        });
    }

    #setValueToChildProps() {
        const baseData = this.#data;

        this.#children.forEach(child => {
            const { name, props } = child.#bindProps;
            const { data} = ObjectUtil.findFirstByKey(baseData, name);

            if (!data) {
                return;
            }

            child.#bindProps.data = data;
            this.#initChildProps(data, props);
        });
    }

    #initChildProps(data, props) {
        Object.entries(props).forEach(([name, prop]) => {
            const { type, onInit, watch } = prop;

            this.#setDefaultDataToData(data, prop, name);
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

    #setDefaultDataToData(data, prop, propName) {
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
            const { data: parentData, path: parentDataPath } = ObjectUtil.findFirstByKey(rootData, name);

            if (!parentData) {
                return;
            }
            const parentDataProxy = this.#createReactiveProxy(parentData, childProps);
            ObjectUtil.setValue(rootData, parentDataPath, parentDataProxy);
        });
    }

    #createReactiveProxy(baseData = {}, targetProps = {}) {
        const proxyCache = new WeakMap();
        const _this = this;

        function _createReactiveProxy(obj) {
            if (!ObjectUtil.isObject(obj)) {
                return obj;
            }
            if (proxyCache.has(obj)) {
                return proxyCache.get(obj);
            }

            Object.entries(obj).forEach(([key, value]) => {
                if (typeof value === 'function') {
                    obj[key] = value.bind(obj);
                }
            });

            const proxy = new Proxy(obj, {
                get(o, key) {
                    const value = o[key];

                    if (ObjectUtil.isObject(value)) {
                        return _createReactiveProxy(value);
                    }
                    return value;
                },

                set(o, key, newValue) {
                    const oldValue = o[key];

                    if (oldValue === newValue) {
                        return true;
                    }

                    if (typeof newValue === 'function') {
                        newValue = newValue.bind(obj);
                    }

                    if (o === baseData) {
                        _this.#updateDataAndProcessProps(o, key, newValue, baseData, targetProps);
                        return true;
                    }

                    const target = ObjectUtil.findFirst(baseData, o);
                    if (!target) {
                        return true;
                    }

                    const { path } = target;
                    if (!path || path?.length === 0) {
                        return true;
                    }

                    const [ propName ] = path;
                    if (!Object.hasOwn(targetProps, propName)) {
                        return true;
                    }

                    _this.#updateDataAndProcessProps(o, key, newValue, baseData, targetProps);
                    return true;
                },
            });

            proxyCache.set(obj, proxy);
            return proxy;
        }

        return _createReactiveProxy(baseData);
    }

    #updateDataAndProcessProps(updateData, updatePropName, newValue, baseData, props) {
        this.#updateData(updateData, updatePropName, newValue);
        this.#processPropAfterUpdatedData(baseData, props, updatePropName);
    }

    #updateData(updateData, updateName, newValue) {
        updateData[updateName] = newValue;
    }

    #processPropAfterUpdatedData(baseData, props, propName) {
        if (!Object.hasOwn(props, propName)) {
            return;
        }
        const { type, onUpdate, watch, showIf } = props[propName];
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