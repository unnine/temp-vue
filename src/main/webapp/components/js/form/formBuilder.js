const constructorKey = Symbol('formBuilderConstructor');

export default class FormBuilder {

    #values = [];


    constructor(key) {
        if (key !== constructorKey) {
            throw new Error(`use FormBuilder.builder() to instantiate.`);
        }
    }


    static builder() {
        return new FormBuilder(constructorKey);
    }

    build() {
        const values = this.#values;
        this.#values = [];
        return [...values];
    }

    #addItem(item) {
        if (!item?.props) {
            item.props = {};
        }
        this.#values.push(item);
        return this;
    }

    #lastItem() {
        if (this.#values.length === 0) {
            throw new SyntaxError(`form items array is empty. not found last item.`);
        }
        return this.#values[this.#values.length - 1];
    }

    Input(name, label, props) {
        return this.#addItem({
            type: 'text',
            name,
            label,
            props,
        });
    }

    InputPassword(name, label, props) {
        return this.#addItem({
            type: 'password',
            name,
            label,
            props,
        });
    }

    InputNumber(name, label, props) {
        return this.#addItem({
            type: 'number',
            name,
            label,
            props,
        });
    }

    InputFile(name, label, props) {
        return this.#addItem({
            type: 'file',
            name,
            label,
            props,
        });
    }

    TextView(name, label, props) {
        return this.#addItem({
            type: 'textView',
            name,
            label,
            props,
        });
    }

    Textarea(name, label, props) {
        return this.#addItem({
            type: 'textarea',
            name,
            label,
            props,
        });
    }

    Select(name, label, props) {
        return this.#addItem({
            type: 'select',
            name,
            label,
            props,
        });
    }

    Label(name, label) {
        if (label == null) {
            label = name;
        }
        return this.#addItem({
            type: 'label',
            name,
            label,
        });
    }

    Hidden(name) {
        return this.#addItem({
            type: 'hidden',
            name,
        });
    }

    Button(name, label, props) {
        return this.#addItem({
            type:'button',
            name,
            label,
            props,
        });
    }

    Blank() {
        return this.#addItem({
            type: 'blank',
        });
    }

    Radio(name, label, props) {
        return this.#addItem({
            type: 'radio',
            name,
            label,
            props,
        });
    }

    RadioGroup(name, label, props) {
        return this.#addItem({
            type: 'radioGroup',
            name,
            label,
            props,
        });
    }

    Datepicker(name, label, props) {
        return this.#addItem({
            type: 'datepicker',
            name,
            label,
            props,
        });
    }

    DatepickerTwin(name, label, props) {
        return this.#addItem({
            type: 'twinDatepicker',
            name,
            label,
            props: {
                ...props,
                twin: true,
            },
        });
    }

    DatepickerWithSwitch(name, label, props) {
        return this.#addItem({
            type: 'switchDatepicker',
            name,
            label,
            props: {
                ...props,
                disabled: true,
            },
        });
    }

    DatepickerTwinWithSwitch(name, label, props) {
        return this.#addItem({
            type: 'datepickerTwinWithSwitch',
            name,
            label,
            props: {
                ...props,
                twin: true,
                disabled: true,
            },
        });
    }

    Checkbox(name, label, props) {
        return this.#addItem({
            type: 'checkbox',
            name,
            label,
            props,
        });
    }

    CheckboxGroup(name, label, props) {
        return this.#addItem({
            type: 'checkboxGroup',
            name,
            label,
            props,
        });
    }

    readonly() {
        this.#lastItem().props.readonly = true;
    }

    disabled() {
        this.#lastItem().props.disabled = false;
    }

    required() {
        this.#lastItem().props._required = true;
    }

    colSpan(span) {
        this.#lastItem().props._colSpan = span;
        return this;
    }

    rowSpan(span) {
        this.#lastItem().props._rowSpan = span;
        return this;
    }

    multiple(name, label, formValues) {
        if (!Array.isArray(formValues)) {
            throw new TypeError(`[FormBuilder] multiple's third arguments must be array.`);
        }
        this.#addItem({
            type: 'multiple',
            name,
            label,
            props: {
                items: formValues,
            },
        });
        return this;
    }

    // suffix(string) {
    //     this._lastItem().suffix = string;
    //     return this;
    // },
}