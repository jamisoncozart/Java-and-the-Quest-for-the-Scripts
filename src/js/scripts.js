// import { resetGame } from '../index.js'

$(document).ready(function() {
  $("button#credits").click(function(event) {
    event.preventDefault();
    $("#mainMenu").hide();
    $("#creditsDisplay").show();
    $("#creditsMenuButton").show();
  });
  $("#start").click(function() {
    $("canvas").show();
    $("#mainMenu").hide();
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "src/index.js";
    document.getElementsByTagName("head")[0].appendChild(script);
    return false;
    //reset game
    // resetGame.reset();
  });
  $("button#creditsToMenu").click(function(event) {
    event.preventDefault();
    $("#mainMenu").show();
    $("#creditsDisplay").hide();
  });
  $("button#controls").click(function(event) {
    event.preventDefault();
    $("#mainMenu").hide();
    $("#controlsDisplay").show();
  });
  $("button#controlsToMenu").click(function(event) {
    event.preventDefault();
    $("#mainMenu").show();
    $("#controlsDisplay").hide();
  });
});
