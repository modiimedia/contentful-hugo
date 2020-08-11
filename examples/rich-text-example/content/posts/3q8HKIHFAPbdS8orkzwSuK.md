---
type: "blog"
updated: "2020-08-10T23:15:25.414Z"
createdAt: "2019-08-23T21:34:33.719Z"
date: "2019-08-23T21:34:33.719Z"
title: "Example With Text, Assets, and Entries"
slug: "example-with-text-assets-and-entries"
featuredImage:
  assetType: "image/jpeg"
  url: "//images.ctfassets.net/6fc4s4k6v9co/4up9JEFDVOMp1zLOqbAbRN/0054a3bbfc0c5cf4ae172c6957b5b42c/photo-1533227268428-f9ed0900fb3b"
  title: "Man in Red Shirt"
  description: "Man in red shirt excited because he was able to use port his rich text fields over to Hugo."
  width: 1779
  height: 1539
tags:
  - "rich text"
  - "text"
  - "assets"
  - "entries"
---

In this example we will see a bit of everything. Below me is an embedded asset.

{{< embeddedAsset title="Man in Red Shirt" description="Man in red shirt excited because he was able to use port his rich text fields over to Hugo." url="//images.ctfassets.net/6fc4s4k6v9co/4up9JEFDVOMp1zLOqbAbRN/0054a3bbfc0c5cf4ae172c6957b5b42c/photo-1533227268428-f9ed0900fb3b" filename="photo-1533227268428-f9ed0900fb3b" assetType="image/jpeg" size="470466" width="1779" height="1539" parentContentType="post" >}}

Below me here is an **embedded entry** where `contentType === gallery. `I already have created a template for this which is why it displays below.

{{< embeddedEntry id="nTLo2ffSJJp5QrnrO5IU9" contentType="gallery" parentContentType="post" >}}

Here is an {{< entryHyperlink id="6WpgTH2wCLQNldpJw8fFoK" contentType="post" parentContentType="post" >}}entry hyperlink{{< /entryHyperlink >}} 

Here is an {{< assetHyperlink title="Lots of photos" description="" url="//images.ctfassets.net/6fc4s4k6v9co/61Vr40rLmmpyK4X9hD8Z2P/779cac848bddac52e025fcb5fddf03bc/photo-1533158307587-828f0a76ef46" filename="photo-1533158307587-828f0a76ef46" assetType="image/jpeg" size="218452" width="967" height="725" parentContentType="post" >}}asset hyperlink{{< /assetHyperlink >}}

Next to me is an inline entry {{< inlineEntry id="743Y9PAirb8FodggmzLdVn" contentType="categories" parentContentType="post" >}}. Pretty neat 

Here is an {{< entryHyperlink id="2FJ57uwDeQcKhTzq1fil7Y" contentType="post" parentContentType="post" >}}**bold entry hyperlink**{{< /entryHyperlink >}} . Followed by a {{< assetHyperlink title="Handwritten note on paper" description="" url="//images.ctfassets.net/6fc4s4k6v9co/5VdF15Q4Gzd3oU5WH2rl8n/447670d645f98d5cfcf42fa49e42c889/photo-1543769657-fcf1236421bc" filename="photo-1543769657-fcf1236421bc" assetType="image/jpeg" size="862516" width="1950" height="2600" parentContentType="post" >}}*italicized asset hyperlink*{{< /assetHyperlink >}}.

> And we have an inline entry {{< inlineEntry id="2FJ57uwDeQcKhTzq1fil7Y" contentType="post" parentContentType="post" >}}. All inside the quote block. Pretty cool.

Below me is an embedded asset with a assetType that I haven&#39;t created a template for.

{{< embeddedAsset title="Example Text File" description="This is a text file that was uploaded as an asset to contentful" url="//assets.ctfassets.net/6fc4s4k6v9co/3rhYPMI6hBpgrTpxUDrITD/6b327926f69dbff550bb0307f71e7e66/asset.txt" filename="asset.txt" assetType="text/plain" size="26" width="" height="" parentContentType="post" >}}

> This is a **multiline**
> 
> quoteblock

Below me is an embedded entry that I have not created a template for.

{{< embeddedEntry id="6WpgTH2wCLQNldpJw8fFoK" contentType="post" parentContentType="post" >}}



