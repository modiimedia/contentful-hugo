const getEntryFields = require('./getEntryFields');
const getAssetFields = require('./getAssetFields');

const mapDataNode = node => {
    const { target } = node;
    if (target) {
        if (target.sys) {
            switch (target.sys.type) {
                case 'Entry':
                    return getEntryFields(target);
                case 'Asset':
                    return getAssetFields(target);
            }
        } else {
            console.log(node);
        }
    }
    return node;
};

const mapContentNode = node => {
    const contentArr = [];
    for (const item of node) {
        contentArr.push(richTextNodes(item));
    }
    return contentArr;
};

const mapMarks = node => {
    const markArr = [];
    for (const item of node) {
        markArr.push(item.type);
    }
    return markArr;
};

const richTextNodes = node => {
    const fieldContent = {};
    for (const field of Object.keys(node)) {
        const subNode = node[field];
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

module.exports = richTextNodes;
