const { ipcRenderer } = require("electron");
const XLSX = require("xlsx");
const logTextarea = document.getElementById("log");
const elGroup = document.getElementById("fileGroup");
const startButton = document.getElementById("Start");
const stopButton = document.getElementById("stop");
const ekspo = document.getElementById("export");
const logTable = document.getElementById("data-table");
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
      fileGroup: elGroup.files[0]?.path,
      visible: headles.checked ? false : "new",
      api2captcha: Api.value,
      busterKey: busterKey.value,
      buster: buster.checked,
      captcha: captcha.checked,
      cghost: cghost.checked,
      country: country.files[0]?.path,
    };

    clearLogTable();
    previousReportData = [];
    initNumb = 0;
    ipcRenderer.send("start", data);
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
    startButton.style.backgroundColor = "#808080";
    startButton.classList.add("d-none");
    stopButton.classList.remove("d-none");
  });
  ekspo.classList.add("hidden");
});

ipcRenderer.on("enabled", () => {
  elDis.forEach((e) => {
    e.removeAttribute("disabled", "");
    startButton.style.backgroundColor = "#0f0129";
    ekspo.classList.remove("hidden");
    startButton.classList.remove("d-none");
    stopButton.classList.add("d-none");
  });
});

ipcRenderer.send("app_version");
ipcRenderer.on("app_version", (event, arg) => {
  version.innerText = "v" + arg.version;
});

ipcRenderer.on("update_available", () => {
  ipcRenderer.removeAllListeners("update_available");
  message.innerText = "A new update is available. Downloading now...";
  warp.classList.remove("hidden");
  loaderDownload.classList.remove("hidden");
});

ipcRenderer.on("update_progress", (event, progress) => {
  updateProgress = progress;
  const progsDown = document.getElementById("download-progress");
  progsDown.style.width = updateProgress + "%";
  progsDown.setAttribute("aria-valuenow", updateProgress);
});

ipcRenderer.on("update_downloaded", () => {
  ipcRenderer.removeAllListeners("update_downloaded");
  message.innerText =
    "Update Downloaded. It will be installed on restart. Restart now?";
  restartButton.classList.remove("d-none");
  warp.classList.remove("hidden");

  loaderDownload.classList.add("hidden");
});

restartButton.addEventListener("click", (e) => {
  ipcRenderer.send("restart_app");
});

ipcRenderer.send("check-for-updates");
ipcRenderer.on("checking-for-updates", (event, args, response) => {
  if (args && response == null) {
    message.innerText = "Please wait, checking for updates...";
    warp.classList.remove("hidden");
  } else if ((response != null) && response.status === "warning" && response.point === "need update") {
    message.innerText = response.message;
    warp.classList.remove("hidden");
    spinner.classList.add("hidden");
    link_update.classList.remove("d-none");
    link_update.href = response.link;
  } else if ((response != null) && response.status === "failed") {
    message.innerText = response.message;
    message.classList.add('text-danger')
    warp.classList.remove("hidden");
    spinner.classList.add("hidden");

    const btnClose = document.createElement("button");
    btnClose.setAttribute("type", "button");
    btnClose.classList.add("btn", "btn-secondary");
    btnClose.innerText = "Close";
    btnClose.addEventListener("click", () => {
      ipcRenderer.send("close-auth");
    });

    document.getElementById('notification').appendChild(btnClose);
  } else if ((response != null) && response.status === "error") {
    message.innerHTML = response.message;
    warp.classList.remove("hidden");
    spinner.classList.add("hidden");
  } else {
    warp.classList.add("hidden");
    loaderDownload.classList.add("hidden");
  }
});
