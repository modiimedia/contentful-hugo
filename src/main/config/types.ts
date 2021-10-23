import { Entry } from 'contentful';

export interface ResolveEntryConfig {
    field: string;
    resolveTo: string;
}

export interface ResolveEntryConfigMap {
    [field: string]: string;
}

export interface OverrideConfig {
    field: string;
    options: {
        /**
         * Overrides the fieldname
         */
        fieldName?: string;
        /**
         * Method that transforms the value of the field.
         */
        valueTransformer?: (fieldValue: unknown) => unknown;
    };
}

export interface OverrideConfigMap {
    [fieldName: string]: OverrideConfig['options'];
}

export interface CustomFieldsConfig {
    [fieldName: string]: unknown | ((entry: Entry<unknown>) => unknown);
}

type fileExtensionBase = 'md' | 'yaml' | 'yml';

// produced a "Maximum call stack size exceeded" error
// probably a problem with Typescript, will try again on future TS versions
// export type fileExtension =
//     | `${string}.${fileExtensionBase}`
//     | fileExtensionBase;

export type fileExtension = fileExtensionBase | string;

export interface TypeConfig {
    /**
     * Contentful content type ID
     */
    id: string;
    /**
     * Directory where entries will be placed
     */
    directory: string;
    type?: string;
    /**
     * The field that will act as the main content of the .md file
     */
    mainContent?: string;
    fileExtension?: fileExtension;
    /**
     * Options specifying how to resolve asset references and entry references
     */
    resolveEntries?: ResolveEntryConfig[] | ResolveEntryConfigMap;
    /**
     * Options that allow you to override field names and modify field values before rendering the content file.
     */
    overrides?: OverrideConfig[] | OverrideConfigMap;
    /**
     * Object of Contentful search filters. See https://www.contentful.com/developers/docs/references/content-delivery-api/#/reference/search-parameters.
     */
    filters?: { [key: string]: string | number | boolean };
    ignoreLocales?: boolean;
    customFields?: CustomFieldsConfig;
}

export interface SingleTypeConfig extends TypeConfig {
    fileName: string;
}

export interface RepeatableTypeConfig extends TypeConfig {
    isHeadless?: boolean;
    isTaxonomy?: boolean;
    /**
     * Entry property that will dictate the filename. Default is "sys.id".
     */
    fileName?: string;
}

export interface ConfigContentfulSettings {
    /**
     * Contentful Space ID
     */
    space: string;
    /**
     * Contentful Content Delivery Token
     */
    token: string;
    /**
     * Contentful Content Preview Token
     */
    previewToken?: string;
    /**
     * Contentful environment ID
     */
    environment: string;
}

export type LocaleConfig = {
    /**
     * The Locale Code (Ex: en-US). This is case sensitive.
     */
    code: string;
    mapTo: string;
};

export type StaticContentConfig = {
    inputDir: string;
    outputDir: string;
};

export interface ContentfulHugoConfig {
    locales: (string | LocaleConfig)[];
    contentful: ConfigContentfulSettings;
    singleTypes: SingleTypeConfig[];
    repeatableTypes: RepeatableTypeConfig[];
    staticContent: StaticContentConfig[];
}

export const getResolveEntryConfigs = (
    data?: TypeConfig['resolveEntries']
): ResolveEntryConfig[] => {
    if (Array.isArray(data)) {
        return data;
    }
    if (typeof data === 'object') {
        const configs: ResolveEntryConfig[] = [];
        Object.keys(data).forEach((key) => {
            configs.push({
                field: key,
                resolveTo: data[key],
            });
        });
        return configs;
    }
    return [];
};

export const getOverrideConfigs = (
    data?: TypeConfig['overrides']
): OverrideConfig[] => {
    if (Array.isArray(data)) {
        return data;
    }
    if (typeof data === 'object') {
        const configs: OverrideConfig[] = [];
        Object.keys(data).forEach((key) => {
            configs.push({
                field: key,
                options: data[key],
            });
        });
        return configs;
    }
    return [];
};
