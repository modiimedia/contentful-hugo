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
singleInstances:
  - id: homepage
    directory: /content/
    fileName: _index
    fileExtension: md

  - id: siteSettings
    directory: /data/
    fileName: settings
    fileExtension: yaml

contentTypes:
  - id: posts
    directory: /content/posts/
    fileExtension: 
    mainContent: 
  
  - id: seoFields
    title: metaTitle
    isHeadless: true
    directory: /content/seo-fields/
    fileExtension: 
    mainContent: 

  - id: reviews
    title: companyName
    isHeadless: true
    directory: /content/reviews/

  - id: staff
    isHeadless: true
    directory: /content/staff/
```
