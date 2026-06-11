import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { analyze, renderReport } from './analyze.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const fixtureLines = readFileSync(join(here, 'fixtures/transcript.jsonl'), 'utf8')
  .split('\n')
  .filter(Boolean)

test('fixture transcript yields all-YES verdicts', () => {
  const a = analyze(fixtureLines)
  assert.equal(a.verdicts.discoveredStages, true)
  assert.equal(a.verdicts.fetchedStagePrompt, true)
  assert.equal(a.verdicts.scaffoldedKnowledgeBase, true)
  assert.equal(a.verdicts.listedSkills, true)
  assert.equal(a.verdicts.fetchedSkill, true)
  assert.equal(a.verdicts.fetchedSupportFile, true)
  assert.equal(a.verdicts.producedPrdArtifact, true)
  assert.equal(a.verdicts.wroteDevlog, true)
  assert.equal(a.verdicts.stoppedAtHumanGate, true)
})

test('fixture transcript extracts ordered tool calls and written files', () => {
  const a = analyze(fixtureLines)
  assert.equal(a.toolCalls[0].name, 'mcp__orchestra__orchestra_list_stages')
  assert.equal(a.toolCalls.length, 9)
  assert.ok(
    a.filesWritten.includes('/tmp/pilot-sandbox/.orchestra/work/001-release-notes-cli/prd.md')
  )
  assert.equal(a.leaks.length, 0)
  assert.match(a.finalText, /human gate/)
})

test('empty transcript yields all-NO verdicts, no crash', () => {
  const a = analyze([])
  for (const v of Object.values(a.verdicts)) assert.equal(v, false)
  assert.equal(a.toolCalls.length, 0)
  assert.equal(a.filesWritten.length, 0)
})

test('malformed and unknown lines are skipped, remainder analyzed', () => {
  const lines = [
    'this is not json {{{',
    '{"type":"weird_future_event","data":1}',
    '{"type":"assistant","message":{"content":[{"type":"tool_use","id":"t1","name":"mcp__orchestra__orchestra_list_stages","input":{}}]}}',
  ]
  const a = analyze(lines)
  assert.equal(a.verdicts.discoveredStages, true)
  assert.equal(a.toolCalls.length, 1)
})

test('non-orchestra MCP tools are flagged as isolation leaks', () => {
  const lines = [
    '{"type":"assistant","message":{"content":[{"type":"tool_use","id":"t1","name":"mcp__github__create_issue","input":{}}]}}',
  ]
  const a = analyze(lines)
  assert.deepEqual(a.leaks, ['mcp__github__create_issue'])
})

test('report renders a verdict table with one row per measurement', () => {
  const a = analyze(fixtureLines)
  const report = renderReport(a)
  for (const key of Object.keys(a.verdicts)) assert.ok(report.includes(key), `missing row: ${key}`)
  assert.match(report, /\| discoveredStages \| YES \|/)
  assert.match(report, /orchestra_list_stages/)
})

test('all-NO run still renders a usable report', () => {
  const report = renderReport(analyze([]))
  assert.match(report, /\| discoveredStages \| NO \|/)
  assert.match(report, /finding, not a harness error/i)
})
