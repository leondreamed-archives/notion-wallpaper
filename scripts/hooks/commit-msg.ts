#!/usr/bin/env -S npx ts-node-transpile-only --script-mode

import { execaSync } from 'execa';

const message = process.argv[process.argv.length - 1];

execaSync('pnpm', ['exec', 'commitlint', '--edit', message]);
