import { registerNonBindingComponent, ComponentConnector } from '../component/index.js';
import { StringUtil } from '../util/index.js';

const preventDefaultEventHandler = (e) => {
    e.preventDefault();
};

export default new class ButtonRenderer {

    render(container, buttons) {
        const $buttons = this.createComponents(buttons);
        const $components = $buttons.map(({ $component }) => $component);
        container.append(...$components);
        $buttons.forEach(({ onRendered }) => onRendered());
    }

    createComponents(buttons) {
        return buttons.map(button => {
            return this.#createDOM({
                name: button.name,
                label: button.label ?? button.name,
                type: button.type ?? 'primary',
                disabled: button.disabled ?? false,
                onClick: typeof button.onClick === 'function' ? button.onClick : () => {},
           });
        });
    }

    destroy(container) {
        ComponentConnector.releaseAllByContainer(container);
        container.replaceChildren();
    }

    #generateId() {
        return StringUtil.random();
    }

    #createDOM(button) {
        const { label, type } = button;

        const id = this.#generateId();

        const $button = document.createElement('button');
        $button.innerText = label;
        $button.addEventListener('click', preventDefaultEventHandler);

        const $wrap = document.createElement('div');
        $wrap.classList.add('button-component__button', type);
        $wrap.setAttribute('e-id', 'button');
        $wrap.append($button);

        const $component = document.createElement('div');
        $component.setAttribute('component-id', id);
        $component.classList.add('button-component');
        $component.append($wrap);
        return {
            $component,
            onRendered: () => this.#registerButtonInstance(id, button),
        };
    }

    #registerButtonInstance(id, button) {
        registerNonBindingComponent({
            id,
            data() {
                return {
                    ...button,
                };
            },
            mounted() {
                this.init();
            },
            destroy() {
                const button = this.$find('button');
                button._$el.removeEventListener('click', preventDefaultEventHandler);
                button.clear();
            },
            methods :{
                init() {
                    this.applyAttributes();
                    this.bindEventHandlers();
                },
                applyAttributes() {
                    if (this.disabled) {
                        this.disable();
                    }
                },
                bindEventHandlers() {
                    this.$find('button').on('click', e => {
                        this.onClick({
                            originEvent: e,
                            name: this.name,
                            label: this.label,
                        });
                    });
                },
                disable() {
                    const button = this.$find('button');

                    button.setAttribute('disabled', true);
                    button.addClass('disabled');
                },
                enable() {
                    const button = this.$find('button');

                    button.removeAttribute('disabled');
                    button.removeClass('disabled');
                },
                show() {
                    this.$self.show();
                },
                hide() {
                    this.$self.hide();
                },
            },
        });
    }

}