// chat-archive-system.js

const cron = require('node-cron');

/**
 * Setup the archive schedule
 * Currently disabled as per user requirement
 */
const setupArchiveSchedule = ({ daysOld, cronSchedule, cronLib }) => {
  console.log('Message archiving system is ENABLED.');
  
  if (!cronLib) {
    cronLib = cron;
  }
  
  cronLib.schedule(cronSchedule, () => {
    console.log(`Running scheduled message archiving at ${new Date()}`);
    const { archiveOldMessages } = require('../controllers/messages.archiver.controller');
    archiveOldMessages(daysOld)
      .then(stats => {
        console.log(`Archive process completed:`, stats);
      })
      .catch(err => {
        console.error(`Archive process failed:`, err);
      });
  });
};

module.exports = {
  setupArchiveSchedule
};