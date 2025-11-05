export default class Element {

    _componentId;
    _id;
    _$el;


    constructor(componentId, id) {
        this._componentId = componentId;
        this._id = id;
        this._$el = this._findElementById(id);

        Object.freeze(this);
    }


    _findElementById(id) {
        const $el = document.querySelector(`[component-id="${this._componentId}"] [e-id="${id}"]`);
        if (!$el || !($el instanceof HTMLElement)) {
            throw new Error(`Cannot find element with id ${id}`);
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
    }

}