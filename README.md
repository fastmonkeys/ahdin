# Ahdin

Lossy image compression module for JavaScript applications. It takes image `File`s or `Blob`s and compresses them to `Blob`s. It also fixes image orientation according to image's EXIF metadata.

## Install

```
$ npm install --save ahdin
```

## Usage

```js
const Ahdin = require('ahdin');

Ahdin
  .compress(
    source,
    {
      maxWidth: 1000,
      outputFormat: 'png'
    }
  )
  .then((compressedBlob) => {
    doSomething(compressedBlob);
  });
```

## API

### compress(source, [options])

Returns: a `Promise` that resolves to a compressed image as a `Blob`.

#### source

Type: `Blob`

A JPEG or PNG image to be compressed.

#### options

##### maxWidth

Type: `number`<br>
Default: original image width

Maximum width of the compressed image in pixels.

#### maxHeight

Type: `number`<br>
Default: original image height

Maximum height of the compressed image in pixels.

#### outputFormat

Type: `string`<br>
Default: `'jpeg'`

The image format for the compressed image. Accepted values: `'jpeg'` and `'png'`.

#### quality

Type: `number`<br>
Default: `0.8`

Image quality, when desired `outputFormat` is `'jpeg'`. The quality must be a number between `0` and `1`. If `outputFormat` is `png`, this has no effect.

## License

MIT © [Fast Monkeys](http://www.fastmonkeys.com)
