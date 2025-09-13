/**
 * Data management module for Hocus Focus game
 * Handles challenge loading, game results, analytics, and user progress
 */

import { openDB } from "https://cdn.jsdelivr.net/npm/idb@7/+esm";
import { getParameter, isTouchDevice, getDateFormatted } from "./utils.js";
import { CONFIG, ENDPOINTS } from './config.js';
import { ChallengeNotFoundError, DatabaseError, createUserFriendlyError } from './errors.js';
import { getJSON } from './network.js';
import { globalCache } from './cache.js';
import { validateGameResult, validateUrlParameter } from './validation.js';

/**
 * @typedef {Object} Challenge
 * @property {string} clue - The riddle clue
 * @property {string} [date] - Challenge date
 * @property {boolean} [isSpecified] - Whether this is a user-specified challenge
 * @property {Array} [hitAreas] - Click target areas
 * @property {Array} [goals] - Time goals for star ratings
 * @property {Array} [beforeMessages] - Messages to show before game
 */

/**
 * @typedef {Object} GameResult
 * @property {string} date - Date played
 * @property {number} timePassed - Time taken in seconds
 * @property {number} mistakes - Number of wrong clicks
 * @property {number} stars - Stars earned (0-5)
 * @property {number} timestamp - When the result was saved
 */

// Database setup
const dbPromise = openDB(CONFIG.DB_NAME, CONFIG.DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(CONFIG.DB_STORE_NAME)) {
      db.createObjectStore(CONFIG.DB_STORE_NAME, { keyPath: "key", autoIncrement: true });
    }
  },
});

// State management
let cachedResults = [];
let cachedChallenges = null; // Cache for local challenges file
let cachedTutorialChallenges = [];

/**
 * Parse tokenized hitAreas string back into array of objects
 * @param {string} tokenString - Tokenized string like "x1,y1,x2,y2|x1,y1,x2,y2"
 * @returns {Array} Array of hitArea objects with x1,y1,x2,y2,w properties
 */
const parseHitAreas = (tokenString) => {
  if (!tokenString || typeof tokenString !== 'string') return [];
  return tokenString.split('|').map(token => {
    const [x1, y1, x2, y2] = token.split(',').map(Number);
    return { x1, y1, x2, y2, w: 12 }; // Default width of 12
  });
};

/**
 * Get today's date in YYMMDD format
 * @returns {string} Date string in YYMMDD format
 */
const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear().toString().slice(-2); // Last 2 digits
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  return year + month + day;
};

/**
 * Load all challenges from local JSON file
 * @returns {Promise<Array>} Array of all challenges
 */
const loadLocalChallenges = async () => {
  if (cachedChallenges) {
    return cachedChallenges;
  }
  
  try {
    const response = await fetch(ENDPOINTS.LOCAL_CHALLENGES);
    if (!response.ok) {
      throw new NetworkError(`Failed to load challenges file: ${response.status}`, ENDPOINTS.LOCAL_CHALLENGES, response.status);
    }
    
    cachedChallenges = await response.json();
    return cachedChallenges;
    
  } catch (error) {
    throw error;
  }
};

/**
 * Load tutorial challenges from local JSON file
 * @returns {Promise<Array>} Array of all challenges
 */
const loadTutorialChallenges = async () => {
  if (cachedTutorialChallenges?.length>0) {
    return cachedTutorialChallenges;
  }
  
  try {
    const response = await fetch(ENDPOINTS.TUTORIAL_CHALLENGES);
    if (!response.ok) {
      throw new NetworkError(`Failed to load challenges file: ${response.status}`, ENDPOINTS.TUTORIAL_CHALLENGES, response.status);
    }
    
    cachedTutorialChallenges = await response.json();
    return cachedTutorialChallenges;
    
  } catch (error) {
    throw error;
  }
};

/**
 * Handle specified challenge from URL parameters
 * @returns {Promise<Challenge|null>} Challenge object or null if none specified
 */
const handleSpecifiedLocalChallenge = async () => {

  const allChallenges = await loadLocalChallenges();

  const specifiedDate = getParameter("date");
  const specifiedKey = getParameter("key");
  if (!specifiedDate && !specifiedKey) return null;

  let specifiedChallenge = null;

  try {
    validateUrlParameter(specifiedDate, 'date');
    validateUrlParameter(specifiedKey, 'key');
    
    if (specifiedDate) {
      specifiedChallenge = allChallenges.find(challenge => challenge.date === specifiedDate);
    }
    
    if (specifiedKey) {
      specifiedChallenge = allChallenges.find(challenge => challenge.imageKey === specifiedKey);
    }

    specifiedChallenge.isSpecified = true;
    return specifiedChallenge;
    
  } catch (error) {
    return null;
  }
};

/**
 * Handle specified challenge from URL parameters
 * @returns {Promise<Challenge|null>} Challenge object or null if none specified
 */
const handleSpecifiedDatabaseChallenge = async () => {
  const specifiedId = getParameter("id");
  if (!specifiedId) return null;

  try {
    const url = `https://cerulean-api.onrender.com/api/hocus-focus/challenge/`+specifiedId;
    const response = await fetch(url, {
      method: "GET",
      mode: "cors",
    });
    const challenge = await response.json();

    challenge.isSpecified = true;
    return challenge;
    
  } catch (error) {
    return null;
  }
};


/**
 * Handle tutorial progression logic
 * @param {Array<GameResult>} results - User's game results
 * @returns {Promise<Challenge|null>} Tutorial challenge or null if tutorials complete
 */
const handleTutorialProgression = async (results) => {
  
  let tutorialToLoad = 0;
  results.forEach( result => {
    if (tutorialToLoad<1 && result.date == "tutorial0" ) tutorialToLoad=1;
    else if (tutorialToLoad<2 && result.date == "tutorial1" ) tutorialToLoad=2;
    else if (result.date == "tutorial2" ) tutorialToLoad=-1; //skip tutorial if completed
  })

  let tutorialKey = null;
  if (tutorialToLoad==0) {
    tutorialKey = isTouchDevice() ? 'tutorial0_mobile' : 'tutorial0';
  } else if (tutorialToLoad==1) {
    tutorialKey = 'tutorial1';
  } else if (tutorialToLoad==2) {
    tutorialKey = 'tutorial2';
  }
  
  if (tutorialKey) {
    const tutorials = await loadTutorialChallenges();
    const tutorial = tutorials[tutorialKey];
    if (tutorial) {
      tutorial.isSpecified = true;
      return tutorial;
    }
  }
  
  return null;
};


/**
 * Handle daily challenge loading from local JSON file
 * @param {Array<GameResult>} results - User's game results
 * @returns {Promise<Challenge>} Daily challenge
 */
const handleDailyChallenge = async (results) => {
  try {
    // Get today's date in YYMMDD format
    const todayDateString = getTodayDateString();
    
    // Load all challenges from local file
    const allChallenges = await loadLocalChallenges();
    
    // Find today's challenge by date
    const todayChallenge = allChallenges.find(challenge => challenge.date === todayDateString);
    
    if (!todayChallenge) {
      throw new ChallengeNotFoundError(`No challenge found for date ${todayDateString}`);
    }
    
    // Check if already played today
    const playedToday = !!results.find((result) => {
      return result?.date === todayChallenge.date;
    });

    if (playedToday) {
      return null;
    }
    
    return todayChallenge;
    
  } catch (error) {
    return cnull;
  }
};


const handleArchiveChallenge = async (results) => {
  try {
    const todayDateString = getTodayDateString();

    // Load all challenges from local file
    const allChallenges = await loadLocalChallenges();
    
    //find the first challenge that the user hasn't played
    let archiveChallenge = null;
    for (const challenge of allChallenges){
      //must be before today, and not a tutorial
      if (challenge.date>todayDateString && challenge.date.indexOf("tutorial"<0)){
        break;
      }
      //user hasn't played it
      let isPlayed = false;
            for (const result of results){
              if (result.date == challenge.date){
                isPlayed = true;
                break;
              }
            }
      if (!isPlayed) {
        archiveChallenge = challenge;
        break;
      }
    }

    archiveChallenge.isArchive = true;
    return archiveChallenge;
    
  } catch (error) {
    return null;
  }
};

/**
 * Default error challenge when no puzzle is available
 */
const getErrorChallenge = () => {
  return {
    imageKey: "error",
    clue: "[No Puzzle Available]<br/>Come back later",
    isError: true
  };
}

/**
 * Retrieves the next challenge based on user progress and parameters
 * @returns {Promise<Challenge>} Challenge object with _id, clue, and other properties
 */
const getNextChallenge = async () => {
  try {
    const results = await getGameResults();
    
    let challenge = null;
    
    // Handle challenges in priority order
    challenge = await handleSpecifiedLocalChallenge();
    if (!challenge) challenge = await handleSpecifiedDatabaseChallenge();
    if (!challenge) challenge = await handleTutorialProgression(results);
    if (!challenge) challenge = await handleDailyChallenge(results);
    if (!challenge) challenge = await handleArchiveChallenge(results);
    if (!challenge) challenge = await handleArchiveChallenge(results); 
    if (!challenge) challenge = getErrorChallenge();
    
    // Parse hitAreas if it's a tokenized string
    if (challenge && challenge.hitAreas && typeof challenge.hitAreas === 'string') {
      challenge.hitAreas = parseHitAreas(challenge.hitAreas);
    }
    
    return challenge;
    
  } catch (error) {
    return createUserFriendlyError(error, 'Challenge Loading');
  }
};

/**
 * Save a game result to the database
 * @param {string} challengeId - Challenge identifier
 * @param {string} challengeDate - Date the challenge was played
 * @param {number} timePassed - Time taken in seconds
 * @param {number} mistakes - Number of wrong clicks
 * @param {number} stars - Stars earned (0-5)
 * @returns {Promise<void>}
 * @throws {ValidationError|DatabaseError} When validation fails or database operation fails
 */
async function saveGameResult(challengeDate, timePassed, mistakes, stars) {
  try {
    // Create and validate the result object
    const newResult = { 
      date: challengeDate, 
      timePassed: Math.round(timePassed), 
      mistakes, 
      stars,
      timestamp: Date.now()
    };
    
    validateGameResult(newResult);
    
    // Save to cache and database
    cachedResults.push(newResult);
    await (await dbPromise).put(CONFIG.DB_STORE_NAME, newResult);
    
  } catch (error) {
    throw new DatabaseError(`Failed to save game result: ${error.message}`, 'saveGameResult');
  }
}

// /**
//  * Get yesterday's scores from the server
//  * @returns {Promise<Array>} Array of yesterday's scores
//  * @throws {NetworkError} When request fails
//  */
// async function getYesterdayScores() {
//   try {
//     const data = await getJSON(ENDPOINTS.YESTERDAY_SCORES);
//     return data;
    
//   } catch (error) {
//     // Return null instead of throwing - the app expects this for offline mode
//     return null;
//   }
// }

/**
 * Calculate the user's current win streak
 * @returns {Promise<number>} Number of consecutive days with wins
 */
async function getStreak() {
  try {
    const results = await getGameResults();
    let missedADay = false;
    let streak = 0;
    
    while (!missedADay) {
      streak++;
      const streakDate = getDateFormatted(streak, false);
      let found = false;
      
      results.forEach(result => {
        if (result.date === streakDate && result.stars > 0) {
          found = true;
        }
      });
      
      if (!found) {
        missedADay = true;
      }
    }
    
    return streak - 1; // Subtract 1 because we increment before checking
    
  } catch (error) {
    return 0;
  }
}

/**
 * Send analytics data to the server
 * @param {string} type - Analytics event type
 * @param {Object} data - Analytics data
 * @returns {Promise<void>}
 */
async function sendAnalytics(type, data) {
  console.log("analytics:"+type, data)
  //add google analytics here
}

/**
 * Get all game results from the database
 * @returns {Promise<Array<GameResult>>} Array of game results
 */
async function getGameResults() {
  try {
    const db = await dbPromise;
    let results = await db.getAll(CONFIG.DB_STORE_NAME);
    
    // Fallback to cached results if database is empty
    if (!results || results.length === 0) {
      results = cachedResults;
    }
    
    return results;
    
  } catch (error) {
    // Return cached results as fallback
    return cachedResults;
  }
}

/**
 * Log a page view for analytics
 */
function logPageView() {
  try {
    const analyticsData = {
      page: "hocusfocus",
      url: window.location.href,
      userAgent: navigator.userAgent,
      width: $(window).width(),
      height: $(window).height(),
      touch: isTouchDevice()
    };
    
    sendAnalytics("pageview", analyticsData);
    
  } catch (error) {
    // Silently fail for analytics
  }
}

/**
 * Reset all user data (with confirmation)
 * @returns {Promise<void>}
 */
async function resetData() {
  try {
    if (confirm("Clear all your game data?")) {
      const db = await dbPromise;
      await db.clear(CONFIG.DB_STORE_NAME);
      cachedResults = [];
      globalCache.clear();
    }
  } catch (error) {
    throw new DatabaseError(`Failed to reset data: ${error.message}`, 'resetData');
  }
}

// Export all public functions
export { 
  getNextChallenge, 
  saveGameResult, 
  getGameResults, 
  sendAnalytics, 
  logPageView, 
  resetData, 
  getStreak 
};
