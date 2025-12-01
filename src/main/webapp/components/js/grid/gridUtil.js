import {AUIGrid} from './index.js';

export default {
    useLoader(pid, asyncFn) {
        AUIGrid.showAjaxLoader(pid);
        return asyncFn().finally(() => AUIGrid.removeAjaxLoader(pid));
    },
    moveToGrid(fromGridProxy, toGridProxy) {
        this.moveToGridByPid(fromGridProxy._pid, toGridProxy._pid);
    },
    moveToGridByPid(fromGridPid, toGridPid) {
        const checkedRows = AUIGrid.getCheckedRowItems(fromGridPid);
        AUIGrid.removeRow(
            fromGridPid,
            checkedRows.map(({rowIndex}) => rowIndex),
        );
        AUIGrid.addRow(
            toGridPid,
            checkedRows.map(({item}) => item),
        );
    },
    findColumn(columns, dataField) {
        return columns.find((col) => col.dataField === dataField);
    },
    existsValue(proxyOrPid, rowIndex, columnNameOrColumnIndex) {
        const value =
            typeof proxyOrPid === 'string'
                ? AUIGrid.getCellValue(proxyOrPid, rowIndex, columnNameOrColumnIndex)
                : proxyOrPid.getCellValue(rowIndex, columnNameOrColumnIndex);
        return stringUtil.isNotEmpty(value);
    },
};
