/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    BLOCKS,
    MARKS,
    INLINES,
    Document,
    Heading1,
    Heading2,
    Heading3,
    Heading4,
    Heading5,
    Heading6,
    Paragraph,
    Quote,
    OrderedList,
    UnorderedList,
    Hr,
    Hyperlink,
} from '@contentful/rich-text-types';
import {
    documentToHtmlString,
    Next,
} from '@contentful/rich-text-html-renderer';
import { isMultilineString, replaceSpecialEntities } from '@helpers/strings';
import { Entry, Asset } from 'contentful';
import { AssetObject } from './getAssetFields';

const mapEntry = (target: Entry<any>) => {
    return {
        id: target.sys.id,
        contentType: target.sys.contentType.sys.id,
    };
};

const mapAsset = (target: Asset) => {
    const { title, description, file } = target.fields;
    const { url, details, fileName, contentType } = file;
    const asset: AssetObject = {
        title,
        description,
        url,
        fileName,
        assetType: contentType,
        size: details.size,
        width: null,
        height: null,
    };
    if (details.image && details.image.width && details.image.height) {
        asset.width = details.image.width;
        asset.height = details.image.height;
    }
    return asset;
};

const optionsRenderNode = (parentContentType = ''): any => {
    return {
        [BLOCKS.HEADING_1]: (node: Heading1, next: Next) => {
            return `# ${next(node.content)}\n\n`;
        },
        [BLOCKS.HEADING_2]: (node: Heading2, next: Next) => {
            return `## ${next(node.content)}\n\n`;
        },
        [BLOCKS.HEADING_3]: (node: Heading3, next: Next) => {
            return `### ${next(node.content)}\n\n`;
        },
        [BLOCKS.HEADING_4]: (node: Heading4, next: Next) => {
            return `#### ${next(node.content)}\n\n`;
        },
        [BLOCKS.HEADING_5]: (node: Heading5, next: Next) => {
            return `##### ${next(node.content)}\n\n`;
        },
        [BLOCKS.HEADING_6]: (node: Heading6, next: Next) => {
            return `###### ${next(node.content)}\n\n`;
        },
        [BLOCKS.PARAGRAPH]: (node: Paragraph, next: Next) => {
            return `${next(node.content)}\n\n`;
        },
        [BLOCKS.QUOTE]: (node: Quote, next: Next) => {
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
        [BLOCKS.OL_LIST]: (node: OrderedList, next: Next) => {
            let string = ``;
            for (let i = 0; i < node.content.length; i++) {
                const item = node.content[i];
                string += `${i + 1}. ${next(item.content)}`;
            }
            string = string.replace(/\n\n/g, `\n`);
            return `${string}\n`;
        },
        [BLOCKS.UL_LIST]: (node: UnorderedList, next: Next) => {
            let string = ``;
            for (let i = 0; i < node.content.length; i++) {
                const item = node.content[i];
                string += `- ${next(item.content)}`;
            }
            string = string.replace(/\n\n/g, `\n`);
            return `${string}\n`;
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        [BLOCKS.HR]: (node: Hr, next: Next) => {
            return `---\n\n`;
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        [BLOCKS.EMBEDDED_ASSET]: (node: any, next: Next) => {
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
                ''}" parentContentType="${parentContentType || ''}" >}}\n\n`;
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        [BLOCKS.EMBEDDED_ENTRY]: (node: any, next: Next) => {
            const { id, contentType } = mapEntry(node.data.target);
            return `{{< contentful-hugo/embedded-entry id="${id}" contentType="${contentType}" parentContentType="${parentContentType ||
                ''}" >}}\n\n`;
        },
        [INLINES.HYPERLINK]: (node: Hyperlink, next: Next) => {
            return `[${next(node.content)}](${node.data.uri})`;
        },
        [INLINES.ASSET_HYPERLINK]: (node: any, next: Next) => {
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
                ''}" parentContentType="${parentContentType || ''}" >}}${next(
                node.content
            )}{{< /contentful-hugo/asset-hyperlink >}}`;
        },
        [INLINES.ENTRY_HYPERLINK]: (node: any, next: Next) => {
            const { id, contentType } = mapEntry(node.data.target);
            return `{{< contentful-hugo/entry-hyperlink id="${id}" contentType="${contentType}" parentContentType="${parentContentType ||
                ''}" >}}${next(
                node.content
            )}{{< /contentful-hugo/entry-hyperlink >}}`;
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        [INLINES.EMBEDDED_ENTRY]: (node: any, next: Next) => {
            const { id, contentType } = mapEntry(node.data.target);
            return `{{< contentful-hugo/inline-entry id="${id}" contentType="${contentType}" parentContentType="${parentContentType ||
                ''}" >}}`;
        },
    };
};

const options = (parentContentType = '') => {
    return {
        renderMark: {
            [MARKS.BOLD]: (text: string) => {
                return `**${text}**`;
            },
            [MARKS.ITALIC]: (text: string) => {
                return `*${text}*`;
            },
            [MARKS.CODE]: (text: string) => {
                if (isMultilineString(text)) {
                    return `\`\`\`\n${text}\n\`\`\``;
                }
                return `\`${text}\``;
            },
        },
        renderNode: optionsRenderNode(parentContentType),
    };
};

/**
 * Convert a contentful richtext field to markdown
 * @param {Object} document - Contentful richtext field
 * @param {String} contentType - Content type id
 */
const richTextToMarkdown = (
    document: Document,
    contentType?: string
): string => {
    const string = documentToHtmlString(document, options(contentType));
    return `\n${replaceSpecialEntities(string)}`;
};

export default richTextToMarkdown;
