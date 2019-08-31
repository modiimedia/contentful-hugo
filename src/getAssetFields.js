module.exports = (contentfulObject) => {
    let frontMatter = {}
    let assetType = '';
    if (contentfulObject.fields.file){
        assetType = contentfulObject.fields.file.contentType
    }
    frontMatter.assetType = assetType
    frontMatter.url = contentfulObject.fields.file.url
    frontMatter.title = contentfulObject.fields.title
    frontMatter.description = contentfulObject.fields.description
    
    // get specific details depending on the asset type
    let details = contentfulObject.fields.file.details
    if (assetType.includes("image")){
        // image height and width
        frontMatter.width = details.image.width;
        frontMatter.height = details.image.height;
    }
    return frontMatter
}