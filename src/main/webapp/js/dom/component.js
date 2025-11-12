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
    #dataProxy = {};
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
            bindParentData,
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

        if (bindParentData) {
            const { name, props } = bindParentData;

            this.#bindParentData.name = name;

            Object.entries(props).forEach(([name, o]) => {
                const {
                    defaultValue = null,
                    type = 'String',
                    required = false,
                    init = () => {},
                    watch = () => {},
                } = o ?? {};

                this.#bindParentData.props[name] = {
                    type,
                    required,
                    defaultValue,
                    init: init.bind(this.#bindingInstance),
                    watch: watch.bind(this.#bindingInstance),
                };

                this.#propsData[name] = null;
            });
        }

        if (data && typeof data === 'function') {
            this.#data = data.call(this.#bindingInstance);
            this.#dataProxy = objectUtil.copy(this.#data);
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

    _bindingDataToChildrenProps() {
        const data = this.#data;
        const proxy = this.#dataProxy;
        const children = this.#children;

        this.#setValueToChildProps();

        children.forEach(child => {
           const { name, props: childProps } = child._bindParentData();
           const { data: target, path: parentDataPath } = objectUtil.findFirst(proxy, name);
           const childPropsData = child._propsData();

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

                       if ((type.toLowerCase() === 'array' && Array.isArray(newValue)) ||
                           ((typeof newValue).toLowerCase() !== type.toLowerCase())) {
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
        const children = this.#children;

        children.forEach(child => {
           const { name, props } = child._bindParentData();
           const { data: target } = objectUtil.findFirst(data, name);
            const childPropsData = child._propsData();

           if (!target) {
               return;
           }

           Object.entries(target).forEach(([key, value]) => {
              if (!Object.hasOwn(props, key)) {
                  return;
              }
               const { defaultValue, init } = props[key];
               childPropsData[key] = value ? value : defaultValue;
               init(value);
           });
        });
    }

    _mount() {
        this.#lifeCycle.mounted();
    }

    #initBindingInstance() {
        this.#bindingInstance.$id = this.#id;
        this.#bindingInstance.$el = this.#$el;
        this.#bindingInstance.$data = this.#dataProxy;
        this.#bindingInstance.$props = this.#propsData;
        this.#bindingInstance.find = this.find;
        this.#bindingInstance.form = this.form;

        Object.entries(this.#methods).forEach(([methodName, method]) => {
            this.#bindingInstance[methodName] = method;
        });

        Object.freeze(this.#bindingInstance);
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

}

export default Component;