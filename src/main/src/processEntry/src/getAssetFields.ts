import { Asset, EntryFields } from 'contentful';

export interface AssetObject {
    assetType: string;
    url: string;
    title: string;
    description?: string;
    fileName?: string;
    size?: number | null;
    width?: number | null;
    height?: number | null;
}

const getAssetFields = (
    contentfulObject: EntryFields.Object<Asset>
): AssetObject => {
    const frontMatter: AssetObject = {
        assetType: contentfulObject.fields.file?.contentType || '',
        url: contentfulObject.fields.file?.url || '',
        title: contentfulObject.fields.title || '',
        description: contentfulObject.fields.description || '',
    };
    // get specific details depending on the asset type
    const details = contentfulObject.fields.file?.details;
    if (frontMatter.assetType?.includes('image') && details.image) {
        // image height and width
        frontMatter.width = details.image.width;
        frontMatter.height = details.image.height;
    }
    return frontMatter;
};

export default getAssetFields;
