import FormBuilder from './formBuilder.js';

class FormRenderer {

    #generators = {
        text: (item, event) => {
            return this.#createFormItem(item.label, this.#text(item, event));
        },
        password: (item, event) => {
            return this.#createFormItem(item.label, this.#password(item, event));
        },
        number: (item, event) => {
            return this.#createFormItem(item.label, this.#number(item, event));
        },
        checkbox: (item, event) => {
            return this.#createFormItem(item.label, this.#checkbox(item, event));
        },
        checkboxGroup: (item, event) => {
            return this.#createFormItem(item.label, this.#checkboxGroup(item, event));
        },
        radio: (item, event) => {
            return this.#createFormItem(item.label, this.#radio(item, event));
        },
        radioGroup: (item, event) => {
            return this.#createFormItem(item.label, this.#radioGroup(item, event));
        },
        file: (item, event) => {
            return this.#createFormItem(item.label, this.#file(item, event));
        },
        button: (item, event) => {
            return this.#createFormItem(item.label, this.#button(item, event));
        },
        textarea: (item, event) => {
            return this.#createFormItem(item.label, this.#textarea(item, event));
        },
        select: (item, event) => {
            return this.#createFormItem(item.label, this.#select(item, event));
        },
        datepicker: (item, event) => {
            return this.#createFormItem(item.label, this.#datepicker(item, event));
        },
        hidden: (item, event) => {
            return this.#hidden(item, event);
        },
        textView: (item) => {
            return this.#createFormItem(item.label, this.#textView(item));
        },
        label: (item) => {
            return this.#createFormItemSingle(this.#label(item));
        },
        blank: (item) => {
            return this.#createFormItemSingle(this.#blank(item));
        },
    };

    render($target, props) {
        if (!props) {
            props = {};
        }
        if (!props?.forms) {
            props.forms = FormBuilder.builder().build();
        }
        if (!props?.event) {
            props.event = {};
        }
        if (typeof props.event.onInput !== 'function') {
            props.event.onInput = () => {};
        }
        const $nodes = this.#valuesToNodes(props);
        $nodes.forEach($node => $target.append($node));
    }

    #valuesToNodes(props) {
        const { forms, event: eventHandlers } = props ?? {};
        const $nodes = [];
        let $formItem;

        for (let item of forms) {
            this.#initFormItem(item);

            const { type } = item;

            if (!Object.hasOwn(this.#generators, type)) {
                console.warn('unknown type form item', item);
                continue;
            }
            $formItem = this.#generators[type](item, eventHandlers);
            $nodes.push($formItem);
        }
        return $nodes;
    }

    #initFormItem(item) {
        item._$value = '';
    }

    #createFormItem(label, $node) {
        const $formItem = document.createElement('div');
        $formItem.classList.add('form-item');

        const $label = this.#createFormLabel(label);
        const $element= this.#createFormElement($node);
        $formItem.append($label, $element);

        return $formItem;
    }

    #createFormItemSingle($node) {
        const $formItem = document.createElement('div');
        $formItem.classList.add('form-item-single');

        const $element= this.#createFormElement($node);
        $formItem.append($element);

        return $formItem;
    }

    #createFormLabel(label) {
        const $label = document.createElement('div');
        $label.classList.add('form-label');
        $label.textContent = label;
        return $label;
    }

    #createFormElement($node) {
        const $element = document.createElement('div');
        $element.classList.add('form-element');
        $element.append($node);
        return $element;
    }

    #createInput(type, item, event) {
        const { name, props } = item;
        const value = props.value ?? '';
        item._$value = value;

        const $input = document.createElement('input');
        $input.type = type;
        $input.name = name;
        $input.value = value;

        this.#onInputEventHandler(item, $input, event);
        return $input;
    }

    #createEtcInput(type, item, event) {
        const { name, props } = item;
        const value = props.value ?? '';
        item._$value = value;

        const $input = document.createElement(type);
        $input.classList.add(`form-element__${type}`);
        $input.name = name;
        $input.innerHTML = value;

        this.#onInputEventHandler(item, $input, event);
        return $input;
    }

    #onInputEventHandler(item, $node, event) {
        const { onInput } = event ?? {};

        $node.addEventListener('input', e => {
            const value = e.target.value;
            item._$value = value;
            onInput({ item, value, originEvent: e });
        });
    }

    #text(item, event) {
        return this.#createInput('text', item, event);
    }

    #password(item, event) {
        return this.#createInput('password', item, event);
    }

    #number(item, event) {
        return this.#createInput('number', item, event);
    }

    #checkbox(item, event) {
        const { onInput } = event;
        const { label, props } = item;
        const {
            checkedValue = 'true',
            uncheckedValue = 'false',
            label: checkboxLabel,
            value,
        } = props;

        const newEvent = {
            onInput: (e) => {
                const isChecked = e.originEvent.target.checked;
                const value = isChecked ? checkedValue : uncheckedValue;
                item._$value = value;
                onInput({ ...e, value });
            },
        }

        const $label = document.createElement('span');
        $label.append(checkboxLabel ?? '');

        const $node = this.#createInput('checkbox', item, newEvent);
        $node.value = checkedValue;

        if (checkedValue == value) {
            $node.checked = true;
        }

        const $wrap = document.createElement('div');
        $wrap.classList.add('form-element__checkbox-wrap');
        $wrap.append($node, $label);

        return $wrap;
    }

    #checkboxGroup(item, event) {
        const { onInput: onGroupInput } = event;
        const { name: groupName, label: groupLabel, props } = item;
        const {
            value,
            groups = [],
            gap,
            rowGap,
            columnGap,
            countPerRow
        } = props;

        const initItemValue = () => {
            item._$value = []

            if (Array.isArray(value)) {
                item._$value.push(...value);
            }
        }

        const onInputCheckbox = (checkedValue, uncheckedValue, e) => {
            const isChecked = e.originEvent.target.checked;
            const index = item._$value.findIndex((v) => v == checkedValue);

            if (isChecked && index === -1) {
                item._$value.push(checkedValue);
            }
            if (!isChecked && index !== -1) {
                item._$value.splice(index, 1);
            }
            onGroupInput({ ...e, value: item._$value });
        }

        const createCheckboxGroup = () => {
            const $group = document.createElement('div');
            $group.classList.add('form-element__checkbox-group');
            $group.style.gridTemplateColumns = `repeat(${countPerRow ?? 1}, 1fr)`;
            $group.style.rowGap = `${gap ?? rowGap ?? 2}px`;
            $group.style.columnGap = `${gap ?? columnGap ?? 4}px`;
            return $group;
        }

        const createCheckboxes = () => {
            return groups.reduce(($nodes, group) => {
                const { checkedValue, uncheckedValue, label: checkboxLabel } = group;
                const alreadyChecked = item._$value.includes(checkedValue);
                const checkboxItem = {
                    name: groupName,
                    label: groupLabel,
                    props: {
                        checkedValue,
                        uncheckedValue,
                        label: checkboxLabel,
                        value: alreadyChecked ? checkedValue : uncheckedValue,
                    },
                };

                const $checkbox = this.#checkbox(checkboxItem, {
                    onInput: (e) => onInputCheckbox(checkedValue, uncheckedValue, e),
                });

                $nodes.push($checkbox);
                return $nodes;
            }, []);
        }

        initItemValue();
        const $group = createCheckboxGroup();
        const $checkboxes = createCheckboxes();
        $checkboxes.forEach($checkbox => $group.append($checkbox));
        return $group;
    }

    #radio(item, event) {
        const { props } = item;
        const {
            checkedValue = 'true',
            label,
            value,
        } = props;

        const createWrap = () => {
            const $wrap = document.createElement('div');
            $wrap.classList.add('form-element__radio-wrap');
            return $wrap;
        }

        const createLabel = () => {
            const $label = document.createElement('span');
            $label.append(label ?? '');
            return $label;
        }

        const createRadio = () => {
            const $node = this.#createInput('radio', item, event);
            $node.value = checkedValue;

            if (checkedValue == value) {
                $node.checked = true;
            }
            return $node;
        }

        const $wrap = createWrap();
        const $label = createLabel();
        const $node = createRadio();
        $wrap.append($node, $label);
        return $wrap;
    }

    #radioGroup(item, event) {
        const { onInput: onGroupInput } = event;
        const { name: groupName, label: groupLabel, props } = item;
        const {
            value,
            groups = [],
            gap,
            rowGap,
            columnGap,
            countPerRow
        } = props;

        const initItemValue = () => {
            item._$value = value ?? '';
        }

        const onInputCheckbox = (checkedValue, e) => {
            const isChecked = e.originEvent.target.checked;

            if (isChecked) {
                item._$value = checkedValue;
            }
            onGroupInput({ ...e, value: item._$value });
        }

        const createRadioGroup = () => {
            const $group = document.createElement('div');
            $group.classList.add('form-element__radio-group');
            $group.style.gridTemplateColumns = `repeat(${countPerRow ?? 1}, 1fr)`;
            $group.style.rowGap = `${gap ?? rowGap ?? 2}px`;
            $group.style.columnGap = `${gap ?? columnGap ?? 4}px`;
            return $group;
        }

        const createRadios = () => {
            return groups.reduce(($nodes, group) => {
                const { checkedValue, label: radioLabel } = group;
                const alreadyChecked = item._$value == checkedValue;
                const checkboxItem = {
                    name: groupName,
                    label: groupLabel,
                    props: {
                        checkedValue,
                        label: radioLabel,
                        value: alreadyChecked ? checkedValue : '',
                    },
                };

                const $radio = this.#radio(checkboxItem, {
                    onInput: (e) => onInputCheckbox(checkedValue, e),
                });

                $nodes.push($radio);
                return $nodes;
            }, []);
        }

        initItemValue();
        const $group = createRadioGroup();
        const $radios = createRadios();
        $radios.forEach($radio => $group.append($radio));
        return $group;
    }

    #file(item, event) {
        return this.#createInput('file', item, event);
    }

    #button(item, event) {
        const { name, label, props } = item;

        if (!label) {
            item.label = name;
        }
        if (!props.value) {
            props.value = label;
        }
        return this.#createInput('button', item, event);
    }

    #textarea(item, event) {
        const $node = this.#createEtcInput('textarea', item, event);
        $node.rows = 1;
        return $node;
    }

    #select(item, event) {
        return this.#createEtcInput('select', item, event);
    }

    #datepicker(item, event) {
        const $node = this.#createInput('date', item, event);
        return $node;
    }

    #hidden(item, event) {
        const { name } = item;
        const $node = this.#createInput('hidden', item, event);
        $node.classList.add('hide');
        $node.name = name;
        return $node;
    }

    #textView(item) {
        const { name, props } = item;
        const $node = document.createElement('div');
        $node.classList.add('form-element__text-view');
        $node.name = name;
        $node.innerHTML = props.value ?? '234';
        return $node;
    }

    #label(item) {
        const { name, label } = item;
        const $node = document.createElement('div');
        $node.classList.add('form-element__label');
        $node.name = name;
        $node.innerHTML = label;
        return $node;
    }

    #blank() {
        const $node = document.createElement('div');
        $node.classList.add('form-element__blank');
        return $node;
    }

}

export default new FormRenderer();