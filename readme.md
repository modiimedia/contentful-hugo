# Contentful Hugo

This is a simple Node.js CLI tool that pulls data from Contentful and turns it into Markdown or YAML files for use with a static site generator. It can be used with any static site generator that uses Markdown with YAML frontmatter, but it has some features that are specific to [Hugo](https://gohugo.io).

# Prerequisites

Install [Node.js](https://nodejs.org)

# Installation

# Usage

Complete [configuration](#configuration) then run the following command in the terminal

```
contentful-hugo
```
Failure to complete configuration will return an error in the console

![Environment Variables not set](https://raw.githubusercontent.com/ModiiMedia/contentful-hugo/master/images/environment-variables-missing.jpg)

![Config file not found]("https://raw.githubusercontent.com/ModiiMedia/contentful-hugo/master/images/config-file-not-found.jpg")

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

```yaml
# Single instance types. 
# For these content types contentful-hugo will only pull the most recent entry of a content type. Useful for things like homepages and settings
singleInstances: 
  - id: homepage # content type id (required)
    directory: /content/ # destination directory (required)
    fileName: _index # filename (required)
    fileExtension: md # can be "md", "yaml", or "yml". It defaults to "md" 

  - id: siteSettings
    directory: /data/ # example of a single instance being used for a data file instead of a content file
    fileName: settings
    fileExtension: yaml

# repeated content types
contentTypes:
  - id: posts # content type ID (required)
    directory: /content/posts/ # destination directory (required)
    fileExtension: # This can be "md", "yaml", or "yml". It defaults to "md" if not set.
    mainContent: content # field you want to map as main content (optional. Does not work with rich-text fields. See below)
    isHeadless: false # makes content type a headless bundle (see hugo docs)
  
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
