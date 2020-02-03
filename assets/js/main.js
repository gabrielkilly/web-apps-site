//Important DOM elements
const tableParent = document.querySelector('.table-responsive');
const searchBox = document.querySelector('#searchBox');
const statBox = document.querySelector('#statBox');
const teamSelector = document.querySelector('#teamSelector');
const statNameSelector = document.querySelector('#statNameSelector');
const comparisonSelector = document.querySelector('#comparisonSelector');

teamSelector.dataset.last = "";
statNameSelector.dataset.last = "";
tableParent.dataset.thStates = JSON.stringify({ lastName: "", lastReveredState: false});

async function getJson(url, func) {
    const response = await fetch(url);
    const data = await response.json();
    func(data);
}
 
function htmlToElements(html) {
    var template = document.createElement('template');
    template.innerHTML = html;
    return template.content.childNodes;
}

function compareProp(prop, reverse) {
   return (a, b) => {
    if (!reverse) {
        if(isNaN(a[prop])) { return (a[prop] < b[prop]) ? -1 : 1; }
        else { return (parseInt(a[prop]) < parseInt(b[prop])) ? -1 : 1; }
    } else {
        if(isNaN(a[prop])) { return (a[prop] < b[prop]) ? 1 : -1; }
        else { return (parseInt(a[prop]) < parseInt(b[prop])) ? 1 : -1; }
    }
   };
}

function matchesName(a, searchVal) {
    if(!searchVal) return true;
    const srchKey = a.First + a.Last;
    return srchKey.includes(searchVal.toLowerCase());
}

function isInTeam(a, team) {
    if(!team || team == 'Choose...') return true;
    return a.Team == team;
}

function hasUsableStat(a, statName, statVal, compareFunc) {
    if (!statName || statName == 'Choose...') return true;
    return compareFunc(a[statName], statVal);
}

function parseFuncFromString(operator) {
    switch(operator) {
        case '>':
            return (a, b) =>  {return a > b};
            break;
        case '==':
            return (a, b) =>  {return a == b};
            break;
        case '<':
            return (a, b) =>  {return a < b};
            break
        default:
            return () => {};
            break;
    }
}

function filterTable(a) {
    const searchVal = searchBox.value;
    const team = teamSelector.value;
    teamSelector.dataset.last = team;
    const statName = statNameSelector.value;
    statNameSelector.dataset.last = statName;
    const statVal = statBox.value;
    const compareFunc = parseFuncFromString(comparisonSelector.value);
    return matchesName(a, searchVal) && isInTeam(a, team) && hasUsableStat(a, statName, statVal, compareFunc);
}

function loadTable(prop, reverse=false) {
    getJson('assets/json/basketball-stats.json', (data) => printTable(compareProp(prop,reverse), data));
}

function printTable(compareFunc, data) {
    const {stats, teams, statNames} = data;

    //get thead func
    const thead = createTHead(Object.keys(stats[0]));

    const playerStats = [...stats.slice(1)].filter(filterTable);
    playerStats.sort(compareFunc);

    //all tbodys in string form 
    const tbodies = createTBodies(playerStats);

    //concat them into to string
    const table = '<table class="table table-dark">' + thead + tbodies + '</table>';
    //append elem to table responsive
    tableParent.innerHTML = table;

    const teamOptions = createOptions(teams, teamSelector.dataset.last);
    const statNameOptions = createOptions(statNames, statNameSelector.dataset.last);

    teamSelector.innerHTML = teamOptions;
    statNameSelector.innerHTML = statNameOptions;

    allTHeads = document.querySelectorAll("th");
    allTHeads.forEach((th) => th.addEventListener("click", onTHeadClick));
}

/*
<thead>
    <tr>
    <th scope="col">#</th>
    <th scope="col">First</th>
    <th scope="col">Last</th>
    <th scope="col">Handle</th>
    </tr>
</thead>
*/
function createTHead(headers) {
    const theadBeg = "<thead><tr>";
    const theadEnd  = "</tr></thead>";
    let middle = headers
                .map((header) => `<th scope="col" data-name=${header}>${header}</th>`)
                .join("");
    
    return theadBeg + middle + theadEnd;
}

/* 
<tbody>
              <tr>
                <th scope="row">1</th>
                <td>Mark</td>
                <td>Otto</td>
                <td>@mdo</td>
              </tr>
              <tr>
                <th scope="row">2</th>
                <td>Jacob</td>
                <td>Thornton</td>
                <td>@fat</td>
              </tr>
              <tr>
                <th scope="row">3</th>
                <td>Larry</td>
                <td>the Bird</td>
                <td>@twitter</td>
              </tr>
            </tbody>
*/
function createTBodies(players) {
    let middle = players
        .map((player) => {
            const playerStr = Object.keys(player).map((prop, index) => {
                if(index == 0) {
                    return `<th scope="row">${player[prop]}</th>`;
                } else {
                    return `<td>${player[prop]}</td>`;
                }
            }).join("");
            return `<tr>${playerStr}</tr>`;                       
        }).join("");
    return `<tbody>${middle}</tbody>`;
}

/* <option value="<"><</option> */
function createOptions(vals, last="") {
    const str = vals.map(val => `<option ${(last == val)?"selected":""} value="${val}">${val}</option>`).join("");
    return `<option ${(!last)?"selected":""}>Choose...</option>` + str;
}

function onTHeadClick(e) {
    const clickedTH = e.target;
    const name = clickedTH.dataset.name;
    const thStates = JSON.parse(tableParent.dataset.thStates);
    let reversed = false;
    if(thStates.lastName == name) {
        reversed = !thStates.lastReveredState;
    }
    tableParent.dataset.thStates =  JSON.stringify({ lastName: name, lastReveredState: reversed});
    loadTable(name, reversed);
}

function onApplyClick(e) {
    const thStates = JSON.parse(tableParent.dataset.thStates);
    // loadTable(thStates.lastName, thStates.lastReveredState);
    loadTable("Last");
}

function clearFilters() {
    searchBox.value = "";
    teamSelector.value = "";
    teamSelector.dataset.last = "";
    statNameSelector.value = "";
    statNameSelector.dataset.last = "";
    statBox.value = "";

    loadTable("Last");
}

loadTable("Last", false);
document.querySelector('#applyButton').addEventListener('click', onApplyClick);
document.querySelector('#clearButton').addEventListener('click', clearFilters);