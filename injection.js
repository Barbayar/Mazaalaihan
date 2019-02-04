// it seems like javascripts don't conflict each other, but css can be conflicted
// http://stackoverflow.com/questions/7213883/how-can-i-use-jquery-in-a-chrome-extension-content-script-when-an-older-version
// https://developer.chrome.com/extensions/content_scripts#execution-environment
// http://stackoverflow.com/questions/10568065/limit-the-scope-of-bootstrap-styles/14145510#14145510

let popoverWindow = ' \
<div class="mazaalai"> \
    <div class="popover" id="_mazaalaiPopoverWindow"> \
    </div> \
</div>';
$('body').prepend(popoverWindow);
$popoverWindow = $('#_mazaalaiPopoverWindow');

let lastWord = null;

let log = (message) => {
    chrome.runtime.sendMessage({
        command: 'log',
        parameter: message,
    });
}

let buildPopoverWindow = (word, found, result) => {
    let titleClass = 'bg-success';
    let resultHTML = '';

    $popoverWindow.html('');

    if (!found) {
        titleClass = 'bg-danger';

        if (result.length > 0) {
            resultHTML += '<div class="popover-title" style="background-color:#f7f7f7;"><p class="small"><b>&ldquo;' + word + '&rdquo;</b> гэсэн үг олдоогүй тул, ойролцоох үгнүүдийг харуулж байна.</p></div>';
        } else {
            resultHTML += '<div class="popover-title" style="background-color:#f7f7f7;"><p class="small"><b>&ldquo;' + word + '&rdquo;</b> гэсэн үг олдсонгүй.</p></div>';
        }
    }

    for (let i = 0; i < result.length; i++) {
        resultHTML += '<div class="popover-title ' + titleClass + '"><p>' + result[i][0] + '</p></div>';
        resultHTML += '<div class="popover-content"><p class="small">' + result[i][1] + '</p></div>';
    }

    resultHTML += '<div class="popover-title" style="background-color:#f7f7f7;"><p class="small" style="text-align:right;">&copy; 2014, Barbayar Dashzeveg</p></div>';

    $popoverWindow.append(resultHTML);
}

let showPopoverWindow = (x, y) => {
    let spareSpace = 20;
    let popoverWindowWidth = $popoverWindow.width();
    let popoverWindowHeight = $popoverWindow.height();

    let popoverWindowTop = y - popoverWindowHeight / 2;
    let popoverWindowBottom = popoverWindowTop + popoverWindowHeight;
    let popoverWindowLeft = x + spareSpace;
    let popoverWindowRight = popoverWindowLeft + popoverWindowWidth;
    let windowTop = $(window).scrollTop();
    let windowBottom = windowTop + $(window).height();
    let windowLeft = $(window).scrollLeft();
    let windowRight = windowLeft + $(window).width();

    if (popoverWindowRight + spareSpace > windowRight) {
        popoverWindowLeft = x - popoverWindowWidth - spareSpace;
        popoverWindowRight = popoverWindowLeft + popoverWindowWidth;
    }

    if (popoverWindowBottom + spareSpace > windowBottom) {
        popoverWindowTop = windowBottom - popoverWindowHeight - spareSpace;
        popoverWindowBottom = popoverWindowTop + popoverWindowHeight;
    }

    if (popoverWindowTop - spareSpace < windowTop) {
        popoverWindowTop = windowTop + spareSpace;
        popoverWindowBottom = popoverWindowTop + popoverWindowHeight;
    }

    $popoverWindow.css('left', popoverWindowLeft + 'px');
    $popoverWindow.css('top', popoverWindowTop + 'px');
    $popoverWindow.show();
}

let htmlEncode = (value) => {
    return $('<div/>').text(value).html();
}

let htmlDecode = (value) => {
    return $('<div/>').html(value).text();
}

let parts = $('body').html().split(/(<.+?>)/);

//ref: https://stackoverflow.com/a/10730777
let findTextNodes = (parent) => {
    if (!parent) {
        return [];
    }

    let node, result = [], walk = document.createTreeWalker(parent, NodeFilter.SHOW_TEXT, null, false);

    while (node = walk.nextNode()) {
        result.push(node);
    }

    return result;
}

let textNodes = findTextNodes(document.getElementsByTagName('html')[0]);

for (let i in textNodes) {
    let node = $(textNodes[i]);

    node.replaceWith('<mazaalai_text>' + node.text().replace(/\b(\w+)\b/g, '<mazaalai>$1</mazaalai>') + '</mazaalai_text>');
}

$('mazaalai').hover(
    function(event) {
        $(this).css('background-color','#ffff66');

        chrome.runtime.sendMessage({
            command: 'search',
            parameter: $(this).text().toLowerCase(),
        }, (response) => {
            buildPopoverWindow($(this).text(), response.found, response.result);
            showPopoverWindow(event.pageX, event.pageY);
        });
    },
    function() {
        $(this).css('background-color','');
        $popoverWindow.hide();
    }
);
