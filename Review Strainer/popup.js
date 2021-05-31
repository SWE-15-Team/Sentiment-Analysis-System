chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {    
    if (request.message === "setSetting") {
        document.getElementById('block').checked = request.block;
        document.getElementById('highlight').checked = request.highlight;
        document.getElementsByName('chk_info').forEach((node) => {
            if (node.value == request.chk_info) {
                node.checked = true
            }
        })
    } else if (request.message === "getMovieDataReply") {
        
    }
});
document.getElementById('applyButton').onclick = function () {
    var block = document.getElementById('block').checked;
    var highlight = document.getElementById('highlight').checked;
    var scoreNodeList = document.getElementsByName('chk_info');
    var scoreValue = 0;
    scoreNodeList.forEach((node) => {
        if (node.checked) {
            scoreValue = node.value
        }
    })
    console.log(block, highlight, scoreValue)
    chrome.runtime.sendMessage({
        message: 'applySetting',
        block: block,
        highlight: highlight,
        chk_info: scoreValue
    });
}