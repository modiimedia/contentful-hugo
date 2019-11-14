# Contentful Hugo

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/281eacf31e864217953437f66b7e3a72)](https://www.codacy.com/app/joshmossas/contentful-hugo?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=ModiiMedia/contentful-hugo&amp;utm_campaign=Badge_Grade)

This is a simple Node.js CLI tool that pulls data from Contentful CMS and turns it into Markdown or YAML files for use with a static site generator. It can be used with any static site generator that uses Markdown with YAML frontmatter, but it has some features that are specific to [Hugo](https://gohugo.io).

## Table of Contents

-   [Prerequisites](#Prerequisites)
-   [Installation](#Installation)
-   [Usage](#Usage)
-   [Configuration](#Configuration)
-   [Expected Output](#Expected-Output)
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
contentful-hugo
```

#### When Installed Locally

```powershell
npx contentful-hugo
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

Before using you must first set the following environment variables. CONTENTFUL_SPACE, and CONTENTFUL_TOKEN.

This can be done with a **.env** file in the root directory of your project.

```TOML
CONTENTFUL_SPACE = '<your-space-id>`
CONTENTFUL_TOKEN = '<content-api-access-token>`
```

You can also declare the environment variables in the command line

**Powershell:**

```powershell
$env:CONTENTFUL_SPACE="<contentful_space_id>"
$env:CONTENTFUL_TOKEN="<contentful_acessToken>"
```

**Bash:**

```bash
export CONTENTFUL_SPACE=<contentful_space_id>
export CONTENTFUL_TOKEN=<contentful_acessToken>
```

### Config File

In order to pull the data you want you will need to create a **contentful-settings.yaml** file in the root of your repository.

Example **contentful-settings.yaml** file (see below for complete configuration options)

```yaml
singleTypes:
    # fetches only the most recently updated entry in a particular content type
    # Generated file will be named after the fileName setting
    - id: homepage
      directory: /content/
      fileName: _index
      fileExtension: md

      # this will generate a file named "_index.md" in the "content" directory
    - id: siteSettings
      directory: /data/
      fileName: settings
      fileExtension: yaml
      # this will generate a file named settings.yaml in the "data" directory

repeatableTypes:
    # fetches all the entries of a content type and places them in a directory.
    # Generated files will be named after their Entry ID in Contentful.
    - id: posts
      directory: /content/posts/
      fileExtension: md
      mainContent: content

    - id: seoFields
      isHeadless: true
      directory: /content/seo-fields/

    - id: reviews
      directory: /content/reviews/
      mainContent: reviewBody

    - id: staff
      isHeadless: true
      directory: /content/staff/
```

**Configuration Options**

| field         | required                         | description                                                                                                                                          |
| ------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| id            | required                         | contentful content type ID goes here                                                                                                                 |
| directory     | required                         | directory where you want the file(s) to be generated (leading and trailing slashes required for the time being)                                      |
| fileName      | required (single types only)     | name of the file generated                                                                                                                           |
| fileExtension | optional                         | can be "md", "yml", or "yaml" (defaults to "md")                                                                                                     |
| isHeadless    | optional (repeatable types only) | turns all entries in a content type into headless leaf bundles (see [hugo docs](https://gohugo.io/content-management/page-bundles/#headless-bundle)) |
| mainContent   | optional                         | field ID for field you want to be the main Markdown content. (Does not work with rich text fields)                                                   |

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

### Rich Text Fields

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

## Known Issues

These are some known issues.

-   **Date & Time Field w/o Timezone**: Date fields that include time but do not have a specified timezone will have a timezone set based on whatever machine the script is run on. So using a date field in contentful with this setting could lead to unexpected results when formatting dates. Date fields that don't include time (ex: YYYY-MM-DD) are not effected by this.
-   **Fetching Data Before Contentful CDN Updates**: Sometimes when triggering a build from a webhook, it won't always get the latest data. This is because it sometimes takes a couple seconds for the latest data to get distrubuted across Contentful's CDN. If you run into this issue it might be worth it to create a "wait function" just to delay fetching the data by a couple seconds. You could include it in the script you use contentful-hugo by doing something like the following `"node wait.js && contentful-hugo"`
