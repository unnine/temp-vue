export default class ComponentsConnector {

    #instances = new Map();


    add($component, instance) {
        this.#instances.set($component, instance);
    }

    connect() {
        this.#connectChildrenToParent();
        this.#bindingParentAndChildrenComponents();
        this.#mount();
    }

    #connectChildrenToParent() {
        this.#instances.values().forEach(instance => {
            const $parentComponent = instance._getParentComponentElement();

            if (!$parentComponent) {
                return;
            }

            const parentComponentInstance = this.#instances.get($parentComponent);
            parentComponentInstance._addChildInstance(instance);
        });
    }

    #bindingParentAndChildrenComponents() {
        this.#instances.values().forEach(instance => instance._bindingComponents());
    }

    #mount() {
        this.#instances.values().forEach(instance => instance._mount());
    }

    clear() {
        this.#instances.clear();
    }
}