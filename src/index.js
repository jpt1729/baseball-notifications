import { scheduleJob } from 'node-schedule';
import { getScheduleData, getGameData } from './getData.js';
import { insertData } from './processData.js';

/**
 * Polls an API for game data and inserts it into a database at an interval.
 *
 * @param {Object} game - An object representing a game.
 * @param {number} [intervalTime=30000] - The time (in milliseconds) to wait between API polls.
 * @returns {undefined}
 */
async function pollApi(game, intervalTime = 30000) {
  // Set up a new table here to store game data

  const { link } = game;
  let pastData = await getGameData(link);
  let data = pastData;

  setInterval(async () => {
    data = await getGameData(link);
    if (pastData === data) {
      console.log(`[${new Date()}] No change in data.`);
    } else {
      insertData(data.gameData, data.homeTeam, data.awayTeam);
      console.log(`[${new Date()}] Data inserted successfully.`);
    }
  }, intervalTime);

  console.log(`[${new Date()}] Game finished.`);
}

/**
 * Retrieves the schedule data, schedules each game, and logs the scheduled time.
 *
 * @returns {Promise} Resolves with a result object if scheduling was successful.
 */
async function main() {
  const schedule = await getScheduleData();
  schedule.forEach((game) => {
    scheduleJob(game.gameDate, () => {
      pollApi(game);
    });
    console.log(`[${new Date()}] Scheduled game for ${game.gameDate}`);
  });
}

// Run the main function to schedule games
main().catch((err) => {
  console.error(err);
});

// Schedule a job to retrieve the game schedule every day at midnight
scheduleJob('0 0 * * *', () => {
  console.log(`[${new Date()}] Fetching game schedule`);
  main().catch((err) => {
    console.error(err);
  });
});
