const MAX_SIZE = 530 * 300 ;

function generateOriginImg(data: Blob){
    const objectURL = URL.createObjectURL(data);
    const img = new Image();
    img.src = objectURL;
    return new Promise((resolve,reject)=>{
        img.onload = function(){
            URL.revokeObjectURL(objectURL);
            resolve(img);
        }
    })
}

export async function generateCompressImg(data: Blob){
    const image = await generateOriginImg(data) as HTMLImageElement
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    // 计算压缩比例
    const ratio = Math.min(MAX_SIZE / image.width!, MAX_SIZE / image.height!);
    // 设置canvas大小
    canvas.width = image.width * ratio;
    canvas.height = image.height * ratio;
    // 绘制压缩后的图片
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    document.appendChild(canvas)
    
    // 将canvas转换为图片
    //canvas.toBlob(resolve, 'image/jpeg', 0.9);
}