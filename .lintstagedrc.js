const path = require("path");

module.exports = {
  "packages/nextjs/**/*.{ts,tsx,js,jsx}": (files) => {
    const rel = files
      .map((f) => path.relative(path.join("packages", "nextjs"), f))
      .join(" ");
    return [`yarn workspace @se-2/nextjs exec eslint --fix ${rel}`];
  },
  "packages/hardhat/**/*.{ts,js}": (files) => {
    const rel = files
      .map((f) => path.relative(path.join("packages", "hardhat"), f))
      .join(" ");
    return [`yarn workspace @se-2/hardhat exec eslint --fix ${rel}`];
  },
};
