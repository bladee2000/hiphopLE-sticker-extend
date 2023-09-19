import Component from "./core/Component.js";
import Navigation from "./navigation/navigation.js";
import stickerManager from "./content/stickerManager.js"
import setting from "./content/setting.js"
import info from "./content/info.js";

export default class App extends Component {
    setup() {
        this.state = {
            nowLocation: "stickerManager",
            contents: [
                {
                    name: "stickerManager",
                    displayName: "📝 스티커 관리",
                    component: stickerManager
                },
                {
                    name:"setting",
                    displayName: "🔧 설정",
                    component: setting
                },
                {
                    name:"info",
                    displayName: "ℹ️ 소개",
                    component: info
                } 
            ]
        }
        
        
    }
    template () {
        return `
        <div id="nav"></div>
        <div id="content">
            <div class="component" id="${this.state.nowLocation}"></div>
        </div>
        `
    }

    mounted() {
        const nav = document.querySelector("#nav")
        new Navigation(nav, {
            contents: this.state.contents,
            nowLocation: this.state.nowLocation,
            clickNavBtn: this.clickNavBtn.bind(this)
        })
    }

    afterFirstRender() {
        this.loadContent(this.state.nowLocation)
    }

    clickNavBtn(contentName) {
        if (this.state.nowLocation != contentName) {
            this.loadContent(contentName)
        }
    }   

    loadContent(contentName) {
        console.log(contentName)
        this.setState({nowLocation: contentName})
        for (const content of this.state.contents){
            if (content.name == contentName){
                new content.component(document.querySelector(`#${contentName}`))
            }
        }
    }

    setEvent() {
        // 드롭다운 열려있을시 드롭다운 바깥쪽 클릭하면 닫히게
        document.body.addEventListener("click", (event) => {
            const active_dropdown = document.querySelector(".dropdown_active")
            if (active_dropdown !== null) {
                if (event.target.closest(".dropdown") === null) {
                    active_dropdown.classList.remove("dropdown_active")
                }
            }
        })

        // editer_sticker_img_list 드래그 오버시 하이라이트
        this.target.addEventListener("dragover", (event) => {
            event.preventDefault();
            if (event.dataTransfer.types.includes("dnd_event")) { return; }

            let img_list = this.target.querySelector(".editer_sticker_img_list")
            if (img_list === null){ return; }

            if (event.target.closest(".editer_sticker_img_list") !== null) {
                img_list.classList.add("img_list_dragover")
            } else {
                img_list.classList.remove("img_list_dragover")
            }
        })

        
    }
}


new App(document.querySelector("#App"))