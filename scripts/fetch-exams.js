/**
 * Fetches full exam data from YLE Tehtava API for each exam listed in exams.json.
 * Uses: https://tehtava.api.yle.fi/v1/public/exams.json?uuid=<EXAM_UUID>
 *
 * Usage: node fetch-exams.js [subject]
 *   subject: e.g. matematiikka-lyhyt, matematiikka-pitka (default: matematiikka-lyhyt)
 */

const fs = require('fs');
const path = require('path');

const API_BASE = 'https://tehtava.api.yle.fi/v1/public/exams.json';
const subject = process.argv[2] || 'matematiikka-lyhyt';
const EXAMS_JSON_PATH = path.join(__dirname, '..', 'data', subject, 'exams.json');
const OUT_DIR = path.join(__dirname, '..', 'data', subject, 'exams');

async function fetchExam(uuid) {
  const url = `${API_BASE}?uuid=${uuid}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json();
}

async function main() {
  const examsList = JSON.parse(fs.readFileSync(EXAMS_JSON_PATH, 'utf8'));
  const exams = examsList.data;

  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  for (const exam of exams) {
    const { name, uuid } = exam;
    console.log(`Fetching: ${name} (${uuid})`);
    try {
      const data = await fetchExam(uuid);
      const outPath = path.join(OUT_DIR, `${uuid}.json`);
      fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`  -> ${outPath}`);
    } catch (err) {
      console.error(`  ERROR: ${err.message}`);
    }
  }

  console.log('Done.');
}

main();
