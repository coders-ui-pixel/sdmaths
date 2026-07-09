// Minimal RFC4180-style CSV parser: handles quoted fields with embedded commas,
// escaped quotes (""), and both \n and \r\n line endings. No external dependency
// needed for the simple fixed-column question-bank format.
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let inQuotes = false

  const pushField = () => { row.push(field); field = "" }
  const pushRow = () => { pushField(); rows.push(row); row = [] }

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const next = text[i + 1]

    if (inQuotes) {
      if (char === '"' && next === '"') { field += '"'; i++ }
      else if (char === '"') { inQuotes = false }
      else { field += char }
    } else {
      if (char === '"') inQuotes = true
      else if (char === ",") pushField()
      else if (char === "\r") { /* skip, \n handles the row break */ }
      else if (char === "\n") pushRow()
      else field += char
    }
  }
  if (field.length > 0 || row.length > 0) pushRow()

  return rows.filter(r => r.some(cell => cell.trim() !== ""))
}

// Accepts a letter (A-D) or a 1-based number (1-4) and returns a 0-based index.
export function parseCorrectOption(raw: string): number | null {
  const val = raw.trim().toUpperCase()
  if (["A", "B", "C", "D"].includes(val)) return val.charCodeAt(0) - 65
  const num = parseInt(val, 10)
  if (!isNaN(num) && num >= 1 && num <= 4) return num - 1
  return null
}
