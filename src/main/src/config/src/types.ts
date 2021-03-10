export interface ResolveEntryConfig {
    field: string;
    resolveTo: string;
}

export interface OverrideConfig {
    field: string;
    options: {
        /**
         * Overrides the fieldname
         */
        fieldName?: string;
        /**
         * Transforms the value of the field.
         */
        valueTransformer?: (fieldValue: unknown) => unknown;
    };
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
    // title?: string;
    // dateField?: string;
    /**
     * The field that will act as the main content of the .md file
     */
    mainContent?: string;
    fileExtension?: fileExtension;
    /**
     * Options specifying how to resolve asset references and entry references
     */
    resolveEntries?: ResolveEntryConfig[];
    /**
     * Options that allow you to override field names and modify field values before rendering the content file
     */
    overrides?: OverrideConfig[];
    filters?: { [key: string]: string | number | boolean };
    ignoreLocales?: boolean;
}

export interface SingleTypeConfig extends TypeConfig {
    fileName: string;
}

export interface RepeatableTypeConfig extends TypeConfig {
    isHeadless?: boolean;
    isTaxonomy?: boolean;
    fileName?: string;
}

export interface ConfigContentfulSettings {
    space: string;
    token: string;
    previewToken?: string;
    environment: string;
}

export type LocaleConfig = { code: string; mapTo: string };

export interface ContentfulConfig {
    locales: (string | LocaleConfig)[];
    contentful: ConfigContentfulSettings;
    singleTypes: SingleTypeConfig[];
    repeatableTypes: RepeatableTypeConfig[];
}
