const getAssetFields = require('./getAssetFields');

const imageAsset = {
    fields: {
        title: 'My Example Image',
        description: 'This is a example image for testing purposes',
        file: {
            contentType: 'image/jpeg',
            url: 'https://source.unsplash.com/200x200',
            details: {
                image: {
                    width: 200,
                    height: 200,
                },
            },
        },
    },
};

test('Image Assets', () => {
    const asset = getAssetFields(imageAsset);
    expect(asset.assetType).toBe(imageAsset.fields.file.contentType);
    expect(asset.title).toBe(imageAsset.fields.title);
    expect(asset.description).toBe(imageAsset.fields.description);
    expect(asset.height).toBe(imageAsset.fields.file.details.image.height);
    expect(asset.width).toBe(imageAsset.fields.file.details.image.width);
    expect(asset.url).toBe(imageAsset.fields.file.url);
});
