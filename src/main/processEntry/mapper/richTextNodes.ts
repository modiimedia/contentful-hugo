/* eslint-disable @typescript-eslint/no-explicit-any */
import getEntryFields from './getEntryFields';
import getAssetFields from './getAssetFields';
import { log } from '@/helpers/logger';

const mapDataNode = (node: any = {}) => {
    const { target } = node;
    if (target) {
        if (target.sys) {
            switch (target.sys.type) {
                case 'Entry':
                    return getEntryFields(target);
                case 'Asset':
                    return getAssetFields(target);
                default:
                    break;
            }
        } else {
            log(node);
        }
    }
    return node;
};

const mapContentNode = (node = []) => {
    const contentArr = [];
    for (const item of node) {
        contentArr.push(richTextNodes(item));
    }
    return contentArr;
};

const mapMarks = (node: { type: string }[] = []): string[] => {
    const markArr = [];
    for (const item of node) {
        markArr.push(item.type);
    }
    return markArr;
};

const richTextNodes = (node: any = {}): any => {
    const fieldContent: any = {};
    for (const field of Object.keys(node)) {
        const subNode: any = node[field];
        switch (field) {
            case 'data': {
                fieldContent[field] = mapDataNode(subNode);
                break;
            }
            case 'content': {
                fieldContent[field] = mapContentNode(subNode);
                break;
            }
            case 'marks': {
                fieldContent[field] = mapMarks(subNode);
                break;
            }
            default:
                fieldContent[field] = node[field];
                break;
        }
    }
    return fieldContent;
};

export default richTextNodes;
