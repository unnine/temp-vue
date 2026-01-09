import { ObjectUtil } from '../util/index.js';

class ColumnBuilder {

    #columns = [];


    #make(dataField, ...args) {
        let headerText = null;
        let visible = true;
        let option = {};

        //* column('field', visible)
        if (args.length === 1 && typeof args[0] === 'boolean') {
            visible = args[0];

        //* column('field', {})
        } else if (args.length === 1 && ObjectUtil.isObject(args[0])) {
            visible = false;
            option = args[0];

        //* column('field', 'text')
        } else if (args.length === 1) {
            headerText = args[0];

        //* column('field', 'text', visible)
        } else if (args.length === 2 && typeof args[1] === 'boolean') {
            headerText = args[0];
            visible = args[1];

        //* column('field', 'text', {})
        } else if (args.length === 2 && ObjectUtil.isObject(args[1])) {
            headerText = args[0];
            option = args[1];

        //* column('field', 'text', visible, {})
        } else if (args.length === 3) {
            headerText = args[0];
            visible = args[1];
            option = args[2];
        }

        return { dataField, headerText, visible, ...option };
    }

    col(...args) {
        this.#columns.push(this.#make(...args));
        return this;
    }

    calendar(...args) {
        const makeColumnHeader = this.#make(...args);
        const calendarRenderer = {
            width: 100,
            editRenderer: {
                type: 'CalendarRenderer',
                defaultFormat: 'yyyy-mm-dd',
            },
        };

        this.#columns.push({...makeColumnHeader, ...calendarRenderer });
        return this;
    }

    icon(...args) {
        const makeColumnHeader = this.#make(...args);

        const iconRenderer = {
            width: 100,
            renderer: {
                type: 'IconRenderer',
                iconPosition: 'aisleRight',
                iconWidth: 16,
                iconHeight: 16,
                iconTableRef: {
                    // TODO
                    // default: '../assets/images/searchBtn.png',
                },
            },
        };

        this.#columns.push({ ...makeColumnHeader, ...iconRenderer });
        return this;
    }

    button(...args) {
        const header = this.#make(...args);
        const buttonRenderer = {
            renderer: {
                type: 'ButtonRenderer',
                labelText: header.label ?? header.headerText,
            },
        };

        if (header.visibleFunction) {
            buttonRenderer.renderer.visibleFunction = header.visibleFunction;
        }
        if (header.disabledFunction) {
            buttonRenderer.renderer.disabledFunction = header.disabledFunction;
        }

        this.#columns.push({ ...header, ...buttonRenderer });
        return this;
    }

    checkbox(...args) {
        const [ , , option = {} ] = args;
        const makeColumnHeader = this.#make(...args);
        const checkboxRenderer = {
            width: 100,
            renderer: {
                type: 'CheckBoxEditRenderer',
                editable: Object.hasOwn(option, 'editable') ? option.editable : true,
            },
        };

        this.#columns.push({ ...makeColumnHeader, ...checkboxRenderer });
        return this;
    }

    combo(...args) {
        const [ dataField, , option = {} ] = args;

        const column = this.#make(...args);
        column.list = option.list ?? [];
        const renderer = this.#createComboRenderer(option, column);
        Object.assign(column, renderer);

        if (option.async && typeof option.async === 'function') {
            option.async()
                .then((data) => {
                    if (Array.isArray(data)) {
                        column.list = data;
                        return;
                    }
                    console.warn('async combo data is not array.', data);
                    column.list = [];
                })
                .catch(e => {
                    console.error('failed to fetch combo list.', e);
                    column.list = [];
                });
        }

        this.#columns.push(column);
        return this;
    }

    #createComboRenderer(option, column) {
        if (option.ancestor) {
            return this.#createDescendantCombo(option);
        }
        return this.#createNormalCombo(option, column);
    }

    #createNormalCombo(option, column) {
        const renderer = this.#createDropDownListRenderer();

        renderer.labelFunction = (_, __, value) => {
            const returnValue = column.list.filter((item) => item.value == value);

            if (returnValue[0] != null) {
                return returnValue[0].label;
            }
            return value;
        }

        if (!option.listFunction) {
            renderer.editRenderer.listFunction = () => column.list;
        }
        return renderer;
    }

    #createDescendantCombo(option) {
        const renderer = this.#createDropDownListRenderer();

        if (!option.listFunction) {
            renderer.editRenderer.listFunction = (_, __, item, dataField) => {
                return this.#getListFromAncestor(item, dataField);
            }
        }

        renderer.labelFunction = (_, __, value, ___, item, dataField, a, b, c) => {
            const descendents = this.#getListFromAncestor(item, dataField) ?? [];
            const matchedItem = descendents.find(item => item.value == value);

            if (!matchedItem) {
                item[dataField] = descendents[0]?.value;
                return descendents[0]?.label;
            }
            return matchedItem?.label;
        }
        return renderer;
    }

    #createDropDownListRenderer() {
        return {
            editRenderer: {
                type: 'DropDownListRenderer',
                showEditorBtnOver: true,
                keyField: 'value',
                valueField: 'label',
            },
        };
    }

    #getListFromAncestor(item, dataField, path = []) {
        const ancestorColumn = this.#columns.find(column => column.dataField === dataField);

        if (!ancestorColumn) {
            console.warn(`not found ancestor column of '${dataField}'`);
            return [];
        }

        if (ancestorColumn.ancestor) {
            const ancestorValue = item[ancestorColumn.ancestor];
            return this.#getListFromAncestor(item, ancestorColumn.ancestor, [...path, ancestorValue]);
        }

        return ObjectUtil.findHierarchyArrayByPath(ancestorColumn.list, [...path], 'children');
    }

    build() {
        return this.#columns;
    }

}

export default {
    builder() {
        return new ColumnBuilder();
    },
}
