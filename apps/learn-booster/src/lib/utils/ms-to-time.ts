/**
 * ממיר זמן ממילישניות לפורמט של דקות:שניות
 * @param ms - זמן במילישניות
 * @returns מחרוזת בפורמט MM:SS
 */
export function msToTime(ms: number): string {
    // המרה לשניות
    const totalSeconds = Math.floor(ms / 1000);
    
    // חישוב דקות ושניות
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    // הוספת אפס מוביל אם צריך
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    
    return `${formattedMinutes}:${formattedSeconds}`;
}
