import { strokes, clearStrokes, setHitActive, startHitInterval, clearHitInterval } from "./hitArea.js";

// Detect mode from URL parameter (default to 'create')
const urlParams = new URLSearchParams(window.location.search);
const mode = urlParams.get('mode') || 'create';
let theme = mode === 'holiday' ? 1 : 'none';

// Initialize UI based on mode
const initializeMode = () => {
  if (mode === 'holiday') {
    document.getElementById('page-title').textContent = 'Hocus Focus Holiday Card Creator';
    document.getElementById('create-intro').style.display = 'none';
    document.getElementById('holiday-intro').style.display = 'block';
  } else {
    document.getElementById('page-title').textContent = 'Hocus Focus Puzzle Creator';
    document.getElementById('create-intro').style.display = 'block';
    document.getElementById('holiday-intro').style.display = 'none';
    // Show admin options if admin parameter is present
    if (window.location.search.indexOf("admin") >= 0) {
      $("body").addClass("admin");
    }
  }
};

// Serialize hit areas to tokenized string (without width)
const serializeHitAreas = (strokes) => {
  return strokes.map(stroke => 
    `${stroke.x1.toFixed(2)},${stroke.y1.toFixed(2)},${stroke.x2.toFixed(2)},${stroke.y2.toFixed(2)}`
  ).join('|');
};

// Deserialize hit areas from tokenized string
const deserializeHitAreas = (tokenString) => {
  if (!tokenString) return [];
  return tokenString.split('|').map(token => {
    const [x1, y1, x2, y2] = token.split(',').map(Number);
    return { x1, y1, x2, y2, w: 12 }; // Default width of 12 (since it's stored as percentage)
  });
};

const submit = async () => {
  const clue = $("#clue-field").val();
  const canvas = document.getElementById("pic");
  const image = canvas.toDataURL('image/jpeg', .4);
  
  // Base data structure
  const data = {
    clue,
    image,
    hitAreas: serializeHitAreas(strokes), // Store as tokenized string
    mode
  };

  // Add mode-specific data
  if (mode === 'create') {
    Object.assign(data, {
      credit: $("#credit-field").val(),
      creditUrl: $("#credit-url-field").val(),
      date: $("#date-field").val(),
      difficulty: $("#difficulty").val()
    });
  }

  // Always include message/theme data (from holiday version)
  Object.assign(data, {
    theme,
    beforeMessage: $("#message-body").val().replace(/(?:\r\n|\r|\n)/g, '<br>'),
    beforeTitle: $("#message-title").val()
  });

  $("#submit-message").text("Sending");

  // Use conditional endpoint based on mode
  const url = `https://cerulean-api.onrender.com/challenge`;
  
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

// File upload handler
const uploadField = document.getElementById("upload-field");
uploadField.onchange = (evt) => {
  const [file] = uploadField.files;
  if (file) {
    drawUploadToCanvas(file);
    showHit();
  }
};

// Event handlers
$("#change-image").click((e) => {
  e.preventDefault();
  clearStrokes();
  uploadField.value = ""; // Clear the file input so onchange fires for new selections
  showUpload();
});

$("#hide-hit-instructions").click((e) => {
  e.preventDefault();
  $("#hit-instructions").hide();
});

$("#hide-clue-instructions").click((e) => {
  e.preventDefault();
  $("#clue-instructions").hide();
});

$("#hide-message-instructions").click((e) => {
  e.preventDefault();
  $("#message-instructions").hide();
});

$("#submit-clue").click((e) => {
  e.preventDefault();
  if ($("#clue-field").val() == "") return;
  $("#clue-instructions").hide();
  showMessage();
});

$("#submit-hit").click((e) => {
  e.preventDefault();
  showClue();
});

$("#submit-message").click((e) => {
  e.preventDefault();
  submit();
});

$("#show-themes-button").click((e) => {
  e.preventDefault();
  $("#theme-select").show();
});

// Message field handlers
let hasClearedMessageTitle = false;
$("#message-title").click((e) => {
  e.preventDefault();
  if (!hasClearedMessageTitle) $("#message-title").html("&nbsp;");
  hasClearedMessageTitle = true;
});

let hasClearedMessageBody = false;
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

// View management functions
const showUpload = () => {
  $("#upload").show();
  $("#hit").hide();
  $("#hit-controls").hide();
  $("#clue-controls").hide();
  $("#hit-instructions").hide();
  $("#clue-instructions").hide();
  $("#message, #message-controls").hide();
  $("#confirm").hide();
  setHitActive(false);
  clearHitInterval();
};

const showClue = () => {
  $("#canvases").hide(); 
  $("#upload").hide(); 
  $("#hit").show();
  $("#hit-controls").hide(); 
  $("#hit-instructions").hide();
  $("#clue-instructions").show();
  $("#clue-controls").show(); 
  $("#message, #message-controls").hide(); 
  setHitActive(false);
  clearHitInterval();
};

const showHit = () => {
  $("#canvases").show();
  $("#upload").hide(); 
  $("#hit").show();
  $("#hit-controls").show(); 
  $("#hit-instructions").show();
  $("#clue-instructions").hide();
  $("#clue-controls").hide(); 
  $("#message, #message-controls").hide(); 
  startHitInterval();
  setHitActive(true);
};

const showMessage = () => {
  $("#upload").hide(); 
  $("#hit").hide();
  $("#hit-controls").hide(); 
  $("#hit-instructions").hide();
  $("#clue-instructions").hide();
  $("#clue-controls").hide(); 
  setHitActive(false);
  $("#message").css('display', 'flex');
  $("#message-controls").show();
  $("#message-instructions").show();
  $("#theme-select").hide();
  $("#confirm").hide(); 
  clearHitInterval();
};

const showConfirm = (id) => {
  $("#upload").hide(); 
  $("#hit").hide();
  $("#hit-controls").hide(); 
  $("#hit-instructions").hide();
  $("#clue-instructions").hide();
  $("#clue-controls").hide(); 
  setHitActive(false);
  $("#message, #message-controls").hide(); 
  clearHitInterval();
  $("#confirm").show(); 
  const url = "www.hocusfocus.fun?id=" + id;
  $("#puzzle-link").text(url).attr("href", "https://" + url);
};

const setTheme = (themeId) => {
  theme = themeId;
  if (theme === 'none') {
    $("#message").css("background-image", "none");
    $("#message").css("background-color", "#ffffff");
  } else {
    $("#message").css("background-image", "url(../img/themes/bgs/" + theme + ".jpg)");
    $("#message").css("background-color", "");
  }
};

const drawUploadToCanvas = (file) => {
  var reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onloadend = function (e) {
    var image = new Image();
    image.src = e.target.result;
    image.onload = function(ev) {
      var canvas = document.getElementById('pic');
      var ctx = canvas.getContext('2d');
      
      let sx = 0;
      let sy = (image.height - image.width) / 2;
      let sWidth = image.width;
      let sHeight = image.width;
      if (image.width > image.height) {
        sx = (image.width - image.height) / 2;
        sy = 0;
        sWidth = image.height;
        sHeight = image.height;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, sx, sy, sWidth, sHeight, 0, 0, 1000, 1000);
    }
  }
};

const resize = () => {
  let winW = $(window).width();
  let winH = $(window).height();
  let w = Math.min((winW - 20), winH - 220);
  $(".square-block").width(w);
  $(".square-block").height(w);
  $(".horizontal-block").height(w);

  if (w < 340) $("body").addClass("small");
  else $("body").removeClass("small");
  if (w < 420) $("body").addClass("medium");
  else $("body").removeClass("medium");
};

// Initialize
initializeMode();
setTheme(theme); // Initialize the theme
showUpload();
resize();