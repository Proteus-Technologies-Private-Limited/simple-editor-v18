import * as _ from 'lodash';
import { TreeviewItem } from './treeview-item';

export const TreeviewHelper = {
    findItem: findItem,
    findItemInList: findItemInList,
    findParent: findParent,
    removeItem: removeItem
};

function findItem(root: TreeviewItem, value: any): TreeviewItem {
    if (_.isNil(root)) {
        return undefined as any;
    }

    if (root.value === value) {
        return root;
    }

    if (root.children) {
        for (const child of root.children) {
            const foundItem = findItem(child, value);
            if (foundItem) {
                return foundItem;
            }
        }
    }

    return undefined as any;
}

function findItemInList(list: TreeviewItem[], value: any): TreeviewItem {
    if (_.isNil(list)) {
        return undefined as any;
    }

    for (const item of list) {
        const foundItem = findItem(item, value);
        if (foundItem) {
            return foundItem;
        }
    }

    return undefined as any;
}

function findParent(root: TreeviewItem, item: TreeviewItem): TreeviewItem {
    if (_.isNil(root) || _.isNil(root.children)) {
        return undefined as any;
    }

    for (const child of root.children) {
        if (child === item) {
            return root;
        } else {
            const parent = findParent(child, item);
            if (parent) {
                return parent;
            }
        }
    }

    return undefined as any;
}

function removeItem(root: TreeviewItem, item: TreeviewItem): boolean {
    const parent: any = findParent(root, item);
    if (parent) {
        _.pull(parent.children, item);
        if (parent.children.length === 0) {
            parent.children = undefined;
        } else {
            parent.correctChecked();
        }
        return true;
    }

    return false;
}
