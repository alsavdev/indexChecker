const { sendEvent } = require("../interface/electron");
const ApiService = require("../services/ApiService");
const service = new ApiService();

document.addEventListener('DOMContentLoaded', () => {
    const input = document.querySelector('input');
    const [ submit, loadBtn ] = document.querySelectorAll('button');
    const msg = document.querySelector('#msg-error');
    
    submit.addEventListener('click', async () => {
        msg.innerHTML = ''
        stateButton(true)
        await service.validateLicense(input.value).then((data) => {
            if (data === 'success') {
                stateButton(false)
                sendEvent('license-valid')
            } else {
                msg.innerHTML = data.message
                stateButton(false)
            }
        }).catch(err => {
            msg.innerHTML = err.message.includes('Failed to fetch') ? 'Something error please report to us, <a style="cursor:pointer;" href="mailto: support@alsavdev.com">support@alsavdev.com</a>' : err.message
            stateButton(false)
        })
    })

    function stateButton(isDone = false) {
        if (isDone === true) {
            submit.classList.add('d-none')
            loadBtn.classList.remove('d-none')
        } else {
            submit.classList.remove('d-none')
            loadBtn.classList.add('d-none')
        }
    }
});

