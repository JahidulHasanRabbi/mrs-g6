// Shared spreadsheet -> game-sequence parsing for the three sequence importers
// (Smash Egg, Lucky Spin, Penalty Kick). SheetJS is imported lazily so its
// parser only loads once an admin actually opens an import modal.

export const ACCEPTED_EXTENSIONS = [".csv", ".xls", ".xlsx", ".xlsb", ".ods"];
export const ACCEPT_ATTR = ACCEPTED_EXTENSIONS.join(",");
export const MAX_FILE_BYTES = 5 * 1024 * 1024;

export const TEMPLATE_HEADERS = ["Position", "Reward Name", "Reward UUID"];

const POSITION_ALIASES = [
  "position", "positions", "order", "itemorder", "item order", "sequence",
  "sequenceorder", "slot", "no", "no.", "num", "number", "#",
];
const NAME_ALIASES = [
  "rewardname", "reward name", "reward", "itemname", "item name", "item",
  "prize", "prizename", "prize name", "name",
];
const UUID_ALIASES = [
  "rewarduuid", "reward uuid", "itemuuid", "item uuid", "uuid", "rewardid",
  "reward id", "itemid", "item id",
];

function cellText(value) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\s+/g, " ").trim();
}

function headerKey(value) {
  return cellText(value).toLowerCase().replace(/[_\-.]/g, "").replace(/\s+/g, " ").trim();
}

function nameKey(value) {
  return cellText(value).toLowerCase();
}

function matchColumn(row, aliases) {
  for (let i = 0; i < row.length; i += 1) {
    const key = headerKey(row[i]);
    if (!key) continue;
    if (aliases.includes(key) || aliases.includes(key.replace(/\s+/g, ""))) return i;
  }
  return -1;
}

function isBlankRow(row) {
  return !row || row.every((cell) => cellText(cell) === "");
}

/**
 * Read the first worksheet of a CSV/XLS/XLSX/XLSB/ODS file into a grid of
 * trimmed strings.
 */
export async function readSheetGrid(file) {
  if (!file) throw new Error("No file selected.");
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). The limit is 5MB.`);
  }

  const lower = file.name.toLowerCase();
  if (!ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext))) {
    throw new Error(`Unsupported file type. Use one of: ${ACCEPTED_EXTENSIONS.join(", ")}.`);
  }

  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();

  let workbook;
  try {
    workbook = XLSX.read(new Uint8Array(buffer), { type: "array", cellDates: false });
  } catch {
    throw new Error("Could not read that file - it may be corrupt or password protected.");
  }

  const sheetName = workbook.SheetNames?.[0];
  if (!sheetName) throw new Error("That file has no worksheets.");

  const grid = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
    header: 1,
    blankrows: false,
    defval: "",
    raw: true,
  });

  return grid.map((row) => (Array.isArray(row) ? row.map(cellText) : []));
}

/**
 * Turn a raw grid into positioned sequence entries resolved against the game's
 * rewards. Every input row comes back annotated, valid or not, so the modal can
 * preview the whole file instead of only the first failure.
 *
 * @param {string[][]} grid
 * @param {{id: string, name: string}[]} rewards
 */
export function buildSequenceImport(grid, rewards = []) {
  const rows = (grid || []).filter((row) => !isBlankRow(row));
  if (rows.length === 0) {
    return { rows: [], entries: [], errorCount: 0, fatal: "That file is empty." };
  }

  const byUuid = new Map();
  const byName = new Map();
  for (const reward of rewards) {
    if (reward?.id) byUuid.set(String(reward.id).toLowerCase(), reward);
    const key = nameKey(reward?.name);
    if (!key) continue;
    if (byName.has(key)) byName.get(key).push(reward);
    else byName.set(key, [reward]);
  }

  // Header row: the first of the top few rows that names any known column.
  let headerIndex = -1;
  let cols = { position: -1, name: -1, uuid: -1 };
  for (let i = 0; i < Math.min(rows.length, 5); i += 1) {
    const candidate = {
      position: matchColumn(rows[i], POSITION_ALIASES),
      name: matchColumn(rows[i], NAME_ALIASES),
      uuid: matchColumn(rows[i], UUID_ALIASES),
    };
    if (candidate.name !== -1 || candidate.uuid !== -1) {
      headerIndex = i;
      cols = candidate;
      break;
    }
  }

  // No header: fall back to the template's own column order.
  const headerless = headerIndex === -1;
  if (headerless) cols = { position: 0, name: 1, uuid: 2 };

  const dataRows = headerless ? rows : rows.slice(headerIndex + 1);
  if (dataRows.length === 0) {
    return { rows: [], entries: [], errorCount: 0, fatal: "That file has a header row but no data rows." };
  }

  const seenPositions = new Map();
  const annotated = dataRows.map((row, index) => {
    const rawPosition = cols.position === -1 ? "" : cellText(row[cols.position]);
    const rawName = cols.name === -1 ? "" : cellText(row[cols.name]);
    const rawUuid = cols.uuid === -1 ? "" : cellText(row[cols.uuid]);

    const entry = {
      line: index + 1,
      rawPosition,
      rawName,
      rawUuid,
      position: null,
      rewardId: null,
      rewardName: rawName,
      error: null,
    };

    // A file with no position column is read as top-to-bottom ordering.
    if (cols.position === -1) {
      entry.position = index + 1;
    } else {
      const digits = rawPosition.replace(/^#/, "");
      if (digits === "") entry.error = "Position is empty.";
      else if (!/^\d+$/.test(digits) || Number(digits) < 1) {
        entry.error = `"${rawPosition}" is not a position number (1 or greater).`;
      } else entry.position = Number(digits);
    }

    if (!entry.error) {
      if (rawUuid) {
        const match = byUuid.get(rawUuid.toLowerCase());
        if (match) {
          entry.rewardId = match.id;
          entry.rewardName = match.name;
        } else {
          entry.error = `No reward with UUID "${rawUuid}".`;
        }
      } else if (rawName) {
        const matches = byName.get(nameKey(rawName)) || [];
        if (matches.length === 1) {
          entry.rewardId = matches[0].id;
          entry.rewardName = matches[0].name;
        } else if (matches.length > 1) {
          entry.error = `"${rawName}" matches ${matches.length} rewards - add a Reward UUID column.`;
        } else {
          entry.error = `No reward named "${rawName}".`;
        }
      } else {
        entry.error = "Reward is empty.";
      }
    }

    if (!entry.error) {
      const clash = seenPositions.get(entry.position);
      if (clash) entry.error = `Position ${entry.position} is already used by row ${clash}.`;
      else seenPositions.set(entry.position, entry.line);
    }

    return entry;
  });

  const entries = annotated
    .filter((row) => !row.error)
    .map(({ position, rewardId, rewardName }) => ({ position, rewardId, rewardName }))
    .sort((a, b) => a.position - b.position);

  return {
    rows: annotated,
    entries,
    errorCount: annotated.filter((row) => row.error).length,
    fatal: null,
  };
}

function csvCell(value) {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(rows) {
  return rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}

/**
 * A template pre-filled with this game's real rewards, so an operator edits the
 * Position column instead of guessing at names.
 */
export function buildTemplateCsv(rewards = []) {
  const sample = rewards.slice(0, 8);
  const rows = [TEMPLATE_HEADERS];

  if (sample.length === 0) {
    rows.push([1, "Free Credit 10", ""], [2, "Token x5", ""]);
  } else {
    sample.forEach((reward, index) => rows.push([index + 1, reward.name, reward.id]));
  }

  return toCsv(rows);
}

export function downloadCsv(filename, csv) {
  // BOM keeps Excel from mangling non-ASCII reward names.
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/**
 * Clear the existing sequence, then create the imported one. There is no bulk
 * sequence endpoint, so this is one request per row — and a mid-run failure
 * leaves the sequence partially written, which callers must report.
 */
export async function replaceSequence({ existing = [], entries = [], deleteOne, createOne, onProgress }) {
  const total = existing.length + entries.length;
  let done = 0;
  const report = (label) => onProgress?.({ done, total, label });

  report(existing.length ? `Clearing ${existing.length} existing positions...` : "Creating positions...");

  for (const row of existing) {
    await deleteOne(row);
    done += 1;
    report(`Cleared ${done} of ${existing.length} existing positions...`);
  }

  for (let i = 0; i < entries.length; i += 1) {
    await createOne(entries[i]);
    done += 1;
    report(`Created ${i + 1} of ${entries.length} positions...`);
  }
}

/**
 * Walk every page of a paginated sequence endpoint. "Replace all" has to delete
 * rows the on-screen page never loaded, so it needs the full list.
 */
export async function fetchAllSequences(fetchPage, { pageSize = 100, maxPages = 50 } = {}) {
  const all = [];
  for (let page = 1; page <= maxPages; page += 1) {
    const response = await fetchPage({ page, page_size: pageSize });
    const batch = Array.isArray(response) ? response : response?.results || [];
    all.push(...batch);
    if (Array.isArray(response) || batch.length === 0) break;
    const count = Number(response?.count);
    const moreByCount = Number.isFinite(count) && all.length < count;
    if (!response?.next && !moreByCount) break;
  }
  return all;
}
