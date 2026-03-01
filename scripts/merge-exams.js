/**
 * Creates exams-merged.json for a subject: merges the exam list (exams.json)
 * with full exam data from exams/<uuid>.json, and simplifies the structure
 * (no meta, exams array instead of data).
 *
 * Usage: node merge-exams.js [subject]
 *   subject: e.g. psykologia, matematiikka-lyhyt (default: psykologia)
 *
 * Output: data/<subject>/exams-merged.json
 *   { name: "Subject", exams: [ { uuid, name, main_text, questions, ... } ] }
 */

const fs = require('fs');
const path = require('path');

const subject = process.argv[2] || 'psykologia';
const DATA_DIR = path.join(__dirname, '..', 'data', subject);
const EXAMS_JSON_PATH = path.join(DATA_DIR, 'exams.json');
const EXAMS_DIR = path.join(DATA_DIR, 'exams');
const OUT_PATH = path.join(DATA_DIR, 'exams-merged.json');

function subjectDisplayName(subjectKey) {
  return subjectKey
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function main() {
  const listRaw = fs.readFileSync(EXAMS_JSON_PATH, 'utf8');
  const list = JSON.parse(listRaw);
  const examItems = list.data || [];

  const exams = [];
  for (const item of examItems) {
    const { name, uuid } = item;
    const examPath = path.join(EXAMS_DIR, `${uuid}.json`);
    if (!fs.existsSync(examPath)) {
      console.warn(`  Skip (missing): ${name} (${uuid})`);
      continue;
    }
    const raw = fs.readFileSync(examPath, 'utf8');
    const doc = JSON.parse(raw);
    const fullExam = Array.isArray(doc.data) && doc.data[0] ? doc.data[0] : null;
    if (!fullExam) {
      console.warn(`  Skip (no data): ${name} (${uuid})`);
      continue;
    }
    exams.push({
      ...fullExam,
      uuid,
      name: fullExam.name ?? name,
    });
  }

  const merged = {
    name: subjectDisplayName(subject),
    exams,
  };

  fs.writeFileSync(OUT_PATH, JSON.stringify(merged, null, 2), 'utf8');
  console.log(`Wrote ${exams.length} exams -> ${OUT_PATH}`);
}

main();
