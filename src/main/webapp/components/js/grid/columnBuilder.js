import { ObjectUtil } from '../util/index.js';

class ColumnBuilder {

    #columns = [];


    #make(dataField, ...args) {
        const [
            labelOrOptionOrVisible,

        ] = args;

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
                labelText: header.buttonLabel ?? header.headerText,
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
        const makeColumnHeader = this.#make(...args);
        const checkboxRenderer = {
            width: 100,
            renderer: {
                type: 'CheckBoxEditRenderer',
                editable: true,
            },
        };

        this.#columns.push({ ...makeColumnHeader, ...checkboxRenderer });
        return this;
    }

    combo(...args) {
        const [ , , option = {} ] = args;
        const comboRenderer = this.#createComboRenderer(option);

        if (Object.hasOwn(option, 'async')) {
            option.async()
                .then(({ data }) => {
                    if (!Array.isArray(data)) {
                        console.warn('async response combo data is not array.', data);
                        comboRenderer.editRenderer.list = [];
                        return;
                    }
                    comboRenderer.editRenderer.list = data;
                })
                .catch(e => {
                    console.error('failed to fetch combo list.', e);
                    comboRenderer.editRenderer.list = [];
                });
        }

        const makeColumnHeader = this.#make(...args);
        const makeColumn = { ...makeColumnHeader, ...comboRenderer };
        this.#columns.push(makeColumn);
        return this;
    }

    #createComboRenderer(option) {
        if (this.#isNormalCombo(option)) {
            return this.#createNormalCombo(option);
        }
        if (this.#isAncestorCombo(option)) {
            return this.#createAncestorCombo(option);
        }
        if (this.#isDescendantCombo(option)) {
            return this.#createDescendantCombo(option);
        }
        return {};
    }

    #isNormalCombo(option) {
        if (Object.hasOwn(option, 'descendants')) {
            return false;
        }
        if (Object.hasOwn(option, 'ancestor')) {
            return false;
        }
        if (Object.hasOwn(option, 'list') && Array.isArray(option.list)) {
            return true;
        }
        if (Object.hasOwn(option, 'async')) {
            return true;
        }
        return false;
    }

    #createNormalCombo(option) {
        const { list = [] } = option ?? {};

        return {
            editRenderer: {
                type: 'DropDownListRenderer',
                showEditorBtnOver: true,
                keyField: 'value',
                valueField: 'label',
                list,
            },
            labelFunction: function (rowIndex, columnIndex, value) {
                const returnValue = this.editRenderer.list.filter((item) => item.value == value);

                if (returnValue[0] != null) {
                    return returnValue[0].label;
                }
                return value;
            },
        };
    }

    #isAncestorCombo(option) {
        return Object.hasOwn(option, 'descendants') && Array.isArray(option.descendants);
    }

    #createAncestorCombo(option) {
        const { descendants, descendantDefaultValues } = option;
        const renderer = this.#createNormalCombo(option);

        return {
            ...renderer,
            editRenderer: {
                ...renderer.editRenderer,
                descendants,
                descendantDefaultValues,
            },
        };
    }

    #isDescendantCombo(option) {
        return Object.hasOwn(option, 'ancestor') && Object.hasOwn(option, 'async');
    }

    #createDescendantCombo(option) {
        const { ancestor, async } = option;
        const renderer = this.#createNormalCombo(option);

        return {
            _ancestor: {
                target: ancestor,
                value: -1,
            },
            ...renderer,
            editRenderer: {
                ...renderer.editRenderer,
            },
            labelFunction(rowIndex, columnIndex, value, headerText, item = {}) {
                /**
                 ** AUIGrid labelFunction 권장사항에 따라 다음 로직은 최대한 메서드를 사용하지 않고 처리합니다.
                 * @see https://www.auisoft.net/documentation/auigrid/ColumnLayout/Column.html#labelFunction
                 */
                //* 그리드에 처음 데이터가 삽입될 때(초기화, 행 추가 등) 부모 값을 캐싱합니다.
                if (this._ancestor.value === -1) {
                    this._ancestor.value = item[this._ancestor.target];
                }

                /**
                 * TODO 여기부터의 코드들은 문제가 있어보이는데 확인 필요.
                 */
                //* 부모 컬럼의 값이 변경될 때만 실행합니다.
                if (this._ancestor.value != item[this._ancestor.target]) {
                    this._ancestor.value = item[this._ancestor.target];
                    async({ ...item }).then(({ data }) => (this.editRenderer.list = data));
                }

                const returnValue = this.editRenderer.list.filter((item) => item.value == value);

                if (returnValue[0] != null) {
                    return returnValue[0].label;
                } else {
                    return value;
                }
            },
        };
    }

    build() {
        const result = this.#columns;
        this.#columns = null;
        return result;
    }

}

export default {
    builder() {
        return new ColumnBuilder();
    },
}
