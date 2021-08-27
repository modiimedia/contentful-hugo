/* eslint-disable @typescript-eslint/no-explicit-any */
import { documentToPlainTextString as richTextToPlain } from '@contentful/rich-text-plain-text-renderer';
import { Asset, Entry } from 'contentful';
import { ResolveEntryConfig } from '@/main/config';
import getEntryFields from './getEntryFields';
import getAssetFields from './getAssetFields';
import richTextToMarkdown from './richTextToMarkdown';
import richTextNodes from './richTextNodes';
import { CustomFieldsConfig, OverrideConfig } from '../../config/types';
import getAppendableFields from './getCustomFields';

const mapArrayField = (
    fieldContent: Entry<any>[] | Asset[] | string[] | { [key: string]: any }[]
): any[] => {
    if (!fieldContent.length) {
        return [];
    }
    const array: any[] = [];
    for (let i = 0; i < fieldContent.length; i++) {
        const arrayNode = fieldContent[i];
        switch (typeof arrayNode) {
            case 'object':
                if (arrayNode?.sys) {
                    switch (arrayNode.sys.type) {
                        case 'Asset':
                            array.push(getAssetFields(arrayNode as Asset));
                            break;
                        case 'Entry':
                            array.push(getEntryFields(arrayNode as Entry<any>));
                            break;
                        default:
                            array.push(arrayNode);
                            break;
                    }
                } else {
                    array.push(arrayNode);
                }
                break;
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
    overrides?: OverrideConfig[],
    customFields: CustomFieldsConfig = {}
): any => {
    const frontMatter: { [key: string]: any } = {};
    // set default fields
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
    frontMatter.date = entry.sys.createdAt;

    // loop through every field and add it to frontmatter
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
                    frontMatter[fieldName] =
                        mapRichTextField(fieldContent).richText;
                    frontMatter[`${field}_plaintext`] =
                        mapRichTextField(fieldContent).plainText;
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

    // add appendable fields if they exist
    const fieldsToAppend = getAppendableFields(customFields, entry);
    Object.keys(fieldsToAppend).forEach((key) => {
        frontMatter[key] = fieldsToAppend[key];
    });

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
        return `\n${mainContentField}`;
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
