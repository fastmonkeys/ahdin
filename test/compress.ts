import * as almostEqual from 'almost-equal';
import * as fs from 'fs';
import * as test from 'tape';

import { compress } from '../src/index';

interface ImageFixture {
  format: string;
  buffer: Buffer;
};

const fixtures: ImageFixture[] = [
  {
    format: 'jpg',
    buffer: fs.readFileSync(`${__dirname}/test-image.jpg`),
  },
  {
    format: 'png',
    buffer: fs.readFileSync(`${__dirname}/test-image.png`),
  },
];

function blobToImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      resolve(image);
    };
    image.src = url;
  });
}

function fixtureToBlob(fixture: ImageFixture): Blob {
  return new Blob([fixture.buffer.buffer]);
}

function getImageAspectRatio(image: HTMLImageElement): number {
  return image.width / image.height;
}

test('#compress', (t) => {
  function assertRejection(t, options, error) {
    t.timeoutAfter(100);
    t.plan(1);
    const source = fixtureToBlob(fixtures[0]);
    compress(source, options).catch((e) => {
      t.deepEqual(e, new Error(error), 'should reject the promise');
    });
  }

  t.test('when `options.maxHeight` is not greater than zero', (t) => {
    assertRejection(t, { maxHeight: 0 }, 'options.maxHeight must be greater than zero');
  });

  t.test('when `options.maxWidth` is not greater than zero', (t) => {
    assertRejection(t, { maxWidth: 0 }, 'options.maxWidth must be greater than zero');
  });

  t.test('when `options.quality` is smaller than 0', (t) => {
    assertRejection(t, { quality: -0.1 }, 'options.quality must be between 0 and 1');
  });

  t.test('when `options.quality` is greater than 1', (t) => {
    assertRejection(t, { quality: 1.1 }, 'options.quality must be between 0 and 1');
  });

  fixtures.forEach((fixture) => {
    t.test(`when compressing (${fixture.format})`, (t) => {
      const source = fixtureToBlob(fixture);

      t.test('with default options', (t) => {
        t.timeoutAfter(1000);
        t.plan(1);
        compress(source).then((compressed) => {
          t.true(compressed.size < source.size, 'makes image file smaller');
        });
      });

      t.test('with maxWidth', (t) => {
        t.timeoutAfter(1000);
        t.plan(2);
        compress(source, { maxWidth: 1000 }).then((compressed) => {
          Promise.all([
            blobToImage(source),
            blobToImage(compressed),
          ]).then(results => {
            const [sourceImage, compressedImage] = results;
            t.equal(compressedImage.width, 1000, 'honors the max width');
            t.equal(getImageAspectRatio(compressedImage), getImageAspectRatio(sourceImage), 'maintains aspect ratio');
          });
        });
      });

      t.test('with maxHeight', (t) => {
        t.timeoutAfter(1000);
        t.plan(2);
        compress(source, { maxHeight: 300 }).then((compressed) => {
          Promise.all([
            blobToImage(source),
            blobToImage(compressed),
          ]).then(results => {
            const [sourceImage, compressedImage] = results;
            t.equal(compressedImage.height, 300, 'honors the max height');
            t.equal(getImageAspectRatio(compressedImage), getImageAspectRatio(sourceImage), 'maintains aspect ratio');
          });
        });
      });

      t.test('with maxWidth and maxHeight', (t) => {
        t.test('and width rule is stronger', (t) => {
          t.timeoutAfter(1000);
          t.plan(2);
          compress(source, {maxWidth: 100, maxHeight: 900}).then((compressed) => {
            Promise.all([
              blobToImage(source),
              blobToImage(compressed),
            ]).then(results => {
              const [sourceImage, compressedImage] = results;
              t.equal(compressedImage.width, 100, 'honors the max width');
              t.true(almostEqual(getImageAspectRatio(compressedImage), getImageAspectRatio(sourceImage), 0.02), 'maintains aspect ratio');
            });
          });
        });

        t.test('and height rule is stronger', (t) => {
          t.timeoutAfter(1000);
          t.plan(2);
          compress(source, {maxWidth: 900, maxHeight: 500}).then((compressed) => {
            Promise.all([
              blobToImage(source),
              blobToImage(compressed),
            ]).then(results => {
              const [sourceImage, compressedImage] = results;
              t.equal(compressedImage.height, 500, 'honors the max height');
              t.equal(getImageAspectRatio(compressedImage), getImageAspectRatio(sourceImage), 'maintains aspect ratio');
            });
          });
        });
      });
    });
  });
});
