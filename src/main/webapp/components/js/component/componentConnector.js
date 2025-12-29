export default new class ComponentsConnector {

    #instances = new Map();


    #connectChildrenToParent() {
        this.#instances.values().forEach(instance => this.#connectToParent(instance));
    }

    #connectToParent(instance) {
        const $parentComponent = instance._getParentComponentElement();

        if (!$parentComponent) {
            return;
        }

        const parentComponentInstance = this.#instances.get($parentComponent);
        parentComponentInstance._addChildInstance(instance);
    }

    #bindingChildrenByParent() {
        this.#instances.values().forEach(instance => instance._bindingComponents());
    }

    #mount() {
        this.#instances.values().forEach(instance => instance._mount());
    }

    #destroy($component) {
        if (!this.#instances.has($component)) {
            return;
        }
        const instance = this.#instances.get($component);
        instance._destroy();

        this.#instances.delete($component);
        $component.replaceChildren();
        $component.remove();
    }

    add($component, instance) {
        this.#instances.set($component, instance);
    }

    connectWithNonBindingState($component) {
        if (!this.#instances.has($component)) {
            return;
        }
        const instance = this.#instances.get($component);
        instance._initBoundedStoreData();
        instance._mount();
    }

    connectAll() {
        this.#connectChildrenToParent();
        this.#bindingChildrenByParent();
        this.#mount();
    }

    release($component) {
        if (!this.#instances.has($component)) {
            return;
        }
        this.releaseAllByContainer($component);
        this.#destroy($component);
    }

    releaseAllByContainer($el) {
        const $children = $el.querySelectorAll('[component-id]');
        $children.forEach($childComponent => this.#destroy($childComponent));
    }
}