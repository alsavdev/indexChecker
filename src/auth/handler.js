const { sendEvent } = require("../utils/electron");
const { validateLicense } = require("../services/ApiService");

document.addEventListener('DOMContentLoaded', () => {
    const input = document.querySelector('input');
    const [ submit, loadBtn ] = document.querySelectorAll('button');
    const msg = document.querySelector('#msg-error');

    submit.addEventListener('click', async () => await init());
    input.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            init();
        }
    });

    async function init() {
        updateMessage('')
        stateButton(true)
        await validateLicense(input.value).then((data) => {
            if (data === 'success') {
                stateButton(false)
                sendEvent('license-valid')
            } else {
                updateMessage(data.message)
                stateButton(false)
            }
        }).catch(err => {
            updateMessage(err.message.includes('Failed to fetch') ? 'Something error please report to us, <a style="cursor:pointer;" href="mailto: support@alsavdev.com">support@alsavdev.com</a>' : err.message)
            stateButton(false)
        })
    }

    function stateButton(isDone = false) {
        if (isDone === true) {
            submit.classList.add('d-none')
            loadBtn.classList.remove('d-none')
        } else {
            submit.classList.remove('d-none')
            loadBtn.classList.add('d-none')
        }
    }

    function updateMessage(message) {
        msg.innerHTML = message
    }
});

