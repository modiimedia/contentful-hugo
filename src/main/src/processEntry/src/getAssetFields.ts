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

/**
 *
 * @param {Object} contentfulObject
 * @param {Object} contentfulObject.sys
 * @param {Object} contentfulObject.fields
 */
const getAssetFields = (
    contentfulObject: EntryFields.Object<Asset>
): AssetObject => {
    let assetType = '';
    if (contentfulObject.fields.file) {
        assetType = contentfulObject.fields.file.contentType;
    }
    const frontMatter: AssetObject = {
        assetType,
        url: contentfulObject.fields.file.url,
        title: contentfulObject.fields.title,
        description: contentfulObject.fields.description,
    };
    // get specific details depending on the asset type
    const details = contentfulObject.fields.file.details;
    if (assetType.includes('image') && details.image) {
        // image height and width
        frontMatter.width = details.image.width;
        frontMatter.height = details.image.height;
    }
    return frontMatter;
};

export default getAssetFields;
