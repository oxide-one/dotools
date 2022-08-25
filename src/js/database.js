

const do_url = "https://api.digitalocean.com/v2"
var full_schema
var redis_schema
var mysql_schema
var postgres_schema

var databases
var database_uuid
var content = document.getElementById("main-content");
var current_page = 1
function removeContent(is_end) {
  if (content.classList.contains('animate__fadeOut')) {
    content.innerHTML = "";
    content.classList.remove('animate__animated', 'animate__fadeOut', 'animate__faster')
    content.removeEventListener('animationend', removeContent)
  }

}

// Fade out content when that view is completed
function fadeOutContent() {
  content.classList.add('animate__animated', 'animate__fadeOut', 'animate__faster');
  content.addEventListener('animationend', () => {
    removeContent(true)
  });
}


// Fetch the DigitalOcean API spec.
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

// List the DO Databases and create a table
async function listDODatabases(token) {
  // Set the URL to access the Database endpoint
  const url = `${do_url}/databases`;
  const response = await fetch(url, {
    method: 'GET', // *GET, POST, PUT, DELETE, etc.
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
  });
  databases = await response.json();
  // Create a table
  content.innerHTML = `
  <div class="container animate__animated animate__fadeIn">
    <h1 class="title">
      Please select a Database Cluster
    </h1>
  
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
    </div>
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
  database_uuid = uuid
  console.log(`Fetching cluster information for ${uuid}`);
  fadeOutContent()
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
    constructDatabaseOptionsTable(database_cluster_config, postgres_schema)
  } else if (engine == "redis") {
    console.log("Redis Engine")
    constructDatabaseOptionsTable(database_cluster_config, redis_schema)
  } else if (engine == "mysql") {
    console.log("MySQL engine")
    constructDatabaseOptionsTable(database_cluster_config, mysql_schema)
  }
}


function lookupRef(obj, path) {
  for (var i=0, path=path.split('/'), len=path.length; i<len; i++){
      obj = obj[path[i]];
  };
  return obj;
};


function constructValueField(key, field, schema) {
  // Unwrap #ref
  if ("$ref" in schema) {
    schema = lookupRef(full_schema, schema["$ref"].substring(2));
  }
  if (field == null) {
    field = ""
  }
  switch (schema.type) {
    case "string":
      if (schema.maxLength > 100) {
        return `<textarea class="textarea is-medium">${field}</textarea>`
      } else {
        return `<input class="input" type="text" value="${field}">`
      }
      
    case "integer":
      return `<input class="input" type="number" value="${field}">`
    case "number":
      return `<input class="input" type="number" value="${field}">`
    case "object":
      break;
    case "boolean":

      if (field == true) {
        options = `
        <option></option>
        <option selected>True</option>
        <option>False</option
        `
      } else if (field == false) {
        options = `
        <option></option>
        <option>True</option>
        <option selected>False</option
        `
      } else {
        options = `
        <option selected></option>
        <option>True</option>
        <option>False</option
        `
      }
      return `
      <div class="select">
        <select id="${key}">
          ${options}
        </select>
      </div>
      `
    default:
      console.log(schema);
      break;

  }
}

function splitArrayIntoChunks(property_keys, database_schema) {
  let nested_keys = [], arr = [], regular_keys = []
  for (let i = 0; i < property_keys.length; i++) {
    let property = property_keys[i]
    let schema = database_schema[property]
    if ("$ref" in schema) {
      //schema = lookupRef(full_schema, schema["$ref"].substring(2));
      nested_keys.push(property)
    } else {
      arr.push(property)
    }
  }
  while((x = arr.splice(0, 7)).length) regular_keys.push(x)
  // Code readability is for suckas
  if (regular_keys[regular_keys.length - 1].length == 1) {
    regular_keys[regular_keys.length - 2].push(regular_keys[regular_keys.length - 1].pop())
    regular_keys.pop()
  }
  return {regular_keys, nested_keys}
}

function setPage(pagenum) {
  // Find the A link and remove it's class
  var current_page_a = document.getElementById(`page ${current_page}`);
  current_page_a.classList.remove("is-current");
  current_page_a.ariaCurrent = false;
  // Find the div and make invisible
  var current_page_div = document.getElementById(current_page);
  current_page_div.style.display = "none";


  // Find the new page A and add the class
  var new_page_a = document.getElementById(`page ${pagenum}`);
  new_page_a.classList.add("is-current");
  new_page_a.ariaCurrent = "page";
  // Find the div and make invisible
  var new_page_div = document.getElementById(pagenum);
  new_page_div.style.display = "";

  current_page = pagenum

}

function addDatabaseTab(pagenum, hidden) {
  // Create a page on the thingy dingy
  const pagination_page = document.createElement("li")
  pagination_page.innerHTML = `
  <a class="pagination-link control" id="page ${pagenum}" aria-label="Goto page ${pagenum}" onclick=setPage("${pagenum}")>${pagenum}</a>
  `

  // Create a div to hold this
  const key_set_div = document.createElement("div");
  key_set_div.id = pagenum;
  
  // Hide if not the first set
  if (hidden) {
    key_set_div.style.display = "none";
  }

  return {pagination_page, key_set_div}
  
}

function addDatabaseItem(key, key_val, key_schema) {
  // Create a div within the key_set_div
  const key_div = document.createElement("div");
  // Set the class of this div
  key_div.className="field";

  const key_input_field = constructValueField(key, key_val, key_schema);
  key_div.innerHTML = `
    <label class="label">${key}</label>
    <div class="control">
      ${key_input_field}
    </div>
    <p class="help">${key_schema.description}</p>
  `;
  return key_div
}

function constructDatabaseOptionsTable(config, schema) {
  content.innerHTML = `
  <div class="container columns animate__animated animate__fadeIn">
  <div class="column is-one-fifth"></div>
  <div class="column">

  <nav class="pagination" role="navigation" aria-label="pagination">
    <ul class="pagination-list field is-grouped is-grouped-centered" id="pagination-list">
    </ul>
  </nav>
  <div id="config-options"></div>
  <div class="field pt-4 is-grouped is-grouped-centered">
  <p class="control">
    <a class="button is-primary">
      Submit
    </a>
  </p>
  <p class="control">
    <a class="button is-danger">
      Cancel
    </a>
  </p>
</div>
  </div>
  <div class="column is-one-fifth"></div>
  </div>
  `
  config_options = document.getElementById('config-options')
  pagination_list = document.getElementById('pagination-list')
  const keys = Object.keys(schema.properties);
  const keys_length = keys.length
  // Split the array up into equal chunks
  // regular_keys = [[key_name(7)],[key_name(7)]]
  // nested_keys = ["key_name", "key_name"]
  let {regular_keys, nested_keys} = splitArrayIntoChunks(keys, schema.properties);
  
  // Iterate over each set of arrays
  for (let x = 0; x < regular_keys.length; x++) {
    var {pagination_page, key_set_div} = addDatabaseTab(x + 1, x != 0)
    let key_set = regular_keys[x]
    pagination_list.appendChild(pagination_page)

    // Iterate over each key within this key set
    for (let y = 0; y < key_set.length; y++) {
      let key = key_set[y]
      key_set_div.appendChild(addDatabaseItem(key, config.config[key], schema.properties[key]));
    }
    config_options.appendChild(key_set_div)
  }
  // Iterate over each of the nested keys
  for (let x = 0; x < nested_keys.length; x++) {
    let nested_key = nested_keys[x]

    var {pagination_page, key_set_div} = addDatabaseTab(nested_key, true)
    let dereferenced_schema = lookupRef(full_schema, schema.properties[nested_key]["$ref"].substring(2))
    let key_set = Object.keys(dereferenced_schema.properties)

    pagination_list.appendChild(pagination_page)
    // Iterate over each key within this key set
    for (let y = 0; y < key_set.length; y++) {
      let key = key_set[y]
      key_set_div.appendChild(addDatabaseItem(key, config.config[nested_key][key], dereferenced_schema.properties[key]));
    }
    config_options.appendChild(key_set_div)
  }
  setPage(1)

  // for (let i = 0; i < keys.length; i++) {
  //   const key = keys[i];
  //   const key_val = config.config[key];
  //   const key_schema = schema.properties[key]
  //   const field = document.createElement("div")
  //   var value_field = constructValueField(key, key_val, key_schema)
  //   field.className="field"
  //   field.innerHTML = `
  //     <label class="label">${key}</label>
  //     <div class="control">
  //       ${value_field}
  //     </div>
  //     <p class="help">${key_schema.description}</p>
  //   `
  //   config_options.appendChild(field);
  // }
}

async function getAccDetails(token) {
  console.log("Fetching account details")
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
      bulmaToast.toast({
        message: account_details.message,
        type: 'is-danger',
        dismissible: true,
        animate: { in: 'fadeIn', out: 'fadeOut' },
      })
    return false;
  } else {
    bulmaToast.toast({
      message: `email: ${account_details.account.email}, team: ${account_details.account.team.name}`,
      type: 'is-primary',
      dismissible: true,
      animate: { in: 'fadeIn', out: 'fadeOut' },
    })
    return true;
  };
}

getDOSpec()
  .then((data) => {
    try {
        full_schema = jsyaml.load(data);
        mysql_schema = full_schema.components.schemas.mysql;
        postgres_schema = full_schema.components.schemas.postgres;
        redis_schema = full_schema.components.schemas.redis;
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
      fadeOutContent()
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

