export default new class ComponentsConnector {

    #instances = new Map();


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

    connectAll() {
        this.#connectChildrenToParent();
        this.#bindingParentAndChildrenComponents();
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