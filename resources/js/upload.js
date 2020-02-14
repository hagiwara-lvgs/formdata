let fileInput = $('#file');
fileInput.on('change', (e) => {
    let file = e.target.files[0];
    $.ajax({
        url: '/api/signature',
        type: 'POST',
        data: {
            name: file.name,
            size: file.size,
            type: file.type
        },
        dataType: 'json'
    }).then((response) => {
        let key;
        let formData = new FormData();
        
        for (key in response.data) {
            if (response.data.hasOwnProperty(key)) {
                formData.append(key, response.data[key]);
            }
        }

        // リサイズ
        let reader = new FileReader();
        reader.onload = (e) => {
            let image = new Image();
            image.onload = () => {
                console.log(1)
                let canvas = document.createElement('canvas');
                let ctx = canvas.getContext('2d');
                [canvas.width, canvas.height] = [image.width, image.height];
                ctx.drawImage(image, 0, 0);
                let base64 = canvas.toDataURL(file.type);
                let bin = atob(base64.replace(/^.*,/, ''));
                let buffer = new Uint8Array(bin.length);
                for (let i = 0; i < bin.length; i++) {
                    buffer[i] = bin.charCodeAt(i);
                }
                let blob = new Blob([buffer.buffer], {
                    type: file.type
                });
                console.log(blob)
                formData.append('file', blob);
                return $.ajax({
                    url: response.url,
                    type: 'POST',
                    data: formData,
                    dataType: 'xml',
                    processData: false,
                    contentType: false,
                }).catch((error) => {
                    console.log('署名作成エラー');
                    console.log(error);
                });
            };
            image.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }).then((response) => {
        let body = $('body');
        let img = document.createElement('img');
        img.src = $(response).find('Location').first().text();
        body.append(img);
    }).catch((error) => {
        console.log('アップロードエラー');
        console.log(error);
    })
});
