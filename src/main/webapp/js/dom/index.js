import Component from "./component.js";


const dom = {
    newComponent(props) {
        return new Component(props);
    },
};


export {
    dom
}