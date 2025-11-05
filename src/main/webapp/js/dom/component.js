import {eventBus} from "./eventBus.js";
import Element from "./element.js";
import Form from "./form.js";

class Component {

    #id;
    #$el;
    #methods = {};
    #bindingInstance = {};


    constructor(props) {
        this.#init(props);
        this.#initBindingInstance();
        this.#registerEventHandlers();
        return this.#bindingInstance;
    }


    #initBindingInstance() {
        this.#bindingInstance.id = this.#id;
        this.#bindingInstance.$el = this.#$el;

        Object.entries(this.#methods).forEach(([methodName, method]) => {
            this.#bindingInstance[methodName] = method;
        });

        this.#bindingInstance = {
            find: this.find,
            invokeParent: this.invokeParent,
            form: this.form,
        };

        Object.freeze(this.#bindingInstance);
    }

    #init(props) {
        const {
            id,
            methods,
        } = props;

        if (!id) {
            throw new Error('id is required.');
        }

        this.#id = id;
        this.#$el = document.querySelector(`[component-id="${id}"]`);

        if (!this.#$el) {
            throw new Error(`component with id '${id}' not found in DOM. make sure the component is rendered before initializing.`);
        }

        if (methods) {
            Object.entries(methods).forEach(([methodName, method]) => {
                this.#methods[methodName] = method.bind(this.#bindingInstance);
            });
        }
    }

    #registerEventHandlers() {
        Object.entries(this.#methods).forEach(([handlerName, handler]) => {
            eventBus.addEventHandler(this.#$el, handlerName, handler);
        });
    }

    find = function(elementId) {
        return new Element(this.#id, elementId);
    }.bind(this);

    form = function(elementId) {
        return new Form(this.#id, elementId);
    }.bind(this);

    invokeParent = function(handlerName, args) {
        const parentComponent = this.#$el.parentElement.closest('[component-id]');
        eventBus.emit(parentComponent, handlerName, args);
    }.bind(this);

}

export default Component;