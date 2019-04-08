# Contentful Hugo

This is a simple Node.js CLI tool that pulls data from Contentful and turns it into Markdown or YAML files for use with a static site generator. It can be used with any static site generator that uses Markdown with YAML frontmatter, but it has some features that are specific to [Hugo](https://gohugo.io).

## Prerequisites

Install [Node.js](https://nodejs.org)

## Installation

## Usage

```
contentful-hugo
```

## Configuration

### Environment Variables

Before using you must first set the following environment variables. CONTENTFUL_SPACE, and CONTENTFUL_TOKEN.

This can be done with a .env file in the root directory of your project.
```
CONTENTFUL_SPACE = '<your-space-id>`
CONTENTFUL_TOKEN = '<content-api-access-token>`
```
You can also declare the environment variables in the command line

### Config File

In order to pull the data you want you will need to create a contentful-settings.yaml file in the root of your repository.

```
---
singleInstances: # will only pull the most recent entry of a content type. Useful for content types like homepages and settings
  - id: homepage # your content type ID
    directory: /content/ # directory you wan the file to appear
    fileName: _index # filename (available only in single instances)
    fileExtension: md # defaults to "md". "md", "yml", and "yaml" are all available

  - id: siteSettings
    directory: /data/
    fileName: settings
    fileExtension: yaml

contentTypes: # will pull all the entries of a content type
  - id: posts # content type ID
    directory: /content/posts/ # destination directory
    fileExtension: # optional defaults to "md"
    mainContent: # optional sets as the Main content in a markdown file (does not work on rich-text fields)
  
  - id: seoFields
    isHeadless: true
    directory: /content/seo-fields/
    fileExtension: 
    mainContent: 

  - id: reviews
    isHeadless: true
    directory: /content/reviews/

  - id: staff
    isHeadless: true
    directory: /content/staff/
---
```
