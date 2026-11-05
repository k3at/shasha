import { chromium, devices } from "@playwright/test";
import fs from "node:fs/promises";

const baseURL = process.env.VISUAL_BASE_URL ?? "http://127.0.0.1:3000";
const outDir = "artifacts";

await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const issues = [];

async function capture(name, contextOptions, steps) {
  const context = await browser.newContext({ locale: "ar-SA", ...contextOptions });
  const page = await context.newPage();

  page.on("console", (message) => {
    if (message.type() === "error") {
      issues.push(`[${name}] console: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => issues.push(`[${name}] pageerror: ${error.message}`));
  page.on("response", (response) => {
    if (response.status() >= 400) {
      issues.push(`[${name}] http ${response.status()}: ${response.url()}`);
    }
  });
  page.on("requestfailed", (request) => {
    issues.push(`[${name}] request failed: ${request.url()} (${request.failure()?.errorText})`);
  });

  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "شاشتك جاهزة" }).waitFor();
  await page.screenshot({ path: `${outDir}/${name}-empty.png` });

  await steps(page);

  await context.close();
}

await capture("desktop", { viewport: { width: 1440, height: 900 } }, async (page) => {
  await page.getByRole("button", { name: "تجربة القائمة التجريبية" }).click();
  await page.getByRole("heading", { name: "الجزيرة" }).waitFor();
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${outDir}/desktop-player.png` });

  await page.getByRole("button", { name: "إضافة قائمة تشغيل", exact: true }).first().click();
  await page.getByRole("dialog").waitFor();
  await page.screenshot({ path: `${outDir}/desktop-dialog.png` });

  await page.getByRole("tab", { name: "Xtream" }).click();
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${outDir}/desktop-xtream.png` });

  await page.getByRole("button", { name: "إغلاق", exact: true }).click();
});

await capture("mobile", { ...devices["Pixel 7"] }, async (page) => {
  await page.getByRole("button", { name: "تجربة القائمة التجريبية" }).click();
  await page.getByRole("heading", { name: "الجزيرة" }).waitFor();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${outDir}/mobile-player.png`, fullPage: true });

  await page.getByRole("button", { name: "إضافة قائمة تشغيل", exact: true }).first().click();
  await page.getByRole("dialog").waitFor();
  await page.getByRole("tab", { name: "Xtream" }).click();
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${outDir}/mobile-xtream.png` });
});

await browser.close();

if (issues.length > 0) {
  console.log("Console/page issues:");
  for (const issue of issues) {
    console.log(`- ${issue}`);
  }
} else {
  console.log("No console or page errors.");
}

console.log(`Screenshots written to ${outDir}/`);
