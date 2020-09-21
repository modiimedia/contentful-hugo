const { BLOCKS, MARKS, INLINES } = require('@contentful/rich-text-types');
const { documentToHtmlString } = require('@contentful/rich-text-html-renderer');
const { isMultilineString, replaceSpecialEntities } = require('./strings');

const mapEntry = target => {
    return {
        id: target.sys.id,
        contentType: target.sys.contentType.sys.id,
    };
};

const mapAsset = target => {
    const { title, description, file } = target.fields;
    const { url, details, fileName, contentType } = file;
    const asset = {
        title,
        description,
        url,
        fileName,
        assetType: contentType,
        size: details.size,
        width: null,
        height: null,
    };
    if (details.image) {
        asset.width = details.image.width;
        asset.height = details.image.height;
    }
    return asset;
};

const options = parentContentType => {
    return {
        renderMark: {
            [MARKS.BOLD]: text => {
                return `**${text}**`;
            },
            [MARKS.ITALIC]: text => {
                return `*${text}*`;
            },
            [MARKS.CODE]: text => {
                if (isMultilineString(text)) {
                    return `\`\`\`\n${text}\n\`\`\``;
                }
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
                const string = next(node.content);
                const lines = string.split(`\n`);
                let finalString = '';
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    finalString += `> ${line}\n`;
                }
                const removeExtraSpace = finalString.substr(
                    0,
                    finalString.length - 6
                );
                return `${removeExtraSpace}\n`;
            },
            [BLOCKS.OL_LIST]: (node, next) => {
                let string = ``;
                for (let i = 0; i < node.content.length; i++) {
                    const item = node.content[i];
                    string += `${i + 1}. ${next(item.content)}`;
                }
                string = string.replace(/\n\n/g, `\n`);
                return `${string}\n`;
            },
            [BLOCKS.UL_LIST]: (node, next) => {
                let string = ``;
                for (let i = 0; i < node.content.length; i++) {
                    const item = node.content[i];
                    string += `- ${next(item.content)}`;
                }
                string = string.replace(/\n\n/g, `\n`);
                return `${string}\n`;
            },
            [BLOCKS.HR]: (node, next) => {
                return `---\n\n`;
            },
            [BLOCKS.EMBEDDED_ASSET]: (node, next) => {
                const {
                    title,
                    description,
                    url,
                    fileName,
                    assetType,
                    size,
                    width,
                    height,
                } = mapAsset(node.data.target);
                return `{{< contentful-hugo/embedded-asset title="${title}" description="${description ||
                    ''}" url="${url || ''}" filename="${fileName ||
                    ''}" assetType="${assetType || ''}" size="${size ||
                    ''}" width="${width || ''}" height="${height ||
                    ''}" parentContentType="${parentContentType ||
                    ''}" >}}\n\n`;
            },
            [BLOCKS.EMBEDDED_ENTRY]: (node, next) => {
                const { id, contentType } = mapEntry(node.data.target);
                return `{{< contentful-hugo/embedded-entry id="${id}" contentType="${contentType}" parentContentType="${parentContentType ||
                    ''}" >}}\n\n`;
            },
            [INLINES.HYPERLINK]: (node, next) => {
                return `[${next(node.content)}](${node.data.uri})`;
            },
            [INLINES.ASSET_HYPERLINK]: (node, next) => {
                const {
                    title,
                    description,
                    url,
                    fileName,
                    assetType,
                    size,
                    width,
                    height,
                } = mapAsset(node.data.target);
                return `{{< contentful-hugo/asset-hyperlink title="${title}" description="${description ||
                    ''}" url="${url || ''}" filename="${fileName ||
                    ''}" assetType="${assetType || ''}" size="${size ||
                    ''}" width="${width || ''}" height="${height ||
                    ''}" parentContentType="${parentContentType ||
                    ''}" >}}${next(
                    node.content
                )}{{< /contentful-hugo/asset-hyperlink >}}`;
            },
            [INLINES.ENTRY_HYPERLINK]: (node, next) => {
                const { id, contentType } = mapEntry(node.data.target);
                return `{{< contentful-hugo/entry-hyperlink id="${id}" contentType="${contentType}" parentContentType="${parentContentType ||
                    ''}" >}}${next(
                    node.content
                )}{{< /contentful-hugo/entry-hyperlink >}}`;
            },
            [INLINES.EMBEDDED_ENTRY]: (node, next) => {
                const { id, contentType } = mapEntry(node.data.target);
                return `{{< contentful-hugo/inline-entry id="${id}" contentType="${contentType}" parentContentType="${parentContentType ||
                    ''}" >}}`;
            },
        },
    };
};

/**
 * Convert a contentful richtext field to markdown
 * @param {Object} document - Contentful richtext field
 * @param {String} contentType - Content type id
 */
const richTextToMarkdown = (document, contentType) => {
    const string = documentToHtmlString(document, options(contentType));
    return `\n${replaceSpecialEntities(string)}`;
};

module.exports = richTextToMarkdown;
