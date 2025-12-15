import AUIGrid from './auigrid.js';

export const resizeAllGrids = () => {
    const grids = document.querySelectorAll('[e-id="grid-container"]');
    grids.forEach(grid => AUIGrid.resize(grid.id));
}
