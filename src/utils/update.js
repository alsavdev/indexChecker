const { sendEvent, receiveEvent } = require("./electron");

sendEvent("check-for-updates");
receiveEvent("checking-for-updates", (event, args, response) => {
    if (args && response == null) {
        updateMessage("Please wait, checking for updates...");
        handleClass(warp, false, "hidden");
    } else if (response != null && response.status === "warning" && response.point === "need update") {
        updateMessage(response.message);
        handleClass(warp, false, "hidden")
        handleClass(spinner, true, "hidden")
        handleClass(link_update, false, "hidden")
        link_update.href = response.link;
    } else if (response != null && response.status === "failed") {
        updateMessage(response.message, true);
        handleClass(message, true, "text-danger")
        handleClass(warp, false, "hidden")
        handleClass(spinner, true, "hidden")
    } else if (response?.status === "error") {
        updateMessage(response.message);
        handleClass(warp, false, "hidden")
        handleClass(spinner, true, "hidden")
    } else {
        handleClass(warp, true, "hidden")
        handleClass(loaderDownload, true, "hidden")
    }
});

const updateMessage = (msg, withBtn = false) => {
    message.innerHTML = msg;
    if (withBtn) {
        const btnClose = document.createElement("button");
        btnClose.innerText = "Close";
        btnClose.setAttribute("type", "button");
        btnClose.classList.add("btn", "btn-secondary");

        btnClose.addEventListener("click", () => {
            sendEvent("close-auth");
        });
        document.getElementById("notification").appendChild(btnClose);
    }
};