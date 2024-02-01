const {
  ipcRenderer
} = require('electron');
const XLSX = require('xlsx');
const logTextarea = document.getElementById('log');
const elGroup = document.getElementById('fileGroup');
const startButton = document.getElementById('Start');
const stopButton = document.getElementById('stop');
const ekspo = document.getElementById("export");
const logTable = document.getElementById('data-table');
const Api = document.getElementById('apikey')
const busterKey = document.getElementById('busterKey')
const inputFields = [elGroup];
const toggleBtn = document.getElementById('headlesst');
const logContainer = document.getElementById('logTextArea');
const headles = document.getElementById('disable')
const buster = document.getElementById('buster')
const captcha = document.getElementById('captcha')
const cghost = document.getElementById('cghost')
const country = document.getElementById('country')
const countryLabel = document.getElementById('country_label')

let previousReportData = [];

ekspo.addEventListener('click', () => {
  const data = []
})

buster.addEventListener('change', () => {
  if (buster.checked) {
    captcha.checked = false;
    busterKey.classList.remove('d-none');
    Api.classList.add('d-none')
  } else {
    busterKey.classList.add('d-none')
  }
})
captcha.addEventListener('change', () => {
  if (captcha.checked) {
    buster.checked = false;
    Api.classList.remove('d-none');
    busterKey.classList.add('d-none')
  } else {
    Api.classList.add('d-none')
  }
})

cghost.addEventListener('change', () => {
  if (cghost.checked) {
    country.classList.remove('d-none')
    countryLabel.classList.remove('d-none')
  } else {
    country.classList.add('d-none')
    countryLabel.classList.add('d-none')
  }
})

startButton.addEventListener('click', () => {
  if (validateForm(inputFields)) {
    const data = {
      fileGroup: elGroup.files[0]?.path,
      visible: headles.checked ? false : 'new',
      api2captcha: Api.value,
      busterKey: busterKey.value,
      buster: buster.checked,
      captcha: captcha.checked,
      cghost: cghost.checked,
      country: country.files[0]?.path,
    }

    previousReportData = [];
    initNumb = 0;
    ipcRenderer.send('start', data)
  }
});

function validateForm(fields) {
  let isValid = true;

  fields.forEach((field) => {
    if (field.value === "") {
      isValid = false;
      field.style.border = "2px solid red"
    } else {
      field.style.border = ""
    }
  });

  return isValid;
}

stopButton.addEventListener('click', () => {
  if (confirm("Realy want to stop the proccess ?") == true) {
      ipcRenderer.send('stop');
      startButton.classList.remove('d-none')
      stopButton.classList.add('d-none')
  }
})

document.addEventListener('change', () => {
  if (toggleBtn.checked) {
    logContainer.classList.remove("hidden")
    logTextarea.scrollTop = logTextarea.scrollHeight;
  } else {
    logContainer.classList.add("hidden")
  }
})

ipcRenderer.on('log', (event, logs) => {
  logTextarea.value = logs;
  logTextarea.scrollTop = logTextarea.scrollHeight;

});

document.getElementById('refreshButton').addEventListener('click', () => {
  ipcRenderer.send('refreshWindow');
});

document.getElementById('export').addEventListener('click', function () {
  const table = document.getElementById('data-table');
  const wb = XLSX.utils.table_to_book(table);
  if (!wb['Sheets']['Sheet1']['!cols']) {
    wb['Sheets']['Sheet1']['!cols'] = [];
  }
  wb['Sheets']['Sheet1']['!cols'][0] = {
    width: 5
  };
  wb['Sheets']['Sheet1']['!cols'][0] = {
    width: 40
  };
  wb['Sheets']['Sheet1']['!cols'][1] = {
    width: 12
  };

  const data = XLSX.write(wb, {
    bookType: 'xlsx',
    type: 'array'
  });

  ipcRenderer.send('save-excel-data', data);
});



let initNumb = 0

function logToTable(search, hasil) {
  if (search !== undefined && hasil !== undefined) {
    const isDuplicate = previousReportData.some(report => report.search === search && report.hasil === hasil);

    if (!isDuplicate) {
      initNumb++;
      const newRow = logTable.insertRow();
      const rowHtml = `<tr><td>${initNumb}</td><td>${search}</td><td class="text-center">${hasil}</td></tr>`;
      newRow.innerHTML = rowHtml;
      document.getElementById('scrl').scrollTop = document.getElementById('scrl').scrollHeight;

      previousReportData.push({
        search,
        hasil
      });
    }
  }
}
ipcRenderer.on('logToTable', (event, report) => {
  for (const log of report) {
    logToTable(log.search, log.hasil);
  }
});

const elDis = [elGroup, startButton, ekspo, Api, buster, captcha, busterKey, cghost, country]

ipcRenderer.on("disabled", () => {
  elDis.forEach((e) => {
    e.setAttribute('disabled', '')
    startButton.style.backgroundColor = '#808080'
    startButton.classList.add('d-none')
    stopButton.classList.remove('d-none')
  })
})

ipcRenderer.on("enabled", () => {
  elDis.forEach((e) => {
    e.removeAttribute("disabled", '')
    startButton.style.backgroundColor = '#0f0129'
    ekspo.classList.remove("hidden")
    startButton.classList.remove('d-none')
    stopButton.classList.add('d-none')
  })
})