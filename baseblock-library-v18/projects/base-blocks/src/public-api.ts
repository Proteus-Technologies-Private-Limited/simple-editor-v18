/*
 * Public API Surface of base-blocks (trimmed for simple-editor-v18 integration)
 *
 * Only the symbols actually imported by simple-editor-v18's invoice-transaction
 * + simple_editor modules are re-exported. The full library exports many more
 * components (bb-grister, bb-query-builder, bb-side-bar, etc.) that pull in
 * heavy or dead deps (@agm/core, ng-sidebar, ngx-bootstrap, igniteui@19,
 * angular-gridster2@19, the `visuals` module, etc.). Trimming the entry-point
 * keeps ng-packagr's import-graph closure free of those.
 *
 * If a host app needs more than this set, add the matching export here AND
 * verify its sibling-import closure stays inside the v18-compatible deps.
 */

export { MaterialModule } from './lib/mat-module';
export { BaseBlockComponent } from './lib/base-block.component';

// MaterialModule transitively pulls in TouchClickModule/TouchClick, so they
// must also appear in the public surface (ng-packagr enforces this).
export * from './lib/touch-click/index';

export * from './lib/form/index';
export * from './lib/validators/index';

export * from './lib/bb-textbox/index';
export * from './lib/bb-text-area/index';
export * from './lib/bb-button/index';
export * from './lib/bb-checkbox/index';
export * from './lib/bb-chip-input/index';
export * from './lib/bb-choice/index';
export * from './lib/bb-radio-button-group/index';

export * from './lib/bb-datepicker/index';
export * from './lib/bb-autosuggest/index';
export * from './lib/bb-autosuggest-transaction/index';

export * from './lib/bb-treeview/index';

export * from './lib/bb-pophelp/index';
export * from './lib/bb-open-pophelp/index';

export * from './lib/httpRequest/index';
export * from './lib/confirm-box/index';
export * from './lib/bb-confirm-box/index';
export * from './lib/utility/index';

export * from './lib/bb-set-row-count/index';
export * from './lib/bb-progress-spinner/index';
export * from './lib/bb-feed-view/index';
export * from './lib/bb-ag-grid/index';
