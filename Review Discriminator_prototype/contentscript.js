console.log("hi!");

let attachObserver = false;
var nodeMap = new Map();
var nodeCount = 0;
let block = false;
let highlight = false;
let score = 0;
shouldReplaceHTML = function (node) {
    var text = node.textContent;
    if (text.indexOf("http") == 0)
        return false;
    text = text.replaceAll('↵', "").trim();
    if (text.length == 0)
        return false;
    text = text.replaceAll("\n", " ");
    nodeMap.set(nodeCount, node);
    
    if (block) {
        chrome.runtime.sendMessage({
            message: 'checkForBlock',
            data: text,
            nodeNum: nodeCount,
            score: score
        });
    }
    if (highlight) {
        chrome.runtime.sendMessage({
            message: 'checkForHighlight',
            data: text,
            nodeNum: nodeCount,
            score: score
        });
    }
    nodeCount++;
}
reviewCheck = function (node) {
    let checkText = false;
    let text = node.textContent;
    if (!node) {
        return 0;
    }
    ntSize = 0;

    if (node.nodeName.toLowerCase() === "#text") {
        text = text.replace(/\u200B/g, '');     
        checkText = true;
    }
    if (replaceDivIsEnabled(node, node.nodeName)) {
        for (let child of node.childNodes) {
            if (child.nodeName == "#comment")
                continue;

            let checkNode = reviewCheck(child);
            if (checkNode) {
                
                shouldReplaceHTML(node);
                break;
            }
        }
    }
    else {
        checkText = false;
    }
    
    return checkText;
}
replaceDivIsEnabled = function (node, nodeName) {

    if ((nodeName == "#text") && (node.textContent.replaceAll('↵', "").trim().length == 0)) {
        return false;
    }

    var toLowerNodeName = nodeName.toLowerCase();

    if (toLowerNodeName == "head" ||
        toLowerNodeName == "noscript" ||
        toLowerNodeName == "script" ||
        toLowerNodeName == "style" ||
        toLowerNodeName == "time" ||
        toLowerNodeName == "meta" ||
        toLowerNodeName == "svg" ||
        toLowerNodeName == "path" ||
        toLowerNodeName == "button" ||
        toLowerNodeName == "input"
    ) {
        return false;
    }
    if (node.parentElement) {
        var toLowerParentElementLocalName = node.parentElement.localName.toLowerCase();
        return toLowerParentElementLocalName !== "head" &&
            toLowerParentElementLocalName !== "noscript" &&
            toLowerParentElementLocalName !== "script" &&
            toLowerParentElementLocalName !== "style" &&
            toLowerParentElementLocalName !== "time";
    }
}
blurNode = function (node) {
    let blurText = "blur(6px)";
    if (node.isBlurred == undefined) {
        node.isBlurred = true;
        node.style.filter = blurText;
    }
}
AttachBlockObserver = function () {
    if (attachObserver)
        return;
    attachObserver = true;
    reviewCheck(document.body);

    let observer = new MutationObserver(function (mutations, observer) {
        for (mutation of mutations) {
            for (added of mutation.addedNodes) {
                reviewCheck(added);
            }
        }
    });

    // define what element should be observed by the observer
    // and what types of mutations trigger the callback
    observer.observe(document, {
        subtree: true,
        childList: true
        //...
    });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.message == 'applySetting') {
        block = request.block;
        highlight = request.highlight;
        score: request.chk_info;
        AttachBlockObserver();
    }
    else if (request.message == 'blockReply') {
        let node = nodeMap.get(request.nodeNum);
        if (request.isChecked) {
            if (node != undefined) {
                //console.log(Date.now() - startTime);
                blurNode(node);
            }
        }      
    }
    else if (request.message == 'highlightReply') {
        let node = nodeMap.get(request.nodeNum);
        if (request.isChecked) {
            if (node != undefined) {
                //console.log(Date.now() - startTime);
                blurNode(node);
            }
        }      
    }
})

chrome.runtime.sendMessage({
    message: 'callBackground'
});

startTime = Date.now();
