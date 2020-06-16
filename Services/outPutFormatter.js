module.exports = (model) => {
    if (Array.isArray(model)) {
        model.forEach(element => {
            removeProperties(element);
        });
    } else {
        removeProperties(model);
    }
    return model;
}

function removeProperties(model){
    model.UserId = undefined;
    model.OrganizationalUnitId = undefined;
    model.PupilId = undefined;
    model.PeriodId = undefined;
    model.password = undefined;
    model.get({plain: true}).createdAt = undefined;
    model.get({plain: true}).updatedAt = undefined;
}