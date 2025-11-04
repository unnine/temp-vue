import Button from "./button.js";

class Component {

    #id;
    #$el;
    #methods = {};

    constructor(props) {
        console.log(props);
        this.#init(props);
    }

    #init(props) {
        const {
            id,
            methods
        } = props;

        if (!id) {
            throw new Error('id is required.');
        }

        this.#id = id;
        this.#$el = document.querySelector(`[c-id="${id}]"`);

        if (methods) {
            Object.entries(methods).forEach(([methodName, method]) => {
               this.#methods[methodName] = method;
            });
        }
    }

    button(buttonId) {
        return new Button(buttonId);
    }

}


export default Component;