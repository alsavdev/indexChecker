const { ipcRenderer } = require("electron");
const path = require("path");
const XLSX = require("xlsx");

const relativePath = (p) => path.resolve(__dirname.replace("pages", ""), p);
const { sendEvent } = require(relativePath("./utils/electron"));
const { resolveFiles } = require(relativePath("./utils/tools"));

require(relativePath('./utils/update'))

const logTextarea = document.getElementById("log");
const elGroup = document.getElementById("fileGroup");
const startButton = document.getElementById("Start");
const stopButton = document.getElementById("stop");
const ekspo = document.getElementById("export");
const table = document.getElementById("table-data");
const Api = document.getElementById("apikey");
const busterKey = document.getElementById("busterKey");
const inputFields = [elGroup];
const toggleBtn = document.getElementById("headlesst");
const logContainer = document.getElementById("logTextArea");
const headles = document.getElementById("disable");
const buster = document.getElementById("buster");
const captcha = document.getElementById("captcha");
const cghost = document.getElementById("cghost");
const country = document.getElementById("country");
const countryLabel = document.getElementById("country_label");
const version = document.getElementById("version");
const warp = document.getElementById("warp");
const message = document.getElementById("message");
const restartButton = document.getElementById("restart-button");
const link_update = document.getElementById("link-update");
const loaderDownload = document.getElementById("warp-loader");
const spinner = document.getElementById("spinner");

let previousReportData = [];

buster.addEventListener("change", () => {
  if (buster.checked) {
    captcha.checked = false;
    busterKey.classList.remove("d-none");
    Api.classList.add("d-none");
  } else {
    busterKey.classList.add("d-none");
  }
});
captcha.addEventListener("change", () => {
  if (captcha.checked) {
    buster.checked = false;
    Api.classList.remove("d-none");
    busterKey.classList.add("d-none");
  } else {
    Api.classList.add("d-none");
  }
});

cghost.addEventListener("change", () => {
  if (cghost.checked) {
    country.classList.remove("d-none");
    countryLabel.classList.remove("d-none");
  } else {
    country.classList.add("d-none");
    countryLabel.classList.add("d-none");
  }
});

startButton.addEventListener("click", () => {
  if (validateForm(inputFields)) {
    const data = {
      fileGroup: resolveFiles(elGroup),
      visible: headles.checked ? false : "new",
      api2captcha: Api.value,
      busterKey: busterKey.value,
      buster: buster.checked,
      captcha: captcha.checked,
      cghost: cghost.checked,
      country: resolveFiles(country),
    };

    clearLogTable();
    previousReportData = [];
    initNumb = 0;
    sendEvent("start", data);
  }
});

function clearLogTable() {
  const rowCount = table.rows.length;
  for (let i = rowCount - 1; i >= 0; i--) {
    table.deleteRow(i);
  }
}

function validateForm(fields) {
  let isValid = true;

  fields.forEach((field) => {
    if (field.value === "") {
      isValid = false;
      field.style.border = "2px solid red";
    } else {
      field.style.border = "";
    }
  });

  return isValid;
}

stopButton.addEventListener("click", () => {
  if (confirm("Realy want to stop the proccess ?") == true) {
    ipcRenderer.send("stop");
    startButton.classList.remove("d-none");
    stopButton.classList.add("d-none");
  }
});

document.addEventListener("change", () => {
  if (toggleBtn.checked) {
    logContainer.classList.remove("hidden");
    logTextarea.scrollTop = logTextarea.scrollHeight;
  } else {
    logContainer.classList.add("hidden");
  }
});

ipcRenderer.on("log", (event, logs) => {
  logTextarea.value = logs;
  logTextarea.scrollTop = logTextarea.scrollHeight;
});

ekspo.addEventListener("click", function () {
  const table = document.getElementById("data-table");
  const wb = XLSX.utils.table_to_book(table);
  if (!wb["Sheets"]["Sheet1"]["!cols"]) {
    wb["Sheets"]["Sheet1"]["!cols"] = [];
  }
  wb["Sheets"]["Sheet1"]["!cols"][0] = {
    width: 5,
  };
  wb["Sheets"]["Sheet1"]["!cols"][1] = {
    width: 60,
  };
  wb["Sheets"]["Sheet1"]["!cols"][2] = {
    width: 12,
  };

  const data = XLSX.write(wb, {
    bookType: "xlsx",
    type: "array",
  });

  ipcRenderer.send("save-excel-data", data);
});

let initNumb = 0;

function logToTable(search, hasil) {
  if (search !== undefined && hasil !== undefined) {
    const isDuplicate = previousReportData.some(
      (report) => report.search === search && report.hasil === hasil
    );

    if (!isDuplicate) {
      initNumb++;
      const newRow = table.insertRow();
      const rowHtml = `<tr><td>${initNumb}</td><td>${search}</td><td class="text-center">${hasil}</td></tr>`;
      newRow.innerHTML = rowHtml;
      document.getElementById("scrl").scrollTop =
        document.getElementById("scrl").scrollHeight;

      previousReportData.push({
        search,
        hasil,
      });
    }
  }
}

ipcRenderer.on("logToTable", (event, report) => {
  for (const log of report) {
    logToTable(log.search, log.hasil);
  }
});

const elDis = [
  elGroup,
  startButton,
  ekspo,
  Api,
  buster,
  captcha,
  busterKey,
  cghost,
  country,
];

ipcRenderer.on("disabled", () => {
  elDis.forEach((e) => {
    e.setAttribute("disabled", "");
  });
  buttonStart(true)
});

ipcRenderer.on("enabled", () => {
  elDis.forEach((e) => {
    e.removeAttribute("disabled", "");
  });
  buttonStart()
});

ipcRenderer.send("app_version");
ipcRenderer.on("app_version", (event, arg) => {
  version.innerText = "v" + arg.version;
});


const handleClass = (el, isAdd = false, className) => {
  isAdd ? el.classList.add(className) : el.classList.remove(className);
}

function buttonStart(isDisabled = false) {
  if (isDisabled) {
    startButton.style.backgroundColor = "#808080";
    [startButton, ekspo].forEach((e) => {
      handleClass(e, true, 'hidden')
    });
    handleClass(stopButton, false, 'hidden')
  } else {
    startButton.style.backgroundColor = "#0f0129";
    [startButton, ekspo].forEach((e) => {
      handleClass(e, false, 'hidden')
    });
    handleClass(stopButton, true, 'hidden')
  }
}