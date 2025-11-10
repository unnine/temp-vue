import {eventBus} from "./eventBus.js";
import Element from "./element.js";
import Form from "./form.js";
import { objectUtil } from './util.js';

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
            instance._bindingDataToChildrenProps();
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
    #bindParentData = {
        name: null,
        props: {},
    };
    #props = {};
    #propsData = {};
    #data = {};
    #_dataProxy = {};
    #children = [];
    #methods = {};
    #bindingInstance = {};
    #lifeCycle = {
        mounted() {
        },
    };


    constructor(options) {
        this.#initProps(options);
        this.#initAsyncProps(options);
        this.#initBindingInstance();
        this.#registerEventHandlers();
        componentsConnector.add(this.#$el, this);
        return this.#bindingInstance;
    }


    #initProps(options) {
        const {
            id,
            bindParentData,
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

        if (bindParentData) {
            const { name, props } = bindParentData;

            this.#bindParentData.name = name;

            Object.entries(props).forEach(([name, o]) => {
                const {
                    type = 'String',
                    required = false,
                    watch = () => {
                    }
                } = o ?? {};

                this.#bindParentData.props[name] = {
                    type,
                    required,
                    watch: watch.bind(this.#bindingInstance),
                };

                this.#propsData[name] = null;
            });
        }

        if (methods) {
            Object.entries(methods).forEach(([methodName, method]) => {
                this.#methods[methodName] = method.bind(this.#bindingInstance);
            });
        }

        if (mounted && typeof mounted === 'function') {
            this.#lifeCycle.mounted = mounted.bind(this.#bindingInstance);
        }
    }

    async #initAsyncProps(options) {
        const {
            data,
        } = options;

        if (data && typeof data === 'function') {
            this.#data = await data();
        }
    }

    _bindingDataToChildrenProps() {
        const data = this.#data;
        const proxy = this.#_dataProxy;
        const children = this.#children;

        this.#setValueToChildProps();

        children.forEach(child => {
           const { name, props: childProps } = child._bindParentData();
           const childPropsData = child._propsData();
           const { data: target, path: parentDataPath } = objectUtil.findFirst(proxy, name);

           if (!target) {
               return;
           }

           Object.keys(target).forEach(key => {
               Object.defineProperty(target, key, {
                   get() {
                       return objectUtil.getValue(data, [...parentDataPath, key]);
                   },
                   set(newValue) {
                       if (!Object.hasOwn(childProps, key)) {
                           return;
                       }

                       const { type, required, watch } = childProps[key];

                       if ((typeof newValue).toLowerCase() !== type.toLowerCase()) {
                           console.warn(`invalid type. '${key}' must be '${type}'. but '${newValue}' is '${typeof newValue}'`);
                       }
                       if (required && !newValue) {
                           console.error(`${key} is required. but '${newValue}'`);
                       }
                       if (childPropsData[key] !== newValue) {
                           childPropsData[key] = newValue;
                           const oldValue = objectUtil.getValue(data, [...parentDataPath, key]);
                           watch(newValue, oldValue);
                       }

                       objectUtil.setValue(data, [...parentDataPath, key], newValue);
                   },
               });
           });
        });
    }

    #setValueToChildProps() {
        const data = this.#data;
        const proxy = this.#_dataProxy;
        const children = this.#children;

        Object.entries(data).forEach(([key, value]) => {
            proxy[key] = objectUtil.copy(value);

            children.forEach(childInstance => {
                const bindParentData = childInstance._bindParentData();
                if (!bindParentData) {
                    return;
                }

                const { data: propData } = objectUtil.findFirst(data, bindParentData.name);
                if (!propData) {
                    return;
                }

                const childPropsData = childInstance._propsData();
                objectUtil.writeValue(propData, childPropsData);
            });
        });
    }

    _mount() {
        this.#lifeCycle.mounted();
    }

    #initBindingInstance() {
        this.#bindingInstance.$id = this.#id;
        this.#bindingInstance.$el = this.#$el;
        this.#bindingInstance.$data = this.#_dataProxy;
        this.#bindingInstance.$props = this.#propsData;
        this.#bindingInstance.find = this.find;
        this.#bindingInstance.invokeParent = this.invokeParent;
        this.#bindingInstance.form = this.form;

        Object.entries(this.#methods).forEach(([methodName, method]) => {
            this.#bindingInstance[methodName] = method;
        });

        Object.freeze(this.#bindingInstance);
    }

    #registerEventHandlers() {
        Object.entries(this.#methods).forEach(([handlerName, handler]) => {
            eventBus.addEventHandler(this.#$el, handlerName, handler);
        });
    }

    _addChildInstance(childComponentInstance) {
        this.#children.push(childComponentInstance);
    }

    _bindParentData() {
        return this.#bindParentData;
    }

    _propsData() {
        return this.#propsData;
    }

    find = function (elementId) {
        return new Element(this.#id, elementId);
    }.bind(this);

    form = function (elementId) {
        return new Form(this.#id, elementId);
    }.bind(this);

    invokeParent = function (handlerName, args) {
        const parentComponent = this.#$el.parentElement.closest('[component-id]');
        eventBus.emit(parentComponent, handlerName, args);
    }.bind(this);

}

export default Component;