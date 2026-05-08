import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function fail(message) {
  throw new Error(`[business] ${message}`);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const readme = read("README.md");
const market = read("docs/market-validation-pack.md");
const buyerPack = read("docs/buyer-seller-order-pack.md");
const procurement = read("docs/procurement-pack.md");
const acceptance = read("docs/acceptance.md");

assert(readme.includes("Default first purchase"), "README must state a default first purchase");
assert(readme.includes("US TikTok Shop beauty and personal-care"), "README must narrow the first ICP");
assert(readme.includes("conditional release"), "README must explain buyer-facing conditional release language");
assert(market.includes("sandbox_verified"), "market validation pack must include sandbox_verified status");
assert(market.includes("Validated evidence gap"), "market validation pack must state validated evidence gap honestly");
assert(market.includes("What we can claim now"), "market validation pack must define current claim boundary");
assert(market.includes("不能声称已有真实付费客户"), "market validation pack must forbid fake customer traction claims");
assert(buyerPack.includes("Buyer acceptance mini terms"), "buyer/seller pack must include buyer acceptance mini terms");
assert(buyerPack.includes("AA-SANDBOX-TRIAL-001"), "buyer/seller pack must reference sandbox package");
assert(procurement.includes("Default Trial gate"), "procurement pack must include default Trial gate");
assert(acceptance.includes("Evidence artifact gates"), "acceptance must include evidence artifact gates");

console.log("business readiness verification passed");
