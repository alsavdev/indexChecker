const getPersonalData = require("../utils/getPersonalData");

const address = 'http://127.0.0.1:3000/api/v1/';
const SECRET_KEY = process.env.API_KEY

async function validateLicense(license) {
    return new Promise(async (resolve, reject) => {
        const personalData = await getPersonalData();
        const mac = personalData.mac;
        const app_id = 'alsav.index.checker';

        await fetch(`${address}validate-license`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + SECRET_KEY
            },
            body: JSON.stringify({
                license: license,
                mac: mac,
                app_id: app_id
            })
        }).then(res => res.json()).then(data => {
            if (data.status === 'failed' || data.status === 'error') {
                reject(data);
            } else {
                resolve(data.status);
            }
        }).catch(err => reject(err));
    });
}


async function checkForUpdates(app) {
    return new Promise(async (resolve, reject) => {
        await fetch(`${address}check-version`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + SECRET_KEY,
                },
                body: JSON.stringify({
                    app_id: app.getName(),
                    version: app.getVersion(),
                }),
            })
            .then((res) => res.json())
            .then((data) => {
                resolve(data);
            })
            .catch((err) => reject(err));
    });
}

module.exports = {
    validateLicense,
    checkForUpdates
};