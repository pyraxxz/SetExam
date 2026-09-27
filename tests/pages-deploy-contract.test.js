const fs = require('fs');
const assert = require('assert');

const workflow = fs.readFileSync('.github/workflows/pages.yml', 'utf8');
const previewWorkflow = fs.readFileSync('.github/workflows/pages-preview.yml', 'utf8');

assert(workflow.includes('branches: [main]'), 'Pages deployment must only publish the main branch');
assert(workflow.includes('workflow_dispatch'), 'Pages deployment must remain manually triggerable');
assert(workflow.includes('pages: write'), 'Pages deployment needs Pages write permission');
assert(workflow.includes('id-token: write'), 'Pages deployment needs OIDC token permission');
assert(workflow.includes('actions/checkout@v5'), 'Pages workflow must use current checkout action');
assert(workflow.includes('actions/configure-pages@v5'), 'Pages workflow must configure the Pages environment');
assert(workflow.includes('actions/upload-pages-artifact@v3'), 'Pages workflow must publish a Pages artifact');
assert(workflow.includes('actions/deploy-pages@v4'), 'Pages workflow must deploy through the Pages action');
assert(workflow.includes('path: .'), 'Pages artifact must contain the simulator root');

console.log('GitHub Pages deployment contract passed.');

assert(previewWorkflow.includes('feat/exam-nav-splitter-polish'), 'PR preview workflow must track the feature branch');
assert(previewWorkflow.includes('github-pages-preview'), 'PR preview must use an isolated Pages environment');
assert(previewWorkflow.includes('git archive'), 'PR preview must materialize the pushed branch commit');
assert(previewWorkflow.includes('path: .'), 'PR preview must publish the assembled site artifact');
assert(previewWorkflow.includes('actions/deploy-pages@v4'), 'PR preview must deploy through GitHub Pages');
