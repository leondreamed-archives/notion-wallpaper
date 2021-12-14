#!/usr/bin/env -S npx ts-node-transpile-only --script-mode

import { execaCommandSync } from 'execa';

function precommit() {
	const branch = execaCommandSync(
		'git rev-parse --symbolic-full-name --abbrev-ref HEAD'
	).stdout.toString();

	if (branch === 'dev') {
		execaCommandSync('pnpm exec lint-staged', {
			stdout: process.stdout,
		});
	}
}

if (require.main === module) {
	precommit();
}
