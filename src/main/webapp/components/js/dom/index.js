import Component from "./component.js";
import FormBuilder from "./formBuilder.js";


const dom = {
    newComponent(props) {
        return new Component(props);
    },
};


export {
    dom,
    FormBuilder,
}