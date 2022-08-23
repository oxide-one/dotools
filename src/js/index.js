document.getElementById("submit").addEventListener("click", handleSubmit);

function handleSubmit() {
    makeDisabled();
    readForm();
}

function makeDisabled() {
    document.getElementById("ip-range").disabled = true;
}

function readForm() {
    const ipaddresses = document.getElementById('ip-range').value.split('\n');
    console.log(ipaddresses);
    postData('/fn/api/ip-check', ipaddresses)
    .then((data) => {
      tableCreate(data); // JSON data parsed by `data.json()` call
    });
}

// Example POST method implementation:
async function postData(url , ipaddresses) {
    var query_str_url = url + '?' + new URLSearchParams({
        ipaddresses: ipaddresses,
    })
    // Default options are marked with *
    const response = await fetch(query_str_url, {
      method: 'GET', // *GET, POST, PUT, DELETE, etc.
      //mode: 'no-cors', // no-cors, *cors, same-origin
      //cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      //credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Accept': 'application/json'
        //'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      //redirect: 'follow', // manual, *follow, error
      //referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    });
    return await response.json(); // parses JSON response into native JavaScript objects
  }

function tableCreate(data) {
    const body = document.getElementById("submit-area");
    var table = document.createElement('table');
    // Set the class name
    table.className = "table"
    // Create the header
    var header = table.createTHead();
    var row = header.insertRow(0);
  var cell = row.insertCell(0);
    row.innerHTML = `
    <th>IP Address</th>
    <th>Private IP</th>
    <th>DigitalOcean IP</th>
    <th>IP Range</th>
    <th>Country</th>
    <th>City</th>
    <th>Postcode</th>
    `; 
    for (var i = 0; i < data.ipaddresses.length; i++){
        const tr = table.insertRow();
        var ip_info = data.ipaddresses[i]
        tr.innerHTML = `
        <td>${ip_info.ip_address}</td>
        <td>${ip_info.is_private}</td>
        <td>${ip_info.is_do}</td>
        <td>${ip_info.in_range}</td>
        <td>${ip_info.country}</td>
        <td>${ip_info.city}</td>
        <td>${ip_info.postcode}</td>
        `
    }
    body.replaceWith(table);
  }
  

  

  