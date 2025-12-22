import Component from "./component.js";
import Connector from "./componentConnector.js";

export const newComponent = (props) => {
    return new Component(props);
}

export const ComponentConnector = Connector;