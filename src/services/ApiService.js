const getPersonalData = require("../utils/getPersonalData");

class ApiService {
    constructor() {
        this.address = 'http://localhost:3000/api/v1/';
        this.mac = '';
        this.app_id = '';
        this.initialize();
    }

    async initialize() {
        const personalData = await getPersonalData();
        this.mac = personalData.mac;
        this.app_id = 'alsav.index.checker';
    }

    async validateLicense(license) {    
        return new Promise(async (resolve, reject) => {
            await fetch(`${this.address}validate-license`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + process.env.API_KEY
                },
                body: JSON.stringify({
                    license: license,
                    mac: this.mac,
                    app_id: this.app_id
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
}

module.exports = ApiService;