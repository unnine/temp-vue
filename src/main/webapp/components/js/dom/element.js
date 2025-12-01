import {FormRenderer} from '../form/index.js';

export default class Element {

    _componentId;
    _id;
    _$el;


    constructor(componentId, id) {
        this._componentId = componentId;
        this._id = id;

        if (componentId === id) {
            this._$el = this.#findByComponentId(componentId);
        } else {
            this._$el = this.#findByElementId(id);
        }

        Object.freeze(this);
    }

    #findByComponentId(id) {
        const $el = document.querySelector(`[component-id="${id}"]`);

        if (!$el || !($el instanceof HTMLElement)) {
            throw new Error(`Cannot find element with id ${id}`);
        }
        return $el;
    }

    #findByElementId(id) {
        const $el = document.querySelector(`[component-id="${this._componentId}"] [e-id="${id}"]`);

        if (!$el || !($el instanceof HTMLElement)) {
            throw new Error(`Cannot find element with id '${id}'`);
        }
        return $el;
    }

    on(eventName, handler) {
        const eventListener = event => {
            handler({
                eventName,
                event,
            });
        };
        this._$el.addEventListener(eventName, eventListener);
        return this;
    }

    once(eventName, handler) {
        const onceHandler = event => {
            handler({
                eventName,
                event,
            });
            this._$el.removeEventListener(eventName, onceHandler);
        }
        this._$el.addEventListener(eventName, onceHandler);
        return this;
    }
    
    emit(eventName) {
        const event = new Event(eventName, { bubbles: true });
        this._$el.dispatchEvent(event);
        return this;
    }

    append($html) {
        if (Array.isArray($html)) {
            $html.forEach($el => this._$el.append($el));
            return this;
        }
        this._$el.append($html);
        return this;
    }

    addClass(className) {
        this._$el.classList.add(className);
        return this;
    }

    remove() {
        this._$el.remove();
    }

    removeClass(className) {
        this._$el.classList.remove(className);
        return this;
    }

    addStyle(key, value) {
        this._$el.style[key] = value;
        return this;
    }

    removeStyle(key) {
        this._$el.style[key] = null;
        return this;
    }

    isEmpty() {
        return this._$el.children.length === 0;
    }

    isNotEmpty() {
        return !this.isEmpty();
    }

    whenEmpty(fn) {
        if (this.isEmpty()) {
            fn(this);
        }
        return this;
    }

    whenNotEmpty(fn) {
        if (!this.isEmpty()) {
            fn(this);
        }
        return this;
    }

    showIf(predicate) {
        if (predicate()) {
            this.show();
        }
        return this;
    }

    hide() {
        this.addClass('hide');
        return this;
    }

    show() {
        this.removeClass('hide');
        return this;
    }

    // TODO extends form element
    render(formValues) {
        FormRenderer.render(this._$el, formValues);
        return this;
    }

    clear() {
        this._$el.replaceChildren();
        return this;
    }

}