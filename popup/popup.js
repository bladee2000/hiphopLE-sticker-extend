document.addEventListener("DOMContentLoaded", () => {
    let options_btn = document.getElementById("options_btn")
    console.log(options_btn)
    options_btn.addEventListener("click", () =>{
        chrome.runtime.openOptionsPage();
    })
})


