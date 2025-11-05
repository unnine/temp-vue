class EventBus {

    #handlerStore = new WeakMap();


    addEventHandler($component, handlerName, handler) {
        if (!this.#handlerStore.has($component)) {
            this.#handlerStore.set($component, {});
        }
        const handlers = this.#handlerStore.get($component);
        handlers[handlerName] = handler;
    }

    emit($component, handlerName, args) {
        if (!this.#handlerStore.has($component)) {
            console.warn(`event handler '${handlerName}' not found on component.`, $component);
            return;
        }
        const handlers = this.#handlerStore.get($component);
        const handler = handlers[handlerName];

        if (!handler) {
            console.warn(`unknown event handler '${handlerName}'`);
            return;
        }
        handler(args);
    }

}

const eventBus = new EventBus();

export {
    eventBus
};