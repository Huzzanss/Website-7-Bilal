// Vercel serverless entry point.
//
// Static files (index.html, style.css, page/adminpanel/index.html, dst) are
// served directly by Vercel's own static hosting — this function only
// handles everything under /api/*. See vercel.json for the rewrite rule
// that sends all /api/* traffic here.
module.exports = require("../server/app");
