# Contentful Hugo

This is a simple Node.js CLI tool that pulls data from Contentful and turns it into Markdown or YAML files for use with a static site generator. It can be used with any static site generator that uses Markdown with YAML frontmatter, but it has some features that are specific to [Hugo](https://gohugo.io).

**Table of Contents**

- [Prerequisites](#Prerequisites)
- [Installation](#Installation)
- [Usage](#Usage)
- [Configuration](#Configuration)
- [Expected Output](#Expected-Output)
- [Compatibility Issues](#Compatibility-Issues)


# Prerequisites

Install [Node.js](https://nodejs.org)

# Installation
```
npm install contentful-hugo
```

# Usage

Complete [configuration](#configuration) then run the following command in the terminal

```
contentful-hugo
```
Failure to complete configuration will return an error in the console

![Environment Variables not set](https://raw.githubusercontent.com/ModiiMedia/contentful-hugo/master/images/environment-variables-missing.jpg)

![Config file not found](https://raw.githubusercontent.com/ModiiMedia/contentful-hugo/master/images/config-file-not-found.jpg)

# Configuration

## Environment Variables

Before using you must first set the following environment variables. CONTENTFUL_SPACE, and CONTENTFUL_TOKEN.

This can be done with a .env file in the root directory of your project.
```
CONTENTFUL_SPACE = '<your-space-id>`
CONTENTFUL_TOKEN = '<content-api-access-token>`
```
You can also declare the environment variables in the command line

## Config File

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

  - id: siteSettings
    directory: /data/
    fileName: settings
    fileExtension: yaml

repeatableTypes: 
# feteches all the entries of a content type and places them in a directory. 
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

| field | required | description |
| ------ | -------- | ------------ | 
| id | required | contentful content type ID goes here |
| directory | required | directory where you want the file(s) to be generated (leading and trailing slashes required for the time being) |
| fileName | required (single types only) | name of the file generated | 
| fileExtension | optional (repeatable types only) | can be "md", "yml", or "yaml" (defaults to "md") |
| isHeadless | optional (repeated instances only) | turns all entries in a content type into headless leaf bundles (see [hugo docs](https://gohugo.io/content-management/page-bundles/#headless-bundle)) |
| mainContent | optional | field ID for field you want to be the main Markdown content. (Does not work with rich text fields)

# Expected Output

Files will be generated in the directory specified in the **contentful-settings.yaml** file. Front matter will be in YAML format. Files of single types will be named after fileName specified in the config file. Files of repeatable types will be named after their entry ID in Contenful, which makes it easy to link files together.

## Default Date and Time Fields

The following fields will always appear in your frontmatter:

```yaml
updated: # the last time this entry was update in Contentful
createdAt: # when the entry was created in Contentful
date: # defaults to creation date unless you have a field with the id "date" then it get's overwritten
```

## Asset Information

Asset like images and videos come with some extra information that makes it easy to implement things like alt text or layouts that rely on knowing the image dimensions. The fields are as follows:
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
<img src="{{ .Params.assetFieldName.url }}" width="{{ .Params.assetFieldName.width }}">
```

This same information will also appear in asset arrays like a gallery:
```yaml
myGallery:
  - 
    assetType: "image/jpg"
    url: "//link-to-image.jpg"
    title: "Image 1"
    description: "Image 1 Description"
    width: 500
    height: 500
  - 
    assetType: "image/jpg"
    url: "//link-to-image-2.jpg"
    title: "Image 2"
    description: "Image 2 Description"
    width: 1920
    height: 1080
```

## Entries

Linked entries will include fields for it's id and it's content type id.

```yaml
linkedEntry:
  id: <contentful-entry-id>
  typeId: <content-type-ID>


#example with array of linked entries

relatedArticles:
  -
    id: "41UFfIhszbS1kh95bomMj7"
    typeId: "articles"
  -
    id: "85UFfIhsacS1kh71bpqMj7"
    typeId: "articles"
```

All files are named after their entry id in Contentful making it easy to retrieve it using .Site.GetPage in Hugo

```html
{{ with .Site.GetPage "<path-to-file>.md" }}
  {{ .Title }}
{{ end }}
```

# Compatibility Issues

These are know compatibility issues.

- Hugo cannot parse date field if field is set to "date and time without timezone"
- Rich Text Fields give errors when using "inline-entry" "link-to-asset" "link-to-entry". Please disable these for the time being.