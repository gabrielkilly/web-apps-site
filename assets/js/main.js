const tableParent = document.querySelector('.table-responsive');
tableParent.dataset.thStates = JSON.stringify({ lastName: "", lastReveredState: false});

async function getJson(url, func) {
    const response = await fetch(url);
    const data = await response.json();
    func(data);
}

function loadTable(prop, reverse=false) {
    getJson('assets/json/basketball-stats.json', (data) => printTable(compareProp(prop,reverse), data));
}

 
function htmlToElements(html) {
    var template = document.createElement('template');
    template.innerHTML = html;
    return template.content.childNodes;
}

function compareProp(prop, reverse) {
   return (a, b) => {
    if (!reverse) {
        return (a[prop] < b[prop]) ? -1 : 1;
    } else {
        return (a[prop] < b[prop]) ? 1 : -1;
    }
   };
}

function printTable(compareFunc, stats) {
    stats.sort(compareFunc);

    //get thead func
    const thead = createTHead(Object.keys(stats[0]));

    //all tbodys in string form 
    const tbodies = createTBodies([...stats.slice(1)]);

    //concat them into to string and make into html elem
    const table = '<table class="table table-dark">' + thead + tbodies + '</table>';
    //append elem to table responsive
    tableParent.innerHTML = table;

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

function onTHeadClick(e) {
    const clickedTH = e.target;
    const name = clickedTH.dataset.name;
    console.log(tableParent);
    const thStates = JSON.parse(tableParent.dataset.thStates);
    let reversed = false;
    if(thStates.lastName == name) {
        reversed = !thStates.lastReveredState;
    }
    tableParent.dataset.thStates =  JSON.stringify({ lastName: name, lastReveredState: reversed});
    loadTable(name, reversed);
}

loadTable("Last", false);

// document.querySelectorAll('th').forEach((th) => th.addEventListener("click", onTHeadClick));