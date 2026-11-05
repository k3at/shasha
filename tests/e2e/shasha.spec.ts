import { test, expect, type Page } from "@playwright/test";

const PASTED_PLAYLIST = `#EXTM3U
#EXTINF:-1 tvg-logo="https://example.com/logo.png" group-title="أخبار",قناة الاختبار
https://example.com/test-stream.m3u8
#EXTINF:-1 group-title="رياضة",قناة رياضية
https://example.com/sport-stream.m3u8
`;

async function openAddDialog(page: Page) {
  await page.getByRole("button", { name: "إضافة قائمة تشغيل", exact: true }).first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
}

async function addDemo(page: Page) {
  await page.getByRole("button", { name: "تجربة القائمة التجريبية" }).click();
  await expect(page.getByRole("button", { name: /الجزيرة/ }).first()).toBeVisible();
}

async function expectStored(page: Page, text: string) {
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("shasha:library:v1")))
    .toContain(text);
}

async function expectFavoritesStored(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => {
        const raw = localStorage.getItem("shasha:library:v1");

        return raw ? (JSON.parse(raw) as { favorites: string[] }).favorites.length : 0;
      }),
    )
    .toBeGreaterThan(0);
}

test.describe("واجهة شاشة", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "شاشتك جاهزة" })).toBeVisible();
  });

  test("الصفحة عربية RTL وبعنوان صحيح", async ({ page }) => {
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page).toHaveTitle(/شاشة/);
    await expect(page.getByText("شاشتك جاهزة")).toBeVisible();
    await expect(page.getByRole("button", { name: "تجربة القائمة التجريبية" })).toBeVisible();
  });

  test("القائمة التجريبية تضيف القنوات وتُحفظ بعد إعادة التحميل", async ({ page }) => {
    await addDemo(page);

    await expect(page.getByRole("heading", { name: "الجزيرة" })).toBeVisible();
    await expect(page.getByRole("button", { name: /قائمة تجريبية/ })).toBeVisible();
    await expect(page.getByText(/8 قنوات/).first()).toBeVisible();
    await expectStored(page, "قائمة تجريبية");

    await page.reload();
    await expect(page.getByRole("button", { name: /الجزيرة/ }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "الجزيرة" })).toBeVisible();

    const stored = await page.evaluate(() => localStorage.getItem("shasha:library:v1"));
    expect(stored).toContain("قائمة تجريبية");
  });

  test("البحث يرشّح القنوات ومسحه يعيدها", async ({ page }) => {
    await addDemo(page);

    const search = page.getByRole("searchbox", { name: "البحث عن قناة" });
    await search.fill("فرانس");

    await expect(page.getByRole("button", { name: /فرانس 24/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /^الجزيرة/ })).toHaveCount(0);

    await page.getByRole("button", { name: "مسح البحث" }).click();
    await expect(page.getByRole("button", { name: /^الجزيرة/ }).first()).toBeVisible();
  });

  test("المفضلة تُضاف وتُحفظ وتظهر في تصفية المفضلة", async ({ page }) => {
    await addDemo(page);

    await page.getByRole("button", { name: "إضافة إلى المفضلة" }).last().click();
    await expect(page.getByRole("button", { name: "إزالة من المفضلة" }).last()).toBeVisible();

    await page
      .getByRole("button", { name: /^المفضلة/ })
      .first()
      .click();
    await expect(page.getByRole("button", { name: /^الجزيرة/ }).first()).toBeVisible();

    await expectFavoritesStored(page);
    await page.reload();
    await page
      .getByRole("button", { name: /^المفضلة/ })
      .first()
      .click();
    await expect(page.getByRole("button", { name: /^الجزيرة/ }).first()).toBeVisible();
  });

  test("إضافة قائمة باللصق تعرض قنواتها وتُسمّى بشكل صحيح", async ({ page }) => {
    await openAddDialog(page);

    await expect(page.getByRole("tab", { name: "رابط" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByLabel("رابط القائمة")).toBeVisible();
    await expect(page.getByLabel("اسم القائمة").first()).toBeVisible();

    await page.getByRole("tab", { name: "لصق" }).click();
    await page.getByLabel("محتوى M3U").fill(PASTED_PLAYLIST);
    await page
      .getByLabel(/اسم القائمة/)
      .first()
      .fill("قائمة الاختبار");
    await page.getByRole("button", { name: "إضافة القائمة" }).click();

    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(page.getByRole("button", { name: /^قناة الاختبار/ }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /قائمة الاختبار/ })).toBeVisible();

    await expectStored(page, "قناة رياضية");
  });

  test("إضافة حساب Xtream تجلب القنوات وتحفظها", async ({ page }) => {
    await page.route("**/api/xtream", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          channels: [
            {
              id: "cxtream1",
              name: "قناة Xtream الأولى",
              url: "https://demo.example.com/live/user/pass/1.m3u8",
              logo: null,
              group: "أخبار",
              tvgId: "xtream-one",
              tvgName: "قناة Xtream الأولى",
            },
            {
              id: "cxtream2",
              name: "قناة Xtream الثانية",
              url: "https://demo.example.com/live/user/pass/2.m3u8",
              logo: null,
              group: "رياضة",
              tvgId: "xtream-two",
              tvgName: "قناة Xtream الثانية",
            },
          ],
          suggestedName: "Xtream — demo.example.com",
          total: 2,
          truncated: false,
        }),
      });
    });

    await openAddDialog(page);
    await page.getByRole("tab", { name: "Xtream" }).click();

    await expect(page.getByLabel("رابط الخادم")).toBeVisible();
    await expect(page.getByLabel("اسم المستخدم")).toBeVisible();
    await expect(page.getByLabel("كلمة المرور")).toBeVisible();

    await page.getByRole("button", { name: "إضافة القائمة" }).click();
    await expect(page.getByRole("dialog").getByRole("alert")).toContainText(
      "أدخل رابط خادم Xtream",
    );

    await page.getByLabel("رابط الخادم").fill("http://demo.example.com:8080");
    await page.getByLabel("اسم المستخدم").fill("user");
    await page.getByLabel("كلمة المرور").fill("pass");
    await page.getByLabel(/اسم القائمة/).fill("اشتراك تجريبي");
    await page.getByRole("button", { name: "إضافة القائمة" }).click();

    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(page.getByRole("button", { name: /^قناة Xtream الأولى/ }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /اشتراك تجريبي/ })).toBeVisible();
    await expect(page.getByText(/قناتان/).first()).toBeVisible();

    await expectStored(page, "قناة Xtream الثانية");
    await expectStored(page, "اشتراك تجريبي");
  });

  test("نموذج الإضافة يعرض خطأً واضحاً عند محتوى غير صالح", async ({ page }) => {
    await openAddDialog(page);

    await page.getByRole("tab", { name: "لصق" }).click();
    await page.getByLabel("محتوى M3U").fill("نص عادي بلا قنوات");
    await page.getByRole("button", { name: "إضافة القائمة" }).click();

    await expect(page.getByRole("dialog").getByRole("alert")).toContainText("لم نعثر على قنوات");
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("صفحة 404 عربية وتعود للرئيسية", async ({ page }) => {
    await page.goto("/not-a-real-page");
    await expect(page.getByRole("heading", { name: "لم نجد هذه الصفحة" })).toBeVisible();
    await expect(page.getByRole("link", { name: "العودة إلى شاشة" })).toBeVisible();
  });
});

test.describe("واجهات API", () => {
  test("فحص الصحة يعمل", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);

    const body = (await response.json()) as { status: string; service: string };
    expect(body.status).toBe("ok");
    expect(body.service).toBe("shasha");
  });

  test("وسيط القائمة يرفض الطلب الناقص والعناوين المحلية", async ({ request }) => {
    const missing = await request.get("/api/playlist");
    expect(missing.status()).toBe(400);
    expect(((await missing.json()) as { error: string }).error).toContain("url");

    const local = await request.get("/api/playlist?url=http://127.0.0.1:3000/secret");
    expect(local.status()).toBe(400);
    expect(((await local.json()) as { error: string }).error).toContain("محلي");

    const file = await request.get("/api/playlist?url=file:///etc/passwd");
    expect(file.status()).toBe(400);
  });

  test("وسيط Xtream يرفض الطلب الناقص والعناوين المحلية", async ({ request }) => {
    const missing = await request.post("/api/xtream", { data: {} });
    expect(missing.status()).toBe(400);
    expect(((await missing.json()) as { error: string }).error).toContain("رابط الخادم");

    const local = await request.post("/api/xtream", {
      data: { server: "http://127.0.0.1:8080", username: "user", password: "pass" },
    });
    expect(local.status()).toBe(400);
    expect(((await local.json()) as { error: string }).error).toContain("محلي");

    const scheme = await request.post("/api/xtream", {
      data: { server: "file:///etc/passwd", username: "user", password: "pass" },
    });
    expect(scheme.status()).toBe(400);
  });
});
