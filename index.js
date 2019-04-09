const contentful = require('contentful');
const yaml = require('js-yaml');
const YAML = require('json-to-pretty-yaml')
const fs = require('fs');
const mkdirp = require('mkdirp')
require('dotenv').config();
let totalContentTypes = 0;
let typesExtracted = 0

if (process.env.CONTENTFUL_SPACE && process.env.CONTENTFUL_TOKEN) {
    initialize();  
} else {
    console.log(`\nERROR: Environment variables not yet set.\n\nThis module requires the following environmental variables to be set before running:\nCONTENTFUL_SPACE, CONTENTFUL_TOKEN\n\nYou can set them using the command line or place them in a .env file.\n`)
}

// getting settings from config file
function initialize(){
    let configFile = 'contentful-settings.yaml'
    // check if configFile exist and throw error if it doesn't
    if(fs.existsSync(configFile)){
        console.log(`\n\n-------------------------------------\n   Pulling Data from Contentful...\n-------------------------------------\n`)
        try {
            let config = yaml.safeLoad(fs.readFileSync('contentful-settings.yaml'));
            // loop through repeatable content types
            let types = config.repeatableTypes
            if(types){
                totalContentTypes += types.length
                for(let i = 0; i < types.length; i++){
                    // object to pass settings into the function
                    let contentSettings = {
                        typeId: types[i].id,
                        directory: types[i].directory,
                        isHeadless: types[i].isHeadless,
                        fileExtension: types[i].fileExtension,
                        titleField: types[i].title,
                        dateField: types[i].dateField,
                        mainContent: types[i].mainContent
                    }
                    // check file extension settings
                    switch(contentSettings.fileExtension){
                        case 'md':
                        case 'yaml':
                        case 'yml':
                        case undefined:
                        case null:
                            getContentType(1000, 0, contentSettings);
                            break;
                        default:
                            console.log(`ERROR: file extension "${contentSettings.fileExtension}" not supported`);
                            break;
                    }
                }
            }
            // loop through single content types
            let singles = config.singleTypes
            if (singles){
                totalContentTypes += singles.length
                for (let i = 0; i < singles.length; i++){
                    let single = singles[i]
                    let contentSettings = {
                        typeId: single.id,
                        directory: single.directory,
                        fileExtension: single.fileExtension,
                        fileName: single.fileName,
                        titleField: single.title,
                        dateField: single.dateField,
                        mainContent: single.mainContent,
                        isSingle: true
                    }
                    switch(contentSettings.fileExtension){
                        case 'md':
                        case 'yaml':
                        case 'yml':
                        case null:
                        case undefined:
                            getContentType(1, 0, contentSettings);
                            break;
                        default:
                            console.log(`ERROR: file extension "${contentSettings.fileExtension}" not supported`);
                            break;
                    }
                }
            }
        } catch (e) {
            console.log(e)
        }
    } else {
    console.log(`\nConfiguration file not found. Create a file called "contentful-settings.yaml" to get started.\n`)
    }
}

/// get content for a single content type ///
// itemsPulled refers to entries that have already been called it's used in conjunction with skip for pagination
function getContentType(limit, skip, contentSettings, itemsPulled){
    
    let client = contentful.createClient({
        space: process.env.CONTENTFUL_SPACE,
        accessToken: process.env.CONTENTFUL_TOKEN
    });

    // check for file extension default to markdown
    if(!contentSettings.fileExtension){
        contentSettings.fileExtension = 'md'
    }

    client.getEntries({
        content_type: contentSettings.typeId,
        limit: limit,
        skip: skip,
        order: 'sys.updatedAt'
    })
    .then((data) => {
        // variable for counting number of items pulled
        let itemCount;
        if (itemsPulled){
            itemCount = itemsPulled;
        } else {
            itemCount = 0;
        }
        // create directory for file
        mkdirp.sync(`.${contentSettings.directory}`)
        
        for(let i = 0; i < data.items.length; i++){
            let item = data.items[i];
            let fileContent = '';
            let frontMatter = {};
            if(contentSettings.fileExtension === 'md' || contentSettings.fileExtension == null || contentSettings.fileExtension == undefined) {
                fileContent += `---\n`
            }
            if (contentSettings.isHeadless) {
                frontMatter.headless = true
                mkdirp.sync(`.${contentSettings.directory + item.sys.id}`)
            }
            frontMatter.updated = item.sys.updatedAt; 
            frontMatter.createdAt = item.sys.createdAt;
            frontMatter.date = item.sys.createdAt;
            for(let field of Object.keys(item.fields)) {
                if (field === contentSettings.mainContent){
                    continue;
                }
                let fieldContent = item.fields[field]
                switch (typeof(fieldContent)){
                    case 'object':
                        if ('sys' in fieldContent){
                            frontMatter[field] = {}
                            switch (fieldContent.sys.type){
                                case 'Asset':
                                    getAssetFields(fieldContent, frontMatter[field]);
                                    break;
                                case 'Entry':
                                    getEntryFields(fieldContent, frontMatter[field]);
                                    break;
                                default:
                                    frontMatter[field] = fieldContent;
                                    break;
                            }
                        } 
                        // rich text (see rich text function)
                        else if ('nodeType' in fieldContent) {
                            frontMatter[field] = []
                            let nodes = fieldContent.content
                            for(let i = 0; i < nodes.length; i++){
                                richTextNodes(nodes[i], frontMatter[field]);
                            }

                        } 
                        // arrays
                        else {
                            if (!fieldContent.length) {
                                frontMatter[field] = fieldContent
                            } else {
                                frontMatter[field] = []
                                for(let i = 0; i < fieldContent.length; i++) {
                                    let arrayNode = fieldContent[i];
                                    switch(typeof(arrayNode)){
                                        case 'object':
                                            let arrayObject = {}
                                            switch(arrayNode.sys.type){
                                                case 'Asset':
                                                    getAssetFields(arrayNode, arrayObject)
                                                    frontMatter[field].push(arrayObject)
                                                    break;
                                                case 'Entry':
                                                    getEntryFields(arrayNode, arrayObject)
                                                    frontMatter[field].push(arrayObject);
                                                    break;
                                                default:
                                                    frontMatter[field].push(arrayNode);
                                                    break;
                                            }
                                            break;
                                        default:
                                            frontMatter[field].push(arrayNode);
                                            break;
                                    }
                                }
                            }
                        }
                        break;
                    default:
                        frontMatter[field] = item.fields[field];
                        break;
                }
            }
            
            // add current item to filecontent
            fileContent += YAML.stringify(frontMatter)
            if(contentSettings.fileExtension != 'yaml' || contentSettings.fileExtension != 'yml'){
                fileContent += `---\n`
            }

            // if set add the main content below the front matter
            if (item.fields[contentSettings.mainContent]) {
                fileContent += `${item.fields[contentSettings.mainContent]}`
            }

            // create file
            if (contentSettings.isHeadless) {
                fs.writeFile(`.${contentSettings.directory}${item.sys.id}/index.${contentSettings.fileExtension}`, fileContent, (error) => {
                    if(error) {
                        console.log(error)}
                    }
                )
            } else if (contentSettings.isSingle) {
                fs.writeFile(`.${contentSettings.directory}/${contentSettings.fileName}.${contentSettings.fileExtension}`, fileContent, (error) => {
                    if(error) {
                        console.log(error)
                    }
                })
            } else {
                fs.writeFile(`.${contentSettings.directory}${item.sys.id}.${contentSettings.fileExtension}`, fileContent, (error) => { 
                    if (error) {
                        console.log(error)
                    }
                })
            }
            itemCount++
        }
        
        // check total number of items against number of items pulled in API
        if(data.total > data.limit){
            // run function again if there are still more items to get
            let newSkip = skip + limit
            getContentType(limit, newSkip, contentSettings, itemCount)
        } else {
            let grammarStuff
            if (data.total == 1) {
                grammarStuff = "item";
            } else { 
                grammarStuff = "items";
            }
            console.log(`   ${contentSettings.typeId} - ${itemCount} ${grammarStuff}`)
            typesExtracted++
            checkIfFinished(typesExtracted);
        }

    })
    .catch((error) => {
        let response = error.response
        console.log(`   --------------------------\n   ${contentSettings.typeId} - ERROR ${response.status} ${response.statusText}\n   (Note: ${response.data.message})\n   --------------------------`)
    })
}

// function to pull a referenced asset
function getAssetFields(contentfulObject, frontMatter){
    let assetType = contentfulObject.fields.file.contentType
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
}

// function to pull a referenced entry
function getEntryFields(entry, frontMatter){
    frontMatter.id = entry.sys.id;
    frontMatter.contentType = entry.sys.contentType.sys.id;
}

// function for rich text
// support for asset-hyperlink and entry-hyperlink needs to be added.
function richTextNodes(node, frontMatter){
    let object = {}
    object.nodeType = node.nodeType
    for(let field of Object.keys(node)){
        switch(field){
            case 'data':
                object[field] = {}
                if (typeof(node[field]) === 'object'){
                    if(node[field].target){
                        let t = node[field].target
                        if (t.sys){
                            switch(t.sys.type){
                                case 'Asset':
                                    getAssetFields(t, object[field]);
                                    break;
                                case 'Entry':
                                    getEntryFields(t, object[field]);
                                    break;
                            }
                        }
                    } else {
                        object[field] = node[field]
                    }
                };
                break;
            case 'content':
                object[field] = []
                let content = node[field]
                for(let contentNode of Object.keys(content)){
                    let nodeType = content[contentNode].nodeType
                    switch(nodeType){
                        case "embedded-entry-inline":
                            let entry = {}
                            entry.nodeType = nodeType
                            getEntryFields(content[contentNode].data.target, entry);
                            object[field].push(entry)
                            break;
                        default:
                            // support for asset-hyperlinks and entry-hyperlinks needs to be asset here
                            // probably need to create a "richTextContent" function.
                            // The issue is mainly when an entry references itself or another entry that references it. It will just keep looping and looping.
                            // Function needs to check for entry or asset and only get the id and content type (url for assets) then otherwise just added nested content to object.
                            // If the key "content" exists then it needs to run the function again with the nested content object and keep doing it until it gets everything
                            object[field].push(content[contentNode])
                            break;  
                    }
                }
                break;
            default:
                object[field] = node[field];
                break;
        }
    }
    frontMatter.push(object)
}

function checkIfFinished(num){
    if(num === totalContentTypes){
        console.log(`\n-------------------------------------\n\n`)
    }
}