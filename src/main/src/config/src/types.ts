export interface ResolveEntryConfig {
    field: string;
    resolveTo: string;
}

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
    fileExtension?: string;
    /**
     * Configs specifying how to resolve asset references and entry references
     */
    resolveEntries?: ResolveEntryConfig[];
}

export interface SingleTypeConfig extends TypeConfig {
    fileName: string;
}

export interface RepeatableTypeConfig extends TypeConfig {
    isHeadless?: boolean;
    isTaxonomy?: boolean;
}

export interface ConfigContentfulSettings {
    space: string;
    token: string;
    previewToken?: string;
    environment: string;
}

export interface ContentfulConfig {
    contentful: ConfigContentfulSettings;
    singleTypes: SingleTypeConfig[];
    repeatableTypes: RepeatableTypeConfig[];
}
