#!/usr/bin/env node
// backend/scripts/process-drip.js
// Run this script via cron every hour to process scheduled drip emails

const { processDripEmails } = require('../services/drip');

console.log(`[${new Date().toISOString()}] Starting drip email processor...`);

processDripEmails()
  .then(() => {
    console.log(`[${new Date().toISOString()}] Drip email processor finished successfully.`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(`[${new Date().toISOString()}] Drip email processor failed:`, error);
    process.exit(1);
  });
