const tutorial0 = {
  isTutorial: true,
  id: "tutorial0",
  clue: "Click the [bullseye].",
  credit: "Prawny",
  imageUrl: "./riddles/dartboard.jpg",
  creditUrl: "https://pixabay.com/illustrations/sport-games-equipment-target-2037681/",
  hitAreas: [{ x1: 50, y1: 50, x2: 50, y2: 50, w: 20 }],
  goals: [15, 30, 45, 60, 90],
  beforeTitle: "How To Play",
  beforeMessage:
    "<p>Each daily puzzle gives a clue to find something in a hidden picture.</p><p>Move the cursor around the canvas to paint blocks of color. Paint over those areas to reveal finer details.</p><p>Keep going until you understand the picture enough to find the goal, then click it to solve the puzzle.</p>",
};
const tutorial0_mobile = {
  isTutorial: true,
  id: "tutorial0_mobile",
  clue: "Click the [bullseye].",
  credit: "Prawny",
  imageUrl: "./riddles/dartboard.jpg",
  creditUrl: "https://pixabay.com/illustrations/sport-games-equipment-target-2037681/",
  hitAreas: [{ x1: 50, y1: 50, x2: 50, y2: 50, w: 20 }],
  goals: [15, 30, 45, 60, 90],
  beforeTitle: "How To Play",
  beforeMessage:
    "<p>Each daily puzzle gives a clue to find something in a hidden picture.</p><p>Swipe your finger around the canvas to paint blocks of color. Paint over those areas to reveal finer details.</p><p>Keep going until you understand the picture enough to find the goal, then click it to solve the puzzle.</p>",
};

const tutorial1 = {
  isTutorial: true,
  id: "tutorial1",
  clue: "Boop the [nose].",
  credit: "Pixabay",
  imageUrl: "./riddles/cute_puppy.jpg",
  creditUrl: "https://www.pexels.com/photo/adorable-animal-canine-cute-220938/",
  goals: [15, 30, 50, 80, 100],
  hitAreas: [{ x1: 45, y1: 45, x2: 45, y2: 45, w: 20 }],
  beforeTitle: "About Time",
  beforeMessage: "<p>Each puzzle can take a minute or so. Your time is shown on the meter below the canvas.</p><p>You earn up to 5 bonus stars for beating the checkpoints.</p><p>But don't make wild guesses. Every wrong click costs a 10-second penalty.</p>",
};

const tutorial2 = {
  isTutorial: true,
  id: "tutorial2",
  clue: "See you in [the fall]",
  credit: "Pixabay",
  imageUrl: "./riddles/waterfall.jpg",
  creditUrl: "https://www.pexels.com/photo/beautiful-country-countryside-daylight-414061/",
  goals: [30, 60, 90, 120, 150],
  hitAreas: [{ x1: 18, y1: 30, x2: 27, y2: 85, w: 25 }],
  beforeTitle: "Just a Moment",
  beforeMessage: "<p>Some puzzles have tricky riddles or perplexing images, but you'll get more time to solve the tough ones.</p><p>Relax.</p><p>Enjoy feeling puzzled for just a moment out of your day.</p><p>Oh, and one last hint:<br/>If you're stumped... squint.</p>",
};

export { tutorial0, tutorial0_mobile, tutorial1, tutorial2 };
