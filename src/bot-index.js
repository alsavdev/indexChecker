const p = require('puppeteer-extra')
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha')
const pPlugin = require('puppeteer-extra-plugin-stealth')
p.use(pPlugin())
const fs = require('fs')
const path = require('path')

const baseUrl = 'https://www.google.com/';
const chrome = path.join(process.cwd(), "chrome/chrome.exe");

async function init(logToTextarea, logToTable, fileGroup, visibleMode, apiKeyValue) {
    p.use(
        RecaptchaPlugin({
            provider: {
                id: '2captcha',
                token: apiKeyValue
            },
            visualFeedback: true
        })
    )

    const browser = await p.launch({
        executablePath: chrome,
        headless: visibleMode,
    })

    const page = await browser.newPage();

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
            waitUntil: 'networkidle2',
            timeout: 30000
        });
    }

    const writeEmail = async (recepientName) => {
        try {
            await page.solveRecaptchas();
            const captchas = await page.$('[title="reCAPTCHA"]')
            if (captchas) {
                logToTextarea("captcha detected")
                page.url().includes('sory/index')
                logToTextarea("done")
            }

            await page.waitForSelector('[name="q"]', {
                waitUntil: 'domcontentloaded',
                timeout: 60000
            });
            const subject = await page.$('[name="q"]')
            await subject.type('site:' + recepientName)
            logToTextarea('Url : ' + recepientName);

            await page.keyboard.press('Enter', {
                waitUntil: 'domcontentloaded',
                timeout: 60000
            })

            await page.sleep(2000)

            
            const captcha = await page.$('[title="reCAPTCHA"]')
            if (captcha) {
                logToTextarea("Captcha detected")
                page.url().includes('sory/index')
                logToTextarea("Done")
                await page.sleep(5000)
            }
            
            await page.solveRecaptchas();
            
            await page.waitForSelector('#result-stats', {
                waitUntil: 'domcontentloaded',
                timeout: 120000
            });
            
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
                    await writeEmail(recipientName);
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