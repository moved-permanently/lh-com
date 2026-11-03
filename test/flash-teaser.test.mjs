/* eslint-disable max-len */
/* flash-teaser's rotation (blocks/flash-teaser/flash-teaser.js buildStrip): www's countdown ring
   (.dcep-flash-teaser, brief 302): with two or more messages a ring around play/pause fills over
   7 s and, when full, the next message comes in (0.2 s out) and the ring starts empty again, one
   clock (requestAnimationFrame) driving both; hover on the message and pause hold the progress;
   previous/next, arrow keys, swipe and focus in a message stop the rotation (the ring empty, the
   play icon); reduced motion starts stopped; a single message has no ring and no controls. The
   control row as www: ring with play/pause, pager "1/2", previous/next. An injected clock (now,
   raf) instead of real waits. Run: node --max-old-space-size=512 --test test/flash-teaser.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body><main></main></body></html>');
window.matchMedia = () => ({ matches: false, addEventListener() {} });
globalThis.window = window;
globalThis.document = document;
globalThis.Node = window.Node;
const { buildStrip, ROTATION_MS } = await import('../blocks/flash-teaser/flash-teaser.js');

const LABELS = {
  title: 'Current travel information, alerts and promotions',
  stepper: 'Message {CURRENT} of {TOTAL}',
  critical: 'Attention',
  promo: 'Promotion',
  previous: 'Previous message',
  next: 'Next message',
  start: 'Start slider rotation',
  stop: 'Stop slider rotation',
};
const msg = (id, headline) => ({
  id, headline, type: 'irreg', criticality: 'low', link: `/ch/en/${id}`, lang: 'en',
});
const TWO = [msg('dubai', 'Information on flights to Dubai'), msg('edelweiss', 'Edelweiss maintenance')];
const C = 2 * Math.PI * 11.25;

/** A strip with a fake clock: advance(ms) runs the queued frames every 16 ms. */
function make(messages = TWO, { reducedMotion = false } = {}) {
  let t = 0;
  let queue = [];
  let id = 0;
  const env = {
    now: () => t,
    raf: (fn) => { id += 1; queue.push([id, fn]); return id; },
    caf: (n) => { queue = queue.filter(([i]) => i !== n); },
    reducedMotion,
  };
  const view = buildStrip(messages, { ...LABELS }, [], { lang: 'en', country: 'ch' }, env);
  document.querySelector('main').replaceChildren(view.region);
  const advance = (ms) => {
    const end = t + ms;
    while (t < end) {
      t = Math.min(end, t + 16);
      const run = queue;
      const at = t;
      queue = [];
      run.forEach(([, fn]) => fn(at));
    }
  };
  const r = view.region;
  const q = (s) => r.querySelector(s);
  const progress = () => {
    const c = q('.flash-teaser-ring-progress');
    return 1 - Number(c.getAttribute('stroke-dashoffset')) / C;
  };
  const active = () => [...r.querySelectorAll('.flash-teaser-slide')].findIndex((s) => !s.hidden);
  return {
    r, q, advance, progress, active, view,
  };
}
const near = (a, b, msg2) => assert.ok(Math.abs(a - b) < 0.02, `${msg2}: ${a} vs ${b}`);

test('the ring: an SVG of two circles (r 11.25, stroke 1.5), decoration only; the control row as www', () => {
  const { q, r } = make();
  const svg = q('.flash-teaser-ring');
  assert.equal(svg.getAttribute('aria-hidden'), 'true');
  assert.equal(svg.getAttribute('viewBox'), '0 0 24 24');
  const circles = [...svg.querySelectorAll('circle')];
  assert.deepEqual(circles.map((c) => c.getAttribute('class')), ['flash-teaser-ring-track', 'flash-teaser-ring-progress']);
  circles.forEach((c) => {
    assert.equal(c.getAttribute('r'), '11.25');
    assert.equal(c.getAttribute('stroke-width'), '1.5');
    assert.equal(c.getAttribute('fill'), 'none');
  });
  near(Number(q('.flash-teaser-ring-progress').getAttribute('stroke-dasharray')), C, 'dasharray the circumference');
  // left to right: the ring with play/pause, the pager, previous/next
  const row = [...q('.flash-teaser-controls').children].map((c) => c.className);
  assert.deepEqual(row, ['flash-teaser-timer', 'flash-teaser-pager', 'flash-teaser-nav']);
  assert.ok(q('.flash-teaser-timer .flash-teaser-toggle'), 'play/pause inside the ring');
  assert.equal(q('.flash-teaser-pager').textContent, '1/2');
  assert.deepEqual([...q('.flash-teaser-nav').children].map((b) => b.getAttribute('aria-label')), ['Previous message', 'Next message']);
  assert.equal(q('.flash-teaser-toggle').getAttribute('aria-label'), 'Stop slider rotation');
  assert.equal(r.querySelector('.flash-teaser-slides').getAttribute('aria-live'), 'off', 'no announcements while it rotates');
});

test('progress after a given time; a full ring brings the next message (0.2 s out) and starts empty', () => {
  const {
    advance, progress, active, q,
  } = make();
  assert.equal(ROTATION_MS, 7000);
  near(progress(), 0, 'at the start');
  advance(3500);
  near(progress(), 0.5, 'after 3.5 s');
  assert.equal(active(), 0);
  advance(3500);
  near(progress(), 1, 'full after 7 s');
  assert.ok(q('.flash-teaser-slide.is-leaving'), 'the message goes out');
  advance(250);
  assert.equal(active(), 1, 'the next message after 0.2 s out');
  assert.equal(q('.flash-teaser-pager').textContent, '2/2');
  assert.ok(progress() < 0.05, 'the ring starts again from empty');
  advance(7300);
  assert.equal(active(), 0, 'and wraps round');
});

test('hover on the message holds the ring where it is; leaving goes on from there', () => {
  const {
    advance, progress, active, q,
  } = make();
  advance(2000);
  q('.flash-teaser-slides').dispatchEvent(new window.Event('mouseenter'));
  advance(10000);
  near(progress(), 2000 / 7000, 'held while hovered');
  assert.equal(active(), 0);
  q('.flash-teaser-slides').dispatchEvent(new window.Event('mouseleave'));
  advance(5000);
  near(progress(), 1, 'goes on from 2 s: full after 5 s more');
});

test('pause holds the ring and shows play; play goes on from that point', () => {
  const {
    advance, progress, active, q,
  } = make();
  advance(3000);
  q('.flash-teaser-toggle').dispatchEvent(new window.Event('click'));
  assert.equal(q('.flash-teaser-toggle').getAttribute('aria-label'), 'Start slider rotation');
  assert.equal(q('.flash-teaser-toggle').dataset.state, 'play');
  assert.equal(q('.flash-teaser-slides').getAttribute('aria-live'), 'polite');
  advance(20000);
  near(progress(), 3000 / 7000, 'held while paused');
  assert.equal(active(), 0);
  q('.flash-teaser-toggle').dispatchEvent(new window.Event('click'));
  assert.equal(q('.flash-teaser-toggle').dataset.state, 'pause');
  advance(4100);
  advance(300);
  assert.equal(active(), 1, 'the next message 4 s after play');
});

test('previous/next, arrow keys, swipe and focus in a message stop the rotation: ring empty, play icon', () => {
  const stopped = (s, why) => {
    near(s.progress(), 0, `${why}: the ring empty`);
    assert.equal(s.q('.flash-teaser-toggle').dataset.state, 'play', `${why}: the play icon`);
    const at = s.active();
    s.advance(15000);
    assert.equal(s.active(), at, `${why}: no rotation`);
    near(s.progress(), 0, `${why}: the ring stays empty`);
  };
  let s = make();
  s.advance(3000);
  s.q('.flash-teaser-next').dispatchEvent(new window.Event('click'));
  assert.equal(s.active(), 1);
  assert.match(s.q('.flash-teaser-status').textContent, /^Message 2 of 2\. /);
  stopped(s, 'next');
  s = make();
  s.advance(3000);
  s.q('.flash-teaser-previous').dispatchEvent(new window.Event('click'));
  assert.equal(s.active(), 1, 'previous from the first wraps to the last');
  stopped(s, 'previous');
  ['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].forEach((key) => {
    s = make();
    s.advance(2000);
    const e = new window.Event('keydown', { bubbles: true });
    e.key = key;
    s.r.dispatchEvent(e);
    stopped(s, key);
  });
  s = make();
  s.advance(2000);
  const start = new window.Event('touchstart');
  start.touches = [{ clientX: 300 }];
  const end = new window.Event('touchend');
  end.changedTouches = [{ clientX: 100 }];
  s.r.dispatchEvent(start);
  s.r.dispatchEvent(end);
  assert.equal(s.active(), 1, 'swipe left: next');
  stopped(s, 'swipe');
  s = make();
  s.advance(2000);
  s.q('.flash-teaser-slide a').dispatchEvent(new window.Event('focusin', { bubbles: true }));
  stopped(s, 'focus in a message');
  // only play starts it again, from empty
  s.q('.flash-teaser-toggle').dispatchEvent(new window.Event('click'));
  s.advance(3500);
  near(s.progress(), 0.5, 'play: from empty');
});

test('focus on the controls does not stop the rotation', () => {
  const s = make();
  s.advance(1000);
  s.q('.flash-teaser-toggle').dispatchEvent(new window.Event('focusin', { bubbles: true }));
  s.advance(1000);
  near(s.progress(), 2000 / 7000, 'goes on');
});

test('reduced motion: stopped from the start, the ring empty with the play icon until play', () => {
  const s = make(TWO, { reducedMotion: true });
  assert.equal(s.q('.flash-teaser-toggle').dataset.state, 'play');
  assert.equal(s.q('.flash-teaser-slides').getAttribute('aria-live'), 'polite');
  s.advance(15000);
  assert.equal(s.active(), 0);
  near(s.progress(), 0, 'empty');
  s.q('.flash-teaser-toggle').dispatchEvent(new window.Event('click'));
  s.advance(3500);
  near(s.progress(), 0.5, 'fills after play');
});

test('one message: no ring, no controls', () => {
  const s = make([TWO[0]]);
  assert.equal(s.q('.flash-teaser-ring'), null);
  assert.equal(s.q('.flash-teaser-controls'), null);
  assert.equal(s.q('.flash-teaser-slides').getAttribute('aria-live'), 'polite');
});
