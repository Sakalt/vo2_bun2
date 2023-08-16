const typeColors: any = {
    "名": {bg: "#ffeeee", br: "#ff9090"},
    "代名": {bg: "#ffeeee", br: "#ff9090"},
    "動": {bg: "#fff0ee", br: "#ffbb90"},
    "形": {bg: "#e7ffdc", br: "#9bed5c"},
    "副": {bg: "#d3ffd9", br: "#4ed264"},
    "助": {bg: "#d3fff8", br: "#58edcd"},
    "助動": {bg: "#d7edff", br: "#5099e8"},
    "感": {bg: "#ffddfc", br: "#ec71d5"},
    "接": {bg: "#eaeaea", br: "#909090"},
    "数": {bg: "#f5d9ff", br: "#b663e7"},
    "前置": {bg: "#e6dece", br: "#a27b3b"},
}

let presentPage = 1
const wordInOnePage = 30

let prevButton: HTMLButtonElement
let nextButton: HTMLButtonElement
let firstButton: HTMLButtonElement
let lastButton: HTMLButtonElement

let searchBox: HTMLInputElement
let searchButton: HTMLButtonElement
let searchTypeList: NodeListOf<HTMLInputElement>

// XMLHttpRequestを使ってjsonデータを読み込む
let requestURL = './dict/dict.json';//jsonへのパス
let request = new XMLHttpRequest();
request.open('GET', requestURL);
request.responseType = 'json';
request.send();
 
// JSONデータをJavaScriptオブジェクトに変換
request.onload = async function() {
    let data = request.response;
    data = JSON.parse(JSON.stringify(data));
    writeDict(data, presentPage)
}

function writeDict(dict: object[], page: number, filter: string = "", type: string = "word") {
    dict.sort((a: any, b: any) => {
        if (a.word > b.word){
            return 1;
        }else if (a.word < b.word){
            return -1;
        }else{
            return 0;
        }
    })

    const filtedWords = dict.filter((w: any) => {
        if (type == "mean") {
            console.log(type)
            const isMeanIncludes = w["mean"].some((m: any) => {
                return m["explanation"].includes(filter)
            })
            const isAppendIncludes = w["append"].some((a: any) => {
                return a["explanation"].includes(filter)
            })
            return isMeanIncludes || isAppendIncludes
        }

        return w[type].includes(filter) //mean以外の時はこっち
    })

    const totalPages = Math.ceil(filtedWords.length / wordInOnePage)

    const dictInPage = filtedWords.filter((a, idx) => {
        return Math.floor(idx / wordInOnePage) + 1 == page
    })

    const contentBox = document.getElementById("contentbox")

    let dictHTML = ""

    dictInPage.forEach((w: any) => {
        let meanHTML = ""

        w.mean.forEach((m: any) => {
            const type: string = m.partOfSpeech //品詞
            meanHTML += `
            <div class="speech">
                <span class="type" style="border-color:${typeColors[type].br}; background-color:${typeColors[type].bg};">${type}</span>
                <span class="text">${m.explanation}</span>
            </div>
            `
        })

        let appendHTML = ""

        if (w.append[0].type != "") {
            appendHTML += '<div class="mean">'
            w.append.forEach((a: any) => {
                appendHTML += `
                <div class="speech">
                    <span class="apptype">${a.type}</span>
                    <span class="text">${a.explanation}</span>
                </div>
                `
            })
            appendHTML += '</div>'
        }

        let wordHTML = `
        <div class="content">
            <div class="word">
                <span class="phun">【${w.word}】</span>
                <span class="trans">${w.word}</span>
                <span class="pron">/${w.pron}/</span>
            </div>
            <div class="mean">
                ${meanHTML}
            </div>
            ${appendHTML}
        </div>
        `
        
        dictHTML += wordHTML
    })

    contentBox!.innerHTML = dictHTML

    const buttons = document.getElementById("pagebuttons")
    const viewPrev = presentPage > 1? "": " class='hidebutton'"
    const viewNext = presentPage < totalPages? "": " class='hidebutton'"

    buttons!.innerHTML = `
    <button type="button"${viewPrev} id="first">最初のページへ</button>
    <button type="button"${viewPrev} id="prev">前のページへ</button>
    <p>${presentPage}/${totalPages}</p>
    <button type="button"${viewNext} id="next">次のページへ</button>
    <button type="button"${viewNext} id="last">最後のページへ</button>
    `

    prevButton = <HTMLButtonElement> document.getElementById("prev")
    nextButton = <HTMLButtonElement> document.getElementById("next")
    firstButton = <HTMLButtonElement> document.getElementById("first")
    lastButton = <HTMLButtonElement> document.getElementById("last")

    searchBox = <HTMLInputElement> document.getElementById("input")
    searchButton = <HTMLButtonElement> document.getElementById("search")

    let numberBox = document.getElementById("numberofwords")
    let numberBoxJP = document.getElementById("numberofwordsjp")

    prevButton.addEventListener("click", () => {
        presentPage--
        writeDict(dict, presentPage, filter, type)
        moveBottom()
    })
    nextButton.addEventListener("click", () => {
        presentPage++
        writeDict(dict, presentPage, filter, type)
        moveBottom()
    })
    firstButton.addEventListener("click", () => {
        presentPage = 1
        writeDict(dict, presentPage, filter, type)
        moveBottom()
    })
    lastButton.addEventListener("click", () => {
        presentPage = totalPages
        writeDict(dict, presentPage, filter, type)
        moveBottom()
    })

    searchButton.addEventListener("click", () => {
        searchTypeList = <NodeListOf<HTMLInputElement>> document.getElementsByName("searchtype")
        let searchType
    
        searchTypeList.forEach((a, idx) => {
            if(searchTypeList.item(idx).checked) {
                searchType = searchTypeList.item(idx).value;
            }
        })

        const text = searchBox.value

        presentPage = 1
        writeDict(dict, presentPage, text, searchType)
    })

    numberBox!.innerHTML = "之時 " + dict.length.toString(12) + "言"
    numberBoxJP!.innerHTML = "現在：" + dict.length + "語"
}

function moveBottom() { //ページ最下部へ移動
    /*
    const a = document.documentElement;
    const y = a.scrollHeight - a.clientHeight;
    window.scroll(0, y);
    */
    window.scroll({top: 0});
}