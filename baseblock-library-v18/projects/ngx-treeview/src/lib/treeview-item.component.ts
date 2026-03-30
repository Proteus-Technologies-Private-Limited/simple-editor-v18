import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import * as _ from 'lodash';
import { TreeviewItem } from './treeview-item';
import { TreeviewConfig } from './treeview-config';
import { TreeviewItemTemplateContext } from './treeview-item-template-context';

@Component({
    selector: 'ngx-treeview-item',
    templateUrl: './treeview-item.component.html',
    styleUrls: ['./treeview-item.component.scss']
})
export class TreeviewItemComponent {
    @Input() config: TreeviewConfig;
    @Input() template: TemplateRef<TreeviewItemTemplateContext> | any;
    @Input() item: TreeviewItem | any;
    @Output() checkedChange = new EventEmitter<boolean>();

    constructor(
        private defaultConfig: TreeviewConfig
    ) {
        this.config = this.defaultConfig;
    }

    onCollapseExpand = () => {
        this.item.collapsed = !this.item.collapsed;
    }

    onCheckedChange = () => {
        const checked = this.item.checked;
        if (!_.isNil(this.item.children) && !this.config.decoupleChildFromParent) {
            this.item.children.forEach((child: any) => child.setCheckedRecursive(checked));
        }
        this.checkedChange.emit(checked);
    }

    onChildCheckedChange(child: TreeviewItem, checked: boolean) {
        if (!this.config.decoupleChildFromParent) {
            let itemChecked: boolean | any= null;
            for (const childItem of this.item.children) {
                if (itemChecked === null) {
                    itemChecked = childItem.checked;
                } else if (itemChecked !== childItem.checked) {
                    itemChecked = undefined;
                    break;
                }
            }

            if (itemChecked === null) {
                itemChecked = false;
            }

            if (this.item.checked !== itemChecked) {
                this.item.checked = itemChecked;
            }

        }

        this.checkedChange.emit(checked);
    }
}
