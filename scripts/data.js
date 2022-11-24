import { getGameResults, getTodayString, getTestChallenge, isTouchDevice } from "./utils.js";

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
    else testerId = null;
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

export { getNextChallengeId, getChallengeById };
