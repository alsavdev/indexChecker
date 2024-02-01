const puppeteer = require('puppeteer-extra');
const {
    executablePath
} = require('puppeteer')
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');
const pPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(pPlugin());

const fs = require('fs');
const path = require('path');
const captcha = path.join(process.cwd(), "src/extension/captcha/");
const cghost = path.join(process.cwd(), "src/extension/cghost/");
const spoof = path.join(process.cwd(), "src/extension/spoof/");

const baseUrl = 'https://www.google.com/';
let page;
let finish = false;

async function init(logToTextarea, logToTable, data) {
    data.captcha && puppeteer.use(
        RecaptchaPlugin({
            provider: {
                id: '2captcha',
                token: apiKeyValue
            },
            visualFeedback: true
        })
    )

    const extensionOption = data.cghost ? cghost : spoof;
    const buserOption = data.buster ? captcha : spoof;

    const browser = await puppeteer.launch({
        executablePath: executablePath(),
        headless: data.visible,
        defaultViewport: null,
        args: [
            `--disable-extensions-except=${spoof},${extensionOption},${buserOption}`,
            `--load-extension=${spoof},${extensionOption},${buserOption}`,
        ]
    })

    page = await browser.newPage();
    const pages = await browser.pages();

    const context = browser.defaultBrowserContext();
    context.overridePermissions(baseUrl, ["geolocation", "notifications"]);

    data.buster && page.on('load', async () => {
        await solveCaptcha(logToTextarea)
    })

    let hasil;

    page.sleep = function (timeout) {
        return new Promise(function (resolve) {
            setTimeout(resolve, timeout);
        });
    };

    const open = async () => {
        data.buster && await handleBuster(data)
        data.cghost && await vpnCghost(data, logToTextarea)

        await page.goto(baseUrl, {
            waitUntil: ['networkidle2', 'domcontentloaded'],
            timeout: 120000
        });
    }

    const writeKeyword = async (recepientName) => {
        try {
            if (data.captcha) {
                await page.solveRecaptchas();
                const captchas = await page.$('[title="reCAPTCHA"]')

                if (captchas) {
                    logToTextarea("captcha detected")
                    page.url().includes('sory/index')
                    logToTextarea("done")
                }
            }

            const search = await page.waitForSelector('[name="q"]', {
                timeout: 120000
            })

            if (search) {
                const accept = await page.$('#L2AGLb');
                if (accept) {
                    logToTextarea("Accept Found ✅");
                    const bahasa = await page.$('#vc3jof');
                    await bahasa.click();
                    await page.waitForSelector('li[aria-label="‪English‬"]');
                    await page.click('li[aria-label="‪English‬"]');
                    logToTextarea('tes dsdsd')
                    await page.sleep(6000)
                    const aklans = await page.$('#L2AGLb');
                    await aklans.click()
                    await page.sleep(6000)
                }

                const subject = await page.$('[name="q"]')
                await subject.type('site:' + recepientName)
                logToTextarea('Url : ' + recepientName);

                await page.keyboard.press('Enter')
                await page.waitForNavigation({
                    waitUntil: ['domcontentloaded', "networkidle2"],
                    timeout: 120000
                })
            }

            if (data.captcha) {
                await page.solveRecaptchas();
                await page.sleep(2000)

                const captcha = await page.$('[title="reCAPTCHA"]')
                if (captcha) {
                    logToTextarea("Captcha detected")
                    page.url().includes('sory/index')
                    logToTextarea("Done")
                    await page.sleep(5000)
                }
            }

            try {
                await page.waitForSelector('#result-stats', {
                    waitUntil: 'domcontentloaded',
                    timeout: 120000
                });
            } catch (error) {
                await browser.close()
            }

            const elResult = await page.$("#result-stats");
            if (elResult) {
                const getResult = await page.evaluate((el) => el.innerText, elResult);
                const splitResult = getResult.split('results')
                let matches = splitResult[0].match('[0-9,.]+');
                const data = matches[0].replace(/\,/g, '')

                logToTextarea('Index : ' + data + '\n');
                hasil = data
            }

            await page.waitForSelector('[jsname="pkjasb"]', {
                waitUntil: 'domcontentloaded',
                timeout: 60000
            });

            await page.sleep(1000)

            const silang = await page.$('[jsname="pkjasb"]')
            silang && await silang.click()
        } catch (error) {
            hasil = "FAILED ❌"
            logToTextarea(error);
        }
    }

    const handleBuster = async (data) => {
        try {
            const pathId = path.join(process.cwd(), 'src/data/idBuster.txt');
            const id = fs.readFileSync(pathId, 'utf-8')
            if (id === '') {
                await page.goto('chrome://extensions', {
                    waitUntil: ['domcontentloaded', "networkidle2"],
                    timeout: 120000
                })
            } else {
                await page.goto(`chrome-extension://${id.trim()}/src/options/index.html`, {
                    waitUntil: ['domcontentloaded', "networkidle2"],
                    timeout: 120000
                })
            }

            if (id === '') {
                const idExtension = await page.evaluateHandle(
                    'document.querySelector("body > extensions-manager").shadowRoot.querySelector("#items-list").shadowRoot.querySelectorAll("extensions-item")[0]'
                );
                await page.evaluate(e => e.style = "", idExtension)

                const id = await page.evaluate(e => e.getAttribute('id'), idExtension)

                await page.goto(`chrome-extension://${id}/src/options/index.html`, {
                    waitUntil: ['domcontentloaded', "networkidle2"],
                    timeout: 60000
                })

                fs.writeFileSync(pathId, id)
            }

            await page.sleep(3000)

            await page.evaluate(() => {
                document.querySelector("#app > div > div:nth-child(1) > div.option-wrap > div.option.select > div > div.v-input__control > div > div.v-field__field > div").click()
            })
            await page.sleep(3000)
            await page.evaluate(() => {
                document.querySelector("body > div.v-overlay-container > div > div > div > div:nth-child(3)").click()
            })

            const addApi = await page.$('#app > div > div:nth-child(1) > div.option-wrap > div.wit-add-api > button')
            addApi && await addApi.click()

            const fieldApi = await page.waitForSelector('#input-18')
            fieldApi && await fieldApi.type(data.busterKey)
        } catch (error) {
            throw error;
        }
    }

    const vpnCghost = async (data, log) => {
        try {
            const pathId = path.join(process.cwd(), 'src/data/idghost.txt');
            const id = fs.readFileSync(pathId, 'utf-8')
            if (id === '') {
                await page.goto('chrome://extensions', {
                    waitUntil: ['domcontentloaded', "networkidle2"],
                    timeout: 120000
                })
            } else {
                await page.goto(`chrome-extension://${id.trim()}/index.html`, {
                    waitUntil: ['domcontentloaded', "networkidle2"],
                    timeout: 120000
                })
            }

            if (id === '') {
                const idExtension = await page.evaluateHandle(
                    `document.querySelector("body > extensions-manager").shadowRoot.querySelector("#items-list").shadowRoot.querySelectorAll("extensions-item")[${data.buster ? 2 : 1}]`
                );
                await page.evaluate(e => e.style = "", idExtension)

                const id = await page.evaluate(e => e.getAttribute('id'), idExtension)

                await page.goto(`chrome-extension://${id}/index.html`, {
                    waitUntil: ['domcontentloaded', "networkidle2"],
                    timeout: 60000
                })

                fs.writeFileSync(pathId, id)
            }

            await page.sleep(3000)

            const pickCountry = await page.waitForSelector('.selected-country')
            pickCountry && await pickCountry.click()

            await page.sleep(3000)

            const regionFiles = fs.readFileSync(data.country, 'utf-8').split('\n').filter(line => line !== "")
            
            const country = await page.$$('mat-option > .mat-option-text')
            await country[Math.floor(Math.random() * regionFiles.length)].click()

            await page.sleep(3000)

            await page.evaluate(() => {
                document.querySelector('body > app-root > main > app-home > div > div.spinner > app-switch > div').click()
            })

            await page.sleep(5000)
        } catch (error) {
            throw error;
        }
    }

    async function solveCaptcha(logToTextarea) {
        return new Promise(async (resolve, reject) => {
            try {
                const captchaBox = await page.$('[title="reCAPTCHA"]')
                if (captchaBox) {
                    logToTextarea("[INFO] Captcha Found Solve....");
                    await captchaBox.click()
                    const elIframe = await page.waitForSelector('iframe[title="recaptcha challenge expires in two minutes"]');
                    if (elIframe) {
                        const iframe = await elIframe.contentFrame();
                        if (iframe) {
                            const body = await iframe.waitForSelector('body');
                            if (body) {
                                const solverButton = await body.waitForSelector('#solver-button');
                                if (solverButton) {
                                    try {
                                        await page.sleep(3000)
                                        solverButton && await solverButton.click();
                                        await page.sleep(3000)

                                        // if (solverButton && await page.url().includes('sorry/index')) {
                                        //     reject("error")
                                        // }
                                        // await page.waitForNavigation({
                                        //     waitUntil: ['networkidle2', 'domcontentloaded'],
                                        //     timeout: 120000
                                        // })

                                        if (!solverButton && !(await page.url().includes('sorry/index'))) {
                                            logToTextarea("[INFO] Solved ✅");
                                            resolve();
                                        }
                                    } catch (error) {
                                        logToTextarea('Error clicking the button:', error.message);
                                        reject(error);
                                    }
                                } else {
                                    logToTextarea('Button not found in the iframe body.');
                                    reject(new Error('Button not found in the iframe body.'));
                                }
                            } else {
                                logToTextarea('Body element not found in the iframe.');
                                reject(new Error('Body element not found in the iframe.'));
                            }
                        } else {
                            logToTextarea('Content frame not found for the iframe.');
                            reject(new Error('Content frame not found for the iframe.'));
                        }
                    } else {
                        logToTextarea('Iframe with title "captcha" not found on the page.');
                        reject(new Error('Iframe with title "captcha" not found on the page.'));
                    }
                }

            } catch (error) {
                logToTextarea(error);
                reject(error);
            }
        });
    }

    const workFlow = async () => {
        try {
            const recipients = fs.readFileSync(data.fileGroup, 'utf-8').split('\n').filter(line => line !== "");

            for (let i = 0; i < recipients.length; i++) {

                if (finish) {
                    await browser.close();
                    break;
                }

                const recipientName = recipients[i].trim();

                try {
                    await writeKeyword(recipientName);
                } catch (error) {
                    logToTextarea(error);
                    continue
                }

                logToTable(recipientName, hasil)

                if (finish) {
                    logToTextarea("[INFO] Stop Success");
                    await browser.close();
                    break;
                }
            }
        } catch (err) {
            logToTextarea(err);
            await browser.close()
        } finally {
            await browser.close()
        }
    }

    await open()
    await workFlow().catch((error) => logToTextarea(error))
}

const stopProccess = (logToTextarea) => {
    finish = true;
    logToTextarea("[INFO] Stop Proccess, waiting until this proccess done")
}

module.exports = {
    init,
    stopProccess
}