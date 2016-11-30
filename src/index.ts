import * as blobUtil from 'blob-util';
import * as loadImage from 'blueimp-load-image';

export type OutputFormat = 'jpeg' | 'png';

export interface CompressOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  outputFormat?: OutputFormat;
}

const defaultCompressOptions: CompressOptions = {
  quality: 0.8,
  outputFormat: 'jpeg',
};

export function compress(source: Blob, options?: CompressOptions): Promise<Blob> {
  const _options = Object.assign({}, defaultCompressOptions, options);

  return new Promise((resolve, reject) => {
    if (_options.maxWidth !== undefined && _options.maxWidth <= 0) {
      throw new Error('options.maxWidth must be greater than zero');
    }
    if (_options.maxHeight !== undefined && _options.maxHeight <= 0) {
      throw new Error('options.maxHeight must be greater than zero');
    }
    if (_options.quality < 0 || _options.quality > 1) {
      throw new Error('options.quality must be between 0 and 1');
    }

    const callback = (canvas: HTMLCanvasElement) => {
      const type = `image/${_options.outputFormat}`;
      blobUtil.canvasToBlob(canvas, type, _options.quality).then((blob) => {
        resolve(blob);
      });
    };
    const loadImageOptions = {
      canvas: true,
      maxWidth: _options.maxWidth,
      maxHeight: _options.maxHeight,
      orientation: true,
    };

    loadImage(source, callback, loadImageOptions);
  });
}
