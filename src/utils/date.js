import moment from 'moment';

export function displayDate(dateString) {
    const date = moment.utc(new Date(dateString));
    return `${date.format('MM/DD/YY')}`
}

export function daysWatched(startDateStr, endDateStr) {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    const difference = (endDate - startDate) / 1000 / 60 / 60 / 24;

    return Math.floor(difference + 1);
}

export function displayDaysWatched(startDateStr, endDateStr) {
    const days = daysWatched(startDateStr, endDateStr);
    if (days === 1) {
        return 'same day finish';
    }

    return `${days} days to finish`;
}
