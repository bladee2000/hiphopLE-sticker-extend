import Component from "../core/Component.js";

export default class info extends Component {
    template() {
        let readme_page = "https://hiphople.com/workroom/26191867"
        let github_page = "https://github.com/bladee2000/hiphopLE-sticker-extend"
        
        return `<h1>힙합엘이 스티커 확장 프로그램</h1>
                <p>힙합엘이 스티커 확장 프로그램은 여러분이 원하시는 이미지를 쉽게 스티커처럼 사용할 수 있도록 도와드립니다.<br>
                   원하시는 스티커를 추가하여 사용하시거나 다른 사람들에게 공유해 보세요!
                </p><br>
                <ul>
                    <li><a href="${readme_page}" target="_blank">사용팁</a></li>
                    <li><a href="${github_page}" target="_blank">github</a></li>
                </ul>
                `
    }
}