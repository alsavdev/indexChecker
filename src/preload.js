const {
  ipcRenderer
} = require('electron');
const XLSX = require('xlsx');
const logTextarea = document.getElementById('log');
const elGroup = document.getElementById('fileGroup');
const startButton = document.getElementById('Start');
const ekspo = document.getElementById("export");
const logTable = document.getElementById('data-table');
const Api = document.getElementById('apikey')
const inputFields = [elGroup , Api];
const toggleBtn = document.getElementById('headlesst');
const logContainer = document.getElementById('logTextArea');
const headles = document.getElementById('disable')

ekspo.addEventListener('click', () => {
  const data = []
})

startButton.addEventListener('click', () => {
  if (validateForm(inputFields)) {
    const fileGroup = elGroup.files[0]?.path;
    const visibleMode = headles.checked ? false : 'new'
    const apiKeyValue = Api.value;

    ipcRenderer.send('start', fileGroup, visibleMode, apiKeyValue)
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

let previousReportData = [];

function logToTable(search, hasil) {
  if (search !== undefined && hasil !== undefined) {
    const isDuplicate = previousReportData.some(report => report.search === search && report.hasil === hasil);

    if (!isDuplicate) {
      const newRow = logTable.insertRow();
      const rowHtml = `<tr><td>${search}</td><td class="text-center">${hasil}</td></tr>`;
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


const elDis = [elGroup, startButton, ekspo, Api]

ipcRenderer.on("disabled", () => {
  elDis.forEach((e) => {
    e.setAttribute('disabled', '')
    startButton.style.backgroundColor = '#808080'
  })
})

ipcRenderer.on("enabled", () => {
  elDis.forEach((e) => {
    e.removeAttribute("disabled", '')
    startButton.style.backgroundColor = '#0f0129'
    ekspo.classList.remove("hidden")
  })
})