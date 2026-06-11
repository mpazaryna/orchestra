#!/usr/bin/env node
// Parses a headless Claude Code stream-json transcript and renders a verdict
// report: did the deployed Orchestra tool catalog, alone, trigger the SDLC?

const ORCHESTRA_PREFIX = 'mcp__orchestra__'

export function analyze(lines) {
  const toolCalls = []
  const filesWritten = []
  const leaks = []
  let finalText = ''

  for (const line of lines) {
    let event
    try {
      event = JSON.parse(line)
    } catch {
      continue
    }
    if (event?.type === 'assistant') {
      const content = event.message?.content ?? []
      for (const block of content) {
        if (block?.type !== 'tool_use') continue
        toolCalls.push({ name: block.name, input: block.input ?? {} })
        if (block.name.startsWith('mcp__') && !block.name.startsWith(ORCHESTRA_PREFIX)) {
          leaks.push(block.name)
        }
        if ((block.name === 'Write' || block.name === 'Edit') && block.input?.file_path) {
          filesWritten.push(block.input.file_path)
        }
      }
    } else if (event?.type === 'result' && typeof event.result === 'string') {
      finalText = event.result
    }
  }

  const called = (tool) => toolCalls.some((c) => c.name === ORCHESTRA_PREFIX + tool)
  const calledWith = (tool, pred) =>
    toolCalls.some((c) => c.name === ORCHESTRA_PREFIX + tool && pred(c.input))

  const verdicts = {
    discoveredStages: called('orchestra_list_stages'),
    fetchedStagePrompt: called('orchestra_get_prompt'),
    scaffoldedKnowledgeBase:
      called('orchestra_scaffold') || filesWritten.some((f) => f.includes('.orchestra/')),
    listedSkills: called('orchestra_list_skills'),
    fetchedSkill: called('orchestra_get_skill'),
    fetchedSupportFile: calledWith('orchestra_get_skill', (input) => Boolean(input?.file)),
    producedPrdArtifact: filesWritten.some((f) => /prd\.md$|\.orchestra\/work\//.test(f)),
    wroteDevlog: called('orchestra_devlog_entry'),
    stoppedAtHumanGate: /\b(approv|human|gate|review)\w*/i.test(finalText),
  }

  return { toolCalls, filesWritten, leaks, finalText, verdicts }
}

export function renderReport(analysis) {
  const { toolCalls, filesWritten, leaks, finalText, verdicts } = analysis
  const lines = []

  lines.push('# Orchestra Pilot — Run Report', '')
  lines.push('## Verdicts', '')
  lines.push('| Measurement | Verdict |')
  lines.push('|-------------|---------|')
  for (const [key, value] of Object.entries(verdicts)) {
    lines.push(`| ${key} | ${value ? 'YES' : 'NO'} |`)
  }
  lines.push('')
  lines.push(
    '_`stoppedAtHumanGate` is a text heuristic on the final message — confirm by reading the transcript._'
  )
  lines.push('')

  if (Object.values(verdicts).every((v) => !v)) {
    lines.push(
      'The agent never engaged the Orchestra catalog. This is a finding, not a harness error — record it in findings.md.',
      ''
    )
  }

  lines.push('## Isolation', '')
  lines.push(
    leaks.length === 0
      ? 'Clean — no non-orchestra MCP tools appear in the transcript.'
      : `**LEAK** — non-orchestra MCP tools were available/used: ${[...new Set(leaks)].join(', ')}`
  )
  lines.push('')

  lines.push(`## Tool Calls (${toolCalls.length})`, '')
  toolCalls.forEach((c, i) => {
    lines.push(`${i + 1}. \`${c.name}\` ${JSON.stringify(c.input)}`)
  })
  lines.push('')

  lines.push(`## Files Written (${filesWritten.length})`, '')
  for (const f of filesWritten) lines.push(`- \`${f}\``)
  lines.push('')

  lines.push('## Final Message', '', '> ' + (finalText || '(none)').replaceAll('\n', '\n> '), '')

  return lines.join('\n')
}

import { fileURLToPath } from 'node:url'
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { readFileSync, writeFileSync } = await import('node:fs')
  const { join } = await import('node:path')
  const runDir = process.argv[2]
  if (!runDir) {
    console.error('usage: analyze.mjs <run-dir containing transcript.jsonl>')
    process.exit(1)
  }
  const lines = readFileSync(join(runDir, 'transcript.jsonl'), 'utf8').split('\n').filter(Boolean)
  const analysis = analyze(lines)
  const report = renderReport(analysis)
  writeFileSync(join(runDir, 'report.md'), report)
  console.log(report)
}
