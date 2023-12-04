const puppeteer = require('puppeteer-extra')
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha')
const pPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(pPlugin())
const fs = require('fs')
const path = require('path')

const baseUrl = 'https://www.google.com/';
const chrome = path.join(process.cwd(), "chrome/chrome.exe");
let page;

async function init(logToTextarea, logToTable, fileGroup, visibleMode, apiKeyValue) {
    puppeteer.use(
        RecaptchaPlugin({
            provider: {
                id: '2captcha',
                token: apiKeyValue
            },
            visualFeedback: true
        })
    )

    const browser = await puppeteer.launch({
        executablePath: chrome,
        headless: visibleMode,
    })

    page = await browser.newPage();
    const pages = await browser.pages();

    const context = browser.defaultBrowserContext();
    context.overridePermissions(baseUrl, ["geolocation", "notifications"]);

    let hasil;

    page.sleep = function (timeout) {
        return new Promise(function (resolve) {
            setTimeout(resolve, timeout);
        });
    };

    const open = async () => {
        await page.goto(baseUrl, {
            waitUntil: ['networkidle2', 'domcontentloaded'],
            timeout: 120000
        });
    }

    const writeKeyword = async (recepientName) => {
        try {
            await page.solveRecaptchas();
            const captchas = await page.$('[title="reCAPTCHA"]')
            if (captchas) {
                logToTextarea("captcha detected")
                page.url().includes('sory/index')
                logToTextarea("done")
            }

            const subject = await page.$('[name="q"]')
            await subject.type('site:' + recepientName)
            logToTextarea('Url : ' + recepientName);

            await page.keyboard.press('Enter')
            await page.waitForNavigation({
                waitUntil: ['domcontentloaded', "networkidle2"],
                timeout: 120000
            })
            
            await page.solveRecaptchas();
            await page.sleep(2000)

            const captcha = await page.$('[title="reCAPTCHA"]')
            if (captcha) {
                logToTextarea("Captcha detected")
                page.url().includes('sory/index')
                logToTextarea("Done")
                await page.sleep(5000)
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

    const workFlow = async () => {
        try {
            const recipients = fs.readFileSync(fileGroup, 'utf-8').split('\n');

            for (let i = 0; i < recipients.length; i++) {
                const recipientName = recipients[i].trim();

                try {
                    await writeKeyword(recipientName);
                } catch (error) {
                    logToTextarea(error);
                    continue
                }

                logToTable(recipientName, hasil)
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

module.exports = {
    init
}