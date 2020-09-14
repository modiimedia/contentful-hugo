const { mapArrayField } = require('./mapper');

const assetFactory = (
    title,
    description,
    url,
    fileName,
    assetType,
    width,
    height,
    size
) => {
    const asset = {
        sys: {
            id: '12345',
            type: 'Asset',
        },
        fields: {
            title,
            description,
            file: {
                url,
                fileName,
                contentType: assetType,
                details: {
                    size,
                    image: assetType.includes('image')
                        ? {
                              width,
                              height,
                          }
                        : null,
                },
            },
        },
    };
    return asset;
};

describe('Array Fields', () => {
    test('Simple Array', () => {
        const arrayContent = ['dog', 'cat', 'duck'];
        const fieldValue = mapArrayField(arrayContent);
        expect(fieldValue[0]).toBe('dog');
        expect(fieldValue[2]).toBe('duck');
    });
    test('Array of Assets', () => {
        const asset1 = assetFactory(
            'Some Image',
            'Some Image Description',
            'https://source.unsplash.com',
            'some-image-1.png',
            'image/png',
            1200,
            1200
        );
        const asset2 = assetFactory(
            'Some Image 2',
            'Some Image Description 2',
            'https://source.unsplash.com',
            'some-image-2.jpg',
            'image/jpeg',
            100,
            100
        );
        const array = [asset1, asset2];
        const fieldValue = mapArrayField(array);
        expect(fieldValue[0].assetType).toBe('image/png');
        expect(fieldValue[0].width).toBe(1200);
        expect(fieldValue[1].assetType).toBe('image/jpeg');
        expect(fieldValue[1].width).toBe(100);
    });
});
