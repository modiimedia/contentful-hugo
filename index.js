const contentful = require('contentful');
const yaml = require('js-yaml');
const fs = require('fs');
const mkdirp = require('mkdirp');
const argv = require('yargs').argv;
const richTextToPlain = require('@contentful/rich-text-plain-text-renderer')
	.documentToPlainTextString;

const getAssetFields = require('./src/getAssetFields');
const getEntryFields = require('./src/getEntryFields');
const richTextNodes = require('./src/richTextNodes');
const createFile = require('./src/createFile');
const checkIfFinished = require('./src/checkIfFinished');

require('dotenv').config();

// counter variables
let totalContentTypes = 0;
let typesExtracted = 0;

if (
	process.env.CONTENTFUL_SPACE &&
	(process.env.CONTENTFUL_TOKEN || process.env.CONTENTFUL_PREVIEW_TOKEN)
) {
	initialize();
} else {
	console.log(
		`\nERROR: Environment variables not yet set.\n\nThis module requires the following environmental variables to be set before running:\nCONTENTFUL_SPACE, CONTENTFUL_TOKEN, CONTENTFUL_PREVIEW_TOKEN (optional)\n\nYou can set them using the command line or place them in a .env file.\n`
	);
}

// getting settings from config file
function initialize() {
	const configFile = 'contentful-settings.yaml';
	// check if configFile exist and throw error if it doesn't
	if (fs.existsSync(configFile)) {
		console.log(
			`\n-------------------------------------\n   Pulling Data from Contentful...\n-------------------------------------\n`
		);
		try {
			const config = yaml.safeLoad(
				fs.readFileSync('contentful-settings.yaml')
			);
			// loop through repeatable content types
			const types = config.repeatableTypes;
			if (types) {
				totalContentTypes += types.length;
				for (let i = 0; i < types.length; i++) {
					// object to pass settings into the function
					const contentSettings = {
						typeId: types[i].id,
						directory: types[i].directory,
						isHeadless: types[i].isHeadless,
						fileExtension: types[i].fileExtension,
						titleField: types[i].title,
						dateField: types[i].dateField,
						mainContent: types[i].mainContent,
						type: types[i].type,
					};
					// check file extension settings
					switch (contentSettings.fileExtension) {
						case 'md':
						case 'yaml':
						case 'yml':
						case undefined:
						case null:
							getContentType(1000, 0, contentSettings);
							break;
						default:
							console.log(
								`   ERROR: extension "${contentSettings.fileExtension}" not supported`
							);
					}
				}
			}
			// loop through single content types
			const singles = config.singleTypes;
			if (singles) {
				totalContentTypes += singles.length;
				for (let i = 0; i < singles.length; i++) {
					const single = singles[i];
					const contentSettings = {
						typeId: single.id,
						directory: single.directory,
						fileExtension: single.fileExtension,
						fileName: single.fileName,
						titleField: single.title,
						dateField: single.dateField,
						mainContent: single.mainContent,
						isSingle: true,
						type: single.type,
					};
					switch (contentSettings.fileExtension) {
						case 'md':
						case 'yaml':
						case 'yml':
						case null:
						case undefined:
							getContentType(1, 0, contentSettings);
							break;
						default:
							console.log(
								`   ERROR: extension "${contentSettings.fileExtension}" not supported`
							);
					}
				}
			}
		} catch (e) {
			console.log(e);
		}
	} else {
		console.log(
			`\nConfiguration file not found. Create a file called "contentful-settings.yaml" to get started.\nVisit https://github.com/ModiiMedia/contentful-hugo for configuration instructions\n`
		);
	}
}

/// get content for a single content type ///
// itemsPulled refers to entries that have already been called it's used in conjunction with skip for pagination
function getContentType(limit, skip, contentSettings, itemsPulled) {
	const options = {
		space: process.env.CONTENTFUL_SPACE,
		host: argv.preview ? 'preview.contentful.com' : 'cdn.contentful.com',
		accessToken: argv.preview ? process.env.CONTENTFUL_PREVIEW_TOKEN : process.env.CONTENTFUL_TOKEN
	};
	const client = contentful.createClient(options);

	// check for file extension default to markdown
	if (!contentSettings.fileExtension) {
		contentSettings.fileExtension = 'md';
	}

	client
		.getEntries({
			content_type: contentSettings.typeId,
			limit: limit,
			skip: skip,
			order: 'sys.updatedAt',
		})
		.then(data => {
			// variable for counting number of items pulled
			let itemCount;
			if (itemsPulled) {
				itemCount = itemsPulled;
			} else {
				itemCount = 0;
			}
			// create directory for file
			mkdirp.sync(`.${contentSettings.directory}`);

			for (let i = 0; i < data.items.length; i++) {
				const item = data.items[i];
				const frontMatter = {};
				if (contentSettings.isHeadless) {
					frontMatter.headless = true;
					mkdirp.sync(`.${contentSettings.directory + item.sys.id}`);
				}
				if (contentSettings.type) {
					frontMatter.type = contentSettings.type;
				}
				frontMatter.updated = item.sys.updatedAt;
				frontMatter.createdAt = item.sys.createdAt;
				frontMatter.date = item.sys.createdAt;
				for (const field of Object.keys(item.fields)) {
					if (field === contentSettings.mainContent) {
						// skips to prevent duplicating mainContent in frontmatter
						continue;
					} else if (field === 'date') {
						// convert dates with time to ISO String so Hugo can properly Parse
						const d = item.fields[field];
						if (d.length > 10) {
							frontMatter.date = new Date(d).toISOString();
						} else {
							frontMatter.date = d;
						}
						continue;
					}
					const fieldContent = item.fields[field];
					switch (typeof fieldContent) {
						case 'object':
							if ('sys' in fieldContent) {
								frontMatter[field] = {};
								switch (fieldContent.sys.type) {
									case 'Asset':
										frontMatter[field] = getAssetFields(
											fieldContent
										);
										break;
									case 'Entry':
										frontMatter[field] = getEntryFields(
											fieldContent
										);
										break;
									default:
										frontMatter[field] = fieldContent;
										break;
								}
							}
							// rich text (see rich text function)
							else if ('nodeType' in fieldContent) {
								frontMatter[field] = [];
								frontMatter[
									`${field}_plaintext`
								] = richTextToPlain(fieldContent);
								const nodes = fieldContent.content;
								for (let i = 0; i < nodes.length; i++) {
									frontMatter[field].push(
										richTextNodes(nodes[i])
									);
								}
							}
							// arrays
							else {
								if (!fieldContent.length) {
									frontMatter[field] = fieldContent;
								} else {
									frontMatter[field] = [];
									for (
										let i = 0;
										i < fieldContent.length;
										i++
									) {
										const arrayNode = fieldContent[i];
										switch (typeof arrayNode) {
											case 'object': {
												let arrayObject = {};
												switch (arrayNode.sys.type) {
													case 'Asset':
														arrayObject = getAssetFields(
															arrayNode
														);
														frontMatter[field].push(
															arrayObject
														);
														break;
													case 'Entry':
														arrayObject = getEntryFields(
															arrayNode
														);
														frontMatter[field].push(
															arrayObject
														);
														break;
													default:
														frontMatter[field].push(
															arrayNode
														);
														break;
												}
												break;
											}
											default:
												frontMatter[field].push(
													arrayNode
												);
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

				if (contentSettings.isHeadless) {
					frontMatter.headless = true;
					mkdirp.sync(`.${contentSettings.directory + item.sys.id}`);
				}
				frontMatter.updated = item.sys.updatedAt;
				frontMatter.createdAt = item.sys.createdAt;
				frontMatter.date = item.sys.createdAt;
				for (const field of Object.keys(item.fields)) {
					if (field === contentSettings.mainContent) {
						// skips to prevent duplicating mainContent in frontmatter
						continue;
					} else if (field === 'date') {
						// convert dates with time to ISO String so Hugo can properly Parse
						const d = item.fields[field];
						if (d.length > 10) {
							frontMatter.date = new Date(d).toISOString();
						} else {
							frontMatter.date = d;
						}
						continue;
					}
					const fieldContent = item.fields[field];
					switch (typeof fieldContent) {
						case 'object':
							if ('sys' in fieldContent) {
								frontMatter[field] = {};
								switch (fieldContent.sys.type) {
									case 'Asset':
										frontMatter[field] = getAssetFields(
											fieldContent
										);
										break;
									case 'Entry':
										frontMatter[field] = getEntryFields(
											fieldContent
										);
										break;
									default:
										frontMatter[field] = fieldContent;
										break;
								}
							}
							// rich text (see rich text function)
							else if ('nodeType' in fieldContent) {
								frontMatter[field] = [];
								frontMatter[
									`${field}_plaintext`
								] = richTextToPlain(fieldContent);
								const nodes = fieldContent.content;
								for (let i = 0; i < nodes.length; i++) {
									frontMatter[field].push(
										richTextNodes(nodes[i])
									);
								}
							}
							// arrays
							else {
								if (!fieldContent.length) {
									frontMatter[field] = fieldContent;
								} else {
									frontMatter[field] = [];
									for (
										let i = 0;
										i < fieldContent.length;
										i++
									) {
										const arrayNode = fieldContent[i];
										switch (typeof arrayNode) {
											case 'object': {
												let arrayObject = {};
												switch (arrayNode.sys.type) {
													case 'Asset':
														arrayObject = getAssetFields(
															arrayNode
														);
														frontMatter[field].push(
															arrayObject
														);
														break;
													case 'Entry':
														arrayObject = getEntryFields(
															arrayNode
														);
														frontMatter[field].push(
															arrayObject
														);
														break;
													default:
														frontMatter[field].push(
															arrayNode
														);
														break;
												}
												break;
											}
											default:
												frontMatter[field].push(
													arrayNode
												);
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
				let mainContent = null;
				if (item.fields[contentSettings.mainContent]) {
					mainContent = `${item.fields[contentSettings.mainContent]}`;
				}

				createFile(
					contentSettings,
					item.sys.id,
					frontMatter,
					mainContent
				);
				itemCount++;
			}

			// check total number of items against number of items pulled in API
			if (data.total > data.limit) {
				// run function again if there are still more items to get
				const newSkip = skip + limit;
				getContentType(limit, newSkip, contentSettings, itemCount);
			} else {
				let grammarStuff;
				if (Number(data.total) === 1) {
					grammarStuff = 'item';
				} else {
					grammarStuff = 'items';
				}
				console.log(
					`   ${contentSettings.typeId} - ${itemCount} ${grammarStuff}`
				);
				typesExtracted++;
				if (checkIfFinished(typesExtracted, totalContentTypes)) {
					console.log(`\n-------------------------------------\n`);
				}
			}
		})
		.catch(error => {
			const response = error.response;
			if (response) {
				console.log(
					`   --------------------------\n   ${contentSettings.typeId} - ERROR ${response.status} ${response.statusText}\n   (Note: ${response.data.message})\n   --------------------------`
				);
			} else {
				console.log(error);
			}
		});
}
