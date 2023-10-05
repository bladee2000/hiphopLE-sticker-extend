

function insert_btn() {
    for (i = 0; i < 2; i++){
        const cmt_write_tool = document.getElementsByClassName("comment-write-tool")
        if (cmt_write_tool.length == 0) {return;}

        var submit_btn = cmt_write_tool[i].querySelector("button")
        
        const sticker_btn = document.createElement("div")
        
        sticker_btn.innerHTML = "<div>스티커 확장!</div>"
        sticker_btn.classList.add("sticker_btn")
        sticker_btn.style = "display:inline-block; margin-left:10px; cursor:pointer; position: relative; padding:7px; background-color: #abffb9; border-radius: 1.7em;"

        cmt_write_tool[i].insertBefore(sticker_btn, submit_btn)
    }
    
}


function insert_popup(target_comment_write_tool) {
    var submit_btn = target_comment_write_tool.querySelector("button")

    const sticker_popup = document.createElement("div")
    const sticker_popup_html = `<div id="sticker_popup">
                                    <div id="sticker_popup_options_bar">
                                        <div>힙합엘이 스티커 확장 프로그램</div>
                                        <div id="options_btn"><b>설정 ⚙</b></div>
                                    </div>
                                    <div id="sticker_popup_nav">
                                        <div id="nav_imgs"></div>
                                    </div>
                                    <div id="sticker_popup_select"></div>
                                </div>`

    sticker_popup.style = "display: block; z-index:999; position: relative; top:7px;"
    sticker_popup.id = "sticker_div"
    sticker_popup.innerHTML = sticker_popup_html

    target_comment_write_tool.appendChild(sticker_popup)

}

function click_sticker_btn(event) {
    const sticker_popup = document.getElementById("sticker_div")
    
    if (sticker_popup === null) {
        const target = event.target.closest(".comment-write-tool")
        insert_popup(target)
        start_fill_popup()
    } else {
        sticker_popup.remove()
    }
}

async function get_sticker_list(){
    let sticker_list = await chrome.storage.local.get("sticker_arr")
    return sticker_list
}

function fill_sticker_select(stickers, readme){
    const sticker_popup_select = document.getElementById("sticker_popup_select")
    while(sticker_popup_select.firstChild) {
        sticker_popup_select.removeChild(sticker_popup_select.firstChild)
    }

    for (const [key, value] of Object.entries(stickers)) {
        const newDiv = document.createElement("div")
        newDiv.onclick = function() {select_img_onclick(value, readme)}
        newDiv.className = "select_img_block"
        const style = "width:95%; height:95%; cursor: pointer; "
        if (value.includes(".mp4")) {
            newDiv.innerHTML = `<video src="${value}" style="${style}" title="${key}" loop="true" autoplay="true">`
        } else {
            newDiv.innerHTML = `<img src="${value}" style="${style}" title="${key}">`
        }
        
        sticker_popup_select.appendChild(newDiv)
    }
}


function fill_sticker_nav(obj){
    const sticker_arr = obj["sticker_arr"]
    for (const sticker of sticker_arr){
        const newDiv = document.createElement("div")
        const newImg = document.createElement("img")
        newDiv.className = "nav_img_block"
        newDiv.onclick = function() {nav_img_onclick(sticker["name"])}
        newDiv.id = sticker["name"]
        newDiv.title = sticker["name"]
        newImg.src = sticker["header"]
        newImg.style = "width:85px; height:85px; cursor: pointer;"
        newDiv.appendChild(newImg)
        document.getElementById("nav_imgs").appendChild(newDiv)

    }
}


async function nav_img_onclick(sticker_name){
    const befroe_sticker = document.getElementById(now_sticker)
    if (befroe_sticker !== null) {
        if (befroe_sticker.classList.contains("selected")) {
            befroe_sticker.classList.remove("selected")
        }
    }
    
    now_sticker = sticker_name

    const after_sticker = document.getElementById(sticker_name)
    after_sticker.classList.add("selected")

    let sticker_json = await get_sticker_list()
    for (const sticker of sticker_json["sticker_arr"]) {
        if (sticker["name"] == sticker_name) {
            fill_sticker_select(sticker["imgs"], sticker["readme"])
        }
    }
    
}

async function select_img_onclick(src, readme) {
    const sticker_div = document.getElementById("sticker_div")
    const textarea = sticker_div.parentElement.parentElement.getElementsByTagName("textarea")[0]
    const btn = sticker_div.parentElement.getElementsByTagName("button")[0]
    
    const options = await chrome.storage.local.get("options")
    textarea.value = comment_html_shell(src, options["options"], readme == "" ? options["options"].readme_page : readme)
    btn.click() // 등록버튼 누르면 몇 초간 버튼 비활성화됨
    const sticker_popup = document.getElementById("sticker_div")
    sticker_popup.remove()
}

function comment_html_shell(img_src, options, readme){
    const style = `width:${options.comment_img_size.x}px; height:${options.comment_img_size.y}px;`
    
    if (img_src.includes(".mp4")) {
        const new_src = img_src.substr(img_src.indexOf("/files"))
        return `<video src=${new_src} style="${style}" loop="true" autoplay="true" muted="true"></video>`
    } else {
        return `<a href="${readme}" target="_blank"><img src="${img_src}" style="${style}"></a>`
    }
    
}

async function start_fill_popup(){
    let sticker_json = await get_sticker_list()
    fill_sticker_nav(sticker_json)
}

async function click_option_btn() {
    try{
        await chrome.runtime.sendMessage({"action": "openOptionsPage"})
        return;
    } catch(err) {
        if (err.name === "Error"){
            chrome.runtime.sendMessage({"action": "openOptionsPage"})
        }else {
            throw new Error(err)
        }
    }
}

function main() {
    insert_btn()

    let sticker_btn = document.querySelectorAll(".sticker_btn")
    for (i = 0; i < sticker_btn.length; i++){
        sticker_btn[i].addEventListener("click", (event) => {
            click_sticker_btn(event)
        })
    }

    document.addEventListener("click", async (event) => {
        let options_btn = event.target.closest("#options_btn")
        if (options_btn !== null) {
            click_option_btn()
        }
    })
}


var now_sticker
main()
