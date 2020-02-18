$(document).ready(function() {
  $("button#credits").click(function(event) {
    event.preventDefault();
    $("#mainMenu").hide();
    $("#creditsDisplay").show();
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