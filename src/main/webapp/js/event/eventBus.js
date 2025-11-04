const event = {
    handlers: {},
};

const eventBus = {
    emit(name, args) {
        if (event.handlers[name] && event.handlers[name].length > 0) {
            event.handlers[name].forEach(handler => handler(args));
        }
    },
    on(name, listener) {
        if (typeof listener !== 'function') {
            return;
        }

        if (!event.handlers[name]) {
            event.handlers[name] = [];
        }

        event.handlers[name].push(listener);
    },
    off(name) {
        if (event.handlers[name]) {
            event.handlers[name] = [];
        }
    },
};


export {
    eventBus
};