const getEntryFields = require('./getEntryFields');
const getAssetFields = require('./getAssetFields');

const richTextNodes = node => {
	const fieldContent = {};
	for (const field of Object.keys(node)) {
		switch (field) {
			case 'data': {
				const t = node[field].target;
				if (t) {
					if (t.sys) {
						switch (t.sys.type) {
							case 'Entry':
								fieldContent[field] = getEntryFields(t);
								break;
							case 'Asset':
								fieldContent[field] = getAssetFields(t);
								break;
						}
					} else {
						console.log(node[field]);
					}
				} else {
					fieldContent[field] = node[field];
				}
				break;
			}
			case 'content': {
				const contentArr = [];
				for (const item of node[field]) {
					contentArr.push(richTextNodes(item));
				}
				fieldContent[field] = contentArr;
				break;
			}
			case 'marks': {
				const markArr = [];
				for (const item of node[field]) {
					markArr.push(item.type);
				}
				fieldContent[field] = markArr;
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
