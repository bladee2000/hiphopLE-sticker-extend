import Component from "../core/Component.js";


export default class Navigation extends Component {
    template() {
        var lists = ""
        for (const content of this.props.contents) {
            var nowLoc = ""
            if (content.name == this.props.nowLocation){
                nowLoc = " nowLocation"
            }
            lists += `<div class="navBtn${nowLoc}" data-content="${content.name}">
                        ${content.displayName}
                    </div>`
            
        }
        return `${lists}`
    }

    setEvent() {
        this.addEvent("click", ".navBtn", (event)=>{
            this.props.clickNavBtn(event.target.dataset.content)
        })
    }
}