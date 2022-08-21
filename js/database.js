const do_url = "https://api.digitalocean.com/v2"
var redis_schema
var mysql_schema
var postgres_schema
async function getDOSpec() {
    // DigitalOcean Public Spec
    const url = 'https://api-engineering.nyc3.cdn.digitaloceanspaces.com/spec-ci/DigitalOcean-public.v2.yaml';
    const response = await fetch(url, {
      method: 'GET', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Accept': 'binary/octet-stream'
      },
    });
    return response.text(); // parses JSON response into native JavaScript objects
  }

var databases
async function listDODatabases(token) {
  const url = `${do_url}/databases`;
  const response = await fetch(url, {
    method: 'GET', // *GET, POST, PUT, DELETE, etc.
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
  });
  databases = await response.json();
  document.getElementById("database-listing").innerHTML = `
  <table class="table is-fullwidth" id="database-table">
  <thead>
  <tr>
    <th>Name</th>
    <th>Region</th>
    <th>Status</th>
    <th>Engine</th>
    <th>Version</th>
    <th>Tags</th>
  </tr>
</thead>
<tbody id="database-table-tbody">
</tbody>
</table>
  `;
  var database_table = document.getElementById("database-table-tbody")
  
  for (let i = 0; i < databases.databases.length; i++) {
    var database_cluster_info = databases.databases[i]
    var tags = ""
    try {
      var tags_length = database_cluster_info.tags.length
    } catch (e) {
      // Nothing to do, tag length of zero
      var tags_length = 0
    }
 
    for (let x = 0; x < tags_length; x++) {
      tags = tags + `<span class="tag">${database_cluster_info.tags[x]}</span> `
    };


    var row = database_table.insertRow();
    row.innerHTML = `
    <td><button class="button is-link is-inverted" onclick="selectDatabaseCluster('${database_cluster_info.id}','${database_cluster_info.engine}')"><strong>${database_cluster_info.name}</strong></button></td>
    <td>${database_cluster_info.region}</td>
    <td>${database_cluster_info.status}</td>
    <td>${database_cluster_info.engine}</td>
    <td>${database_cluster_info.version}</td>
    <td>${tags}</td>
    `;

  } 
}


async function selectDatabaseCluster(uuid,engine) {
  console.log(`Fetching cluster information for ${uuid}`);
  var database_table = document.getElementById("database-table")
  database_table.innerHTML = ""
  const url = `${do_url}/databases/${uuid}/config`
  const response = await fetch(url, {
    method: 'GET', // *GET, POST, PUT, DELETE, etc.
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${api_id_value}`
    },
  });
  database_cluster_config = await response.json()
  if (engine == "pg") {
    console.log("Postgres Engine")
    constructPostgresTable(database_cluster_config, postgres_schema)
  } else if (engine == "redis") {
    console.log("Redis Engine")
  } else if (engine == "mysql") {
    console.log("MySQL engine")
  }
}



function constructPostgresTable(config, schema) {
  results_listing = document.getElementById("results-listing")
  results_listing.innerHTML = ""
  console.log(schema)
  const keys = Object.keys(schema.properties);
  const keys_length = keys.length
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const key_val = config.config[key];
    const key_schema = schema.properties[key]
    const field = document.createElement("div")
    field.className="field"
    field.innerHTML = `
    <div class="columns">
    <div class="column is-two-fifths">
    <p class="is-family-code">
    ${key}
    </p>
    <p class="has-text-weight-light is-size-6">
    <strong>Type:</strong> ${key_schema.type}
    </p>
    </div>
    <div class="column is-two-fifths">
    </div>
    <div class="column is-one-fifth">
    <input class="input" type="text" value="${key_val}">
    </div>
    </div>
    <p class="is-size-6 has-text-weight-light">${key_schema.description}</p>

    
    `
    results_listing.appendChild(field);
  }
}

async function getAccDetails(token) {
  const url = `${do_url}/account`
  const response = await fetch(url, {
    method: 'GET', // *GET, POST, PUT, DELETE, etc.
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`
    },
  });
  account_details = await response.json(); 
  var return_message = document.getElementById('return-message')
  if (!response.ok) {
      return_message.innerHTML = `
      <article class="message is-danger">
      <div class="message-body">
      ${account_details.message}
      </div>
      </article>
    `
    return false;
  } else {
    return_message.innerHTML = `
    <article class="message is-primary">
    <div class="message-body">
    <strong>Email:</strong> ${account_details.account.email}<br>
    <strong>Team:</strong> ${account_details.account.team.name}
    </div>
    </article>
    `
    return true;
  };
}

getDOSpec()
  .then((data) => {
    try {
        const doc = jsyaml.load(data);
        mysql_schema = doc.components.schemas.mysql;
        postgres_schema = doc.components.schemas.postgres;
        redis_schema = doc.components.schemas.redis;
    } catch (e) {

        console.log(e);
    }
  });

var warning_message = document.getElementById("warning-message")
var warning_button = document.getElementById("warning-button")
warning_button.onclick = function() {
  warning_message.innerHTML = "";
};

var api_id = document.getElementById("api-id")
var api_id_value;

function chainThrough() {
  if (api_id_value == api_id.value || api_id.value == "") {
    return;
  }
  warning_message.innerHTML = "";
  api_id.blur();
  api_id.disabled = true;
  api_id_value = api_id.value;
  getAccDetails(api_id_value).then((success) => {
    if (success) {
      console.log("Successful")
      listDODatabases(api_id_value)
    } else {
      console.log("Unsuccessful")
      api_id.disabled = false;
      api_id.value = "";
    }
  });
}

api_id.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      chainThrough();
    }
});

api_id.addEventListener("blur", chainThrough, false);
