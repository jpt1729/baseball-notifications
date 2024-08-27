import { scheduleJob } from "node-schedule";
import { getScheduleData, getLiveGameData } from "./getData.js";

async function pollApi(game, intervalTime = 300000) {
  // Set up a new table here to store game data

  const { link } = game;
  let teamOfInterest;

  if (
    game.teams.away.team.name === "Philadelphia Phillies" ||
    game.teams.home.team.name === "Philadelphia Phillies"
  ) {
    teamOfInterest =
      game.teams.away.team.name === "Philadelphia Phillies" ? "away" : "home";
    console.log("Philadelphia Phillies playing right now");
  } else if (
    game.teams.away.team.name === "Houston Astros" ||
    game.teams.home.team.name === "Houston Astros"
  ) {
    teamOfInterest =
      game.teams.away.team.name === "Houston Astros" ? "away" : "home";
    console.log("Houston Astros playing right now");
  } else {
    return;
  }

  let pastData = await getLiveGameData(link);
  let data;
  let winningTeam = teamOfInterest === "home" ? "away" : "home"

  console.log(`[${new Date()}] Game watch starting.`);

  let gameWatch = setInterval(async () => {
    data = await getLiveGameData(link);
    if (data.status.codedGameState === 'F') {
      clearInterval(gameWatch)
    }

    if (data[teamOfInterest].score > pastData[teamOfInterest].score){
      console.log(`${data[teamOfInterest].name} just scored!`)
    }

    if (data[teamOfInterest].score > data[teamOfInterest === "home" ? "away":"home"].score){
      if (teamOfInterest === winningTeam) {
        console.log(`${data[teamOfInterest].name} winning`)
        winningTeam = teamOfInterest
      }
    } else {
      winningTeam = teamOfInterest === "home" ? "away":"home"
    }

    pastData = data;
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
    console.log(`[${new Date()}] Scheduled ${game.teams.away.team.name} vs. ${game.teams.home.team.name} game for ${game.gameDate}`);
  });
}

// Run the main function to schedule games
main().catch((err) => {
  console.error(err);
});

// Schedule a job to retrieve the game schedule every day at midnight
scheduleJob("0 0 1 1 *", () => {
  console.log(`[${new Date()}] Fetching game schedule`);
  main().catch((err) => {
    console.error(err);
  });
});
