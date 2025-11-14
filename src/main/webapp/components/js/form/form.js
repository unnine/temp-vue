import Element from "../dom/element.js";

export default class Form extends Element {

    #initValues = {};


    constructor(componentId, id) {
        super(componentId, id);

        if (!(this._$el instanceof HTMLFormElement)) {
            throw new Error(`Element with e-id='${id}' must be a <form> element`);
        }

        this.#initValues = this.toJson();
    }


    toJson() {
        const formData = new FormData(this._$el);
        const json = {};

        formData.forEach((value, key) => {
            if (!Object.hasOwn(json, key)) {
                json[key] = value;
                return;
            }
            if (Array.isArray(json[key])) {
                json[key].push(value);
                return;
            }
            json[key] = [json[key], value];
        });

        return json;
    }

    clear() {
        this._$el.reset();
        this._$el
            .querySelectorAll('input[type=hidden]')
            .forEach(hidden => hidden.value = this.#initValues[hidden.name]);
        return this;
    }

    getValue(name) {
        const elements = this._$el.querySelectorAll(`[name="${name}"]`);
        console.log(elements);
    }

    setValue(name, value) {
        this._$el.querySelector(`[name="${name}"]`).value = value;
    }

}