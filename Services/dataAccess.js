const dataAccess = {}

const AppError = require('../Services/error-management').AppError;
const db = require('../Services/database');
const objectHelper = require('./objectHelper');
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

dataAccess.getOUById = async (ouId) => {
    return await OU.findOne({ where: {id: ouId } });
}

dataAccess.OUBelongsToUser = async (ou, userId) => {
    return (await Period.findOne({ where: { id: ou.PeriodId, UserId: userId } })) != null;
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
    let period = await dataAccess.getActivePeriod(userId);
    if (!period)
        throw new AppError(404, "No active period!");

    let ous = await dataAccess.getOUsByPeriodId(period.id, userId);
    if (!ous || ous.length <= 0)
        throw new AppError(404, "No OUs found!");

    while (cntOu < ous.length && !currentTimeSlot) {
        let timeSlots = await dataAccess.getTimeSlotsByOUId(ous[cntOu].id);
        currentTimeSlot = objectHelper.getTimeSlotAvailable(timeSlots);
        cntOu++;
    }
    return currentTimeSlot;
}

dataAccess.getTimeSlotsByOUId = async (ouId) => {
    return await TimeSlot.findAll({ where: {OrganizationalUnitId: ouId}});
}

module.exports = dataAccess;