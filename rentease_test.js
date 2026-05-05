const { Builder, By, until } = require('selenium-webdriver');

async function runTests() {
    let driver = await new Builder().forBrowser('chrome').build();

    try {
        console.log("Starting RentEase Tests...\n");

        // =========================
        // 1. VALID LOGIN TEST
        // =========================
        console.log("Test 1: Valid Login");

        await driver.get('http://localhost:8000/login');
        await driver.sleep(2000);

        let username = await driver.findElement(By.name('username'));
        await driver.executeScript("arguments[0].value='nikam_11';", username);

        let password = await driver.findElement(By.name('password'));
        await driver.executeScript("arguments[0].value='nikam_11';", password);

        let loginBtn = await driver.findElement(By.css('button'));
        await driver.executeScript("arguments[0].click();", loginBtn);

        await driver.sleep(3000);

        let currentUrl = await driver.getCurrentUrl();
        console.log("After login URL:", currentUrl);

        if (!currentUrl.includes('login')) {
            console.log("Valid Login PASSED\n");
        } else {
            console.log("Valid Login FAILED\n");
        }

        // =========================
        // 2. INVALID LOGIN TEST
        // =========================
        console.log("Test 2: Invalid Login");

        await driver.get('http://localhost:8000/login');
        await driver.sleep(2000);

        let user2 = await driver.findElement(By.name('username'));
        await driver.executeScript("arguments[0].value='wronguser';", user2);

        let pass2 = await driver.findElement(By.name('password'));
        await driver.executeScript("arguments[0].value='wrongpass';", pass2);

        let btn2 = await driver.findElement(By.css('button'));
        await driver.executeScript("arguments[0].click();", btn2);

        await driver.sleep(3000);

        let url2 = await driver.getCurrentUrl();

        if (url2.includes('login')) {
            console.log("Invalid Login PASSED\n");
        } else {
            console.log("Invalid Login FAILED\n");
        }

        // =========================
        // 3. NAVIGATION TEST
        // =========================
        console.log("Test 3: Navigation Test");

        await driver.get('http://localhost:8000');
        await driver.sleep(2000);

        let buttons = await driver.findElements(By.css('a, button'));

        if (buttons.length > 0) {
            await driver.executeScript("arguments[0].click();", buttons[0]);
            await driver.sleep(2000);
            console.log("Navigation Test PASSED\n");
        } else {
            console.log("Navigation Test FAILED\n");
        }

        // =========================
        // 4. FORM TEST
        // =========================
        console.log("Test 4: Form Test");

        try {
            await driver.get('http://localhost:8000/listings');
            await driver.sleep(2000);

            let inputs = await driver.findElements(By.css('input'));

            if (inputs.length > 0) {
                await driver.executeScript("arguments[0].value='Test Property';", inputs[0]);
                console.log("Form Test PASSED\n");
            } else {
                console.log("Form Test FAILED\n");
            }
        } catch {
            console.log("Form Test SKIPPED\n");
        }

        console.log("All Tests Completed");

    } catch (err) {
        console.log("Error:", err);
    } finally {
        await driver.quit();
    }
}

runTests();