let debugMode = true;

let log = (message) => {
    if (typeof debugMode === 'undefined' || !debugMode) {
        return;
    }

    console.log(message);
}

let isEnglish = (word) => {
    return word.match(/^[a-z]/) !== null;
}

let onRuntimeMessage = (message, sender, callback) => {
    log('received [' + message.command + '] from tab:' + sender.tab.id);

    switch (message.command) {
        case 'log':
            log(message.parameter);
        break;
        case 'search':
            let word = message.parameter;

            if (isEnglish(word)) {
                callback(engmon.search(word));
            } else {
                callback(moneng.search(word));
            }
        break;
    }
}

chrome.runtime.onMessage.addListener(onRuntimeMessage);
chrome.browserAction.onClicked.addListener(function(tab) {
    alert('working?');
});
