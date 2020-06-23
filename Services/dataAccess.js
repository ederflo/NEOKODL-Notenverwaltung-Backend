const dataAccess = {}

const AppError = require('../Services/error-management').AppError;
const db = require('../Services/database');
const Period = db.model('Period');
const OU = db.model('OrganizationalUnit');
const Pupil = db.model('Pupil');
const TimeSlot = db.model('TimeSlot');

dataAccess.getPeriodByUserIdAndPeriodId = async (userId, periodId) => {
    return await Period.findOne({ where: { id: periodId, UserId: userId } });
}

dataAccess.getActivePeriod = async (userId) => {
    return await Period.findOne({ where: { UserId: userId, active: true } });
}

dataAccess.getActivePeriodId = async (userId) => {
    let result = null;
    let period = await dataAccess.getActivePeriod(userId);
    if (period)
        result = period.id;
    return result;
}

dataAccess.getOUsByPeriodId = async (periodId) => {
    return await OU.findAll({ where: { PeriodId: periodId } });
}

dataAccess.getCurrentOU = async (userId) => {
    let result = null;
    let ou = null;
    let timeSlot = await dataAccess.getCurrentTimeSlot(userId);
    if (timeSlot)
        result = await OU.findOne({where: {id: timeSlot.OrganizationalUnitId}});
    return result;
}

dataAccess.getCurrentTimeSlot = async (userId) => {
    let currentTimeSlot = undefined;
    let cntOu = 0;
    let cntTs = 0;
    let currentDate = new Date();
    let period = await dataAccess.getActivePeriod(userId);
    if (!period)
        throw new AppError(404, "No active period!");
    let ous = await dataAccess.getOUsByPeriodId(period.id, userId);
    if (!ous || ous.length <= 0)
        throw new AppError(404, "No OUs found!");
    while (cntOu < ous.length && !currentTimeSlot) {
        let timeSlots = await dataAccess.getTimeSlotsByOUId(ous[cntOu].id);
        while (cntTs < timeSlots.length && !currentTimeSlot) {
            if (timeSlots[cntTs].weekday == currentDate.getDay()) {
                if ((getMinutesOfUTCDate(timeSlots[cntTs].from) <= getMinutesOfDate(currentDate)) &&
                (getMinutesOfUTCDate(timeSlots[cntTs].till) > getMinutesOfDate(currentDate))) {
                    currentTimeSlot = timeSlots[cntTs];
                }
            }
            if (!currentTimeSlot)
                cntTs++;
        }
        if (!currentTimeSlot) {
            cntOu++;
            cntTs = 0;
        }
    }
    return currentTimeSlot;
}

dataAccess.getTimeSlotsByOUId = async (ouId) => {
    return await TimeSlot.findAll({ where: {OrganizationalUnitId: ouId}});
}



function getMinutesOfDate(date) {
    return 60*date.getHours() + date.getMinutes();
}

function getMinutesOfUTCDate(date) {
    return 60*date.getUTCHours() + date.getUTCMinutes();
}

module.exports = dataAccess;