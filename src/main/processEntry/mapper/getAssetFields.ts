import { Asset } from 'contentful';
import { parseField } from './common';

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

const getAssetFields = (contentfulObject: Asset): AssetObject => {
    const frontMatter: AssetObject = {
        assetType: parseField(contentfulObject.fields.file)?.contentType || '',
        url: parseField(contentfulObject.fields.file)?.url || '',
        title: parseField(contentfulObject.fields.title) || '',
        description: parseField(contentfulObject.fields.description) || '',
        size: parseField(contentfulObject.fields.file)?.details.size,
        width: parseField(contentfulObject.fields.file)?.details.image?.width,
        height: parseField(contentfulObject.fields.file)?.details.image?.height,
    };
    return frontMatter;
};

export default getAssetFields;
