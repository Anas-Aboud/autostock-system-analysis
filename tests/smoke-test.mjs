import assert from "node:assert/strict";
import { createReadStream, existsSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = normalize(join(dirname(fileURLToPath(import.meta.url)), ".."));
const port = 4175;
const mimeTypes = { ".css": "text/css", ".html": "text/html", ".js": "text/javascript", ".png": "image/png" };
const server = createServer((request, response) => {
  const requestPath = request.url === "/" ? "/index.html" : request.url.split("?")[0];
  const filePath = normalize(join(root, requestPath));
  if (!filePath.startsWith(root) || !existsSync(filePath)) return response.writeHead(404).end("Not found");
  response.writeHead(200, { "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream" });
  createReadStream(filePath).pipe(response);
});

await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve));
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`http://127.0.0.1:${port}`);
  assert.equal(await page.locator("#restock-table-body tr").count(), 4);

  await page.getByRole("button", { name: "Critical" }).click();
  assert.equal(await page.locator("#restock-table-body tr:visible").count(), 2);

  await page.locator("#restock-table-body tr:visible").first().getByRole("button", { name: "Restock", exact: true }).click();
  await page.getByLabel("Quantity").fill("50");
  await page.getByRole("button", { name: "Create request" }).click();
  await page.getByText("Request created for 50 units of USB-C Cable.").waitFor();

  await page.getByRole("button", { name: "Inventory", exact: true }).click();
  await page.locator("#inventory-screen").waitFor({ state: "visible" });
  assert.equal(await page.locator(".product-card").count(), 6);
  await page.getByLabel("Search electronics").fill("SSD");
  assert.equal(await page.locator(".product-card:visible").count(), 1);

  await page.getByRole("button", { name: "Restock rules", exact: true }).click();
  await page.locator("#rules-screen").waitFor({ state: "visible" });
  assert.equal(await page.locator(".rule-card").count(), 3);

  await page.getByRole("button", { name: "Suppliers", exact: true }).click();
  await page.locator("#suppliers-screen").waitFor({ state: "visible" });
  assert.equal(await page.locator(".supplier-row:not(.supplier-head)").count(), 4);
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
