import { Parsed } from 'npyjs'
import { ShallowRef } from 'vue'

// 生成mask
export function npytoimg(input: Parsed, selectedMaskId: Array<Number>, canvasRef: ShallowRef<HTMLCanvasElement>) {
    const [height,width] = input.shape;
    const rawData = input.data;
    console.log(`rawimg info: width ${width} , height: ${height}`);
    // canvas imgdata: 每个像素点有4位组成
    let imageDataArray = new Uint8Array(width * height * 4);
    for (let i = 0; i < imageDataArray.length; i++) {
        let index = 4 * i;
        let hasSelectedId = maskIdContain(selectedMaskId, rawData[i] as number)
        imageDataArray[index] = hasSelectedId ? 100 : 0;
        imageDataArray[index + 1] = hasSelectedId ? 100 : 0;
        imageDataArray[index + 2] = hasSelectedId ? 100 : 0;
        imageDataArray[index + 3] = hasSelectedId ? 255 : 0;
    }

    const canvas = canvasRef.value;
    const ctx = canvas.getContext('2d')!;
    const imageData = new Uint8Array(imageDataArray);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // 创建 ImageData 对象
    const image = ctx.createImageData(width, height);
    //将像素数据复制到 ImageData 对象中
    image.data.set(imageData);
    //将 ImageData 对象绘制到 canvas 上
    ctx.putImageData(image, 0, 0);

    //gen(image)
}

// @ts-ignore 生成mask的canvas
export function gen(img){
    const el = document.createElement('canvas');
    const ctx = el.getContext('2d');
    el.width = 1024;
    el.height = 599;
    ctx?.putImageData(img,0,0);
    document.body.appendChild(el)
}

// 是否在选中的maskId里
export function maskIdContain(selectedMaskId: Array<Number>, id: number): boolean {
    return selectedMaskId.includes(id)
}

// Copyright (c) Meta Platforms, Inc. and affiliates.
// All rights reserved.

// This source code is licensed under the license found in the
// LICENSE file in the root directory of this source tree.

// Helper function for handling image scaling needed for SAM
export const handleImageScale = (image: HTMLImageElement) => {
    // Input images to SAM must be resized so the longest side is 1024
    const LONG_SIDE_LENGTH = 1024;
    const w = image.naturalWidth;
    const h = image.naturalHeight;
    const samScale = LONG_SIDE_LENGTH / Math.max(h, w);
    return { height: h, width: w, samScale };
};