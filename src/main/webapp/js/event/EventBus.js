const event = {
    handlers: new WeakMap(),
};

const EventBus = {
    on(name, listener) {
        if (typeof listener === 'function') {
            event.handlers.set(name, listener);
        }
    },
    emit(name, args) {
        if (event.handlers.has(name)) {
            const handler = event.handlers.get(name);
            handler(args);
        }
    },
    release(name) {
        if (event.handlers.has(name)) {
            event.handlers.delete(name);
        }
    },
};


export default EventBus;