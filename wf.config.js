import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  docsRoot: resolve(__dirname, 'docs/wf-plans'),
  projectRoot: __dirname,
  base: 'develop',
  auditRules: './wf-audit.md',
  auditMaxPasses: 3,
  coverageThreshold: 97,
  qaRules: './wf-qa.md',
  linear: {
    team: 'Neurasphere',
    project: 'Second Memory MCP',
  },
};
