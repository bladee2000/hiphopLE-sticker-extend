// 클래스를 생성할때 크롬 스토리지에서 스티커 목록을 비동기로 불러옴
// 근데 생성자함수는 비동기가 안된데요
// 그래서 생성하고 getStickerFromLocal로 한번 불러와줘야됌



export default class Sticker {
    sticker_array;
    
    
    constructor() {
        
    }
    
    async getStickerFromLocal() {
        this.sticker_array = await chrome.storage.local.get("sticker_arr")
        this.sticker_array = this.sticker_array["sticker_arr"]
        
    }

    // 변경사항이 있을시 클래스 내부에도 저장하고 크롬 스토리지에도 저장함
    async saveStickerToLocal() {
        await chrome.storage.local.set({sticker_arr: this.sticker_array})
    }

    addSticker(sticker) {
        if (sticker.name == "") {
            alert("스티커 이름이 공백입니다!!")
            return false;
        }
        if (this.IsStickerNameOverlap(sticker.name)) {
            alert("스티커 이름이 중복됩니다")
            return false;
        }
        
        this.sticker_array.push(sticker)
        this.saveStickerToLocal()
        return true;
    }

    editSticker(original_name, sticker) {
        if (sticker.name == "") {
            alert("스티커 이름이 공백입니다!!")
            return false;
        }

        if (original_name != sticker.name){
            if (this.IsStickerNameOverlap(sticker.name, original_name)){
                alert("스티커 이름이 중복됩니다")
                return false;
            }
        }

        this.sticker_array = this.sticker_array.map((item) => {
            if (item.name == original_name) {
                return sticker;
            }else {
                return item;
            }
        })
        this.saveStickerToLocal()
        return true;
    }

    removeSticker(sticker_name) {
        this.sticker_array = this.sticker_array.filter((item) => item.name != sticker_name)
        this.saveStickerToLocal()
    }

    addStickerUseJSON(sticker) {
        if (!(sticker.name)) {
            alert("스티커 형식이 올바르지 않습니다!")
            return false;
        }
        if (!(sticker.header)) {
            sticker.header = ""
        }
        if (!(sticker.imgs)) {
            sticker.imgs = []
        }
        if (!(sticker.readme)) {
            sticker.readme = ""
        }

        sticker.name = sticker.name.replace(/^\s+|\s+$/g, '').replace(/["'`]/g, '')
        
        var i = 1;
        var temp_name = sticker.name;
        while (this.IsStickerNameOverlap(temp_name)) {
            temp_name = `${sticker.name} (${i})`
            i++;
        }
        sticker.name = temp_name

        return this.addSticker(sticker) ? true : false;

        
    }
    
    stickerChangeAll(sticker_array) {
        this.sticker_array = sticker_array
        this.saveStickerToLocal()
    }

    IsStickerNameOverlap(name, except_name) {
        for (const sticker of this.sticker_array) {
            if (name === sticker.name) {
                if (except_name !== sticker.name){
                    return true;
                }
            }
        }
        return false;
    }
}

