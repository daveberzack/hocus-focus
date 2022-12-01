import { strokes } from "./hitarea.js";
let imageUrl = "";
let clue = "";
let title = "";
let message = "";

const showView = (name) => {
  $(".view").hide();
  $("#" + name).show();
};
showView("upload");

let uploadInterval = setInterval(() => {
  const newImageUrl = $("#source_image").attr("value");
  console.log(newImageUrl);
  if (newImageUrl) {
    imageUrl = newImageUrl;
    $("#pic").attr("src", imageUrl);
    showView("hit");
    clearInterval(uploadInterval);
  }
}, 1000);

$("#submit-hit").click(() => {
  console.log(strokes);
  showView("text");
});
$("#submit-text").click(async () => {
  clue = $("#clue").val();
  title = $("#title").val();
  message = $("#message").val();
  console.log(clue);
  console.log(title);
  console.log(message);
  console.log(strokes);

  const data = {
    clue,
    imageUrl,
    beforeMessage: message,
    beforeTitle: title,
    goals: [30, 60, 90, 120, 150],
    hitAreas: strokes,
  };
  const url = `https://dave-simplecrud.herokuapp.com/hocuschallenge`;
  const response = await fetch(url, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const newChallenge = await response.json();
  console.log(newChallenge);
  showView("confirm");
});
