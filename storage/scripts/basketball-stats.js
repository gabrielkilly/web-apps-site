var fs = require('fs');
fs.readFile( __dirname + '/../data/basketball-stats.txt', function (err, data) {
  if (err) {
    throw err; 
  }
  const file = data.toString();
  const rows = file.split('\n');
  const variablesUnformatted = rows[0].split(" ").filter((str)=> str.length > 1);
  const variables = ["Last", "First", ...variablesUnformatted.splice(1)];

  const playersUnformattedNames = [...rows.slice(1)].map((row) => {
      return row.split(" ").filter((s)=> s != "");
  }).filter(list => list.length > 1);
  
  const players = playersUnformattedNames.map((playerList) => {
      const firstName = playerList[0].split(",")[1];
      const lastName = playerList[0].split(",")[0];
      return [lastName, firstName, ...playerList.slice(1)];
  });
  const listOfObjs = players.map((playerList) => {
       const playerObj = new Object();
       playerList.forEach((stat, i) => {
        playerObj[variables[i]] = stat;
       });
       return playerObj;
  });

  const jsonFormat = JSON.stringify(listOfObjs);

    fs.writeFile('basketball-stats.json', jsonFormat, (err) => {
        if (err) throw err;

        console.log('Success');
    });

});