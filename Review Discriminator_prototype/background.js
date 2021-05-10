var block;
var highlight;
var chk_info;
try {
    chrome.storage.sync.get(['block', 'highlight', 'chk_info'],
        items => {
            block = (typeof items.block == "undefined") ? false : items.block;
            highlight = (typeof items.highlight == "undefined") ? false : items.highlight;
            chk_info = (typeof items.chk_info == "undefined") ? 0 : items.chk_info;

            console.log(items);
        });
}
catch {
    console.log('fail to load data');
}

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
    if (request.message === "applySetting") {
        block = request.block;
        highlight = request.highlight;
        chk_info = request.chk_info;
        chrome.storage.sync.set({ 'block': block });
        chrome.storage.sync.set({ 'highlight': highlight });
        chrome.storage.sync.set({ 'chk_info': chk_info });
        
    } else if (request.message === "callBackground") {
        setSetting();
    } else if (request.message === "checkForBlock") {
        sentimentalCheckForBlock(request, sender.tab.id);
    } else if (request.message === "checkForHighlight") {
        sentimentalCheckForHighlight(request, sender.tab.id);
    }
});

function setSetting() {

    console.log(block, highlight, chk_info)
    chrome.runtime.sendMessage({
        message: 'setSetting',
        block: block,
        highlight: highlight,
        chk_info: chk_info
    });
    chrome.tabs.query({ active: true }, function (tabs) {
        for (tab of tabs) {
            chrome.tabs.sendMessage(tab.id,
                {
                    message: 'applySetting',
                    block: block,
                    highlight: highlight,
                    chk_info: chk_info
                });
        }
    });
}

async function sentimentalCheckForBlock(request, tabId) {
    let result = true;
    if (Math.random() < 0.5) {
        result = false;
    }
    sendBlockReply(tabId, result, request.data, request.nodeNum, request.score);
}
async function sentimentalCheckForHighlight(request, tabId) {
    let result = true;
    if (Math.random() < 0.5) {
        result = false;
    }
    sendHighlightReply(tabId, result, request.data, request.nodeNum, request.score);
}
function sendBlockReply(tabId, isChecked, data, nodeNum, score) {
    chrome.tabs.sendMessage(tabId,
        {
            message: 'blockReply',
            isChecked: isChecked,
            data: data,
            nodeNum: nodeNum,
            score: score
        });
}
function sendHighlightReply(tabId, isChecked, data, nodeNum, score) {
    chrome.tabs.sendMessage(tabId,
        {
            message: 'highlightReply',
            isChecked: isChecked,
            data: data,
            nodeNum: nodeNum,
            score: score
        });
}