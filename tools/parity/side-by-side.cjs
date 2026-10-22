/* eslint-disable no-console, import/no-extraneous-dependencies */
/**
 * Writes a downscaled side-by-side PNG (live left, replica right) of a vertical slice, for a
 * quick look at where a page diverges.
 * Usage: node tools/parity/side-by-side.cjs <live.jpg|png> <eds.png> <out.png> [y0] [height] [scale]
 */
const fs = require('fs');
const { PNG } = require('pngjs');
const jpeg = require('jpeg-js');

const read = (f) => (/\.jpe?g$/i.test(f)
  ? jpeg.decode(fs.readFileSync(f), { useTArray: true, maxMemoryUsageInMB: 1024 })
  : PNG.sync.read(fs.readFileSync(f)));

const [a, b, out, y0s = '0', hs = '1600', ss = '2'] = process.argv.slice(2);
const [y0, h, s] = [Number(y0s), Number(hs), Number(ss)];
const A = read(a);
const B = read(b);
const w = Math.max(A.width, B.width);
const ow = Math.floor((w * 2 + 20) / s);
const oh = Math.floor(h / s);
const img = new PNG({ width: ow, height: oh });
img.data.fill(255);
[[A, 0], [B, w + 20]].forEach(([src, x0]) => {
  for (let y = 0; y < oh; y += 1) {
    for (let x = 0; x < Math.floor(src.width / s); x += 1) {
      const sy = y0 + y * s;
      const sx = x * s;
      if (sy < src.height) {
        const si = (sy * src.width + sx) * 4;
        const di = (y * ow + Math.floor(x0 / s) + x) * 4;
        img.data[di] = src.data[si];
        img.data[di + 1] = src.data[si + 1];
        img.data[di + 2] = src.data[si + 2];
        img.data[di + 3] = 255;
      }
    }
  }
});
fs.writeFileSync(out, PNG.sync.write(img));
console.log(`${out}: ${ow}x${oh}`);
