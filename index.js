  
var outputArea = $("#chat-output");

$("#user-input-form").on("submit", function (e) {

  e.preventDefault();

  var message = $("#user-input").val();
  //exports.input = message;

  outputArea.append("\n<div class='bot-message'>\n<div class='message'>\n" +  message + "\n</div>\n</div>\n");
  $.support.cors = true;
  $.ajax({
                    type: "GET",
                    url: 'http://localhost:3000/input='+message,         
                    dataType: 'text',
                })
          .done(function(data){
            console.log(data);
            outputArea.append("\n<div class='user-message'>\n<div class='message'>\n"+data+"\n</div>\n</div>\n");
          });          
  

  $("#user-input").val("");

});