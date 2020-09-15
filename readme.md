# Contentful Hugo

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/281eacf31e864217953437f66b7e3a72)](https://www.codacy.com/app/joshmossas/contentful-hugo?utm_source=github.com&utm_medium=referral&utm_content=ModiiMedia/contentful-hugo&utm_campaign=Badge_Grade)

This is a simple Node.js CLI tool that pulls data from Contentful CMS and turns it into Markdown or YAML files for use with a static site generator. It can be used with any static site generator that uses Markdown with YAML frontmatter, but it has some features that are specific to [Hugo](https://gohugo.io).

## Table of Contents

-   [Prerequisites](#Prerequisites)
-   [Installation](#Installation)
-   [Usage](#Usage)
-   [Configuration](#Configuration)
-   [Expected Output](#Expected-Output)
    -   [Standard Fields](#Default-Date-and-Time-Fields)
    -   [Richtext Fields](#Rich-Text-As-Main-Content)
    -   [Resolving Reference Fields](#The-Resolve-Entries-Parameter)
-   [Known Issues](#Known-Issues)

## Prerequisites

Install [Node.js](https://nodejs.org)

## Installation

with NPM

```powershell
npm install contentful-hugo
```

with Yarn

```powershell
yarn add contentful-hugo
```

## Usage

### Terminal Commands

Complete [configuration](#configuration) then run the following command(s) in the terminal

#### When Installed Globally

```powershell
## initialize the directory
contentful-hugo --init

## fetch from contentful
contentful-hugo
```

#### When Installed Locally

```powershell
npx contentful-hugo --init
npx contentful-hugo
```

### Flags

| flag      | aliases | description                                                                                              |
| --------- | ------- | -------------------------------------------------------------------------------------------------------- |
| --init    |         | Initialize the directory. Generates a config file and default shortcodes for Contentful rich text fields |
| --preview | -P      | Runs in preview mode, which pulls both published and unpublished entries from Contentful                 |
| --wait    | -W      | Wait for the specified number of milliseconds before pulling data from Contentful.                       |
| --config  | -C      | Specific the path to a config file.                                                                      |

#### Preview Mode Example

```powershell
contentful-hugo --preview
```

#### Multiple Flags Example

```powershell
contentful-hugo --wait=2000 --preview --config="my_custom_config.js"
```

### Example Package.json

```JSON
{
  "name": "my-hugo-project",
  "scripts": {
    "prestart": "contentful-hugo",
    "start": "hugo server",
    "prebuild": "contentful-hugo",
    "build": "hugo --minify"
  }
}
```

In this example when you run `npm start` it will first use contentful-hugo to pull Contentful data then start hugo server. In the same way when you do the command `npm run build` it will first use contentful-hugo to pull Contentful data then run `hugo --minify` to build a minified version of your hugo site.

### Error Messages

Trying to use this package before completing configuration will return an error in the console

![Environment Variables not set](https://raw.githubusercontent.com/ModiiMedia/contentful-hugo/master/images/environment-variables-missing.jpg)

![Config file not found](https://raw.githubusercontent.com/ModiiMedia/contentful-hugo/master/images/config-file-not-found.jpg)

## Configuration

### Environment Variables

Before using you must first set the following environment variables. CONTENTFUL_SPACE, and CONTENTFUL_TOKEN. You can also add the CONTENTFUL_PREVIEW_TOKEN variable to use the --preview flag.

This can be done with a **.env** file in the root directory of your project.

```TOML
CONTENTFUL_SPACE = '<space-id>'
CONTENTFUL_TOKEN = '<content-accessToken>'

# optional but required for preview mode
CONTENTFUL_PREVIEW_TOKEN = '<preview-accessToken>'
```

You can also declare the environment variables in the command line

**Powershell:**

```powershell
$env:CONTENTFUL_SPACE="<contentful_space_id>"
$env:CONTENTFUL_TOKEN="<contentful_acessToken>"
$env:CONTENTFUL_PREVIEW_TOKEN="<contentful_preview_accessToken>"
```

**Bash:**

```bash
export CONTENTFUL_SPACE="<contentful_space_id>"
export CONTENTFUL_TOKEN="<contentful_accessToken>"
export CONTENTFUL_PREVIEW_TOKEN="<contentful_preview_accessToken>"
```

### Config File

In order to pull the data you want you will need to create a config file in the root of your repository. Contentful-hugo by default will search for the following files as a config.

-   `contentful-hugo.config.js`
-   `contentful-hugo.config.yaml`
-   `contentful-hugo.yaml`
-   `contentful-settings.yaml`

You can also specify a custom config file using the `--config` flag. (Javascript or YAML config files are the only currently accepted filetypes)

#### Example Javascript Config

```javascript
// contentful-hugo.config.js

module.exports = {
    singleTypes: [
        {
            id: 'homepage',
            directory: 'content',
            fileName: '_index',
            fileExtension: 'md',
        },
        {
            id: 'siteSettings',
            directory: 'data',
            fileName: 'settings',
            fileExtension: 'yaml',
        },
    ],
    repeatableTypes: [
        {
            id: 'posts',
            directory: 'content/posts',
            fileExtension: 'md',
            mainContent: 'content',
            resolveEntries: [
                {
                    field: 'categories',
                    resolveTo: 'fields.slug',
                },
                {
                    field: 'author',
                    resolveTo: 'fields.name',
                },
            ],
        },
        {
            id: 'seoFields',
            isHeadless: true,
            directory: 'content/seo-fields',
        },
        {
            id: 'reviews',
            directory: 'content/reviews',
            mainContent: 'reviewBody',
        },
    ],
};
```

#### Example YAML Config

```yaml
# contentful-hugo.config.yaml

singleTypes:
    # fetches only the most recently updated entry in a particular content type
    # Generated file will be named after the fileName setting
    - id: homepage
      directory: content
      fileName: _index
      fileExtension: md

      # this will generate a file named "_index.md" in the "content" directory
    - id: siteSettings
      directory: data
      fileName: settings
      fileExtension: yaml
      # this will generate a file named settings.yaml in the "data" directory

repeatableTypes:
    # fetches all the entries of a content type and places them in a directory.
    # Generated files will be named after their Entry ID in Contentful.
    - id: posts
      directory: content/posts
      fileExtension: md
      mainContent: content
      resolveEntries: # resolves a reference or asset field to a specific property
          - field: categories
            resolveTo: fields.slug
          - field: author
            resolveTo: fields.name

    - id: seoFields
      isHeadless: true
      directory: content/seo-fields

    - id: reviews
      directory: content/reviews
      mainContent: reviewBody

    - id: staff
      isHeadless: true
      directory: content/staff
```

#### **Config File Options**

| field          | required                         | description                                                                                                                                          |
| -------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| id             | required                         | contentful content type ID goes here                                                                                                                 |
| directory      | required                         | directory where you want the file(s) to be generated                                                                                                 |
| fileName       | required (single types only)     | name of the file generated                                                                                                                           |
| fileExtension  | optional                         | can be "md", "yml", or "yaml" (defaults to "md")                                                                                                     |
| isHeadless     | optional (repeatable types only) | turns all entries in a content type into headless leaf bundles (see [hugo docs](https://gohugo.io/content-management/page-bundles/#headless-bundle)) |
| mainContent    | optional                         | field ID for field you want to be the main Markdown content. (Does not work with rich text fields)                                                   |
| type           | optional                         | Allows a type to be set enabling a different layout to be used (see [hugo docs](https://gohugo.io/content-management/types/))                        |
| resolveEntries | optional                         | resolve the specified reference fields and/or asset fields to one of it's properties specified with the `resolveTo` parameter                        |

## Expected Output

Files will be generated in the directory specified in the **contentful-settings.yaml** file. Front matter will be in YAML format. Files of single types will be named after fileName specified in the config file. Files of repeatable types will be named after their entry ID in Contenful, which makes it easy to link files together.

### Default Date and Time Fields

The following fields will always appear in your frontmatter:

```yaml
updated: # the last time this entry was update in Contentful
createdAt: # when the entry was created in Contentful
date: # defaults to creation date unless you have a field with the id "date" then it get's overwritten
```

### Asset Information

Assets like images and videos come with some extra information that makes it easy to implement things like alt text or layouts that rely on knowing the image dimensions. The fields are as follows:

```yaml
assetFieldName:
    assetType: # indicates the asset type such as "image" "video" "audio" ect.
    url: # url of the asset
    title: # title of the asset written in Contentful
    description: # description of the asset written in Contentful
    width: # width of the asset (images only)
    height: # height of the asset (images only )
```

If you're using Hugo you can access the information like below:

```html
<img
    src="{{ .Params.assetFieldName.url }}"
    width="{{ .Params.assetFieldName.width }}"
/>
```

This same information will also appear in asset arrays like a gallery:

```yaml
myGallery:
    - assetType: 'image/jpg'
      url: '//link-to-image.jpg'
      title: 'Image 1'
      description: 'Image 1 Description'
      width: 500
      height: 500
    - assetType: 'image/jpg'
      url: '//link-to-image-2.jpg'
      title: 'Image 2'
      description: 'Image 2 Description'
      width: 1920
      height: 1080
```

### Entries

Linked entries will include fields for it's id and it's content type id.

```yaml
linkedEntry:
    id: <contentful-entry-id>
    typeId: <content-type-ID>

#example with array of linked entries

relatedArticles:
    - id: '41UFfIhszbS1kh95bomMj7'
      typeId: 'articles'
    - id: '85UFfIhsacS1kh71bpqMj7'
      typeId: 'articles'
```

All files are named after their entry id in Contentful making it easy to retrieve it using .Site.GetPage in Hugo

```go
{{ with .Site.GetPage "<path-to-file>/<entry-id>.md" }}
    {{ .Title }}
{{ end }}
```

### Rich Text As Main Content

A rich text field that is set as the "mainContent" for a content type will be rendered as markdown for Hugo.

Dynamic content such as `embedded-entry-blocks` are rendered as shortcodes with parameters included that can be used to fetch the necessary data.

```md
<!-- example embedded entry -->
<!-- you can use the id, contentType, and parentContentType parameters to fetch the desired data -->

{{< contentful-hugo/embedded-entry id="nTLo2ffSJJp5QrnrO5IU9" contentType="gallery" parentContentType="post" >}}
```

Before fetching rich text data make sure you have run `contentful-hugo --init` so that you will have all the rich text shortcodes. Once you have these shortcodes you can extend and modify them to suit your needs.

The list of rich text short codes includes:

-   contentful-hugo/asset-hyperlink.html
-   contentful-hugo/embedded-asset.html
-   contentful-hugo/embedded-entry.html
-   contentful-hugo/entry-hyperlink.html
-   contentful-hugo/inline-entry.html

By default the richtext short codes will show a notification for an unconfigured item.

![Unconfigured Embedded Entry Block](images/unconfigured-embedded-entry-block.jpg)

You can customize them by navigating to `layouts/shortcodes/contentful-hugo/{shortcode-name}.html`

### Rich Text In FrontMatter

A Rich text field will produce nested arrays mirroring the JSON structure that they have in the API. Each node will need to be looped through and produce HTML depending on the nodeType field.

```yaml
richTextField:
    - nodeType: 'paragraph'
      data: {}
      content:
          - data: {}
            marks: []
            value: 'This is a simple paragraph.'
            nodeType: 'text'
    - nodeType: 'paragraph'
      data: {}
      content:
          - data: {}
            marks: []
            value: 'This is a paragraph with '
            nodeType: 'text'
          - data: {}
            marks:
                - type: 'italic'
            value: 'italicized text.'
            nodeType: 'text'
    - nodeType: 'embedded-asset-block'
      data:
          assetType: 'image/jpeg'
          url: '//images.ctfassets.net/some-image-url.jpg'
          title: 'Image title will appear here'
          description: 'Image description will appear here'
          width: 1920
          height: 1080
      content: []
```

In addition a plaintext version of the field will be generated using the field ID appended with "\_plaintext". This allows you to quickly fetch the text by itself without any of the other data. A simple use case would be using the plaintext output to automatically generate a meta description for a webpage.

```yaml
richTextField_plaintext: 'This is a simple paragraph. This is a paragraph with italicized text.'
```

### The Resolve Entries Parameter

The resolve entries option let's you specify a field from a referenced entry or asset to resolve that field value you. For example say you have a `category` content type that is referenced in `posts`. Normally contentful-hugo will give the following result

```yaml
category:
    id: some-entry-id
    contentType: category
```

While this makes it easy to find the category, this format does not allow you to use Hugo's built in taxonomy features. With the `resolveEntries` parameter you can remedy this.

```js
// from the config file
module.exports = {
    repeatableTypes: [
        {
            id: 'post',
            directory: 'content/posts',
            resolveEntries: [
                {
                    field: 'category',
                    resolveTo: 'fields.slug',
                },
            ],
        },
    ],
};
```

Now the category field will only display the slug as the value.

```yaml
category: my-category-slug
```

The resolve entries feature works with both reference fields and asset fields. (As well as multiple reference and multiple asset fields)

## Known Issues

These are some known issues.

-   **Date & Time Field w/o Timezone**: Date fields that include time but do not have a specified timezone will have a timezone set based on whatever machine the script is run on. So using a date field in contentful with this setting could lead to unexpected results when formatting dates. Date fields that don't include time (ex: YYYY-MM-DD) are not effected by this.
-   **Fetching Data Before Contentful CDN Updates**: Sometimes when triggering a build from a webhook, it won't always get the latest data. This is because it sometimes takes a couple seconds for the latest data to get distrubuted across Contentful's CDN. If you run into this issue add teh the `--wait` flag to your script. Here's an example where we wait an additional 6 seconds `contentful-hugo --wait=6000`.
