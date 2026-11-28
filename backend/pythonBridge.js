const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

const PYTHON_SCRIPT_PATH = path.join(__dirname, 'python_ai', 'setu_python_brain.py');
const ROOT_DIR = path.join(__dirname, '..');

function jsParityBoqAudit(payload = {}) {
  const projectType = String(payload.projectType || 'custom').toLowerCase();
  const areaSqFt = Math.max(20, Number(payload.areaSqFt) || 120);
  let quantities = {};
  const notes = [];

  if (['house', 'mason', 'boundary'].includes(projectType)) {
    quantities = {
      cement_bags_50kg: Math.ceil(areaSqFt * 0.42),
      river_sand_cft: Math.ceil(areaSqFt * 1.35),
      aggregate_20mm_cft: Math.ceil(areaSqFt * 1.15),
      tmt_steel_fe550_kg: Math.ceil(areaSqFt * 3.85),
      red_bricks_pcs: Math.ceil(areaSqFt * 18),
    };
    notes.push('IS-456 structural rule: ~0.42 cement bag & ~3.85kg TMT steel per sq.ft.');
  } else if (['kitchen', 'wardrobe', 'bed', 'tv_unit_living', 'door_window'].includes(projectType)) {
    const ply = Math.max(2, Math.ceil((areaSqFt * 1.1) / 32));
    quantities = {
      plywood_8x4_sheets: ply,
      laminate_1mm_sheets: ply,
      adhesive_marine_kg: Math.max(2, Math.ceil(ply * 0.8)),
      cutting_wastage_pct: 10,
    };
    notes.push('8x4 sheet nesting calculated with 10% carpenter wastage allowance.');
  } else {
    quantities = {
      estimated_units: Math.max(1, Math.ceil(areaSqFt / 25)),
      safety_buffer_pct: 8,
    };
  }

  return {
    ok: true,
    runtime: 'Node-Python-Parity (Serverless)',
    projectType,
    areaSqFt,
    quantities,
    engineeringNotes: notes,
  };
}

function jsParityCodeAudit() {
  let srcFiles = 0;
  let windowAlertsFound = 0;
  let nativeAlertCallsFound = 0;
  let unprotectedAdminRoutes = 0;
  const issues = [];

  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(ts|tsx)$/.test(entry.name)) {
        srcFiles += 1;
        const txt = fs.readFileSync(full, 'utf8');
        const rel = path.relative(ROOT_DIR, full).replace(/\\/g, '/');
        if (txt.includes('window.alert(') || txt.includes('window.confirm(')) {
          windowAlertsFound += 1;
          issues.push(`Browser popup in ${rel}`);
        }
        if (rel !== 'src/utils/appAlert.ts' && txt.includes('Alert.alert(')) {
          nativeAlertCallsFound += 1;
          issues.push(`Legacy Alert.alert in ${rel}`);
        }
      }
    }
  }

  walk(path.join(ROOT_DIR, 'src'));
  const serverPath = path.join(__dirname, 'server.js');
  if (fs.existsSync(serverPath)) {
    const lines = fs.readFileSync(serverPath, 'utf8').split(/\r?\n/);
    lines.forEach((ln, i) => {
      if (/app\.(get|post|put|patch|delete)\(\s*['"]\/api\/admin\//.test(ln)) {
        if (!ln.includes('/api/admin/login') && !ln.includes('/api/admin/verify-passcode')) {
          if (!ln.includes('requireAuth') || !ln.includes('requireRole')) {
            unprotectedAdminRoutes += 1;
            issues.push(`Admin route missing RBAC guard at backend/server.js:${i + 1}`);
          }
        }
      }
    });
  }

  const score = Math.max(40, 100 - windowAlertsFound * 10 - nativeAlertCallsFound * 5 - unprotectedAdminRoutes * 25);
  return {
    ok: true,
    securityScore: score,
    stats: {
      srcFiles,
      windowAlertsFound,
      nativeAlertCallsFound,
      unprotectedAdminRoutes,
      pythonRuntime: 'Node Parity Fallback',
    },
    issues,
    summary: issues.length === 0 ? 'All inspected routes & UI alerts passed static hygiene checks.' : `Detected ${issues.length} issue(s).`,
  };
}

function invokePythonEngine(mode = 'code_audit', payload = {}) {
  return new Promise((resolve) => {
    if (!fs.existsSync(PYTHON_SCRIPT_PATH)) {
      return resolve(mode === 'boq_audit' ? jsParityBoqAudit(payload) : jsParityCodeAudit());
    }

    const candidates = process.platform === 'win32' ? ['python', 'py'] : ['python3', 'python'];
    let idx = 0;

    const tryNext = () => {
      if (idx >= candidates.length) {
        return resolve(mode === 'boq_audit' ? jsParityBoqAudit(payload) : jsParityCodeAudit());
      }
      const cmd = candidates[idx++];
      const child = execFile(
        cmd,
        [PYTHON_SCRIPT_PATH, '--mode', mode, '--stdin'],
        { timeout: 3500, cwd: ROOT_DIR, maxBuffer: 1024 * 1024 },
        (err, stdout) => {
          if (!err && stdout && stdout.trim()) {
            try {
              const parsed = JSON.parse(stdout.trim());
              if (parsed && parsed.ok) return resolve(parsed);
            } catch {
              // fall through to next candidate/parity fallback
            }
          }
          tryNext();
        }
      );
      try {
        child.stdin.write(JSON.stringify({ ...payload, rootDir: ROOT_DIR }));
        child.stdin.end();
      } catch {
        // ignore stdin error
      }
    };

    tryNext();
  });
}

module.exports = {
  invokePythonEngine,
  PYTHON_SCRIPT_PATH,
};
