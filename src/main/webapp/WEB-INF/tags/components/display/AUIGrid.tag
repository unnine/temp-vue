<%@ tag pageEncoding="UTF-8" %>
<%@ include file="../tag-imports.tag" %>
<c:set var="cid" value="${UUID.randomUUID().toString()}"/>

<%@ attribute name="_bind" fragment="false" required="false" type="java.lang.String" %>


<div component-id="${cid}" class="aui-grid-component">
    <div e-id="grid-container"></div>
</div>

<script type="module">
    import { newComponent } from 'component';
    import { AUIGrid } from 'grid';
    import { StringUtil, DateUtil } from 'util';

    const Math = window.Math;

    const component = newComponent({
        id: '${cid}',
        propsTarget: `${_bind}`,
        props() {
            return {
                title: {
                    type: String,
                },
                columns: {
                    type: Array,
                    default: () => [],
                    desc: `https://www.auisoft.net/documentation/auigrid/ColumnLayout/Column.html`,
                },
                props: {
                    type: Object,
                    default: () => ({}),
                    desc: `https://www.auisoft.net/documentation/auigrid/DataGrid/Properties.html`,
                },
                defaultData: {
                    type: Array,
                    default: () => [],
                },
                event: {
                    type: Object,
                    default: () => ({}),
                },
                width: {
                    type: String,
                    default: '100%',
                },
                height: {
                    type: String,
                    default: '100%',
                },
            }
        },
        mounted() {
            this.setIdToContainer();
            this.createGrid();
            this.bindEvents();
            this.setDefaultData();
            const proxy = this.makeMethodProxy();
            this.created(proxy);
        },
        data() {
            return {
                pid: this.generateId(),
                currentHiddenDataFields: [],
            };
        },
        methods: {
            generateId() {
                return 'auigrid-' + Math.trunc(Math.pow(Math.random() * 10, 17));
            },
            setIdToContainer() {
                this.$find('grid-container').setAttribute('id', this.pid);
            },
            createGrid() {
                const { columns, props = {} } = this.$props;

                AUIGrid.create(
                    this.pid,
                    this.addEditableHeaderStyleToColumns(columns),
                    {
                        ...this.getDefaultProp(),
                        ...props,
                    },
                );
            },
            bindEvents() {
                const { columns, event } = this.$props;

                this.bindGridEvents(this.pid, event);
                this.bindCustomEvents(columns);
            },
            setDefaultData() {
                const { defaultData } = this.$props;

                AUIGrid.setGridData(this.pid, defaultData);
            },
            created(proxy) {
                const { onCreated = () => {} } = this.$props.event;

                window.addEventListener('resize', this.resize);
                onCreated(proxy);
            },
            resize() {
                AUIGrid.resize(this.pid);
            },
            addEditableHeaderStyleToColumns(columns) {
                return columns.map((col) => {
                    if (!col.editable) {
                        return col;
                    }
                    return { ...col, headerStyle: 'editable-col' };
                });
            },
            makeMethodProxy() {
                const { pid } = this;
                const proxy = Object.entries(AUIGrid).reduce((acc, [name, prop]) => {
                    if (typeof prop === 'function') {
                        acc[name] = (...args) => prop.call(AUIGrid, pid, ...args);
                    }
                    return acc;
                }, {});

                proxy._pid = pid;
                this.addUtilMethods(proxy);
                return proxy;
            },
            addUtilMethods(proxy) {
                proxy._useLoader = (asyncFn) => {
                    proxy.showAjaxLoader();
                    return asyncFn().finally(() => proxy.removeAjaxLoader());
                };

                proxy._sendCheckedRows = (targetProxy) => {
                    const checkedRows = proxy.getCheckedRowItems();
                    proxy.removeRow(
                        checkedRows.map(({ rowIndex }) => rowIndex)
                    );
                    AUIGrid.addRow(
                        targetProxy._pid,
                        checkedRows.map(({ item }) => item),
                    );
                };

                proxy._findColumn = (dataField) => {
                    return this.$props.columns.find((col) => col.dataField === dataField);
                }

                proxy._existsValue = (rowIndex, columnNameOrColumnIndex) => {
                    const cellValue = proxy.getCellValue(rowIndex, columnNameOrColumnIndex);
                    return StringUtil.isNotEmpty(cellValue);
                }
            },
            destroy() {
                window.removeEventListener('resize', this.resize);
                AUIGrid.destroy(this.pid);
            },
            bindGridEvents(pid, event) {
                for (let eventName in event) {
                    AUIGrid.bind(pid, eventName, event[eventName]);
                }
            },
            bindCustomEvents(columns) {
                const { onClickButton } = this.$props.event;

                columns.forEach(column => {
                    if (!onClickButton) {
                        return;
                    }
                    if (this.isButtonColumn(column)) {
                        column.renderer.onClick = (e) => onClickButton(e);
                    }
                });
            },
            isButtonColumn(column) {
                return column.renderer && column.renderer.type === 'ButtonRenderer';
            },
            getDefaultProp() {
                return {
                    editable: true,
                    copySingleCellOnRowMode: true,
                    enableCellMerge: false,
                    selectionMode: 'singleRow',
                    showRowCheckColumn: false,
                    showRowNumColumn: true,
                    softRemoveRowMode: false,
                    useContextMenu: true,
                    enableFilter: true,
                    showEditedCellMarker: false,
                    isRowAllCheckCurrentView: true,
                    enableRightDownFocus: true,
                    contextMenuItems: this.createContextMenuItems(),
                };
            },
            createContextMenuItems() {
                return [
                    { label: '모든 필터링 초기화', callback: this.clearAllFilters },
                    { label: '_$line' },
                    { label: '그룹핑 보이기', callback: this.showGrouping },
                    { label: '그룹핑 숨기기', callback: this.hideGrouping },
                    { label: '필터 보이기', callback: this.showFilter },
                    { label: '필터 숨기기', callback: this.hideFilter },
                    { label: '_$line' },
                    { label: '엑셀 다운로드', callback: this.exportToExcel },
                    { label: '_$line' },
                    { label: '현재 컬럼 숨기기', callback: this.hideColumn },
                    { label: '모든 컬럼 보이기', callback: this.showAllColumns },
                ];
            },
            clearAllFilters() {
                AUIGrid.clearFilterAll(this.pid);
            },
            showGrouping() {
                AUIGrid.setProp(this.pid, 'useGroupingPanel', true);
                AUIGrid.refresh(this.pid);
            },
            hideGrouping() {
                AUIGrid.setProp(this.pid, 'useGroupingPanel', false);
                AUIGrid.refresh(this.pid);
            },
            showFilter(e) {
                const { columnIndex } = e;

                AUIGrid.setColumnProp(this.pid, columnIndex, {
                    filter: {
                        showIcon: true,
                        displayFormatValues: true,
                    },
                });
                AUIGrid.refresh(this.pid);
            },
            hideFilter(e) {
                const { columnIndex } = e;

                AUIGrid.setColumnProp(this.pid, columnIndex, {
                    filter: {
                        showIcon: false
                    },
                });
                AUIGrid.refresh(this.pid);
            },
            exportToExcel() {
                const fileName = DateUtil.now();

                AUIGrid.exportToXlsx(this.pid, { fileName });
            },
            hideColumn(e) {
                const { dataField } = e;

                AUIGrid.hideColumnByDataField(this.pid, dataField);
                this.currentHiddenDataFields.push(dataField);
            },
            showAllColumns() {
                AUIGrid.showColumnByDataField(this.pid, this.currentHiddenDataFields);
                AUIGrid.resize(pid);
                this.currentHiddenDataFields.length = 0;
            },
        }
    });

</script>

<style>
</style>