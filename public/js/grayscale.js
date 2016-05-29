

// // Closes the Responsive Menu on Menu Item Click
// $('#signin').click(function() {
//     if($scope.user !== null){
//         document.getElementsByTagName('html')[0].innerHTML = JSON.stringify($scope.user)
//     } else {
//         window.open(ApplicationConfiguration.appConfig.url);
//     }
// });

$('#savechannel').click(function() {
    if($scope.user !== null){
        passMessageToActiveTab({action:'savechannel'}, function(resp){
            console.log(resp)
        });
    } else {
        alert('Please Sign in');
    }
});

$('#viewchannels').click(function() {
    passMessageToActiveTab({action:'viewchannels'}, function(resp){
        console.log(resp);
    });
    document.getElementsByTagName('html')[0].innerHTML = JSON.stringify(channels)
});


function passMessageToActiveTab (messageObj, callback_func) {
    var inner_msg = messageObj;
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, inner_msg, callback_func)
    });
}

window.onload = function(){
    
    // Closes the Responsive Menu on Menu Item Click
    $('.navbar-collapse ul li a').click(function() {
        $('.navbar-toggle:visible').click();
    });

    // Closes the Responsive Menu on Content Window click
    $('.app-content').click(function () {
        if($('.navbar-collapse').hasClass('in')){
            $('.navbar-toggle:visible').click();
        }
    });
}