import FormBuilder from './formBuilder.js';
import ButtonRenderer from './buttonRenderer.js';
import FormUtil from './formUtil.js';
import { XSSUtil } from "../util/index.js";

export default new class FormRenderer {

    #inputEventHandlers = new Map();


    #generators = {
        text: (item, event) => {
            return this.#createFormItem(item, this.#text(item, event));
        },
        password: (item, event) => {
            return this.#createFormItem(item, this.#password(item, event));
        },
        number: (item, event) => {
            return this.#createFormItem(item, this.#number(item, event));
        },
        checkbox: (item, event) => {
            return this.#createFormItem(item, this.#checkbox(item, event));
        },
        checkboxGroup: (item, event) => {
            return this.#createFormItem(item, this.#checkboxGroup(item, event));
        },
        radio: (item, event) => {
            return this.#createFormItem(item, this.#radio(item, event));
        },
        radioGroup: (item, event) => {
            return this.#createFormItem(item, this.#radioGroup(item, event));
        },
        file: (item, event) => {
            return this.#createFormItem(item, this.#file(item, event));
        },
        button: (item, event) => {
            return this.#createFormItem(item, this.#button(item, event));
        },
        textarea: (item, event) => {
            return this.#createFormItem(item, this.#textarea(item, event));
        },
        select: (item, event) => {
            return this.#createFormItem(item, this.#select(item, event));
        },
        datepicker: (item, event) => {
            return this.#createFormItem(item, this.#datepicker(item, event));
        },
        datepickerRange: (item, event) => {
            return this.#createFormItem(item, this.#datepickerRange(item, event));
        },
        datepickerToggle: (item, event) => {
            return this.#createFormItem(item, this.#datepickerToggle(item, event));
        },
        datepickerRangeToggle: (item, event) => {
            return this.#createFormItem(item, this.#datepickerRangeToggle(item, event));
        },
        multiple: (item, event) => {
            return this.#createFormItem(item, this.#multiple(item, event));
        },
        textView: (item) => {
            return this.#createFormItem(item, this.#textView(item));
        },
        hidden: (item, event) => {
            return this.#hidden(item, event);
        },
        label: (item) => {
            return this.#createFormItemSingle(item, this.#label(item));
        },
        blank: (item) => {
            return this.#createFormItemSingle(item, this.#blank(item));
        },
    };

    #clear($el) {
        this.#inputEventHandlers.forEach(($node, handler) => {
            $node.removeEventListener('input', handler);
        });
        this.#inputEventHandlers.clear();
        $el.replaceChildren();
    }

    render($target, props) {
        this.#clear($target);

        if (!props) {
            props = {};
        }
        if (!props?.forms) {
            props.forms = FormBuilder.builder().build();
        }
        if (!props?.event) {
            props.event = {};
        }
        if (typeof props?.event?.onInput !== 'function') {
            props.event.onInput = () => {};
        }

        const nodes = this.#valuesToNodes(props.forms, props.event);

        this.#addFormValidator(props.forms, nodes);
        this.#addFormDataProperty(props.forms);

        nodes.forEach(({ $node, onRendered }) => {
            $target.append($node);

            if (onRendered) {
                onRendered();
            }
        });
    }

    #addFormValidator(forms, nodes) {
        forms.validate = () => {
            const isValid = this.#validateFormValues(nodes);

            if (!isValid) {
                return;
            }

            return Promise.resolve(forms.data);
        };
    }

    #addFormDataProperty(forms) {
        if (Object.hasOwn(forms, 'data')) {
            console.error(`already rendered forms.`, forms);
        }

        Object.defineProperty(forms, 'data', {
            get() {
                return FormUtil.getData(forms);
            },
        });
    }

    #valuesToNodes(forms, eventHandlers) {
        const nodes = [];

        for (let item of forms) {
            this.#initFormItem(item);

            const { type } = item;

            if (!Object.hasOwn(this.#generators, type)) {
                console.warn('unknown type form item', item);
                continue;
            }
            const formItem = this.#generators[type](item, eventHandlers);
            nodes.push(formItem);
        }
        return nodes;
    }

    #initFormItem(item) {
        if (Object.hasOwn(item, '_$value')) {
            return;
        }
        item._$value = '';
    }

    #validateFormValues(nodes) {
        const invalidNodes = this.#findNodesWithInvalidValues(nodes);
        return invalidNodes.length > 0;
    }

    #findNodesWithInvalidValues(nodes) {
        return nodes.reduce((invalidNodes, node) => {
            const { $node, item }  = node;
            const { props } = item;

            if (item?.type === 'multiple' && node.children) {
                const childrenInvalidNodes = this.#findNodesWithInvalidValues(node.children);
                return invalidNodes.concat(childrenInvalidNodes);
            }

            if (!props?.required) {
                return invalidNodes;
            }

            const $message = $node.querySelector('.form-item-message');
            const validator = props?.validator ?? this.#defaultFormValueValidator;
            const validateResult = validator(item._$value);

            if (validateResult === false || typeof validateResult === 'string') {
                $node.classList.add('invalid');
                $message.innerText = typeof validateResult === 'string' ? validateResult : '필수 입력입니다.';
                $message.classList.remove('hide');
                invalidNodes.push(node);
                return invalidNodes;
            }

            $node.classList.remove('invalid');
            $message.innerText = '';
            return invalidNodes;
        }, []);
    }

    #defaultFormValueValidator(value) {
        if (value == null) {
            return false;
        }
        if (value === '') {
            return false;
        }
        return true;
    }

    #createFormItem(item, { $node, onRendered, children }) {
        const { label } = item;

        const $label = this.#createFormLabel(label);
        const $element= this.#createFormElement($node);

        const $formItemMessage = document.createElement('div');
        $formItemMessage.classList.add('form-item-message', 'hide');

        const $formItemContent = document.createElement('div');
        $formItemContent.classList.add('form-item-content');
        $formItemContent.append($element, $formItemMessage);

        const $formItem = document.createElement('div');
        $formItem.classList.add('form-item');
        $formItem.append($label, $formItemContent);

        this.#applyFormItemAttributes($formItem, item);

        return {
            $node: $formItem,
            item,
            onRendered,
            children,
        };
    }

    #createFormItemSingle(item, { $node, onRendered, children }) {
        const $formItem = document.createElement('div');
        $formItem.classList.add('form-item-single');

        const $element= this.#createFormElement($node);
        $formItem.append($element);

        this.#applyFormItemAttributes($formItem, item);

        return {
            $node: $formItem,
            item,
            onRendered,
            children,
        };
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
        const { name, props } = item ?? {};
        const value = props?.value ?? '';
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
        const value = props?.value ?? '';
        item._$value = value;

        const $input = document.createElement(type);
        $input.classList.add(`form-element__${type}`);
        $input.name = name;
        $input.innerHTML = XSSUtil.escape(value);

        this.#onInputEventHandler(item, $input, event);
        return $input;
    }

    #onInputEventHandler(item, $node, event) {
        const { onInput } = event ?? {};

        const eventHandlers = e => {
            const value = e.target.value;
            item._$value = value;
            onInput({
                name: item.name,
                item,
                value,
                target: e.target,
                originEvent: e,
            });
        }

        this.#inputEventHandlers.set(eventHandlers, $node);
        $node.addEventListener('input', eventHandlers);
    }

    #applyFormItemAttributes($node, item) {
        const { props } = item;

        if (props?.rowSpan) {
            $node.style.gridRow = `span ${props?.rowSpan}`;
        }

        if (props?.colSpan) {
            $node.style.gridColumn = `span ${props?.colSpan}`;
        }
    }

    #applyInputAttributes($node, item) {
        const { props } = item;

        if (props?.disabled) {
            $node.disabled = true;
            $node.classList.add('disabled');
        }
        else if (props?.readonly) {
            $node.readOnly = true;
            $node.classList.add('readonly');
        }
    }

    #applyDatepickerAttributes(datepicker, item) {
        const { props } = item;

        if (props?.disabled) {
            datepicker.disable();
        }
        else if (props?.readonly) {
            datepicker.readonly();
        }
    }

    #text(item, event) {
        const $node = this.#createInput('text', item, event);
        this.#applyInputAttributes($node, item)
        return {
            $node,
        };
    }

    #password(item, event) {
        const $node = this.#createInput('password', item, event);
        this.#applyInputAttributes($node, item);
        return {
            $node,
        };
    }

    #number(item, event) {
        const $node = this.#createInput('number', item, event);
        this.#applyInputAttributes($node, item);
        return {
            $node,
        };
    }

    #checkbox(item, event) {
        const { onInput } = event;
        const { props } = item ?? {};
        const {
            checkedValue = 'true',
            uncheckedValue = 'false',
            label: checkboxLabel,
            value,
        } = props ?? {};

        const newEvent = {
            onInput: (e) => {
                const isChecked = e.target.checked;
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

        this.#applyInputAttributes($node, item);

        const $wrap = document.createElement('div');
        $wrap.classList.add('form-element__checkbox-wrap');
        $wrap.append($node, $label);

        return {
            $node: $wrap,
        };
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
            const isChecked = e.target.checked;
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
                        readonly: props?.readonly,
                        disabled: props?.disabled,
                    },
                };

                const checkbox = this.#checkbox(checkboxItem, {
                    onInput: (e) => onInputCheckbox(checkedValue, uncheckedValue, e),
                });

                $nodes.push(checkbox.$node);
                return $nodes;
            }, []);
        }

        initItemValue();
        const $group = createCheckboxGroup();
        const $checkboxes = createCheckboxes();
        $checkboxes.forEach($checkbox => $group.append($checkbox));

        return {
            $node: $group,
        };
    }

    #radio(item, event) {
        const { props } = item;
        const { checkedValue = 'true', label, value } = props;

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
        this.#applyInputAttributes($node, item);

        return {
            $node: $wrap,
        };
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

        const onInputRadio = (checkedValue, e) => {
            const isChecked = e.target.checked;

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
                        readonly: props?.readonly,
                        disabled: props?.disabled,
                    },
                };

                const radio = this.#radio(checkboxItem, {
                    onInput: (e) => onInputRadio(checkedValue, e),
                });

                $nodes.push(radio.$node);
                return $nodes;
            }, []);
        }

        item._$value = value ?? '';
        const $group = createRadioGroup();
        const $radios = createRadios();
        $radios.forEach($radio => $group.append($radio));

        return {
            $node: $group,
        };
    }

    #file(item, event) {
        return {
            $node: this.#createInput('file', item, event),
        };
    }

    #button(item, event) {
        const { name, label, props } = item;
        const { onClickButton } = event;

        const _label = label ?? name;

        const [ node ] = ButtonRenderer.createComponents([{
            ...props,
            name,
            label: _label,
            onClick: onClickButton,
        }]);

        const { $component: $node, onRendered } = node;

        item.label = _label;

        if (!props?.value) {
            props.value = _label;
        }

        return {
            $node,
            onRendered,
        };
    }

    #textarea(item, event) {
        const $node = this.#createEtcInput('textarea', item, event);
        $node.rows = 1;
        this.#applyInputAttributes($node, item);
        return {
            $node,
        };
    }

    #select(item, event) {
        const { props } = item;

        const $node = this.#createEtcInput('select', item, event);

        const addOptions = (options) => {
            const $options = options.map(option => {
               const $option = document.createElement('option');
               $option.value = option?.value ?? '';
               $option.innerText = option?.label ?? '';

               if (option?.value == props?.value) {
                   $option.selected = true;
               }
               return $option;
            });

            $node.append(...$options);
        }

        const addOptionsByFunction = (options) => {
            const result = options();

            if (result instanceof Promise) {
                result.then(data => addOptions(data));
                return;
            }
            addOptions(result);
        }

        if (props?.options) {
            const { options } = props;

            if (Array.isArray(options)) {
                addOptions(options);
            }
            if (typeof options === 'function') {
                addOptionsByFunction(options);
            }
        }

        this.#applyInputAttributes($node, item);
        return {
            $node,
        };
    }

    #hidden(item, event) {
        const { name } = item;
        const $node = this.#createInput('hidden', item, event);
        $node.classList.add('hide');
        $node.name = name;

        return {
            $node,
            item,
        };
    }

    #datepicker(item, event) {
        const { name, props } = item;
        const { onInput } = event ?? {};
        const $node = document.createElement('div');
        $node.classList.add('form-element__datepicker');
        $node.name = name;

        const onRendered = () => {
            const datepicker = Datepicker.single($node);

            datepicker.onInput((e) => {
                item._$value = e.value;
                onInput({
                    ...e,
                    name,
                    item,
                });
            });

            if (props?.value) {
                datepicker.setValue(props.value);
            }

            this.#applyDatepickerAttributes(datepicker, props);

            return datepicker;
        }

        return {
            $node,
            onRendered,
        };
    }

    #datepickerToggle(item, event) {
        const datepicker = this.#datepicker(item, event);
        return this.#toTogglable(datepicker, item.props);
    }

    #datepickerRange(item, event) {
        const { name, props } = item;
        const { onInput } = event ?? {};
        const $node = document.createElement('div');
        $node.classList.add('form-element__datepicker-range');
        $node.name = name;

        const renderDatepicker = () => {
            const datepicker = Datepicker.range($node);

            datepicker.onInput((e) => {
                item._$value = e.value;
                onInput({
                    ...e,
                    name,
                    item,
                });
            });

            if (props?.value) {
                datepicker.setValue(props.value);
            }

            this.#applyDatepickerAttributes(datepicker, props);

            return datepicker;
        }

        return {
            $node,
            onRendered: renderDatepicker,
        };
    }

    #datepickerRangeToggle(item, event) {
        const datepickerRange = this.#datepickerRange(item, event);
        return this.#toTogglable(datepickerRange, item.props);
    }

    #toTogglable({ $node, onRendered }, props) {
        const initialChecked = props?.checked ?? false;

        let datepicker = null;

        const onRenderedDatepicker = () => {
            datepicker = onRendered();

            if (!initialChecked) {
                datepicker.disable();
            }
        }

        const checkbox = this.#checkbox({
            props: {
                checkedValue: true,
                uncheckedValue: false,
                value: initialChecked,
            }
        }, {
            onInput: e => {
                if (!datepicker) {
                    return;
                }
                if (datepicker.isDeactivated()) {
                    return;
                }
                if (e.target.checked) {
                    datepicker.enable();
                    return;
                }
                datepicker.disable();
            },
        });

        $node.insertAdjacentElement('afterbegin', checkbox.$node);

        return {
            $node,
            onRendered: onRenderedDatepicker,
        };
    }

    #multiple(item, event) {
        const { props } = item;
        const {
            gap,
            rowGap,
            columnGap,
            countPerRow,
            children,
        } = props;

        const nodes = this.#valuesToNodes(children, event);

        const $wrap = document.createElement('div');
        $wrap.classList.add('form-element__multiple-wrap');
        $wrap.style.gridTemplateColumns = `repeat(${countPerRow ?? 1}, 1fr)`;
        $wrap.style.rowGap = `${gap ?? rowGap ?? 0}px`;
        $wrap.style.columnGap = `${gap ?? columnGap ?? 0}px`;

        nodes.forEach(({ $node }) => {

            if (props?.showLabel) {
                const childLabel = $node.querySelector('.form-label');
                childLabel.style.display = 'var(--label-display)';
            }
            $wrap.append($node);
        });
        return {
            $node: $wrap,
            children: nodes,
        };
    }

    #textView(item) {
        const { name, props } = item;
        const $node = document.createElement('div');
        $node.classList.add('form-element__text-view');
        $node.name = name;
        $node.innerHTML = XSSUtil.escape(props?.value ?? '');

        return {
            $node,
        };
    }

    #label(item) {
        const { name, label } = item;
        const $node = document.createElement('div');
        $node.classList.add('form-element__label');
        $node.name = name;
        $node.innerHTML = XSSUtil.escape(label);

        return {
            $node,
        };
    }

    #blank() {
        const $node = document.createElement('div');
        $node.classList.add('form-element__blank');

        return {
            $node,
        };
    }

}