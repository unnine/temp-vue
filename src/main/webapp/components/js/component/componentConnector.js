export default new class ComponentConnector {

    #store = new Map();


    #destroy($component) {
        if (!this.#store.has($component)) {
            return;
        }
        const component = this.#store.get($component);
        component.instance._destroy();

        this.#store.delete($component);
    }

    #connectToParent(instance) {
        const $parentComponent = instance._getParentComponentElement();

        if (!$parentComponent) {
            return;
        }

        const parentComponent = this.#store.get($parentComponent);
        parentComponent.instance._addChildInstance(instance);
    }

    connect($component) {
        if (!this.#store.has($component)) {
            return;
        }
        const component = this.#store.get($component);

        if (component.mounted) {
            return;
        }
        this.#connectToParent(component.instance);
        component.instance._bindingData();
        component.instance._mount();
        component.mounted = true;
    }

    connectAll() {
        this.#store.values().forEach(({ instance }) => this.#connectToParent(instance));
        this.#store.values().forEach(({ instance }) => instance._bindingData());
        this.#store.values().forEach(component => {
            if (component.mounted) {
                return;
            }
            component.instance._mount();
            component.mounted = true;
        });
    }

    add($component, instance) {
        this.#store.set($component, {
            instance,
            mounted: false,
        });
    }

    release($component) {
        if (!this.#store.has($component)) {
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