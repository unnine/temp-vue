import Component from "./component.js";
import Connector from "./componentConnector.js";

export const newComponent = (props) => {
    return new Component(props);
}

export const registerComponent = (props) => {
    const component = new Component(props);
    Connector.connect(component.$self._$el);
}

export const ComponentConnector = Connector;

window.addEventListener('load', () => {
    Connector.connectAll();
}, { once: true });