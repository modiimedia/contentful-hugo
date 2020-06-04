const { BLOCKS, MARKS, INLINES } = require('@contentful/rich-text-types');
const { documentToHtmlString } = require('@contentful/rich-text-html-renderer');

const options = {
	renderMark: {
		[MARKS.BOLD]: text => {
			return `**${text}**`;
		},
		[MARKS.ITALIC]: text => {
			return `*${text}*`;
		},
		[MARKS.CODE]: text => {
			return `\`${text}\``;
		},
	},
	renderNode: {
		[BLOCKS.HEADING_1]: (node, next) => {
			return `# ${next(node.content)}\n\n`;
		},
		[BLOCKS.HEADING_2]: (node, next) => {
			return `## ${next(node.content)}\n\n`;
		},
		[BLOCKS.HEADING_3]: (node, next) => {
			return `### ${next(node.content)}\n\n`;
		},
		[BLOCKS.HEADING_4]: (node, next) => {
			return `#### ${next(node.content)}\n\n`;
		},
		[BLOCKS.HEADING_5]: (node, next) => {
			return `##### ${next(node.content)}\n\n`;
		},
		[BLOCKS.HEADING_6]: (node, next) => {
			return `###### ${next(node.content)}\n\n`;
		},
		[BLOCKS.PARAGRAPH]: (node, next) => {
			return `${next(node.content)}\n\n`;
		},
		[BLOCKS.QUOTE]: (node, next) => {
			return `> ${next(node.content)}\n\n`;
		},
		[INLINES.HYPERLINK]: (node, next) => {
			console.log(node, next);
			return `[${next(node.content)}](${node.data.uri})`;
		},
	},
};

const richTextToMarkdown = document => {
	return `\n${documentToHtmlString(document, options)}`;
};

module.exports = richTextToMarkdown;
