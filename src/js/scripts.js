<<<<<<< HEAD
import { resetGame } from '../index.js'

=======
>>>>>>> geoff2
$(document).ready(function() {
  $("button#credits").click(function(event) {
    event.preventDefault();
    $("#mainMenu").hide();
    $("#creditsDisplay").show();
  });
<<<<<<< HEAD
  $("#start").click(function() {
    $("canvas").show();
    $("#mainMenu").hide();
    //reset game
    resetGame.reset();
  })

})
=======
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
>>>>>>> geoff2
