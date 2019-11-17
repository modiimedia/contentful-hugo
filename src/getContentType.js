const contentful = require('contentful');
const richTextToPlain = require('@contentful/rich-text-plain-text-renderer')
	.documentToPlainTextString;
const fs = require('fs');
const mkdirp = require('mkdirp');

const getAssetFields = require('./getAssetFields');
const getEntryFields = require('./getEntryFields');
const richTextNodes = require('./richTextNodes');
// const YAML = require('json-to-pretty-yaml');

function getContentType(
	contentfulSpace,
	contentfulToken,
	limit,
	skip,
	contentSettings,
	itemsPulled
) {
	const client = contentful.createClient({
		space: contentfulSpace,
		accessToken: contentfulToken,
	});

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
				let fileContent = '';
				const frontMatter = {};
				if (
					contentSettings.fileExtension === 'md' ||
					contentSettings.fileExtension === null ||
					contentSettings.fileExtension === undefined
				) {
					fileContent += `---\n`;
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

				// add current item to filecontent
				fileContent += YAML.stringify(frontMatter);
				if (
					contentSettings.fileExtension !== 'yaml' ||
					contentSettings.fileExtension !== 'yml'
				) {
					fileContent += `---\n`;
				}

				// if set add the main content below the front matter
				if (item.fields[contentSettings.mainContent]) {
					fileContent += `${
						item.fields[contentSettings.mainContent]
					}`;
				}

				// create file
				if (contentSettings.isHeadless) {
					fs.writeFile(
						`.${contentSettings.directory}${item.sys.id}/index.${contentSettings.fileExtension}`,
						fileContent,
						error => {
							if (error) {
								console.log(error);
							}
						}
					);
				} else if (contentSettings.isSingle) {
					fs.writeFile(
						`.${contentSettings.directory}/${contentSettings.fileName}.${contentSettings.fileExtension}`,
						fileContent,
						error => {
							if (error) {
								console.log(error);
							}
						}
					);
				} else {
					fs.writeFile(
						`.${contentSettings.directory}${item.sys.id}.${contentSettings.fileExtension}`,
						fileContent,
						error => {
							if (error) {
								console.log(error);
							}
						}
					);
				}
				itemCount++;
			}

			// check total number of items against number of items pulled in API
			if (data.total > data.limit) {
				// run function again if there are still more items to get
				const newSkip = skip + limit;
				getContentType(
					contentfulSpace,
					contentfulToken,
					limit,
					newSkip,
					contentSettings,
					itemCount
				);
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
				// typesExtracted++;
				// checkIfFinished(typesExtracted);
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

module.exports = getContentType;
