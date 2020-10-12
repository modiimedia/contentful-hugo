import { checkContentfulSettings } from './index';

test('Check For Contentful Settings In Config', () => {
    const config = {
        contentful: {
            space: 'my-space',
            token: 'my-token',
            previewToken: 'my-preview-token',
            environment: 'preview',
        },
        singleTypes: [],
        repeatableTypes: [
            {
                id: 'some-type-id',
                directory: 'content/pages',
            },
        ],
    };
    const newConfig = checkContentfulSettings(config);
    expect(newConfig.contentful.space).toBe(config.contentful.space);
    expect(newConfig.contentful.token).toBe(config.contentful.token);
    expect(newConfig.contentful.previewToken).toBe(
        config.contentful.previewToken
    );
});
