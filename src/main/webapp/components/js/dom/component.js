import Element from "./element.js";
import { ObjectUtil, Date } from '../util/index.js';
import { request } from '../http/index.js';

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
    #bindData = {
        parentComponentId: null,
        name: null,
        props: {},
    };
    #propsData = {};
    #data = {};
    #children = [];
    #methods = {};
    #bindingInstance = {};
    #lifeCycle = {
        mounted() {},
    };


    constructor(options) {
        this.#initBindingInstance();
        this.#initProps(options);
        componentsConnector.add(this.#$el, this);
        Object.freeze(this.#bindingInstance);
        return this.#bindingInstance;
    }

    #initBindingInstance() {
        this.#defineGetter(this.#bindingInstance, '$id', () => this.#id);
        this.#defineGetter(this.#bindingInstance, '$el', () => this.#$el);
        this.#defineGetter(this.#bindingInstance, '$props', () => this.#propsData);
        this.#defineGetter(this.#bindingInstance, '$request', () => request);
        this.#defineGetter(this.#bindingInstance, '$find', () => this.#find);
        this.#defineGetter(this.#bindingInstance, '$date', () => Date);
    }

    #initProps(options) {
        const { id, bindData, methods, data, mounted } = options;

        if (!id) {
            throw new Error('id is required.');
        }

        this.#id = id;
        this.#$el = document.querySelector(`[component-id="${id}"]`);

        if (!this.#$el) {
            throw new Error(`component with id '${id}' not found in DOM. make sure the component is rendered before initializing.`);
        }

        if (bindData) {
            const { target, props } = bindData ?? {};
            const parentComponentDataName = target.split('.');

            if (target && (!parentComponentDataName || parentComponentDataName.length < 2)) {
                console.error(`unknown parent component id or data name. 'bindData.id' expression is '{parentComponentId}.{dataName}'`, this);
            }

            const [ parentComponentId, dataName ] = parentComponentDataName;

            this.#bindData.parentComponentId = parentComponentId;
            this.#bindData.name = dataName;

            Object.entries(props).forEach(([name, prop]) => {
                this.#bindData.props[name] = this.#makeBindProp(name, prop);
                this.#propsData[name] = null;
            });
        }

        if (methods) {
            Object.entries(methods)
                .filter(([, method]) => typeof method === 'function')
                .forEach(([methodName, method]) => {
                    this.#methods[methodName] = method.bind(this.#bindingInstance);
                    this.#bindingInstance[methodName] = method.bind(this.#bindingInstance);
            });
        }

        if (typeof data === 'function') {
            this.#data = ObjectUtil.copy(data.call(this.#bindingInstance));
            Object.keys(this.#data).forEach(key => this.#bindDataAndBindingInstance(this.#data, key));
        }

        if (typeof mounted === 'function') {
            this.#lifeCycle.mounted = mounted.bind(this.#bindingInstance);
        }
    }

    #makeBindProp(name, prop) {
        const {
            type = 'String',
            required = false,
            showIf = [],
            init = () => {},
            watch = () => true,
        } = prop ?? {};

        if (prop.default != null && typeof prop.default !== 'function') {
            console.warn(`${name}.default must be a function.`);
        }

        return {
            type,
            required,
            default: prop.default ?? (() => ''),
            showIf,
            init: (value) => {
                this.#showIfElement(showIf, value);
                init.call(this.#bindingInstance, value);
            },
            watch: watch.bind(this.#bindingInstance),
        };
    }

    #bindDataAndBindingInstance(_data, key) {
        Object.defineProperty(this.#bindingInstance, key, {
            get() {
                return _data[key];
            },
            set(v) {
                _data[key] = v;
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

    #setValueToChildProps() {
        const baseData = this.#data;

        this.#children.forEach(child => {
            const { name, props } = child.#bindData;
            const { data} = ObjectUtil.findFirstByKey(baseData, name);

            if (!data) {
                return;
            }

            child.#propsData = data;
            this.#initializeProps(data, props);
        });
    }

    #initializeProps(data, props) {
        Object.entries(props).forEach(([name, prop]) => {
            if (!Object.hasOwn(prop, 'init')) {
                return;
            }
            const { type, init } = prop;

            if (!Object.hasOwn(data, name)) {
                data[name] = prop.default();
            }
            const value = data[name];
            this.#validateType(name, type, value);
            init(value);
        });
    }

    #bindingDataToChildrenProps() {
        const rootData = this.#data;

        this.#children.forEach(child => {
            const { name, props: childProps } = child.#bindData;
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
            if (typeof obj !== 'object' || obj === null) {
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
                get(o, prop) {
                    const value = o[prop];

                    if (typeof value === 'object' && value !== null) {
                        return _createReactiveProxy(value);
                    }
                    return value;
                },

                set(o, prop, newValue) {
                    if (typeof newValue === 'function') {
                        newValue = newValue.bind(obj);
                    }

                    if (o === baseData) {
                        _this.#updateData(o, prop, newValue);
                        _this.#updateProp(baseData, targetProps, prop, o, prop, newValue);
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

                    _this.#updateData(o, prop, newValue);
                    _this.#updateProp(baseData, targetProps, propName, o, prop, newValue);
                    return true;
                },
            });

            proxyCache.set(obj, proxy);
            return proxy;
        }

        return _createReactiveProxy(baseData);
    }

    #updateData(updateData, updateName, newValue) {
        updateData[updateName] = newValue;
    }

    #updateProp(baseData, props, propName) {
        if (!Object.hasOwn(props, propName)) {
            return;
        }
        const { type, watch, showIf } = props[propName];
        const propData = baseData[propName];

        this.#validateType(propName, type, propData);
        this.#showIfElement(showIf, propData);
        watch(propData);
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

    #validateType(name, type, value) {
        if (!type) {
            return;
        }
        if (value == null) {
            return;
        }

        const _type = type.toLowerCase();
        const actualType = (typeof value).toLowerCase();

        if (_type === 'array') {
            if (!Array.isArray(value)) {
                console.warn(`'${name}' prop is invalid type. expected 'array', but got '${actualType}'. value: ${value}`);
            }
            return;
        }

        if (actualType !== _type) {
            console.warn(`'${name}' prop is invalid type. expected '${_type}', but got '${actualType}'. value: ${value}`);
        }
    }

    _bindingComponents() {
        this.#setValueToChildProps();
        this.#bindingDataToChildrenProps();
    }

    _mount() {
        this.#lifeCycle.mounted();
    }

    _getParentComponentElement() {
        return document.querySelector(`[component-id="${this.#bindData.parentComponentId}"]`);
    }

    _addChildInstance(childComponentInstance) {
        this.#children.push(childComponentInstance);
    }

    #find = function(elementId) {
        return new Element(this.#id, elementId);
    }.bind(this);

}

export default Component;