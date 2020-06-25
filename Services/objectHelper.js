const objectHelper = {}

const AppError = require('../Services/error-management').AppError;


objectHelper.isTimeSlotValid = (timeSlots, timeSlot) => {
    let fromDate = parseTimeStringToDate(timeSlot.from);
    let tillDate = parseTimeStringToDate(timeSlot.till);
    let fromMins = getMinutesOfDate(fromDate);
    let tillMins = getMinutesOfDate(tillDate);
    let currentTimeSlot = undefined;
    let cntTs = 0;
    while (cntTs < timeSlots.length && !currentTimeSlot) {
        if (timeSlots[cntTs].weekday == timeSlot.weekday) {
            console.log(getMinutesOfUTCDate(timeSlots[cntTs].from));
            console.log(getMinutesOfUTCDate(timeSlots[cntTs].till));
            console.log(fromMins);
            if ((getMinutesOfUTCDate(timeSlots[cntTs].from) <= fromMins) &&
            (getMinutesOfUTCDate(timeSlots[cntTs].till) > fromMins)) {
                currentTimeSlot = timeSlots[cntTs];
            }
            if ((getMinutesOfUTCDate(timeSlots[cntTs].from) <= tillMins) &&
            (getMinutesOfUTCDate(timeSlots[cntTs].till) > tillMins)) {
                currentTimeSlot = timeSlots[cntTs];
            }
        }
        cntTs++;
    }
    return currentTimeSlot;
}

objectHelper.getTimeSlotAvailable = (timeSlots) => {
    let currentDate = new Date();
    let currentTimeSlot = undefined;
    let cntTs = 0;
    while (cntTs < timeSlots.length && !currentTimeSlot) {
        if (timeSlots[cntTs].weekday == currentDate.getDay()) {
            if ((getMinutesOfUTCDate(timeSlots[cntTs].from) <= getMinutesOfDate(currentDate)) &&
            (getMinutesOfUTCDate(timeSlots[cntTs].till) > getMinutesOfDate(currentDate))) {
                currentTimeSlot = timeSlots[cntTs];
            }
        }
        cntTs++;
    }
    return currentTimeSlot;
}

function parseTimeStringToDate(timeString) {
    let result = new Date();
    let parts = timeString.split(':');
    if (!parts || parts.length != 2)
        throw new AppError(400, 'Could not parse time of timeslot');

    let hours = parseInt(parts[0])
    let mins = parseInt(parts[1]);
    result.setHours(hours);
    result.setMinutes(mins);
    return result;
}

function getMinutesOfDate(date) {
    return 60*date.getHours() + date.getMinutes();
}

function getMinutesOfUTCDate(date) {
    return 60*date.getUTCHours() + date.getUTCMinutes();
}

module.exports = objectHelper;