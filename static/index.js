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
    postData('https://faas-lon1-917a94a7.doserverless.co/api/v1/web/fn-111dca7f-cdef-4c89-a919-000f8b442a48/api/ip-check', ipaddresses)
    .then((data) => {
      console.log(data); // JSON data parsed by `data.json()` call
    });
}


// Example POST method implementation:
async function postData(url = 'https://faas-lon1-917a94a7.doserverless.co/api/v1/web/fn-111dca7f-cdef-4c89-a919-000f8b442a48/api/ip-check' , ipaddresses) {
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
  

  