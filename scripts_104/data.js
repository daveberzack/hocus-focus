import { openDB } from "https://cdn.jsdelivr.net/npm/idb@7/+esm";
import { getParameter, isTouchDevice, testerId, getDateFormatted } from "./utils.js";

const VERSION = 1;
const dbPromise = openDB("data", VERSION, {
  upgrade(db) {
    db.createObjectStore("results", { keyPath: "key", autoIncrement: true });
  },
});

let cachedTestChallenges;

const errorChallenge = {
  _id: "error",
  clue: "[No Puzzle Today]"
};
const tutorial0 = "63962b126b3ee2ea3c813c88";
const tutorial0_mobile = "63963563978afa2b41fc67e5";
const tutorial1 = "639635b56b3ee2ea3c813c9b";
const tutorial2 = "639636146b3ee2ea3c813caa";

let hasLoadedSpecifiedChallenge = false;
const getNextChallenge = async () => {
  const r = await getGameResults();

  //return the specified puzzle or the first uncompleted tutorial
  let challengeId = null;
  const foundTutorial = r.find((e) => e?._id == tutorial2) || r.find((e) => e?._id == tutorial1) || r.find((e) => e?._id == tutorial0)  || r.find((e) => e?._id == tutorial0_mobile);
  
  if (!foundTutorial) {
    if (isTouchDevice()) challengeId = tutorial0_mobile; 
    else challengeId = tutorial0;
  } else if (foundTutorial._id == tutorial0 || foundTutorial._id == tutorial0_mobile) challengeId = tutorial1
  else if (foundTutorial._id == tutorial1) challengeId = tutorial2;

  const specifiedId = getParameter("id");
  if (specifiedId && !hasLoadedSpecifiedChallenge) {
    challengeId = specifiedId;
    hasLoadedSpecifiedChallenge = true;
  }

  const specifiedDateOffset = getParameter("offset");
  if (specifiedDateOffset) {
    try {
      const response = await fetch(`https://dave-simplecrud.herokuapp.com/hocuschallenge/date/` + specifiedDateOffset);
      const challenge = await response.json();
      if (!challenge?._id) throw "challenge not found";
      challenge.isSpecified = true;
      return challenge;
    }
    catch {
      return errorChallenge;
    } 
  }

  else if (challengeId) {
    try {
      const response = await fetch(`https://dave-simplecrud.herokuapp.com/hocuschallenge/` + challengeId);
      const challenge = await response.json();
      if (!challenge?._id) throw "challenge not found";
      challenge.isSpecified = true;
      return challenge;
    }
    catch {
      return errorChallenge;
    }    
  }
  
  //otherwise if this is a tester, return the next one to test ...remember to disable sharing!
  else if (!!testerId) {
    if (!cachedTestChallenges) {
      try {
        const response = await fetch(`https://dave-simplecrud.herokuapp.com/hocustestchallenges`);
        cachedTestChallenges = await response.json();
      } catch {
        //do nothing. it'll just skip testing
      }
    }

    for (let i = 0; i < cachedTestChallenges.length; i++) {
      const id = cachedTestChallenges[i]._id;
      if (!r.find((e) => e._id == id)) return cachedTestChallenges[i];
    }
  }

  //otherwise return today's riddle (or played if already played, or an error if not found)
  try {
    const response = await fetch(`https://dave-simplecrud.herokuapp.com/hocustodaychallenge`);
    const challenge = await response.json();
    if (!challenge?._id) throw "challenge not found";

    const playedToday = !!r.find((e) => e?._id == challenge._id);
    if (playedToday) {
      challenge._id = "played";
    }
    return challenge;
  } catch {
    return errorChallenge;
  }
};

let cachedResults = [];

async function saveGameResult(challengeId, challengeDate, timePassed, mistakes, stars) {
  const newResult = { _id: challengeId, date: challengeDate, timePassed: Math.round(timePassed), mistakes, stars };
  cachedResults.push(newResult);
  (await dbPromise).put("results", newResult);
}

async function getYesterdayScores() {
  const url = `https://dave-simplecrud.herokuapp.com/hocusyesterdayscores`;
  const response = await fetch(url, {
    method: "GET",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    }
  });
  const data = await response.json();
  return data;
}

async function getStreak() {
  const results = await getGameResults();
  let missedADay = false;
  let streak = 0;
  while (!missedADay){
    streak++;
    const streakDate = getDateFormatted(streak, false);
    let found = false;
    results.forEach( r=> {
      if (r.date == streakDate && r.stars>0) found=true;
    });
    if (!found) missedADay=true;
  }
  return streak;
}

async function sendAnalytics(type, data) {
  const url = `https://dave-simplecrud.herokuapp.com/${type}`;
  await fetch(url, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

async function getGameResults() {
  let results = await (await dbPromise).getAll("results");
  if (results == []) results = cachedResults;
  return results;
}

function logPageView() {
  sendAnalytics("pageview", { page: "hocusfocus", url: window.location.href, userAgent: navigator.userAgent, width: $(window).width(), height: $(window).height(), touch: isTouchDevice(), user: testerId });
}

async function resetData() {
  if (confirm("Clear all your game data?")) {
    (await dbPromise).clear("results");
  }
}

export { getNextChallenge, saveGameResult, getGameResults, sendAnalytics, logPageView, resetData, getYesterdayScores, getStreak };
