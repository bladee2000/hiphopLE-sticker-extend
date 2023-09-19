async function sticker_setup() {
    let result = await chrome.storage.local.get("sticker_arr")
    
    if (result["sticker_arr"] === undefined) {
        let f = await fetch("stickerList.json")
        let sticker_json = await f.json()

        chrome.storage.local.set(sticker_json)
        console.log("스티커 리스트 json to 크롬 스토리지 완료..")
    } else{ 
        console.log("스티커 리스트가 이미 존재합니다.")
    }
}   

async function option_setup() {
    let result = await chrome.storage.local.get("options")

    if (result["options"] === undefined) {
        let f = await fetch("options.json")
        let options = await f.json()
        console.log(options)

        chrome.storage.local.set(options)
        console.log("옵션 설정 완료..")
    } else {
        console.log("옵션이 이미 존재합니다..")
    }
    
}

async function reset() {
    await chrome.storage.local.clear()
    sticker_setup()
    option_setup()
}

async function main() {
    //await chrome.storage.local.clear()
    chrome.runtime.onInstalled.addListener(({ reason }) => {
        if (reason === "install") {
            sticker_setup()
            option_setup()
        }
    })
    
    console.log(await chrome.storage.local.get(null))
    
    chrome.runtime.onMessage.addListener(function(message) {
        switch (message.action) {
            case "openOptionsPage":
                chrome.runtime.openOptionsPage();
                break;
            default:
                break;
        }
    });

}

main()


