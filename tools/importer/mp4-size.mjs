/**
 * A video's display size from its MP4 header: the first track with a size in its track header
 * (moov > trak > tkhd: width and height in 16.16 fixed point), turned by a 90 or 270 degree matrix
 * (a phone video recorded upright: width and height swap). Only the box headers and the moov box
 * are read, so a 200 MB file costs a few small range requests.
 *
 * mp4SizeOf(read): read(start, end) returns { buf, total } for that byte range (inclusive).
 * Helpers: httpReader(url) (HTTP range requests), fileReader(path).
 */
/* eslint-disable no-await-in-loop, no-restricted-syntax -- a box walk, one read after another */
import fs from 'node:fs';

/** The boxes in buf[start, end): { type, start, head, end }. */
function boxes(buf, start, end) {
  const out = [];
  for (let o = start; o + 8 <= end;) {
    let size = buf.readUInt32BE(o);
    const type = buf.toString('latin1', o + 4, o + 8);
    let head = 8;
    if (size === 1) {
      size = Number(buf.readBigUInt64BE(o + 8));
      head = 16;
    }
    if (size === 0) size = end - o;
    if (size < head) break;
    out.push({
      type, start: o, head, end: Math.min(o + size, end),
    });
    o += size;
  }
  return out;
}

/** The video track's size in a moov box's bytes, or null. */
export function sizeInMoov(moov) {
  const traks = boxes(moov, 8, moov.length).filter((b) => b.type === 'trak');
  for (const trak of traks) {
    const tkhd = boxes(moov, trak.start + trak.head, trak.end).find((b) => b.type === 'tkhd');
    if (tkhd) {
      const p = tkhd.start + tkhd.head;
      const version = moov.readUInt8(p);
      // version/flags, times (32 or 64 bit), track id, reserved, duration, reserved (8), layer,
      // alternate group, volume, reserved: then the 3x3 matrix and width, height
      const times = version === 1 ? 8 + 8 + 4 + 4 + 8 : 4 + 4 + 4 + 4 + 4;
      const matrix = p + 4 + times + 8 + 2 + 2 + 2 + 2;
      const a = moov.readInt32BE(matrix) / 65536;
      const b = moov.readInt32BE(matrix + 4) / 65536;
      const width = Math.round(moov.readUInt32BE(matrix + 36) / 65536);
      const height = Math.round(moov.readUInt32BE(matrix + 40) / 65536);
      if (width && height) {
        const turned = Math.abs(a) < 0.01 && Math.abs(Math.abs(b) - 1) < 0.01;
        return turned ? { width: height, height: width } : { width, height };
      }
    }
  }
  return null;
}

/** The size of the MP4 that read() reads, or null (no moov box, no video track). */
export async function mp4SizeOf(read) {
  let offset = 0;
  let total = Infinity;
  for (let i = 0; i < 64 && offset < total; i += 1) {
    const { buf, total: t } = await read(offset, offset + 15);
    total = t;
    if (buf.length < 8) return null;
    let size = buf.readUInt32BE(0);
    const type = buf.toString('latin1', 4, 8);
    if (size === 1) size = Number(buf.readBigUInt64BE(8));
    if (size === 0) size = total - offset;
    if (size < 8) return null;
    if (type === 'moov') {
      const { buf: moov } = await read(offset, offset + size - 1);
      return sizeInMoov(moov);
    }
    offset += size;
  }
  return null;
}

/** A reader of a URL by HTTP range requests. */
export function httpReader(url) {
  return async (start, end) => {
    const r = await fetch(url, { headers: { range: `bytes=${start}-${end}` } });
    if (r.status !== 206 && r.status !== 200) throw new Error(`${r.status} ${url}`);
    const buf = Buffer.from(await r.arrayBuffer());
    const range = (r.headers.get('content-range') || '').split('/')[1];
    const total = Number(range) || Number(r.headers.get('content-length'));
    // a server that ignores the range sends the whole file
    if (r.status === 200) return { buf: buf.subarray(start, end + 1), total: buf.length };
    return { buf, total };
  };
}

/** A reader of a local file. */
export function fileReader(file) {
  const total = fs.statSync(file).size;
  return async (start, end) => {
    const fd = fs.openSync(file, 'r');
    try {
      const len = Math.max(0, Math.min(end, total - 1) - start + 1);
      const buf = Buffer.alloc(len);
      fs.readSync(fd, buf, 0, len, start);
      return { buf, total };
    } finally {
      fs.closeSync(fd);
    }
  };
}
