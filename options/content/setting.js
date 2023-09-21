import Component from "../core/Component.js";

export default class Setting extends Component {
    setup() {
        this.load_options()
    }

    template() {
        if (this.state === undefined){ return ""; }

        return `<h2>스티커 크기 조절</h2>
                <p>
                    댓글에 삽입될 스티커 이미지 크기를 조절합니다. <br>
                    <small>(기본 130 x 130, 최소 100 x 100, 최대 300 x 300)</small>
                </p>
                <input class="img_size_input" type="number" id="img_sizex" min=100 max=300 value="${this.state.options.comment_img_size.x}"> 
                x 
                <input class="img_size_input" type="number" id="img_sizey" min=100 max=300 value="${this.state.options.comment_img_size.y}">
                <br><br>
                <h2>스티커 클릭시 이동할 링크 (선택)</h2>
                <p>댓글의 스티커 이미지 클릭시 이동할 링크를 설정합니다.<br>
                    <small><a href="${this.state.options.readme_page}" target="_blank">기본값</a></small>
                </p>
                <input id="user_readme_input" placeholder="미입력시 기본값" value="${this.state.options.user_readme_page}">

        `
    }

    async load_options() {
        let options = await chrome.storage.local.get("options")
        this.setState({
            options: options["options"]
        })
        console.log(this.state.options)
    }
    
    get_img_size() {
        let values = []
        for (let input of ["x", "y"]) {
            let target = this.target.querySelector(`#img_size${input}`)
            console.log(target.value, target.min, target.max)
            if (target.value < target.min || target.value > target.max) {
                values.push(130)
            } else {
                values.push(Number(target.value))
            }
        }
        return values
    }

    option_update() {
        let [img_size_x, img_size_y] = this.get_img_size()
        let user_readme_input = this.target.querySelector("#user_readme_input").value.replace(/^\s+|\s+$/g, '').replace(/["'`]/g, '')
        let options = {
            ...this.state.options,
            comment_img_size: {
                x: img_size_x,
                y: img_size_y
            },
            user_readme_page: user_readme_input
        }

        console.log(options)
        chrome.storage.local.set({
            options: options
        })
        this.setState({
            options: options
        })
    }

    setEvent() {
        this.addEvent("focusout", "input", (event) => {
            this.option_update()
        })
        
        
    }
}