/* eslint-disable @typescript-eslint/no-explicit-any */
import { documentToPlainTextString as richTextToPlain } from '@contentful/rich-text-plain-text-renderer';
import { Asset, Entry } from 'contentful';
import { ResolveEntryConfig } from '@main/src/config';
import getEntryFields from './getEntryFields';
import getAssetFields from './getAssetFields';
import richTextToMarkdown from './richTextToMarkdown';
import richTextNodes from './richTextNodes';
import { OverrideConfig } from '../../config/src/types';

const mapArrayField = (
    fieldContent: Entry<any>[] | Asset[] | string[]
): any[] => {
    if (!fieldContent.length) {
        return fieldContent;
    }
    const array = [];
    for (let i = 0; i < fieldContent.length; i++) {
        const arrayNode = fieldContent[i];
        switch (typeof arrayNode) {
            case 'object': {
                let arrayObject = {};
                switch (arrayNode.sys.type) {
                    case 'Asset':
                        arrayObject = getAssetFields(arrayNode);
                        array.push(arrayObject);
                        break;
                    case 'Entry':
                        arrayObject = getEntryFields(arrayNode);
                        array.push(arrayObject);
                        break;
                    default:
                        array.push(arrayNode);
                        break;
                }
                break;
            }
            default:
                array.push(arrayNode);
                break;
        }
    }
    return array;
};

const mapReferenceField = (fieldContent: Entry<any> | Asset): any => {
    switch (fieldContent.sys.type) {
        case 'Asset':
            return getAssetFields(fieldContent);
        case 'Entry':
            return getEntryFields(fieldContent);
        default:
            return fieldContent;
    }
};

const mapRichTextField = (
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    fieldContent: any
): { richText: any; plainText: string } => {
    const richText = [];
    const fieldPlainText = richTextToPlain(fieldContent);
    const nodes = fieldContent.content;
    if (nodes && nodes.length) {
        for (let i = 0; i < nodes.length; i++) {
            richText.push(richTextNodes(nodes[i]));
        }
    }
    return {
        richText,
        plainText: fieldPlainText,
    };
};

const shouldResolve = (
    fieldName: string,
    resolve: ResolveEntryConfig[] = []
) => {
    for (const item of resolve) {
        if (fieldName === item.field) {
            return item;
        }
    }
    return false;
};

export const shouldOverride = (
    fieldName: string,
    overrides: OverrideConfig[] = []
): OverrideConfig | false => {
    for (const item of overrides) {
        if (fieldName === item.field) {
            return item;
        }
    }
    return false;
};

const resolveEntry = (entry: any = {}, resolvesToString = ''): any => {
    const props = resolvesToString.split('.');
    let value = entry;
    for (const prop of props) {
        value = value[prop];
    }
    return value;
};

export const isDateField = (input: unknown): boolean => {
    const requiredSymbols = ['-', ':', 'T'];
    if (typeof input !== 'string') {
        return false;
    }
    for (const symbol of requiredSymbols) {
        if (!input.includes(symbol)) {
            return false;
        }
    }
    const year = input.split('-')[0];
    if (isNaN(Number(year))) {
        return false;
    }
    if (typeof input === 'string') {
        const date = Date.parse(input);
        if (isNaN(date)) {
            return false;
        }
        return true;
    }
    return false;
};

/**
 *
 * @param {Object} fieldContent - contentful entry or array of contentful entries
 * @param {String} resolvesToString - string indicating which property to resolve to i.e. 'fields.title'
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const resolveField = (fieldContent: any, resolvesToString = ''): any => {
    if (!resolvesToString || typeof fieldContent !== 'object') {
        return null;
    }
    if (Array.isArray(fieldContent)) {
        const fieldValue = [];
        for (const entry of fieldContent) {
            fieldValue.push(resolveEntry(entry, resolvesToString));
        }
        return fieldValue;
    }
    return resolveEntry(fieldContent, resolvesToString);
};

const mapFields = (
    entry: Entry<any>,
    isHeadless?: boolean,
    type?: string,
    mainContentField?: string,
    resolveList?: ResolveEntryConfig[],
    overrides?: OverrideConfig[]
): any => {
    const frontMatter: { [key: string]: any } = {};
    if (isHeadless) {
        frontMatter.headless = true;
    }
    if (type) {
        frontMatter.type = type;
    }
    frontMatter.sys = {
        id: entry.sys.id,
        updatedAt: entry.sys.createdAt,
        createdAt: entry.sys.updatedAt,
        revision: entry.sys.revision,
        space: entry.sys.space?.sys.id,
        contentType: entry.sys.contentType.sys.id,
    };
    frontMatter.updated = entry.sys.updatedAt;
    frontMatter.createdAt = entry.sys.createdAt;
    frontMatter.date = entry.sys.createdAt;
    for (const field of Object.keys(entry.fields)) {
        const fieldContent = entry.fields[field];
        let fieldName = field;
        const fieldOverride = shouldOverride(field, overrides);
        if (fieldOverride && fieldOverride.options?.fieldName) {
            fieldName = fieldOverride.options.fieldName;
        }
        if (fieldOverride && fieldOverride.options?.valueTransformer) {
            frontMatter[fieldName] = fieldOverride.options.valueTransformer(
                entry.fields[field]
            );
            continue;
        }
        const fieldResolver = shouldResolve(field, resolveList);
        if (fieldResolver) {
            frontMatter[fieldName] = resolveField(
                fieldContent,
                fieldResolver.resolveTo
            );
            continue;
        }

        if (field === mainContentField) {
            // skips to prevent duplicating mainContent in frontmatter
            continue;
        } else if (field === 'date') {
            // convert dates with time to ISO String so Hugo can properly Parse
            const d = fieldContent;
            if (d.length > 10) {
                frontMatter.date = new Date(d).toISOString();
            } else {
                frontMatter.date = d;
            }
            continue;
        }
        switch (typeof fieldContent) {
            case 'object':
                if ('sys' in fieldContent) {
                    frontMatter[fieldName] = mapReferenceField(fieldContent);
                }
                // rich text (see rich text function)
                else if ('nodeType' in fieldContent) {
                    frontMatter[fieldName] = mapRichTextField(
                        fieldContent
                    ).richText;
                    frontMatter[`${field}_plaintext`] = mapRichTextField(
                        fieldContent
                    ).plainText;
                }
                // arrays
                else {
                    frontMatter[fieldName] = mapArrayField(fieldContent);
                }
                break;
            default:
                if (isDateField(fieldContent) && fieldContent.length > 10) {
                    // don't convert dates with no time info
                    // i.e. 2021-01-05
                    frontMatter[fieldName] = new Date(
                        fieldContent
                    ).toISOString();
                    break;
                }
                frontMatter[fieldName] = fieldContent;
                break;
        }
    }
    return frontMatter;
};

/**
 *
 * @param {Object} entry
 * @param {String} fieldName
 */
const getMainContent = (
    entry: Entry<any>,
    fieldName: string
): string | null => {
    const mainContentField = entry.fields[fieldName];
    if (
        mainContentField &&
        mainContentField.nodeType &&
        mainContentField.nodeType === 'document'
    ) {
        return richTextToMarkdown(
            mainContentField,
            entry.sys.contentType.sys.id
        );
    }
    if (mainContentField) {
        return mainContentField;
    }
    return null;
};

export {
    mapFields,
    mapArrayField,
    mapReferenceField,
    mapRichTextField,
    getMainContent,
    resolveEntry,
    resolveField,
};
