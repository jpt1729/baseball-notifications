import { scheduleJob } from "node-schedule";
import { getScheduleData, getLiveGameData } from "./getData.js";

async function pollApi(game, intervalTime = 30000) {
  // Set up a new table here to store game data

  const { link } = game;
  let teamOfInterest = "away";

  let pastData = { home: { score: 0 }, away: { score: 0 } }; // Initialize pastData
  let data;
  let winningTeam = teamOfInterest === "home" ? "away" : "home";
  console.log(`[${new Date()}] Game watch starting.`);

  let gameWatch = setInterval(async () => {
    try {
      data = await getLiveGameData(game);
      if (data.status.codedGameState === 'F') {
        clearInterval(gameWatch);
        console.log(`[${new Date()}] Game finished.`);
        return;
      }

      if (data[teamOfInterest].score > pastData[teamOfInterest].score) {
        console.log(`[${new Date()}] ${data[teamOfInterest].name} just scored!`);
      }

      if (data[teamOfInterest].score > data[teamOfInterest === "home" ? "away" : "home"].score) {
        if (teamOfInterest !== winningTeam) {
          console.log(`[${new Date()}] ${data[teamOfInterest].name} winning`);
          winningTeam = teamOfInterest;
        }
      } else {
        winningTeam = teamOfInterest === "home" ? "away" : "home";
      }

      pastData = data;
    } catch (error) {
      console.error(`[${new Date()}] Error fetching live game data:`, error);
    }
  }, intervalTime);
}

pollApi('/api/v1.1/game/745865/feed/live');
