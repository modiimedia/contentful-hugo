# Contentful Hugo

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/c24aacec450c44c1a81ac78d234838b0)](https://www.codacy.com/gh/ModiiMedia/contentful-hugo/dashboard?utm_source=github.com&utm_medium=referral&utm_content=ModiiMedia/contentful-hugo&utm_campaign=Badge_Grade)

This is a CLI tool that pulls data from Contentful CMS and turns it into Markdown or YAML files for use with a static site generator. It can be used with any static site generator that uses Markdown with YAML frontmatter, but it has some features that are specific to [Hugo](https://gohugo.io). It also includes a simple Express server that can can recieve webhooks from Contentful to retrigger get and delete commands (useful when running a preview environment).

![Screenshot of Contentful Hugo](screenshot.png)

## Features

- Outputs to Markdown, YAML, or JSON files
- Singleton support
- Rich text field support
- Multilingual support
- Default shortcodes for rich text content
- Automatic asset field resolution
- Customizable linked entry resolution
- Content filters
- Content Preview API support
- Field name and field value overrides
- Custom field support
- Server mode to receive webhook triggers from Contentful

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
    - [Environenment Variables](#environment-variables)
    - [Config File(s)](#config-file)
        - [Example JS Config](#example-javascript-config)
        - [Example YAML Config](#example-yaml-config)
        - [Config Fields](#config-fields)
        - [Advanced Config Examples](#advanced-config-examples)
        - [Config Autocomplete](#config-file-autocomplete)
    - [Gitignore Setup](#gitignore-setup)
- [Expected Output](#expected-output)
    - [Standard Fields](#default-metadata-fields-and-date-field)
    - [Richtext Fields](#rich-text-as-main-content)
    - [Resolving Reference Fields](#the-resolve-entries-parameter)
    - [Overriding Field Names & Field Values](#the-overrides-parameter)
    - [Filtering Entries Within a Content Type](#the-filters-parameter)
    - [Adding Custom Fields To Frontmatter](#adding-custom-fields-to-frontmatter)
- [Guides](#guides)
    - [Getting live updates from Contentful on localhost](guides/localhost-live-updates.md)
- [Known Issues](#known-issues)

## Prerequisites

Install [Node.js](https://nodejs.org) (Minimum supported version is Node v18)

## Installation

with NPM

```bash
# local install
npm install contentful-hugo

# global install
npm install contentful-hugo -g
```

with PNPM

```bash
# local install
pnpm install contentful-hugo

# global install
pnpm install contentful-hugo -g
```

## Usage

### Terminal Commands

Complete [configuration](#configuration) then run the following command(s) in the terminal

#### When Installed Globally

```powershell
## initialize the directory
contentful-hugo --init

## fetch content from contentful
contentful-hugo [flags]
```

#### When Installed Locally

```powershell
npx contentful-hugo --init
npx contentful-hugo [flags]

# or when using pnpm
pnpm contentful-hugo --init
pnpm contentful-hugo [flags]
```

### Flags

| flag      | aliases | description                                                                                              |
| --------- | ------- | -------------------------------------------------------------------------------------------------------- |
| --init    |         | Initialize the directory. Generates a config file and default shortcodes for Contentful rich text fields |
| --preview | -P      | Runs in preview mode, which pulls both published and unpublished entries from Contentful                 |
| --wait    | -W      | Wait for the specified number of milliseconds before pulling data from Contentful.                       |
| --config  | -C      | Specify the path to a config file.                                                                       |
| --server  | -S      | Run in server mode to receive webhooks from Contentful                                                   |
| --port    |         | Specify port for server mode (Default 1414)                                                              |
| --clean   |         | Delete any directories specified in singleTypes and repeatableTypes                                      |
| --help    |         | Show help                                                                                                |
| --version |         | Show version number                                                                                      |

#### Multiple Flags Example

```powershell
contentful-hugo --wait=2000 --preview --config="my_custom_config.js"

# or

contentful-hugo --wait 2000 --preview --config my_custom_config.js
```

### Example Package.json

```JSON
{
  "name": "my-hugo-project",
  "scripts": {
    "dev": "contentful-hugo --preview && hugo server",
    "build": "contentful-hugo && hugo --minify"
  }
}
```

In this example when you run `npm run dev` it will first use contentful-hugo to pull Contentful data then start hugo server. In the same way when you do the command `npm run build` it will first use contentful-hugo to pull Contentful data then run `hugo --minify` to build a minified version of your hugo site.

### Error Messages

Trying to use this package before completing configuration will return an error in the console

```shell
Error: There is an error in your config file, or it does't exits.
Check your config for errors or run "contentful-hugo --init" to create a config file.
```

## Configuration

### Environment Variables

By default this library will look for the following environment variables. You can also override these values with the config file. (See [config](#config-file))

- CONTENTFUL_SPACE
- CONTENTFUL_TOKEN
- CONTENTFUL_PREVIEW_TOKEN

**.env File:**

To declare these environment variables create a `.env` file in the root directory of your project.

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

Before getting started, you will need to create a config file in the root of your repository. Contentful-hugo by default will search for the following files as a config.

- `contentful-hugo.config.ts`
- `contentful-hugo.config.js`
- `contentful-hugo.config.yaml`
- `contentful-hugo.yaml`
- `contentful-settings.yaml`

You can also specify a custom config file using the `--config` flag. (Javascript or YAML config files are the only currently accepted filetypes)

#### Example Typescript Config

```ts
import { defineConfig } from 'contentful-hugo';

export default defineConfig({
    // fetches from default locale if left blank
    locales: ['en-US', 'fr-FR'],

    contentful: {
        // defaults to CONTENTFUL_SPACE env variable
        space: 'space-id',
        // defaults to CONTENTFUL_TOKEN env variable
        token: 'content-deliver-token',
        // defaults to CONTENTFUL_PREVIEW_TOKEN env variable
        previewToken: 'content-preview-token',
        // defaults to "master"
        environment: 'master',
        // defaults to 1000
        pageSize: 150,
    },

    singleTypes: [
        {
            id: 'homepage',
            directory: 'content',
            fileName: '_index',
        },
        {
            id: 'siteSettings',
            directory: 'data',
            fileName: 'settings',
            fileExtension: 'yaml', // default is md
        },
    ],

    repeatableTypes: [
        {
            id: 'posts',
            directory: 'content/posts',
            mainContent: 'content',
            resolveEntries: {
                categories: 'fields.slug',
                author: 'fields.name',
                relatedPosts: 'sys.id',
            },
        },
        {
            id: 'seoFields',
            isHeadless: true,
            directory: 'content/seo-fields',
            customFields: {
                // these fields will be added to the frontmatter
                myCustomField: 'myCustomFieldVal',
                myOtherCustomField: (entry) => {
                    return entry.fields.whatever;
                },
            },
        },
        {
            id: 'reviews',
            directory: 'content/reviews',
            mainContent: 'reviewBody',
        },
        {
            id: 'category',
            directory: 'content/categories',
            isTaxonomy: true,
        },
    ],

    staticContent: [
        {
            inputDir: 'static_content',
            outputDir: 'content',
        },
    ],
});
```

##### Using a Javascript Config

A javascript config is pretty much the same as a typescript config.

```js
import { defineConfig } from 'contentful-hugo';

export default defineConfig({
    // stuff goes here
});
```

CommonJS syntax _should_ also work (I don't actually test against this maybe it works maybe it doesn't)

```js
const { defineConfig } = require('contentful-hugo');

module.exports = defineConfig({
    // stuff goes here
});
```

#### Example YAML Config

```yaml
# contentful-hugo.config.yaml

locales: # fetches from default locale if left blank
    - en-US
    - fr-FR

contentful:
    space: 'space-id' # defaults to CONTENTFUL_SPACE env variable
    token: 'content-deliver-token' # defaults to  CONTENTFUL_TOKEN env variable
    previewToken: 'content-preview-token' # defaults to  CONTENTFUL_PREVIEW_TOKEN env variable
    environment: 'master' # defaults to "master"
    pageSize: 150 # defaults to 1000

singleTypes:
    # fetches only the most recently updated entry in a particular content type
    # Generated file will be named after the fileName setting

    - id: homepage
      directory: content
      fileName: _index

    - id: siteSettings
      directory: data
      fileName: settings
      fileExtension: yaml # default is md

repeatableTypes:
    # fetches all the entries of a content type and places them in a directory.
    # Generated files will be named after their Entry ID in Contentful.

    - id: posts
      directory: content/posts
      fileExtension: md
      mainContent: content
      resolveEntries: # resolves a reference or asset field to a specific property
          categories: fields.slug
          author: fields.name
          relatedPosts: sys.id

    - id: seoFields
      isHeadless: true
      directory: content/seo-fields
      customFields:
          # will be added to the frontmatter
          myCustomFields: 'myCustomFieldValue'

    - id: reviews
      directory: content/reviews
      mainContent: reviewBody

    - id: staff
      isHeadless: true
      directory: content/staff

    - id: category
      directory: content/categories
      isTaxonomy: true
```

#### **Config Fields**

##### <u>**Contentful Options**</u>

| field        | required | description                                                                                  |
| ------------ | -------- | -------------------------------------------------------------------------------------------- |
| space        | optional | Contentful Space ID (Defaults to CONTENTFUL_SPACE environment variable if not set)           |
| token        | optional | Content delivery token (Defaults to CONTENTFUL_TOKEN environment variable if not set)        |
| previewToken | optional | Content preview token (Defaults to CONTENTFUL_PREVIEW_TOKEN environment variable if not set) |
| environment  | optional | Contentful environment ID (Defaults to "master" if not set)                                  |
| pageSize | optional | Configure how many entries to fetch per page when querying the API. (Defaults to 1000 if not set) |

##### <u>**Single Type Options**</u>

| field          | required | description                                                                                                                                                                                                          |
| -------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id             | required | Contentful content type ID                                                                                                                                                                                           |
| directory      | required | Directory where you want the file(s) to be generated                                                                                                                                                                 |
| fileName       | required | Name of the file generated                                                                                                                                                                                           |
| fileExtension  | optional | Can be "md", "yml", "yaml", or "json" (defaults to "md")                                                                                                                                                             |
| mainContent    | optional | Field ID for field you want to be the main Markdown content. (Can be a markdown, richtext, or string field)                                                                                                          |
| type           | optional | Manually set value for "type" field in the frontmatter (see [hugo docs](https://gohugo.io/content-management/types/))                                                                                                |
| resolveEntries | optional | Resolve the specified reference fields and/or asset fields to one of it's properties parameter                                                                                                                       |
| overrides      | optional | Do custom overrides for field values or field names                                                                                                                                                                  |
| filters        | optional | Accepts an object of Contentful search parameters to filter results. See [Contentful docs](https://www.contentful.com/developers/docs/references/content-delivery-api/#/reference/search-parameters/select-operator) |
| ignoreLocales  | optional | Ignore localization settings and only pull from the default locale (defaults to false)                                                                                                                               |
| customFields   | optional | Accepts an object of fields and values. The values can be a standard static value or a function that accepts the Contentful entry as a parameter and returns a value                                                 |

##### <u>**Repeatable Type Options**</u>

| field                     | required | description                                                                                                                                                                                                                                |
| ------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| id                        | required | Contentful content type ID                                                                                                                                                                                                                 |
| directory                 | required | Directory where you want the files to be generated                                                                                                                                                                                         |
| fileName                  | optional | Entry property that will dicatate the filename. (By default this will be `sys.id`)                                                                                                                                                         |
| fileExtension             | optional | Can be "md", "yml", "yaml", or "json" (defaults to "md")                                                                                                                                                                                   |
| isHeadless                | optional | Turns all entries in a content type into headless leaf bundles (see [hugo docs](https://gohugo.io/content-management/page-bundles/#headless-bundle)). Cannot be set to true when isTaxonomy is set to true.                                |
| isTaxonomy (Experimental) | optional | Organize entries in file structure allowing for custom taxonomy metadata (see [hugo docs](https://gohugo.io/content-management/taxonomies/#add-custom-metadata-a-taxonomy-or-term)). Cannot be set to true when isHeadless is set to true. |
| mainContent               | optional | Field ID for field you want to be the main markdown content. (Can be a markdown, richtext, or string field)                                                                                                                                |
| type                      | optional | Manually set value for "type" field in the frontmatter (see [hugo docs](https://gohugo.io/content-management/types/))                                                                                                                      |
| resolveEntries            | optional | Resolve the specified reference fields and/or asset fields to one of it's properties                                                                                                                                                       |
| overrides                 | optional | Do custom overrides for field values or field names                                                                                                                                                                                        |
| filters                   | optional | Accepts an object of Contentful search parameters to filter results. See [Contentful docs](https://www.contentful.com/developers/docs/references/content-delivery-api/#/reference/search-parameters/select-operator)                       |
| ignoreLocales             | optional | Ignore localization settings and only pull from the default locale (defaults to false)                                                                                                                                                     |
| customFields              | optional | Accepts an object of fields and values. The values can be a standard static value or a function that accepts the Contentful entry as a parameter and returns a value                                                                       |

##### <u>**Localization Options**</u>

The config also has a `locales` field that allows you to specify what locales you want to pull from. This field can take an array of strings, an array of objects, or a combination.

By default locale specific file extensions will be used for multiple translations.

```js
const { defineConfig } = require('contentful-hugo');
// produce en-us.md and fr-fr.md files
module.exports = defineConfig({
    locales: ['en-US', 'fr-FR'];
    // rest of config
})

// produce en.md and fr.md files
module.exports = defineConfig({
    locales: [
        {
            code: 'en-US',
            mapTo: 'en'
        },
        {
            code: 'fr-FR',
            mapTo: 'fr'
        }
    ]
    // rest of config
})

// produce en-us.md files and fr.md files
module.exports = defineConfig({
    locales: [
        'en-US',
        {
            code: 'fr-FR',
            mapTo: 'fr'
        }
    ]
    // rest of config
})
```

After configuring locales in Contentful Hugo you will need to update your Hugo config to account for these locales. Consult the [Hugo docs](https://gohugo.io/content-management/multilingual/) for more details.

```toml
# config.toml

[languages]
    [languages.en-us]
    #language settings
    [languages.fr-fr]
    #language settings
```

###### Locale Specific Directories

There are sometimes cases where you will want to place content in a directory based on it's locale rather than using a file extension based translation. In order to do this you simple include `[locale]` inside your directory file path.

When using locale specific directories the locale specific file extensions (i.e. `en.md` or `fr.md`) get dropped

```js
const { defineConfig } = require('contentful-hugo');

module.exports = defineConfig({
    locales: ['en', 'fr']
    singleTypes: [
        {
            id: 'settings',
            fileName: 'settings',
            fileExtension: 'yaml',
            directory: 'data/[locale]'
            /*
                produces:
                - data/en/settings.yaml
                - data/fr/settings.yaml
            */
        }
    ]
    repeatableTypes: [
        {
            id: 'post',
            directory: 'content/[locale]/post',
            /*
                produces:
                - content/en/post/[entryId].md
                - content/fr/post/[entryId].md
            */
        },
    ],
});
```

##### <u>**Static Content Options**</u>

The recommended setup for Contentful Hugo is to have your content (usually `./content`) and data (usually `./data`) directories ignored in version control. This is because contentful-hugo will generate these directories at build time. However, this creates trouble for instances where you have pages that are not managed in Contentful and aren't generated at build time by another source.

To deal with this problem Contentful-Hugo has a `staticContent` parameter. This paramter accepts an input directory (`inputDir`) that can be commited to git, and an output directory (`outputDir`) which would be your standard content or data directory. All items in the inputDir will get copied into the outputDir at build time and will retain their folder structure.abs

For example in the config below `./static_content/posts/my-post.md` will get copied to `./content/posts/my-post.md`, and `./static_data/global-settings.yaml` will be copied to `./data/global-settings.yaml`.

```js
const { defineConfig } = require('contentful-hugo');

module.exports = defineConfig({
    // rest of config
    staticContent: [
        {
            // all items in ./static_content will be copied to ./content
            inputDir: 'static_content',
            outputDir: 'content',
        },
        {
            // all items in ./static_data will be copied to ./data
            inputDir: 'static_data',
            outputDir: 'data',
        },
    ],
});
```

Contentful-Hugo will also watch for file changes in the inputDir's while running in server mode.

#### Advanced Config Examples

##### Dynamically Changing Tokens

Here is an example of dynamically change the `token`, `previewToken`, and `environment` options depending on any arbitrary condition.

```javascript
// contentful-hugo.config.js
const { defineConfig } = require('contentful-hugo');
require('dotenv').config(); // assuming you have "dotenv" in your dependencies

const myMasterToken = process.env.CONTENTFUL_MASTER_TOKEN;
const myMasterPreviewToken = process.env.CONTENTFUL_MASTER_PREVIEW_TOKEN;
const myStagingToken = process.env.CONTENTFUL_STAGING_TOKEN;
const myStagingPreviewToken = process.env.CONTENTFUL_STAGING_PREVIEW_TOKEN;

// set some condition
const isStaging = true || false;

module.exports = defineConfig({
    contentful: {
        space: 'my-space-id',
        token: isStaging ? myStagingToken : myMasterToken,
        preview: isStaging ? myStagingPreviewToken : myMasterPreviewToken,
        environment: isStaging ? 'staging' : 'master',
    },
    // rest of config
});
```

##### Overriding Fields and Field Values

```js
const { defineConfig } = require('contentful-hugo');
// contentful-hugo.config.js

module.exports = defineConfig({
    repeatableTypes: [
        {
            id: "trips",
            directory: "content/trips"
            overrides: {
                // change the url field name to "slug"
                url: {
                    fieldName: "slug"
                }
                /*
                    rename "distanceInKilometers" to "distanceInMiles"
                    and change the field value from km to mi
                */
                distanceInKilometers: {
                    fieldName: "distanceInMiles",valueTransformer: (val) => {
                        if(typeof val === 'number') {
                            return val * 0.621371
                        }
                        return 0
                    }
                }
            }
        }
    ]
})

// ALTERNATIVE SYNTAX
module.exports = defineConfig({
    repeatableTypes: [
        {
            id: "trips",
            directory: "content/trips"
            overrides: [
            {
                field: "url",
                options: {
                    // change the url field name to "slug" in frontmatter
                    fieldName: "slug"
                }
            },
            {
                field: "distanceInKilometers",
                options: {
                    // rename "distanceInKilometers" to "distanceInMiles"
                    fieldName: "distanceInMiles",
                    // convert distance to miles and output the result in frontmatter
                    valueTransformer: (val) => {
                        if(typeof val === 'number') {
                            return val * 0.621371
                        }
                        return 0
                    }
                }
            }]
        }
    ]
})
```

#### Config File Autocomplete

For JS config files you can use the `defineConfig` helper or you can import the `ContentfulHugoConfig` type.

```js
//////////// OPTION 1 ////////////
const { defineConfig } = require('contentful-hugo');

module.exports = defineConfig({
    // config goes here
});

//////////// OPTION 2 ////////////
/**
 * @type {import('contentful-hugo').ContentfulHugoConfig}
 */
module.exports = {
    // rest of config
};
```

### Gitignore Setup

Example `.gitignore` setup

```bash
# general stuff
.env
node_modules
public
resources

# Contenful Hugo stuff
# temp folder that contentful uses to track files
.contentful-hugo
# since content and data is coming from Contentful
# usually you'll want to ignore those directories
content
data
```

## Expected Output

Files will be generated in the directory specified in the config file. Front matter will be in YAML format. Files of single types will be named after fileName specified in the config file. Files of repeatable types will be named after their entry ID in Contenful, which makes it easy to link files together.

### Default Metadata Fields and Date Field

The following fields will always appear in your frontmatter:

```yaml
date: # defaults to sys.createdAt unless you have a field with the id "date" then it get's overwritten
sys:
    id: # the entry id
    updatedAt: # the last time this entry was updated in Contentful
    createdAt: # when the entry was created in Contentful
    revision: # the revision number
    space: # the space id
    contentType: # the content type id
```

### Asset Information

Assets like images and videos come with some extra information that makes it easy to implement things like alt text or layouts that rely on knowing the image dimensions. The fields are as follows:

```yaml
assetFieldName:
    assetType: # indicates the asset mime type such as image/png, video/mp4, audio/mp3, ect.
    url: # url of the asset
    title: # title of the asset written in Contentful
    description: # description of the asset written in Contentful
    width: # width of the asset (images only)
    height: # height of the asset (images only)
```

If you're using Hugo you can access the information like below:

```html
<img
    src="{{ .Params.assetFieldName.url }}"
    width="{{ .Params.assetFieldName.width }}"
/>
```

For images you can append parameters to the asset url in order to make use of Contentful's [images api](https://www.contentful.com/developers/docs/references/images-api/#/introduction)

```html
<img
    src="{{ .Params.assetFieldname.url }}?w=200&h=200&fit=fill"
    width="200"
    height="200"
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

#### Accessing Linked Entry Data

All files are named after their entry id in Contentful making it easy to retrieve it using `.Site.GetPage` in Hugo

```go
// if you have access to the "Page" object
{{ with .Site.GetPage "<path-to-file>/<entry-id>" }}
    {{ .Title }}
{{ end }}

// if you don't have access to the "Page" object
// for example in a nested partial
{{ with site.GetPage "<path-to-file>/<entry-id>" }}
    {{ .Title }}
{{ end }}
```

**Simple example**

```go
{{ with .Params.myEntryField }}
    {{ $pagePage := print "path/to/entryDir/" .id }}
    {{ with site.GetPage $pagePath }}
        {{ .Title }}
        {{ .Params.someOtherField }}
    {{ end }}
{{ end }}
```

Relevant Documentation:

- [GetPage Method](https://gohugo.io/functions/getpage/#readout)
- [Getting the Site object from a partial](https://gohugo.io/variables/site/#get-the-site-object-from-a-partial)

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

- contentful-hugo/asset-hyperlink.html
- contentful-hugo/embedded-asset.html
- contentful-hugo/embedded-entry.html
- contentful-hugo/entry-hyperlink.html
- contentful-hugo/inline-entry.html

By default the richtext short codes will show a notification for an unconfigured item.

![Unconfigured Embedded Entry Block](images/unconfigured-embedded-entry.PNG)

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

The resolve entries option let's you specify a property from a referenced entry or asset to resolve that field value to. For example say you have a `category` content type that is referenced in `posts`. Normally contentful-hugo will give the following result

```yaml
category:
    id: some-entry-id
    contentType: category
```

While this makes it easy to find the category, this format does not allow you to use Hugo's built in taxonomy features. With the `resolveEntries` parameter you can remedy this.

```js
// from the config file
module.exports = defineConfig({
    repeatableTypes: [
        id: 'posts',
        directory: 'content/posts',
        resolveEntries: {
            category: 'fields.slug'
        }
        // alternative syntax
        resolveEntries: [
            {
                field: 'category',
                resolveTo: 'fields.slug',
            },
        ],
    ]
})
```

Now the category field will only display the slug as the value.

```yaml
category: my-category-slug
```

The resolve entries feature works with both reference fields and asset fields, as well as multiple reference and multiple asset fields.

### The Overrides Parameter

Overrides can be used to modify field names and field values.

Here's a simple example of changing a field name from "url" to "videoUrl"

```js
repeatableTypes: [
    {
        id: 'youtubeVideo',
        directory: 'content/_youtubeVideo',
        isHeadless: true,
        overrides: {
            // the name of the url field to videoUrl
            url: {
                fieldName: 'videoUrl'
            }
        }
        // alternative syntax
        overrides: [
            {
                field: 'url',
                options: {
                    fieldName: 'videoUrl',
                },
            },
        ],
    },
];
```

`overrides` also has a `valueTransformer` options that allows you to manipulate the field data that will appear in frontmatter. `valueTransformer` takes a method that has the field value as a parameter and then returns the final result that will appear in the frontmatter. (Be aware that since `valueTransformer` must be a method this option will only work in javascript config files)

Here's an example where we change the field name from "url" to "videoId" and then we use the `valueTransformer` to extract the video id from the url and then place it in the frontmatter.

```js
repeatableTypes: [
    {
        id: 'youtubeVideo',
        directory: 'content/_youtubeVideo',
        isHeadless: true,
        overrides: {
            url: {
                fieldName: 'videoId',
                // "value" is whatever value is currently saved in the field.
                // in this case it's a url for a youtube video
                valueTransformer: (value) => {
                    if (!value) {
                            return null;
                        }
                    const url = new URL(value);
                    // extract the video id from the url and return it
                    return url.searchParams.get('v');
                }
            }
        }
        // alternative syntax
        overrides: [
            {
                field: 'url',
                options: {
                    fieldName: 'videoId',
                    valueTransformer: (value) => {
                        // transform the value
                    },
                },
            },
        ],
    },
];
```

When using the `valueTransformer` option on fields that contain arrays make sure to loop through the value when manipulating it.

```js
repeatabledTypes: [
    {
        id: 'post',
        directory: 'content/posts',
        overrides: {
            authors: {
                valueTransformer: (authorRefs) => {
                    const authors = [];
                    for (const ref of authorRefs) {
                        // get the name, photo, and bio of the author
                        // and add it to the array
                        authors.push({
                            name: ref.fields.name,
                            photo: ref.fields.photo.fields.file.url,
                            bio: ref.fields.bio,
                        });
                    }
                    return authors;
                },
            },
        },
    },
];
```

Now the `authors` field will look like this:

```yaml
authors:
    - name: Some Name
      photo: //images.cfassets.net/path-to-photo.jpg
      bio: some bio text
    - name: Some other name
      photo: //images.cfassets.net/path-to-photo.jpg
      bio: some other bio text
```

As you can see this can be used to produce similar results to the `resolveEntries` parameter, but `resolveEntries` can only return one property while with overrides you can do whatever you want with the field values.

### The Filters Parameter

You can use to `filters` option to enter search parameters allowing you to filter entries based on some of their properties. For more info on Contentful search parameters visit their [docs](https://www.contentful.com/developers/docs/references/content-delivery-api/#/reference/search-parameters).

Be aware that the following search parameters will be ignored `content_type`, `skip`, `order`, `limit`

#### Examples:

```js
module.exports = defineConfig({
    singleTypes: [
        // get a homepage with a specific entryId
        {
            id: 'homepage',
            directory: 'content',
            fileName: '_index',
            filters: {
                'sys.id': 'my-homepace-id'
            }
        }
    ]
    repeatableTypes: [
        // only get events that start after 01/01/2020
        {
            id: 'events',
            directory: 'content/events',
            filters: {
                'fields.startDate[gte]': '2020-01-01T00:00:00Z',
            },
        },
        // get posts where author is "John Doe" and contains the tag "flowers"
        {
            id: 'posts',
            directory: 'content/posts',
            filters: {
                'fields.author': 'John Doe',
                'fields.tags': 'flowers'
            },
        },
    ];
})
```

### Adding Custom Fields To Frontmatter

You can use the `customFields` parameter to add additional fields to your entries. The config for custom fields can be a static value or a method that accepts a Contentful entry as a parameter and returns a value.

### Examples

Let's say we have an author content type with the following fields:

- firstName
- lastName
- slug

Here's an example config:

```js
module.exports = defineConfig({
    // rest of config
    repeatableTypes: [
        {
            id: 'author',
            directory: 'content/authors',
            customFields: {
                // both "myCustomField" and "fullName"
                // will be appended to the frontmatter for author entries
                myCustomField: 'myCustomFieldValue',
                fullName: (entry) => {
                    const { firstName, lastName } = entry.fields;
                    return `${firstName} ${lastName}`;
                },
            },
        },
    ],
});
```

Here's what that config will result in

```yaml
---
firstName: 'John'
lastName: 'Doe'
slug: 'john-doe'
myCustomField: 'myCustomFieldValue' # custom field
fullName: 'John Doe' # custom field
---
```

You could also use this for Hugo specific fields like [Build Options](https://gohugo.io/content-management/build-options/#readout)

```js
// prevent a content type from appearing in list pages
{
    customFields: {
        _build: {
            render: 'alway',
            list: 'never',
            publishResources: true
        }
    }
}

// prevent a content type from rendering a single page
{
    customFields: {
        _build: {
            render: 'never',
            list: 'always',
            publishResources: true
        }
    }
}
```

## Guides

- [Getting live Contentful updates on Localhost with Contentful-Hugo and Ngrok](guides/localhost-live-updates.md)

## Known Issues

These are some known issues.

- **Date & Time Field w/o Timezone**: Date fields that include time but do not have a specified timezone will have a timezone set based on whatever machine the script is run on. So using a date field in contentful with this setting could lead to unexpected results when formatting dates. Date fields that don't include time (ex: YYYY-MM-DD) are not effected by this.
- **Fetching Data Before Contentful CDN Updates**: Sometimes when triggering a build from a webhook, it won't always get the latest data. This is because it sometimes takes a couple seconds for the latest data to get distributed across Contentful's CDN. If you run into this issue add the the `--wait` flag to your script. Here's an example where we wait an additional 6 seconds `contentful-hugo --wait=6000`.
- **Hugo --server Rendering Issues**: If you have fields that where multiple different files are referenced such as a rich text field that references other entries Hugo's default server mode may not rerender everything. To fix this run `hugo server --disableFastRender`
