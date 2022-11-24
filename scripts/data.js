import { openDB } from "https://cdn.jsdelivr.net/npm/idb@7/+esm";
import { getTodayString, isTouchDevice, testerId } from "./utils.js";
import { tutorial0, tutorial0_mobile, tutorial1, tutorial2 } from "./tutorials.js";

const VERSION = 1;
const dbPromise = openDB("data", VERSION, {
  upgrade(db) {
    db.createObjectStore("results", { keyPath: "key", autoIncrement: true });
  },
});

const getNextChallenge = async () => {
  const r = await getGameResults();

  const playedToday = false; // <---- check results for actual value

  //return the first uncompleted tutorial
  const foundTutorial = r.find((e) => e.id == "tutorial2") || r.find((e) => e.id == "tutorial1") || r.find((e) => e.id.includes("tutorial0"));
  if (!foundTutorial) {
    if (isTouchDevice()) return tutorial0_mobile;
    else return tutorial0;
  } else if (foundTutorial.id == "tutorial1") return tutorial2;
  else if (foundTutorial.id.includes("tutorial0")) return tutorial1;
  //otherwise if this is a tester, return the next one to test ...remember to disable sharing!
  else if (!!testerId) {
    try {
      const response = await fetch(`./challenges/001/data.json`);
      const challenge = await response.json();
      console.log("test", challenge);
      if (!r.find((e) => e.id == challenge.id)) return challenge;
    } catch {
      //do nothing. if this fails, we'll continue checking cases below
    }
  }

  //otherwise return today's riddle or played placeholder
  if (playedToday) {
  }

  //otherwise return today's riddle (or an error if not found)
  else
    try {
      const response = await fetch(`./cccc`);
      const challenge = await response.json();
      return challenge;
    } catch {
      return {
        id: "error",
        clue: "[No Puzzle Today]",
        subtitle: "Please check back tomorrow.",
        hideButton: true,
        credit: "",
        creditUrl: "#",
        goals: [],
      };
    }
};
/*
const getNextChallengeId = async () => {
  const r = await getGameResults();

  //return the first uncompleted tutorial
  const foundTutorial = r.find((e) => e.id == "tutorial2") || r.find((e) => e.id == "tutorial1") || r.find((e) => e.id.includes("tutorial0"));
  if (!foundTutorial) {
    console.log("not found", r);
    if (isTouchDevice()) return "tutorial0_mobile";
    else return "tutorial0";
  } else if (foundTutorial.id == "tutorial1") return "tutorial2";
  else if (foundTutorial.id.includes("tutorial0")) return "tutorial1";

  //if tester, return the first uncompleted test
  if (testerId) {
    const testChallenge = await getTestChallenge();
    if (testChallenge) return testChallenge;
  }
  //else return today's challenge or "played" if already played
  const todayString = getTodayString();
  const foundToday = r.find((e) => e.id == todayString);
  if (!foundToday) return todayString;
  else return "played";
};

const getChallengeById = async (challengeId) => {
  if (challengeId == "played") return null;
  let challenge = {};
  try {
    const response = await fetch(`./challenges/${challengeId}/data.json`);
    challenge = await response.json();
  } catch {
    challengeId = "error";
    challenge = {
      id: challengeId,
      clue: "[No Puzzle Today]",
      subtitle: "Please check back tomorrow.",
      hideButton: true,
      credit: "",
      url: "#",
      goals: [],
    };
  }

  challenge.nextChallenge = challengeId.includes("tutorial") || !!testerId;
  challenge.imgFile = `./challenges/${challengeId}/img.jpg`;
  challenge.hitFile = `./challenges/${challengeId}/hit.jpg`;
  challenge.id = challengeId;
  return challenge;
};

async function getTestChallenge() {
  const results = await getGameResults();
  let challengeId = null;
  const testChallenges = ["001", "002", "003", "004", "005"];
  for (let i = 0; i < testChallenges.length; i++) {
    const testChallenge = testChallenges[i];
    if (!results.find((r) => r.id == testChallenge)) {
      challengeId = testChallenge;
      break;
    }
  }
  return challengeId;
}
*/

let cachedResults = [];

async function saveGameResult(challengeId, timePassed, mistakes, stars) {
  const newResult = { id: challengeId, timePassed: Math.round(timePassed), mistakes, stars };
  cachedResults.push(newResult);
  (await dbPromise).put("results", newResult);
}

async function sendAnalytics(type, data) {
  //console.log("analytics", data);
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
  console.log("/ ", results);
  if (results == []) results = cachedResults;
  console.log(results);
  return results;
}

function logPageView() {
  sendAnalytics("pageview", { page: "hocusfocus", userAgent: navigator.userAgent, width: $(window).width(), height: $(window).height(), touch: isTouchDevice(), user: testerId });
}

async function resetData() {
  if (confirm("Clear all your game data?")) {
    (await dbPromise).clear("results");
  }
}

export { getNextChallenge, saveGameResult, getGameResults, sendAnalytics, logPageView, resetData };
