/* eslint-disable import/extensions, max-len -- plain Node */
/**
 * The parity sweep's pairing (tests: test/parity-jobs-slugs.test.mjs): a www capture (keyed by its www path) and our page,
 * which lives where the write step put it (tools/importer/slug-write.mjs writeTarget: its canonical path once its alias is
 * active in tools/slugs/lh-com.json; flags off: the www path, as before).
 */
import { writeTarget } from '../importer/slug-write.mjs';

export const EDS_ORIGIN = 'https://main--lh-com--moved-permanently.aem.page';

export const edsUrlOf = (wwwPath, map, origin = EDS_ORIGIN) => `${origin}${writeTarget(wwwPath, map)}`;
