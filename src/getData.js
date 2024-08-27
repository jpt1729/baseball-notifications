const API_ENDPOINT = "https://statsapi.mlb.com/";

export async function fetchScheduleData() {
  const time = new Date();

  // Convert to Central Daylight Time (CDT)
  const offset = -5; // CDT is UTC-5
  const today = new Date(time.getTime() + offset * 60 * 60 * 1000);

  const currentYear = today.getFullYear();
  const startDate = today.toISOString().split("T")[0];
  const endOfYear = new Date(currentYear, 11, 31);
  const endDate = endOfYear.toISOString().split("T")[0];

  const params = new URLSearchParams({
    sportId: 1,
    startDate: startDate,
    endDate: endDate,
  });
  const response = await fetch(
    `${API_ENDPOINT}/api/v1/schedule/games?${params.toString()}`
  );
  const data = await response.json();
  return data;
}

/**
 * Processes the raw schedule data to extract relevant information for each game.
 * @param {Object} rawData - The raw data retrieved from the API.
 * @returns {Array<Object>} An array of game objects, each containing information like link, gamePk, gameDate, and status.
 */
export function processRawScheduleData(data) {
    let processedData = []
  data.dates.forEach((dateObj) => {
    const gamesArray = dateObj.games.map((game) => {
      return {
        gameDate: game.gameDate,
        teams: game.teams,
        status: game.status,
      };
    });
    processedData.push(...gamesArray)
  });
  return processedData
}
/**
 * Fetches live game data from the API endpoint.
 * @returns {Promise<Object>} The raw data retrieved from the API.
 */
export async function fetchGameData(link) {
  const response = await fetch(`${API_ENDPOINT}${link}`);
  const data = await response.json();
  return data;
}

export function processRawGameData(rawData) {
  // Extract information for the away team.
  const teams = rawData.gameData.teams;
  const scores = rawData.liveData.linescore.teams;

  // Combine the teams and scores data.
  return {
    home: {
      ...teams.home,
      score: scores.home.runs
    },
    away: {
      ...teams.away,
      score: scores.away.runs
    }
  };
}

export async function getLiveGameData(link) {
  const data = await fetchGameData(link);
  const processedData = processRawGameData(data);
    console.log(processedData)
  return processedData;
}

/**
 * Fetches data from the API endpoint and processes it to extract relevant information for each game.
 * @returns {Promise<Array<Object>>} An array of game objects, each containing information like link, gamePk, gameDate, and status.
 */
export async function getScheduleData() {
  const data = await fetchScheduleData();
  const processedData = processRawScheduleData(data);

  return processedData;
}

console.log(getLiveGameData('/api/v1.1/game/745133/feed/live'));
