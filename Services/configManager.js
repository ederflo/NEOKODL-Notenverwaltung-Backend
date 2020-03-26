const fs = require('fs');

const configManager = {};
const defaultConfigPath = './../configs/default.json';

let configData = {}

configManager.loadConfig = function (filepath) {
    console.log(!fs.existsSync(filepath));
    if (!filepath || filepath.length <= 0)
        filepath = defaultConfigPath;
    configData = require(filepath);
}

configManager.getData = function () {
    if (Object.keys(configData).length <= 0) {
        this.loadConfig(defaultConfigPath);
    }
    return configData;
}

configManager.getDataBaseConfig = function () {
    if (Object.keys(configData).length <= 0 || Object.keys(configData['dbSettings']).length <= 0) {
        this.loadConfig(defaultConfigPath);
    }
    return configData['dbSettings'];
}

configManager.getBackendData = function () {
    console.log(Object.keys(configData).length <= 0 + ' ' + Object.keys(configData['backend']).length <= 0)
    if (Object.keys(configData).length <= 0 || Object.keys(configData['backend']).length <= 0) {
        this.loadConfig(defaultConfigPath);
    }
    return configData['backend'];
}

configManager.getCorsData = function () {
    console.log(Object.keys(configData).length <= 0 + ' ' + Object.keys(configData['corsOptions']).length <= 0)
    if (Object.keys(configData).length <= 0 || Object.keys(configData['corsOptions']).length <= 0) {
        this.loadConfig(defaultConfigPath);
    }
    return configData['corsOptions'];
}

module.exports = configManager;