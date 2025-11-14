import Element from "./element.js";
import {objectUtil} from '../util/index.js';
import {request} from '../http/index.js';

const componentsConnector = new class ComponentsConnector {

    #$components = [];
    #instances = new WeakMap();


    add($component, instance) {
        this.#$components.push($component)
        this.#instances.set($component, instance);
    }

    connect() {
        this.#connectChildrenToParent();
        this.#bindingParentDataToChildrenProps();
    }

    #connectChildrenToParent() {
        this.#$components.forEach($component => {
            const $parentComponent = $component.parentElement.closest('[component-id]');
            if (!$parentComponent) {
                return;
            }
            if (!this.#instances.has($component)) {
                return;
            }

            const parentComponentInstance = this.#instances.get($parentComponent);
            const componentInstance = this.#instances.get($component);
            parentComponentInstance._addChildInstance(componentInstance);
        });
    }

    #bindingParentDataToChildrenProps() {
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
        this.#initProps(options);
        this.#initBindingInstance();
        componentsConnector.add(this.#$el, this);
        return this.#bindingInstance;
    }

    #initProps(options) {
        const {
            id,
            bindData,
            data,
            methods,
            mounted,
        } = options;

        if (!id) {
            throw new Error('id is required.');
        }

        this.#id = id;
        this.#$el = document.querySelector(`[component-id="${id}"]`);

        if (!this.#$el) {
            throw new Error(`component with id '${id}' not found in DOM. make sure the component is rendered before initializing.`);
        }

        if (bindData) {
            const { name, props } = bindData;

            this.#bindData.name = name;

            Object.entries(props).forEach(([name, o]) => {
                const {
                    type = 'String',
                    required = false,
                    defaultValue = '',
                    showIf = [],
                    init = () => {},
                    watch = () => true,
                } = o ?? {};

                this.#bindData.props[name] = {
                    type,
                    required,
                    defaultValue,
                    showIf,
                    init: (value) => {
                        this.#showIfElement(showIf, value);
                        init.call(this.#bindingInstance, value);
                    },
                    watch: watch.bind(this.#bindingInstance),
                };
            });
        }

        if (data && typeof data === 'function') {
            this.#data = objectUtil.copy(data.call(this.#bindingInstance));
        }

        if (methods) {
            Object.entries(methods).forEach(([methodName, method]) => {
                if (typeof method === 'function') {
                    this.#methods[methodName] = method.bind(this.#bindingInstance);
                }
            });
        }

        if (mounted && typeof mounted === 'function') {
            this.#lifeCycle.mounted = mounted.bind(this.#bindingInstance);
        }
    }

    #initBindingInstance() {
        this.#defineGetter(this.#bindingInstance, '$id', () => this.#id);
        this.#defineGetter(this.#bindingInstance, '$el', () => this.#$el);
        this.#defineGetter(this.#bindingInstance, '$data', () => this.#data);
        this.#defineGetter(this.#bindingInstance, '$props', () => this.#propsData);
        this.#defineGetter(this.#bindingInstance, '$request', () => request);
        this.#defineGetter(this.#bindingInstance, '$find', () => this.#find);

        Object.entries(this.#methods).forEach(([methodName, method]) => {
            this.#bindingInstance[methodName] = method;
        });

        Object.freeze(this.#bindingInstance);
    }

    #defineGetter(o, name, getter) {
        Object.defineProperty(o, name, {
            get() {
                return getter();
            },
        });
    }

    _mount() {
        this.#setValueToChildProps();
        this.#bindingDataToChildrenProps();
        this.#lifeCycle.mounted();
    }

    #setValueToChildProps() {
        const baseData = this.#data;

        this.#children.forEach(child => {
            const { name, props } = child.#bindData;
            const { data} = objectUtil.findFirstByKey(baseData, name);

            if (!data) {
                return;
            }

            child.#propsData = data;

            Object.entries(props).forEach(([name, prop]) => {
                if (!Object.hasOwn(prop, 'init')) {
                    return;
                }
                const { type, init } = prop;
                const value = data[name];
                this.#validateType(name, type, value);
                init(value);
            });
        });
    }

    #bindingDataToChildrenProps() {
        const rootData = this.#data;

        this.#children.forEach(child => {
            const { name, props: childProps } = child.#bindData;
            const { data: parentData, path: parentDataPath } = objectUtil.findFirstByKey(rootData, name);

            if (!parentData) {
                return;
            }
            const parentDataProxy = this.#createReactiveProxy(parentData, childProps);
            objectUtil.setValue(rootData, parentDataPath, parentDataProxy);
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

            const proxy = new Proxy(obj, {
                get(o, prop) {
                    const value = o[prop];

                    if (typeof value === 'object' && value !== null) {
                        return _createReactiveProxy(value);
                    }
                    return value;
                },

                set(o, prop, newValue, xy) {
                    if (o === baseData) {
                        _this.#updateProp(baseData, targetProps, prop, o, prop, newValue);
                        return true;
                    }

                    const target = objectUtil.findFirst(baseData, o);
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

                    _this.#updateProp(baseData, targetProps, propName, o, prop, newValue);
                    return true;
                },
            });

            proxyCache.set(obj, proxy);
            return proxy;
        }

        return _createReactiveProxy(baseData);
    }

    #updateProp(baseData, targetProps, targetPropName, updateData, updateName, newValue) {
        const { type, watch, showIf } = targetProps[targetPropName];
        
        updateData[updateName] = newValue;

        const propData = baseData[targetPropName];
        watch(propData);

        this.#validateType(targetPropName, type, propData);
        this.#showIfElement(showIf, propData);
    }

    #showIfElement(showIf, value) {
        if (!showIf || showIf.length === 0) {
            return;
        }
        showIf.forEach(elementId => {
            if (value) {
                this.#find(elementId).append(value);
                this.#find(elementId).removeStyle('display');
                return;
            }
            this.#find(elementId).addStyle('display', 'none');
        });
    }

    #validateType(name, type, value) {
        if (!type) {
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

    _addChildInstance(childComponentInstance) {
        this.#children.push(childComponentInstance);
    }

    #find = function(elementId) {
        return new Element(this.#id, elementId);
    }.bind(this);

}

export default Component;