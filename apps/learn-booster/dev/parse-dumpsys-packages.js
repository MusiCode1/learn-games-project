/**
 * Parse the output of `adb shell dumpsys package packages`
 * and extract package name + application label.
 *
 * @param {string} dumpsysOutput - raw text output from dumpsys
 * @returns {Array<{packageName: string, appLabel: string | null}>}
 */
function parseDumpsysPackages(dumpsysOutput) {
  const lines = dumpsysOutput.split('\n');
  const result = [];
  let currentPackage = null;
  let currentLabel = null;

  for (const line of lines) {
    // זיהוי התחלה של חבילה חדשה
    const pkgMatch = line.match(/Package\s+\[([^\]]+)\]/);
    if (pkgMatch) {
      if (currentPackage) {
        result.push({ packageName: currentPackage, appLabel: currentLabel });
      }
      currentPackage = pkgMatch[1];
      currentLabel = null;
      continue;
    }

    // זיהוי שם האפליקציה (label)
    const labelMatch = line.match(/application-label(?:-res)?:(.*)/);
    if (labelMatch && currentPackage) {
      currentLabel = labelMatch[1].trim();
    }
  }

  // הוספת האחרונה
  if (currentPackage) {
    result.push({ packageName: currentPackage, appLabel: currentLabel });
  }

  return result;
}

// דוגמה לשימוש:

const raw = fully.runSuCommand('dumpsys package packages')
const parsed = parseDumpsysPackages(raw);

console.log(parsed.slice(0, 10)); // מציג את 10 הראשונות
