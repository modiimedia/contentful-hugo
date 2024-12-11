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
import {
    isMultilineString,
    replaceSpecialEntities,
    leadingSpaces,
    trailingSpaces,
} from '@helpers/strings';
import { Entry, Asset } from 'contentful';
import { AssetObject } from './getAssetFields';
import { parseField } from './common';

const mapEntry = (target: Entry<any>) => ({
    id: target.sys.id,
    // contentType doesn't exist if the entry is "missing or inaccessible"
    contentType: target.sys.contentType?.sys?.id,
});

const mapAsset = (target: Asset) => {
    const { title, description, file } = target.fields;
    const { url, details, fileName, contentType } = parseField(file) ?? {
        url: '',
        details: {
            size: 0,
        },
        fileName: '',
        contentType: '',
    };
    const asset: AssetObject = {
        title: typeof title === 'string' ? title : (title?.['en-US'] ?? ''),
        description:
            typeof description === 'string'
                ? description
                : (description?.['en-US'] ?? ''),
        url,
        fileName,
        assetType: contentType,
        size: details.size,
        width: details.image?.width ?? null,
        height: details.image?.height ?? null,
    };
    return asset;
};

const optionsRenderNode = (parentContentType = ''): any => ({
    [BLOCKS.HEADING_1]: (node: Heading1, next: Next) =>
        `# ${next(node.content)}\n\n`,
    [BLOCKS.HEADING_2]: (node: Heading2, next: Next) =>
        `## ${next(node.content)}\n\n`,
    [BLOCKS.HEADING_3]: (node: Heading3, next: Next) =>
        `### ${next(node.content)}\n\n`,
    [BLOCKS.HEADING_4]: (node: Heading4, next: Next) =>
        `#### ${next(node.content)}\n\n`,
    [BLOCKS.HEADING_5]: (node: Heading5, next: Next) =>
        `##### ${next(node.content)}\n\n`,
    [BLOCKS.HEADING_6]: (node: Heading6, next: Next) =>
        `###### ${next(node.content)}\n\n`,
    [BLOCKS.PARAGRAPH]: (node: Paragraph, next: Next) =>
        `${next(node.content)}\n\n`,
    [BLOCKS.QUOTE]: (node: Quote, next: Next) => {
        const string = next(node.content);
        const lines = string.split(`\n`);
        let finalString = '';
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            finalString += `> ${line}\n`;
        }
        const removeExtraSpace = finalString.substr(0, finalString.length - 6);
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
    [BLOCKS.HR]: (_node: Hr, _next: Next) => `---\n\n`,
    [BLOCKS.EMBEDDED_ASSET]: (node: any, _next: Next) => {
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
        const handleQuotes = (string: string) => {
            const regex = new RegExp(/"/, 'g');
            return string.replace(regex, '\\"');
        };

        return `{{< contentful-hugo/embedded-asset title="${handleQuotes(
            title
        )}" description="${handleQuotes(description || '') || ''}" url="${
            url || ''
        }" filename="${fileName || ''}" assetType="${assetType || ''}" size="${
            size || ''
        }" width="${width || ''}" height="${height || ''}" parentContentType="${
            parentContentType || ''
        }" >}}\n\n`;
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    [BLOCKS.EMBEDDED_ENTRY]: (node: any, next: Next) => {
        const { id, contentType } = mapEntry(node.data.target);
        return `{{< contentful-hugo/embedded-entry id="${id}" contentType="${contentType}" parentContentType="${
            parentContentType || ''
        }" >}}\n\n`;
    },
    [INLINES.HYPERLINK]: (node: Hyperlink, next: Next) =>
        `[${next(node.content)}](${node.data.uri})`,
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
        return `{{< contentful-hugo/asset-hyperlink title="${title}" description="${
            description || ''
        }" url="${url || ''}" filename="${fileName || ''}" assetType="${
            assetType || ''
        }" size="${size || ''}" width="${width || ''}" height="${
            height || ''
        }" parentContentType="${parentContentType || ''}" >}}${next(
            node.content
        )}{{< /contentful-hugo/asset-hyperlink >}}`;
    },
    [INLINES.ENTRY_HYPERLINK]: (node: any, next: Next) => {
        const { id, contentType } = mapEntry(node.data.target);
        return `{{< contentful-hugo/entry-hyperlink id="${id}" contentType="${contentType}" parentContentType="${
            parentContentType || ''
        }" >}}${next(node.content)}{{< /contentful-hugo/entry-hyperlink >}}`;
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    [INLINES.EMBEDDED_ENTRY]: (node: any, next: Next) => {
        const { id, contentType } = mapEntry(node.data.target);
        return `{{< contentful-hugo/inline-entry id="${id}" contentType="${contentType}" parentContentType="${
            parentContentType || ''
        }" >}}`;
    },
});

const sanitizedMarkOutput = (
    input: string,
    markWrapper: '__' | '_' | '**' | '*'
): string => {
    const leading = leadingSpaces(input);
    const trailing = trailingSpaces(leading.newString);
    return `${leading.removedSpaces}${markWrapper}${trailing.newString}${markWrapper}${trailing.removedSpaces}`;
};

const options = (parentContentType = '') => ({
    renderMark: {
        [MARKS.BOLD]: (text: string) => sanitizedMarkOutput(text, '**'),
        [MARKS.ITALIC]: (text: string) => sanitizedMarkOutput(text, '_'),
        [MARKS.CODE]: (text: string) => {
            if (isMultilineString(text)) {
                return `\`\`\`\n${text}\n\`\`\``;
            }
            return `\`${text}\``;
        },
    },
    renderNode: optionsRenderNode(parentContentType),
});

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
