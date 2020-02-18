// import { resetGame } from '../index.js'

$(document).ready(function() {
  $("button#credits").click(function(event) {
    event.preventDefault();
    console.log("hello again");
    $("#mainMenu").hide();
    $("#creditsDisplay").show();
  });
  $("#start").click(function() {
    $("canvas").show();
    $("#mainMenu").hide();
    //reset game
    // resetGame.reset();
  })

})