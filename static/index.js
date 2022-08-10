document.getElementById("submit").addEventListener("click", handleSubmit);

function handleSubmit() {
    makeDisabled();
    readForm();
}

function makeDisabled() {
    document.getElementById("ip-range").disabled = true;
}

function readForm() {
    const formData = document.getElementById('ip-range').value;
    console.log(formData.split('\n'));
}
