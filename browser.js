import { browser } from "k6/browser";
import { check } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3333";

export const options = {
    scenarios: {
        ui: {
            executor: "shared-iterations",
            vus: 10,
            iterations: 200,
            // duration: '30s',
            options: {
                browser: {
                    type: "chromium",
                },
            },
        },
    },
};

export default async function () {
    const context = await browser.newContext()
    const page = await context.newPage();

    try {
        await page.goto(BASE_URL);
        const headerText = await page.locator("h1").textContent();
        check(page, {
            header: () => headerText === "Looking to break out of your pizza routine?",
        });

        await page.locator('//button[. = "Pizza, Please!"]').click();
        await page.waitForTimeout(500);
        const recommendationText = await page.locator("div#recommendations").textContent();
        check(page, {
            recommendation:  ()=> recommendationText !== "",
        })
        await page.screenshot({ path: "screenshot.png" });

    } finally {
        await page.close();
    }
}