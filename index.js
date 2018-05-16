exports.handler = (event, context) => {

  try {

    if (event.session.new) {
      // New Session
      console.log("NEW SESSION")
    }

    switch (event.request.type) {

      case "LaunchRequest":
        // Launch Request
        console.log(`LAUNCH REQUEST`)
        context.succeed(
          generateResponse(
            buildSpeechletResponse("Starting Ping Pong! Team 1 0, Team 2 0!", false),
            {team1: 0, team2: 0, gameOver: false}
          )
          // event.session.attributes.team1 // Access sample
          // event.session.attributes.team2 // Access sample
        )
        // Intialize the score
        resetScore(event);
        break;

      case "IntentRequest":
        // Intent Request

        switch(event.request.intent.name) {
          case "AddPoint":

            var prompt = '',
                team = event.request.intent.slots.TeamName.value || '';

            event.session.attributes.team1 = event.session.attributes.team1 || 0;
            event.session.attributes.team2 = event.session.attributes.team2 || 0;

            if ((team.toLowerCase().indexOf('one') > -1) || (team.indexOf('1') > -1)) {
              event.session.attributes.team1++;
              prompt+= readScore(event.session.attributes);
            } else if ((team.toLowerCase().indexOf('two') > -1) || (team.indexOf('2') > -1)) {
              event.session.attributes.team2++;
              prompt+= readScore(event.session.attributes);
            } else {
              prompt+="Sorry. I couldn't understand your command. Please say it again.";
            }

            if (event.session.attributes.team1 >= 21) {
              if (event.session.attributes.team1 > (event.session.attributes.team2 + 1)) { // Only if they've won by 2
                prompt+= " Team 1 wins! Would you like to play again?";
                event.session.attributes.gameOver = true;
              }
            }
            if (event.session.attributes.team2 >= 21) {
              if (event.session.attributes.team2 > (event.session.attributes.team1 + 1)) { // Only if they've won by 2
                prompt+= " Team 2 wins! Would you like to play again?";
                event.session.attributes.gameOver = true;
              }
            }

            context.succeed(
                generateResponse(
                    buildSpeechletResponse(prompt, false),
                    event.session.attributes
                )
            );
            break;

          case "SubtractPoint":
            var prompt = '',
                team = event.request.intent.slots.TeamName.value || '';

            event.session.attributes.team1 = event.session.attributes.team1 || 0;
            event.session.attributes.team2 = event.session.attributes.team2 || 0;

            if ((team.toLowerCase().indexOf('one') > -1) || (team.indexOf('1') > -1)) {
              if (event.session.attributes.team1 > 0) {
                event.session.attributes.team1--;
              }
              prompt+= readScore(event.session.attributes);
            } else if ((team.toLowerCase().indexOf('two') > -1) || (team.indexOf('2') > -1)) {
              if (event.session.attributes.team2 > 0) {
                event.session.attributes.team2--;
              }
              prompt+= readScore(event.session.attributes);
            } else {
              prompt+="Sorry. I couldn't understand your command. Please say it again.";
            }

            context.succeed(
                generateResponse(
                    buildSpeechletResponse(prompt, false),
                    event.session.attributes
                )
            );
            break;

          case "ResetGame":
            resetScore(event.session.attributes);

            var scoreString = readScore(event.session.attributes);
            context.succeed(
              generateResponse(
                buildSpeechletResponse("The game has been reset, the current score is "+scoreString, false),
                event.session.attributes
              )
            );

            break;

          case "SetScore":
            var prompt = '',
                team1 = event.request.intent.slots.TeamName1.value || '',
                pointValue1 = event.request.intent.slots.Point1.value || '',
                team2 = event.request.intent.slots.TeamName2.value || '',
                pointValue2 = event.request.intent.slots.Point2.value || '';

            var pointsStringArray = [
              'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
              'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty',
              'twentyone'
            ];

            var pointsNumberArray = [
              '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
              '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
              '21'
            ];
            var i = 0;

            event.session.attributes.team1 = event.session.attributes.team1 || 0;
            event.session.attributes.team2 = event.session.attributes.team2 || 0;

            if ((team1.toLowerCase().indexOf('one') > -1) || (team1.indexOf('1') > -1)) {

              for(i = 0; i < 22; i++)
              {
                if((pointValue1.toLowerCase().indexOf(pointsStringArray[i]) > -1) || (pointValue1.indexOf(pointsNumberArray[i]) > -1)) {
                  event.session.attributes.team1 = i;
                }
              }

            }

            if ((team2.toLowerCase().indexOf('two') > -1) || (team2.indexOf('2') > -1)) {

              for(i = 0; i < 22; i++)
              {
                if((pointValue2.toLowerCase().indexOf(pointsStringArray[i]) > -1) || (pointValue2.indexOf(pointsNumberArray[i]) > -1)) {
                  event.session.attributes.team2 = i;
                }
              }

            }

            prompt+= readScore(event.session.attributes);

            context.succeed(
                generateResponse(
                    buildSpeechletResponse(prompt, false),
                    event.session.attributes
                )
            );
            break;

          case "ReadScore":
            var scoreString = readScore(event.session.attributes);

            context.succeed(
              generateResponse(
                buildSpeechletResponse("The current score is "+scoreString, false),
                event.session.attributes
              )
            );
            break;

          case "EndGame":
            context.succeed(
              generateResponse(
                buildSpeechletResponse("Thanks for playing Ping Pong!", true)
              )
            );
            // End the session here
            break;

          case "AMAZON.YesIntent":
              var prompt = "Sorry. I couldn't understand your command. Please say it again.",
                  endSession = true;

            if (event.session.attributes.gameOver) {
              prompt = "Starting Ping Pong! Red Team 0, Blue Team 0!";
              endSession = false;
              resetScore(event.session.attributes);
              event.session.attributes.gameOver = false;
            }

            context.succeed(
                generateResponse(
                    buildSpeechletResponse(prompt, endSession),
                    event.session.attributes
                )
            );

            break;
          case "AMAZON.NoIntent":
            var prompt = "Sorry. I couldn't understand your command. Please say it again.",
                endSession = false;

            if (event.session.attributes.gameOver) {
              prompt = "Thanks for playing Ping Pong!";
              endSession = true;
            }

            context.succeed(
                generateResponse(
                    buildSpeechletResponse(prompt, endSession),
                    event.session.attributes
                )
            );

            break;

          default:
            throw "Invalid intent"
        }

        break;

      case "SessionEndedRequest":
        // Session Ended Request
        console.log(`SESSION ENDED REQUEST`)
        break;

      default:
        context.fail(`INVALID REQUEST TYPE: ${event.request.type}`)

    }

  } catch(error) { context.fail(`Exception: ${error}`) }

}

// Helpers
buildSpeechletResponse = (outputText, shouldEndSession, reprompt) => {

  return {
    outputSpeech: {
      type: "PlainText",
      text: outputText
    },
    shouldEndSession: shouldEndSession,
    reprompt: {
      outputSpeech: {
        type: "PlainText",
        text: reprompt || '.....................................................................................................................................................................................'
      }
    }
  }

}

generateResponse = (speechletResponse, sessionAttributes) => {

  return {
    version: "1.0",
    sessionAttributes: sessionAttributes,
    response: speechletResponse
  }

}

readScore = (attributes) => {
    var responseString = "Team 1 has "+attributes.team1+". Team 2 has "+attributes.team2+".";
    return responseString;
}

resetScore = (attributes) => {
  attributes.team1 = 0;
  attributes.team2 = 0;
}
