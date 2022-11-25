import { openDB } from "https://cdn.jsdelivr.net/npm/idb@7/+esm";
import { getTodayString, isTouchDevice, testerId } from "./utils.js";
import { tutorial0, tutorial0_mobile, tutorial1, tutorial2 } from "./tutorials.js";

const VERSION = 1;
const dbPromise = openDB("data", VERSION, {
  upgrade(db) {
    db.createObjectStore("results", { keyPath: "key", autoIncrement: true });
  },
});

let cachedTestChallenges;

const getNextChallenge = async () => {
  const r = await getGameResults();

  //return the first uncompleted tutorial
  const foundTutorial = r.find((e) => e?._id == "tutorial2") || r.find((e) => e?._id == "tutorial1") || r.find((e) => e?._id.includes("tutorial0"));
  if (!foundTutorial) {
    if (isTouchDevice()) return tutorial0_mobile;
    else return tutorial0;
  } else if (foundTutorial._id == "tutorial1") return tutorial2;
  else if (foundTutorial._id.includes("tutorial0")) return tutorial1;
  //
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

    console.log(challenge);
    //otherwise return today's challenge or played placeholder
    const playedToday = !!r.find((e) => e?._id == challenge._id);
    console.log(playedToday);
    if (playedToday) {
      challenge._id = "played";
    }
    return challenge;
  } catch {
    return {
      _id: "error",
      clue: "[No Puzzle Today]",
      subtitle: "Please check back tomorrow.",
      hideButton: true,
      credit: "",
      creditUrl: "#",
      goals: [],
    };
  }
};

let cachedResults = [];

async function saveGameResult(challengeId, timePassed, mistakes, stars) {
  const newResult = { _id: challengeId, timePassed: Math.round(timePassed), mistakes, stars };
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
  if (results == []) results = cachedResults;
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
