module.exports = {
    contentful: {
        space: 'some-space-id', // pulls from .env variable CONTENTFUL_SPACE if not specified
        token: 'some-access-token', // pulls from .env variable CONTENTFUL_TOKEN if not specified
        previewToken: 'some-preview-token', // pulls from .env variable CONTENTFUL_PREVIEW_TOKEN if not specified
        environment: 'master',
    },
    singleTypes: [
        {
            id: 'homepage',
            directory: 'content',
            fileName: '_index',
        },
        {
            id: 'mainMenu',
            directory: 'data',
            fileName: 'mainMenu',
            fileExtension: 'yaml',
        },
        {
            id: 'footerMenu',
            directory: 'data',
            fileName: 'footerMenu',
            fileExtension: 'yaml',
        },
    ],
    repeatableTypes: [
        {
            id: 'post',
            directory: 'content/posts',
            mainContent: 'postBody',
            resolveEntries: [
                {
                    field: 'categories',
                    resolveTo: 'sys.id',
                },
                {
                    field: 'featuredImage',
                    resolveTo: 'fields.file.url',
                },
            ],
        },
        {
            id: 'gallery',
            directory: 'content/galleries',
            isHeadless: true,
        },
        {
            id: 'page',
            directory: 'content',
        },
    ],
};
