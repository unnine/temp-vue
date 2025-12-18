import { FormRenderer } from '../form/index.js';
import { XSSUtil } from '../util/index.js';

export default class Element {

    _componentId;
    _$component;
    _id;
    _$el;
    #eventHandlers = new Map();


    constructor(componentId, id) {
        this._componentId = componentId;
        this._$component = this.#findComponentElement();
        this._id = id;

        if (componentId === id) {
            this._$el = this._$component;
        } else {
            this._$el = this.#findByElementId(id);
        }

        Object.freeze(this);
    }

    #findComponentElement() {
        const $el = document.querySelector(`[component-id="${this._componentId}"]`);

        if (!$el || !($el instanceof HTMLElement)) {
            throw new Error(`Cannot find element with component id. ${this._componentId}`);
        }
        return $el;
    }

    #findByElementId(eid) {
        const [ $el ] = this.#findAllByElementId(eid);

        if (!$el || !($el instanceof HTMLElement)) {
            throw new Error(`Cannot find element by e-id. '${eid}'`);
        }
        return $el;
    }

    #findAllByElementId(eid) {
        const walker = document.createTreeWalker(this._$component, NodeFilter.SHOW_ELEMENT, {
            acceptNode: ($node) => {
                if ($node === this._$el) {
                    return NodeFilter.FILTER_SKIP;
                }
                if ($node.hasAttribute && $node.hasAttribute('component-id')) {
                    return NodeFilter.FILTER_REJECT;
                }
                if ($node.getAttribute && $node.getAttribute('e-id') === eid) {
                    return NodeFilter.FILTER_ACCEPT;
                }
                return NodeFilter.FILTER_SKIP
            }
        });

        const result = [];

        while(walker.nextNode()) {
            result.push(walker.currentNode);
        }
        return result;
    }

    on(eventName, handler) {
        const eventListener = event => {
            handler({
                eventName,
                event,
            });
        };
        this._$el.addEventListener(eventName, eventListener);
        this.#eventHandlers.set(eventListener, eventName);
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
            this._$el.append(...$html);
            return this;
        }
        this._$el.append($html);
        return this;
    }

    innerHtml($html) {
        this._$el.innerHTML = XSSUtil.escape($html);
        return this;
    }

    innerText($html) {
        this._$el.innerText = $html;
        return this;
    }

    setAttribute(key, value) {
        this._$el.setAttribute(key, value);
    }

    removeAttribute(key) {
        this._$el.removeAttribute(key);
    }

    addClass(...classNames) {
        this._$el.classList.add(...classNames);
        return this;
    }

    removeClass(...classNames) {
        this._$el.classList.remove(...classNames);
        return this;
    }

    setStyle(key, value) {
        this._$el.style[key] = value;
        return this;
    }

    removeStyle(key) {
        this._$el.style[key] = null;
        return this;
    }

    isEmpty() {
        const elementNodeType = 1;
        const textNodeType = 3;

        return Array.from(this._$el.childNodes ?? []).filter(childNode => {
            const { nodeType, textContent } = childNode;

            if (nodeType === elementNodeType) {
                return true;
            }
            if (nodeType === textNodeType && textContent != null && textContent.trim() !== '') {
                return true;
            }
            return false;
        }).length === 0;
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

    render(formValues) {
        FormRenderer.render(this._$el, formValues);
        return this;
    }

    clear() {
        this.#eventHandlers.forEach((eventName, handler) => {
            this._$el.removeEventListener(eventName, handler);
        });
        this.#eventHandlers.clear();
        this._$el.replaceChildren();
        return this;
    }

}