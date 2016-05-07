(function () {
    
    var channelObj;
    
    // create and send key object to server
    function encryptMessage(text, permissionObj) {
        // generate key
        var randomKey = Math.random().toString()+Math.random().toString();
    	randomKey = randomKey.replace(/\./g,'').substring(0,16);
    	randomKey = '1234567890';
        
        // encrypt the message
        var encryptedMessage = CryptoJS.AES.encrypt(text, randomKey).toString();
        
        // generate the message id
        var messageID = btoa(Date.now() + Math.random().toString().substring(2,6));
        // var lock character : \uD83D\uDD12
        var msgPrepend = '- cyphor.io -- '+messageID+ ' -- ';
        var msgAppend = ' -- cyphor.io --';
        
        // package up message
        var final = msgPrepend + encryptedMessage + msgAppend;
        return final;
    }
    
    function submitButton(eve) {
        var inp = document.getElementById('cyphor-input'),
            decrypted = null;
            
        if(inp.nodeName == 'INPUT' || inp.nodeName == 'TEXTAREA'){
            decrypted = inp.value;
            inp.value = "";
        } else {
            decrypted = inp.innerText;
            inp.innerText = "";
        }
    
        var final = encryptMessage(decrypted);
        
        // pass encrypted package to content window.
        console.log('encrypting : ', decrypted, 'SUBMIT_BUTTON : ', final);
        eve.data.inputText = final;
        parent.postMessage(eve.data, '*');
        
        inp.focus();
    }
    
    function submitForm() {
        // get decrypted message
        var inp = document.getElementById('cyphor-input'),
            decrypted = null;
            
        if(inp.nodeName == 'INPUT' || inp.nodeName == 'TEXTAREA'){
            decrypted = inp.value;
            inp.value = "";
        } else {
            decrypted = inp.innerText;
            inp.innerText = "";
        }
    
        var final = encryptMessage(decrypted);
        
        // pass encrypted package to content window.
        console.log('encrypting : ', decrypted, 'MESSAGE : ', final);
        parent.postMessage({
            action : 'MESSAGE',
            message : final
        }, '*');
        
        inp.focus();
    }
    
    window.onload = function () {
        document.getElementById('cyphor-input')
        setFocus();
    }
    
    window.addEventListener('keydown', function (eve) {
        if(channelObj && channelObj.sendHotkey){
            var hk = channelObj.sendHotkey;
            if(eve.keyCode == hk.keyCode && !!hk.shiftKey == !!eve.shiftKey && !!hk.altKey == !!eve.altKey && !!hk.ctrlKey == !!eve.ctrlKey && !!hk.metaKey == !!eve.metaKey){
                submitForm();
                eve.stopPropagation();
                eve.preventDefault();
            }
        } else {
            if(eve.keyCode == 13){
                submitForm();
                eve.stopPropagation();
                eve.preventDefault();
            }
        }
    }, true);
    
    window.addEventListener('message', function(eve) {
        if(eve.data.action == 'SUBMIT'){
            submitForm();
        } else if(eve.data.action == 'SUBMIT_BUTTON'){
            submitButton(eve);
        } else if (eve.data.action == 'INSERT'){
            console.log(arguments);
            replicateElements(eve.data);
        } else if(eve.data.action == 'FOCUS'){
            setFocus();
        } else if(eve.data.action == 'CHANNEL'){
            channelObj = eve.data.channel;
        }
    });
    
    function setFocus() {
    	console.log('focusing');
    	var elem = document.getElementById('cyphor-input');
    	if(elem){
    		elem.focus();
    
    		var range = document.createRange();
    		var sel = window.getSelection();
    		range.setStart(elem, 0);
    		range.collapse(true);
    		sel.removeAllRanges();
    		sel.addRange(range);
    	}
    }
        
//     function replicateElements(msg) {
//         // handle parent element
//         var par = document.createElement(msg.parent.type);
//         for(var i=0;i<msg.parent.styles.length;i++){
//             if(msg.parent.styles[msg.parent.styles[i]]){
//                 console.log('parent setting : '+convertToDeshSeperation(msg.parent.styles[i])+' to '+msg.parent.styles[msg.parent.styles[i]]);
//                 par.style[convertToDeshSeperation(msg.parent.styles[i])] = msg.parent.styles[msg.parent.styles[i]];
//             }
// 		}
// 		par.style.background = 'transparent';
// 		document.body.appendChild(par);
		
// 		var target = document.createElement(msg.target.type);
//         for(var i=0;i<msg.target.styles.length;i++){
// 			if(msg.target.styles[msg.target.styles[i]]){
// 			    console.log('target setting : '+convertToDeshSeperation(msg.target.styles[i])+' to '+msg.target.styles[msg.target.styles[i]]);
// 			    target.style[convertToDeshSeperation(msg.target.styles[i])] = msg.target.styles[msg.target.styles[i]];
// 			}
			
// 		}
// 		target.style.background = 'transparent';
// 		document.body.appendChild(target);
//     }
    
    
    function replicateElements(msg) {
        // handle parent element
        var par = document.createElement(msg.parent.type);
        for(var i in msg.parent.styles){
            if(msg.parent.styles[i] && isNaN(i)){
                //console.log('parent setting : '+i+' to '+msg.parent.styles[i]);
                par.style[i] = msg.parent.styles[i];
            }
		}
		par.style.background = 'transparent';
		par.style.display = 'block';
		document.body.appendChild(par);
		
		var target = document.createElement(msg.target.type);
        for(var i in msg.target.styles){
            if(msg.target.styles[i] && isNaN(i)){
                //console.log('parent setting : '+i+' to '+msg.target.styles[i]);
                target.style[i] = msg.target.styles[i];
            }
			
		}
		
		target.style.background = 'transparent';
		target.id = "cyphor-input";
		target.style.display = 'block';
		if(msg.target.type != 'textarea' && msg.target.type != 'input'){
		    target.setAttribute("contentEditable", true);
		}
		
		par.appendChild(target);
    }
    
    
    function convertToDeshSeperation(str) {
        var uppers = str.match(/[A-Z]/g);
        if(uppers && uppers.length){
            uppers.forEach(function (upperLetter) {
                str.replace(upperLetter, '-' + String.fromCharCode(upperLetter.charCodeAt(0)+32))
            });
        }
        return str;
    }
    
})();