// Saves options to chrome.storage
function save_options() {
  var auto_decrypt = document.getElementById('auto_decrypt').checked;
  console.log(auto_decrypt);
  
  chrome.storage.sync.set({
    'auto_decrypt': auto_decrypt
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });

  chrome.runtime.sendMessage({action: "updateLocalStorage", key : "auto_decrypt", value : auto_decrypt}, function(response) {
    console.log(response);
  });

}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    auto_decrypt: true
  }, function(items) {
    document.getElementById('auto_decrypt').checked = items.auto_decrypt;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',save_options);