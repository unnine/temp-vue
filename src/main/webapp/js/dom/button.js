class Button {

    #id;
    #$el;

    constructor(id) {
        this.#id = id;
        this.#$el = this.#findElementById(id);
    }

    #findElementById(id) {

        const $el = document.querySelector(`[c-id="${id}"]`);
        if (!$el || !($el instanceof HTMLElement)) {
            throw new Error(`Cannot find element with id ${id}`);
        }
        return $el;
    }

    on(eventName, handler) {
        this.#$el.addEventListener(eventName, handler);
        return this;
    }

    once(eventName, handler) {
        const onceHandler = () => {
            handler(this.#$el);
            return this.#$el.removeEventListener(eventName, onceHandler);
        }
        this.#$el.addEventListener(eventName, onceHandler);
    }

    click() {
        this.#$el.click();
    }
}

export default Button;