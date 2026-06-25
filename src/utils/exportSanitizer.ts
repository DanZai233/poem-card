// Utility to sanitize and restore document style rules before/after exporting with html2canvas.
// This prevents the common parser crash: 'Attempting to parse an unsupported color function "oklab"'
// caused by Tailwind v4's oklab/oklch color system.

interface SavedRule {
  sheet: CSSStyleSheet;
  ruleText: string;
  index: number;
}

export function sanitizeStylesForExport(): () => void {
  const savedRules: SavedRule[] = [];

  for (let i = 0; i < document.styleSheets.length; i++) {
    const sheet = document.styleSheets[i];
    try {
      // Attempt to access stylesheet rules (wrapped in try/catch to handle CORS restrictions gracefully)
      const rules = sheet.cssRules || sheet.rules;
      if (!rules) continue;

      // Scan rules backwards so deleting rules doesn't mess up preceding indices
      for (let j = rules.length - 1; j >= 0; j--) {
        const rule = rules[j];
        if (!rule || !rule.cssText) continue;

        const text = rule.cssText;
        if (text.includes("oklab") || text.includes("oklch")) {
          // Save the rule and its index to restore later
          savedRules.push({
            sheet,
            ruleText: text,
            index: j
          });
          // Safely delete the offending rule from the active stylesheet
          sheet.deleteRule(j);
        }
      }
    } catch (e) {
      // CORS restricted stylesheet, safe to skip since our app styles are hosted locally
      console.warn("Could not read stylesheet rules during sanitization:", e);
    }
  }

  // Return the restoration callback to cleanly insert the saved rules back to their original places
  return () => {
    // Sort rules ascending by original index so they are restored in correct sequential order
    const sorted = [...savedRules].sort((a, b) => a.index - b.index);
    for (const saved of sorted) {
      try {
        saved.sheet.insertRule(saved.ruleText, saved.index);
      } catch (err) {
        console.warn("Failed to restore sanitized style rule:", err);
      }
    }
  };
}
