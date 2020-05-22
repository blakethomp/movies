export function displayDate(dateString) {
    const date = new Date(dateString);
    return `${date.getUTCMonth()}/${date.getUTCDate()}/${date.getUTCFullYear()}`;
}

export function daysWatched(startDateStr, endDateStr) {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    const difference = (endDate - startDate) / 1000 / 60 / 60 / 24;

    return difference + 1;
}

export function displayDaysWatched(startDateStr, endDateStr) {
    const days = daysWatched(startDateStr, endDateStr);
    if (days === 1) {
        return 'same day finish';
    }

    return `${days} to finish`;
}
