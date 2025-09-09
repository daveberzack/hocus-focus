import { strokes, clearStrokes, setHitActive, startHitInterval, clearHitInterval } from "./hitArea.js";
let theme = 1;

const submit = async () => {
  const clue = $("#clue-field").val();
  const title = $("#message-title").val();
  const message = $("#message-body").val().replace(/(?:\r\n|\r|\n)/g, '<br>');
  const canvas = document.getElementById("pic");
  const image = canvas.toDataURL('image/jpeg', .4);
  const data = {
    clue,
    image,
    theme,
    beforeMessage: message,
    beforeTitle: title,
    hitAreas: strokes,
  };
  $("#submit-message").text("Sending");

  const url = `https://dave-simplecrud.herokuapp.com/christmas`;
  const response = await fetch(url, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const newChallenge = await response.json();
  showConfirm(newChallenge._id);
}; 

const uploadField = document.getElementById("upload-field");
uploadField.onchange = (evt) => {
  const [file] = uploadField.files;
  if (file) {
    drawUploadToCanvas(file);
    showClue();
  } 
};

$("#change-image").click((e) => {
  e.preventDefault();
  clearStrokes();
  showUpload();
});
$("#hide-hit-instructions").click((e) => {
  e.preventDefault();
  $("#hit-instructions").hide();
});
// $("#hide-clue-instructions").click((e) => {
//   e.preventDefault();
//   $("#clue-instructions").hide();
//   $("#clue").show(); 
// });
$("#hide-message-instructions").click((e) => {
  e.preventDefault();
  $("#message-instructions").hide();
});
$("#submit-clue").click((e) => {
  e.preventDefault();
  if ($("#clue-field").val()=="") return;
  $("#clue-instructions").hide();
  showHit();
});
$("#submit-hit").click((e) => {
  e.preventDefault();
  showMessage();
});

$("#submit-message").click((e) => {
  e.preventDefault();
  submit();
});
$("#show-themes-button").click((e) => {
  e.preventDefault();
  $("#theme-select").show();
});

let hasClearedMessageTitle=false;
$("#message-title").click((e) => {
  e.preventDefault();
  if (!hasClearedMessageTitle) $("#message-title").html("&nbsp;");
  hasClearedMessageTitle = true;
});
let hasClearedMessageBody=false;
$("#message-body").click((e) => {
  e.preventDefault();
  if (!hasClearedMessageBody) $("#message-body").html("");
  hasClearedMessageBody = true;
});

$("#theme-select img").click((e) => {
  e.preventDefault();
  $("#theme-select").hide();
  setTheme(e.target.getAttribute("data-value"));
});

const showUpload = ()=>{
  $("#upload").show(); 
  $("#hit").hide(); 
  $("#hit-controls").hide(); 
  $("#hit-instructions").hide();
  $("#clue-instructions").show();
  $("#clue").hide(); 
  $("#message, #message-controls").hide(); 
  setHitActive(false);
  clearHitInterval();
}
const showClue = ()=>{
  $("#canvases").hide(); 
  $("#upload").hide(); 
  $("#hit").show();
  $("#hit-controls").hide(); 
  $("#hit-instructions").hide();
  $("#clue-instructions").show();
  $("#clue").hide(); 
  $("#message, #message-controls").hide(); 
  setHitActive(false);
  clearHitInterval();
}
const showHit = ()=>{
  $("#canvases").show();
  $("#upload").hide(); 
  $("#hit").show();
  $("#hit-controls").show(); 
  $("#hit-instructions").show();
  $("#clue-instructions").hide();
  $("#clue").hide(); 
  $("#message, #message-controls").hide(); 
  startHitInterval();
  setHitActive(true);
}
const showMessage = ()=>{
  $("#upload").hide(); 
  $("#hit").hide();
  $("#hit-controls").hide(); 
  $("#hit-instructions").hide();
  $("#clue-instructions").hide();
  $("#clue").hide(); 
  setHitActive(false);
  $("#message, #message-controls").show(); 
  $("#theme-select").hide();
  $("#confirm").hide(); 
  clearHitInterval();
}
const showConfirm = (id)=>{
  $("#upload").hide(); 
  $("#hit").hide();
  $("#hit-controls").hide(); 
  $("#hit-instructions").hide();
  $("#clue-instructions").hide();
  $("#clue").hide(); 
  setHitActive(false);
  $("#message, #message-controls").hide(); 
  clearHitInterval();
  $("#confirm").show(); 
  const url = "www.hocusfocus.fun?id="+id;
  $("#puzzle-link").text(url).attr("href", "https://"+url);
}

const setTheme = (themeId) => {
  theme = themeId;
  $("#message").css("background-image", "url(../img/themes/bgs/" + theme + ".jpg)");
}

showUpload();

const drawUploadToCanvas = (file)=> {
  var reader  = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = function (e) {
          var image = new Image();
          image.src = e.target.result;
          image.onload = function(ev) {
             var canvas = document.getElementById('pic');
             var ctx = canvas.getContext('2d');
             
             let sx=0;
             let sy=(image.height-image.width)/2;
             let sWidth=image.width;
             let sHeight=image.width;
             if (image.width>image.height){
              sx=(image.width-image.height)/2;
              sy=0;
              sWidth=image.height;
              sHeight=image.height;
             }
             ctx.drawImage(image, sx, sy, sWidth, sHeight, 0, 0, 1000, 1000);
         }
      }
};

const resize = ()=> {
  let winW= $(window).width();
  let winH= $(window).height();
  let w = Math.min( (winW-20), winH-160);
  $(".square-block").width(w);
  $(".square-block").height(w);
  $(".horizontal-block").height(w);

  if (w<340) $("body").addClass("small");
  else $("body").removeClass("small");
  if (w<420) $("body").addClass("medium");
  else $("body").removeClass("medium");
}
resize();