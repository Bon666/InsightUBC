import JSZip from "jszip";

export type Row = Record<string, any>;

/**
 * Loads a zip buffer and extracts JSON rows from any *.json files in it.
 * Expected zip contains one or more JSON files with an array of objects.
 */
export async function loadRowsFromZip(zipBytes: Buffer): Promise<Row[]> {
  const zip = await JSZip.loadAsync(zipBytes);
  const rows: Row[] = [];

  const files = Object.values(zip.files).filter((f) => !f.dir && f.name.toLowerCase().endsWith(".json"));
  if (files.length === 0) {
    throw new Error("Zip contains no .json files");
  }

  for (const f of files) {
    const text = await f.async("string");
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error(`Invalid JSON in file: ${f.name}`);
    }

    const arr = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.result) ? parsed.result : null;
    if (!arr || !Array.isArray(arr)) {
      throw new Error(`JSON must be an array (or {result:[]}) in file: ${f.name}`);
    }

    for (const item of arr) {
      if (item && typeof item === "object") rows.push(item);
    }
  }

  return rows;
}
