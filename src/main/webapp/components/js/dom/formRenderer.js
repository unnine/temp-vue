class FormRenderer {

    render($target, options) {
        const $nodes = this.#valuesToNodes(options);
        $nodes.forEach($node => $target.append($node));
    }

    #valuesToNodes(options) {
        const { forms, event } = options ?? {};
        const $nodes = [];
        let $formItem;

        for (let item of forms) {
            $formItem = null;

            const { type } = item;

            if (type === 'text') {
                $formItem = this.#input(item, event);
            }
            if (type === 'password') {
                $formItem = this.#inputPassword(item, event);
            }
            if (type === 'number') {
                $formItem = this.#inputNumber(item, event);
            }
            if (type === 'textView') {
                $formItem = this.#textView(item);
            }
            if (type === 'textarea') {
                $formItem = this.#textarea(item, event);
            }
            if (type === 'select') {
                $formItem = this.#select(item, event);
            }

            if (!$formItem) {
                console.warn('unknown type form item', item);
                continue;
            }

            $nodes.push($formItem);
        }
        return $nodes;
    }

    #input(item, event) {
        const $node = this.#createInput('text', item, event);
        return this.#createFormItem(item?.label, $node);
    }

    #inputPassword(item, event) {
        const $node = this.#createInput('password', item, event);
        return this.#createFormItem(item?.label, $node);
    }

    #inputNumber(item, event) {
        const $node = this.#createInput('number', item, event);
        return this.#createFormItem(item?.label, $node);
    }

    #textView(item) {
        const { name, label, options } = item ?? {};
        return this;
    }

    #textarea(item, event) {
        const { name, label, options } = item ?? {};
        const $node = document.createElement('textarea');
        $node.classList.add(`form-element__textarea`);
        $node.setAttribute('name', name);
        $node.setAttribute('rows', 1);
        this.#onInputEventHandler(item, $node, event);

        const { value } = options ?? {};

        if (value) {
            $node.innerHTML = value;
        }
        return this.#createFormItem(label, $node);
    }

    #select(item, event) {
        const { name, label } = item ?? {};
        const $node = document.createElement('select');
        $node.classList.add(`form-element__select`);
        $node.setAttribute('name', name);
        this.#onInputEventHandler(item, $node, event);
        return this.#createFormItem(label, $node);
    }

    #createFormItem(label, $element) {
        const $formItem = document.createElement('div');
        $formItem.classList.add(`form-item`);

        const $label = this.#createFormLabel(label);
        $formItem.append($label, $element);

        return $formItem;
    }

    #createFormLabel(label) {
        const $label = document.createElement('div');
        $label.classList.add('form-item__label');
        $label.textContent = label;
        return $label;
    }

    #createInput(type, item, event) {
        const { name, options } = item ?? {};
        const $input = document.createElement('input');
        $input.setAttribute('type', type);
        $input.setAttribute('name', name);
        this.#onInputEventHandler(item, $input, event);

        const { value } = options ?? {};

        if (value) {
            $input.setAttribute('value', value);
        }

        const $wrapper = document.createElement('div');
        $wrapper.classList.add(`form-element__input-${type}`);
        $wrapper.append($input);
        return $wrapper;
    }

    #onInputEventHandler(item, $node, event) {
        const { onInput } = event ?? {};
        $node.addEventListener('input', e => onInput({ item, originEvent: e }));
    }

}

export default new FormRenderer();