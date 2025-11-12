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

    Input(name, label, options) {
        this.#values.push({ name, label, options, type: 'text' });
        return this;
    }

    InputPassword(name, label, options) {
        this.#values.push({ name, label, options, type: 'password' });
        return this;
    }

    InputNumber(name, label, options) {
        this.#values.push({ name, label, options, type: 'number' });
        return this;
    }

    TextView(name, label, options) {
        this.#values.push({ name, label, options, type: 'textView' });
        return this;
    }

    Textarea(name, label, options) {
        this.#values.push({ name, label, options, type: 'textarea' });
        return this;
    }

    Select(name, label, options) {
        this.#values.push({ name, label, options, type: 'select' });
        return this;
    }

}