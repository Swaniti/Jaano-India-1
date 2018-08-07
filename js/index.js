
var outputArea = $("#chat-output");

$("#user-input-form").on("submit", function (e) {

  e.preventDefault();

  var message = $("#user-input").val();
  //exports.input = message;

  outputArea.append("\n    <div class='bot-message'>\n      <div class='message'>\n        " +


  message + "\n      </div>\n    </div>\n  ");




  setTimeout(function () {
    outputArea.append("\n      <div class='user-message'>\n        <div class='message'>\n          hello\n        </div>\n      </div>\n    ");






  }, 250);

  $("#user-input").val("");

});