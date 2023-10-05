import Component from "../core/Component.js";
import Sticker from "../storage/sticker.js"
import svg_icon from "../../img/svg_icon.js";

export default class StickerManager extends Component{
    setup() {
        this.sticker = new Sticker()
        this.state = {
            now_editer_sticker: "",
            now_editer_role: "",
            sticker_arr: undefined,
            focus_bool: false
        }
        this.stickerListScroll = 0
    }

    template() {
        let sitckerList = this.target.querySelector(".sticker_list")
        if (sitckerList !== null){this.stickerListScroll = sitckerList.scrollTop}
        
        return `
            <div data-component="stickerList"></div>
            <div data-component="stickerEditer"></div>
            `
    } 
    
    afterFirstRender() {
        this.loadstorage()
    }
    
    async loadstorage() {
        await this.sticker.getStickerFromLocal()
        let options = await chrome.storage.local.get("options")
        
        this.setState({ 
            sticker_arr: this.sticker.sticker_array ,
            options: options["options"]
        })
        console.log(this.state)
    }
    
    mounted(){
        if (!(this.state.sticker_arr === undefined)){
            const stickerlist = this.target.querySelector('[data-component="stickerList"]')
            const stickerEditer = this.target.querySelector('[data-component="stickerEditer"]')
            new StickerList(stickerlist, {
                sticker_arr: this.state.sticker_arr,
                now_editer_sticker: this.state.now_editer_sticker,
                focus_bool: this.state.focus_bool,
                drag_end_callback: this.stickerChangeAll.bind(this)
            })
            if (this.state.now_editer_role != ""){
                this.sticker_editer = new StickerEditer(stickerEditer, {
                    role: this.state.now_editer_role,
                    sticker: this.state.now_editer_sticker,
                    options: this.state.options
                })
            }
            let sticker_list = this.target.querySelector(".sticker_list")
            sticker_list.scrollTo(0, this.stickerListScroll)
        }
        console.log(this.state)
    }

    // 
    addSticker(sticker) {
        if(this.sticker.addSticker(sticker)){
            this.setState({
                sticker_arr: this.sticker.sticker_array,
                now_editer_role: "edit",
                now_editer_sticker: sticker,
                focus_bool: true
            })
            alert("추가되었습니다!")
            let sticker_list = this.target.querySelector(".sticker_list")
            sticker_list.scrollTop = sticker_list.scrollHeight
        }
    }

    editSticker(original_name, sticker) {
        if (this.sticker.editSticker(original_name, sticker)){
            this.setState({ 
                now_editer_sticker: sticker,
                sticker_arr: this.sticker.sticker_array,
                focus_bool: true
            })
            alert("저장되었습니다!")
        }
    }

    removeSticker(sticker_name) {
        this.sticker.removeSticker(sticker_name)
        if (this.state.now_editer_sticker.name == sticker_name){
            this.setState({
                sticker_arr: this.sticker.sticker_array,
                now_editer_role: "",
                now_editer_sticker: "",
                focus_bool: false
            })
        } else {
            this.setState({ 
                sticker_arr: this.sticker.sticker_array,
                focus_bool: false
            })
        }
        
    }

    addstickerUseJSON(json) {
        var sticker
        try{
            sticker = JSON.parse(json)
        } catch(e) {
            console.log(e.name)
            if (e.name == "SyntaxError"){
                alert("올바르지 않은 JSON 형식입니다!")
                return false;
            } else {
                throw new Error(e)
            }
        }

        if (this.sticker.addStickerUseJSON(sticker)) {
            this.setState({
                sticker_arr: this.sticker.sticker_array,
                now_editer_role: "edit",
                now_editer_sticker: sticker,
                focus_bool: true
            })
        }

        let sticker_list = this.target.querySelector(".sticker_list")
        sticker_list.scrollTop = sticker_list.scrollHeight
    }

    stickerChangeAll(sticker_array) {
        this.sticker.stickerChangeAll(sticker_array)
        this.setState({
            sticker_arr: this.sticker.sticker_array,
            focus_bool: false
        })
    }

    setEvent() {
        // 이벤트 타겟 속성을 참고해야할때 이벤트 버블링 생각하기 
        // https://ko.javascript.info/event-delegation
        
        this.addEvent("click", ".sticker_addBtn", (event) => {
            this.setState({
                now_editer_role: "add",
                now_editer_sticker: "",
                focus_bool: false
            })
            
        })

        this.addEvent("click", ".sticker_add_UseJsonBtn", (event) => {
            let json = prompt("JSON 형식의 스티커 코드를 입력해주세요")
            if (json !== null) {
                this.addstickerUseJSON(json)
            }
        })

        this.addEvent("click", ".sticker_editBtn", (event) => {
            const editBtn = event.target.closest(".sticker_editBtn")
            const sticker = this.state.sticker_arr.find((item) => item.name == editBtn.dataset.stickername)
            this.setState({
                now_editer_role: "edit",
                now_editer_sticker: sticker,
                focus_bool: false
            })
        })

        this.addEvent("click", ".sticker_removeBtn", (event) => {
            let remove_bool = confirm(`"${event.target.dataset.stickername}" 스티커를 정말 삭제하시겠습니까?`)
            if (remove_bool) {
                this.removeSticker(event.target.dataset.stickername)
            }
        })
        
        this.addEvent("click", ".editer_saveBtn", (event) => {
            if (this.state.now_editer_role == "add") {
                this.addSticker(this.sticker_editer.state.sticker)
            } else if (this.state.now_editer_role == "edit") {
                const original_name = this.sticker_editer.state.original_name
                const sticker = this.sticker_editer.state.sticker
                this.editSticker(original_name, sticker)
            }
        })
        
        this.addEvent("click", ".sticker_Json_shareBtn", (event) => {
            let item = event.target.closest(".sticker_list_item")
            let sticker = this.state.sticker_arr[item.tabIndex]
            console.log(JSON.stringify(sticker))
            navigator.clipboard.writeText(JSON.stringify(sticker)).then(() => {
                alert("클립보드에 복사되었습니다!")
            })
        })
        
        
    }
}

class StickerList extends Component {
    setup() {
        this.dropdownSvgIcon = svg_icon.dropdownBtn
    }

    template() {
        let now_sticker_name = this.props.now_editer_sticker.name
        return `
        
        <ul class="sticker_list">
            ${this.props.sticker_arr.map((sticker, index) =>
                `
                
                <li class="sticker_list_item ${now_sticker_name === sticker.name && this.props.focus_bool ? "focus_list_item" : ""}" 
                  data-stickername="${sticker.name}" tabindex="${index}">
                    <img class="list_img" src="${sticker.header}"></img>
                    <div class="list_item_title">${sticker.name}</div>
                    <div class="dropdown_container">
                        <div class="dropdownBtn">${this.dropdownSvgIcon}</div>
                        <div class="dropdown">
                            <div class="sticker_editBtn dropdown_content_btn" data-stickername="${sticker.name}">
                                수정
                            </div>
                            <div class="sticker_Json_shareBtn dropdown_content_btn">
                                JSON으로 공유
                            </div>
                            <div class="sticker_removeBtn dropdown_content_btn" data-stickername="${sticker.name}">
                                <b>삭제</b>
                            </div>
                        </div>
                    </div>
                    
                </li>`
                ).join("")}
        </ul>
        
        <div class="sticker_util_bar">
                <div class="sticker_addBtn utilBtn">스티커 직접 추가</div>
                <div class="sticker_add_UseJsonBtn utilBtn">JSON으로 추가</div>
        </div>
        `
    }

    mounted() {
        if (this.props.focus_bool){
            let foucs_element = this.target.querySelector(`li[data-stickername="${this.props.now_editer_sticker.name}"]`)
            foucs_element.focus()
            
            setTimeout(() => {
                foucs_element.classList.remove("focus_list_item")
            }, 1300);
            //
        }

        let target = this.target.querySelector(".sticker_list")
        new DnDchangingOrder(target, "list", this.props.sticker_arr, this.props.drag_end_callback)
        
    }

    setEvent() {
        this.addEvent("click", ".dropdownBtn", (event) => {
            const dropdown = event.target.closest(".dropdown_container").querySelector(".dropdown")
            const dropdown_actvie = this.target.querySelector(".dropdown_active")
            if (dropdown_actvie !== null) {
                dropdown_actvie.classList.remove("dropdown_active")
                if (dropdown.isSameNode(dropdown_actvie)) {
                    return;
                }
            }

            if (dropdown.classList.contains("dropdown_active")) {
                dropdown.classList.remove("dropdown_active")
            } else {
                dropdown.classList.add("dropdown_active")
            }
            event.stopPropagation()
        })

    }
}

class StickerEditer extends Component {
    setup() {
        if (this.props.role == "add"){
            this.state = {
                role: this.props.role,
                title: "스티커 추가",
                original_name: "",
                sticker: {
                    header: "",
                    name: "",
                    imgs: [],
                    readme: ""
                }
            }
            
        }

        if (this.props.role == "edit"){
            this.state = {
                role: this.props.role,
                title: `스티커 수정 - ${this.props.sticker.name}`,
                original_name: this.props.sticker.name,
                sticker: this.props.sticker
            }
            
        }
    }

    template() {
        function img_tag(img) {
            if (img.includes(".mp4")) {
                return `<video src="${img}" loop="true" autoplay="true" muted="true">`
            } else {
                return `<img src="${img}">`
            }
        }
        let readme_page = this.props.options.readme_page

        return `
            <div class="editer_titlebar">
                <div class="editer_title">${this.state.title}</div>
                <button class="editer_saveBtn">저장</button> 
            </div>

            <div class="editer_infoEdit">
                <div class="editer_header">
                    <div class="editer_img_hover">대표 이미지</div>
                    <div class="editer_header_img">
                        <img src="${this.state.sticker.header}" data-imgkind="header" draggable="false"></img>
                    </div>
                </div>
                <div class="editer_stickerinfo">
                    <div>스티커 제목</div>
                    <input id="name_input" value="${this.state.sticker.name}" placeholder="스티커 제목(최대 25자)" maxlength="25"></input>
                    <div>대표 이미지</div>
                    <input id="header_input" value="${this.state.sticker.header}" placeholder="이미지 주소 입력"></input>
                    <div>클릭시 이동할 링크 (선택)</div>
                    <input id="readme_input" value="${this.state.sticker.readme}" placeholder="주소 입력 (선택)"></input>
                </div>
            </div>

            <div class="img_add">
                <div class="editer_img_add_title_bar">
                    <div class="editer_img_add_title">이미지 추가</div> 
                    <div class="editer_readme"><a href="${readme_page}" target="_blank">사용팁</a>
                </div>
                </div>
                <div class="editer_img_add_content">
                    <input placeholder="이미지 주소 입력후 엔터" id="img_addInput"></input>
                    <div>or 드래그해서 추가 <small>(로컬파일 안됨!)</small></div>
                </div>
            </div>

            <div class="editer_sticker_img_list">
                
                ${this.state.sticker.imgs.map((img, index) => 
                    `<div class="editer_sticker_img draggable" data-index="${index}">
                        <div class="editer_img_hover">
                            <button class="editer_deleteBtn" data-index="${index}" draggable="false">삭제</button>
                        </div>
                        <div class="editer_img">
                            ${img_tag(img)}
                        </div>
                    </div>`
                ).join("")}
            </div>
        `
    }

    mounted() {
        let target = this.target.querySelector(".editer_sticker_img_list")
        new DnDchangingOrder(target, "editer", this.state.sticker.imgs, this.changingImgListOrder.bind(this))
    }

    changingImgListOrder(arr) {
        let before_scrolltop = this.target.querySelector(".editer_sticker_img_list").scrollTop
        this.setState({
            sticker:{
                ...this.state.sticker,
                imgs: arr
            }
        })

        let img_list = this.target.querySelector(".editer_sticker_img_list")
        img_list.scrollTo(0, before_scrolltop)
    }

    haederChange(event){
        if (event.target.value == this.state.sticker.header) {
            return ;
        }
        
        this.setState({
            sticker: {
                ...this.state.sticker,
                header: event.target.value.replace(/["'`]/g, '')
            }
        })
    }

    readmeChange(event) {
        if (event.target.value == this.state.sticker.readme) {
            return ;
        }
        
        this.setState({
            sticker: {
                ...this.state.sticker,
                readme: event.target.value.replace(/["'`]/g, '')
            }
        })
    }

    nameChange(event) {
        if (event.target.value == this.state.sticker.name) {
            return ;
        }
        
        this.setState({
            sticker: {
                ...this.state.sticker,
                name: event.target.value.replace(/^\s+|\s+$/g, '').replace(/["'`]/g, '')
            }
        })
    }

    imgAdd(url) {
        if (url.includes(".mp4")){
            if (!(url.includes("hiphople.com"))){
                alert("mp4 파일은 힙합엘이에서 업로드 된 파일만 사용 가능합니다!")
                return;
            }
        }

        const img_arr = [...this.state.sticker.imgs]
        img_arr.push(url.replace(/["'`]/g, ''))
        this.setState({
            sticker:{
                ...this.state.sticker,
                imgs: img_arr
            }
        })
        let img_list = this.target.querySelector(".editer_sticker_img_list")
        img_list.scrollTop = img_list.scrollHeight
    }

    setEvent() {
        this.addEvent("click", ".editer_deleteBtn", (event) => {
            let before_scrolltop = this.target.querySelector(".editer_sticker_img_list").scrollTop
            const target_index = event.target.dataset.index
            const imgs_arr = this.state.sticker.imgs.filter((item, index) => index != target_index)
            
            this.setState({
                sticker:{
                    ...this.state.sticker,
                    imgs: imgs_arr
                }
            })
            
            let img_list = this.target.querySelector(".editer_sticker_img_list")
            img_list.scrollTo(0, before_scrolltop)
            
        })

        this.addEvent("keyup", "#img_addInput", (event) => {
            if (event.target.value == ""){
                return ;
            }

            if (event.keyCode == 13) {
                this.imgAdd(event.target.value)
                this.target.querySelector("#img_addInput").focus()
            }
        })


        this.addEvent("keyup", "input", (event) => {
            if (event.keyCode == 13 && event.target.id == "header_input") {
                this.haederChange(event)
            }
            if (event.keyCode == 13 && event.target.id == "name_input") {
                this.nameChange(event)
            }
            if (event.keyCode == 13 && event.target.id == "readme_input") {
                this.readmeChange(event)
            }
        })

        this.addEvent("focusout", "input", (event) => {
            if (event.target.id == "header_input") {
                this.haederChange(event)
            }
            if (event.target.id == "name_input") {
                this.nameChange(event)
            }
            if (event.target.id == "readme_input") {
                this.readmeChange(event)
            }
        })

        // 드래그 앤 드롭으로 파일 추가
        this.addEvent("drop", ".editer_sticker_img_list", (event) => {
            event.preventDefault();
            document.querySelector(".editer_sticker_img_list").classList.remove("img_list_dragover")
            if (event.dataTransfer.types.includes("dnd_event")) {
                return;
            }

            let img_html = event.dataTransfer.getData("text/html")
            if (img_html.indexOf("data:") !== -1) {
                alert("추가할 수 없는 이미지 주소입니다!")
                return;
            }

            let imgDiv = document.createElement("div")
            imgDiv.innerHTML = event.dataTransfer.getData("text/html")
            if (imgDiv.querySelector("img") === null) {
                return;
            }
            
            this.imgAdd(imgDiv.querySelector("img").src)
        })
        
    }
}

class DnDchangingOrder {
    constructor(target, id, arr, drag_end_callback) {
        this.target = target
        this.dragging_className = `dragging_${id}`
        this.original_array = JSON.parse(JSON.stringify(arr))
        this.callback = drag_end_callback
        this.setup()
    }

    setup() {
        let children = [...this.target.children]

        for(let [index, element] of children.entries()) {
            element.dataset.index = index
            element.classList.add("draggable")
            element.draggable = "true"
            
            element.addEventListener("dragstart", (event) => {
                element.classList.add(this.dragging_className, "dragging")
                event.dataTransfer.setData("dnd_event", "dnd_event")
            })

            element.addEventListener("dragenter", (event) => {
                let now_dragging = this.target.querySelector(`.${this.dragging_className}`)
                if (now_dragging === null) {
                    return;
                }
                
                let target = event.target.closest(".draggable")
                
                if (target.isSameNode(now_dragging)) {
                    return;
                }
                
                let nodes = [...this.target.children]
                let dragging_index = nodes.indexOf(now_dragging)
                let target_index = nodes.indexOf(target)
                
                if (dragging_index > target_index){
                    target.insertAdjacentElement("beforebegin", now_dragging)
                } else {
                    target.insertAdjacentElement("afterend", now_dragging)
                }
                
            })

            element.addEventListener("dragend", (event) => {
                
                element.classList.remove(this.dragging_className, "dragging")

                let nodes = [...this.target.children]
                let toindex = nodes.indexOf(element)
                let fromindex = element.dataset.index
                if (toindex == fromindex) {return;}
                
                this.original_array.splice(toindex, 0 , this.original_array.splice(fromindex, 1)[0])
                this.callback(this.original_array)
            })
        }
    }
}