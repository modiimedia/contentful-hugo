/**
 * @type {import('contentful-hugo').ContentfulHugoConfig}
 */
module.exports = {
    singleTypes: [],
    repeatableTypes: [
        {
            id: 'gallery',
            directory: 'content/galleries',
            isHeadless: true,
        },
        {
            id: 'post',
            directory: 'content/posts',
            type: 'blog',
            mainContent: 'mainContent',
            resolveEntries: [
                {
                    field: 'categories',
                    resolveTo: 'sys.id',
                },
            ],
        },
    ],
};
