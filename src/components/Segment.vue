<template>
  <div class="segment_container">
    <img
      class="rawimg"
      :style="{
        width: diaplayData.displayWidth + 'px',
        height: diaplayData.displayHeight + 'px',
      }"
      src="../assets/house.jpeg.png"
      @mousedown="mouseDown"
      @mousemove="mouseMove"
      @mouseleave="mouseleave"
    />
    <canvas
      class="maskimg"
      ref="canvasRef"
      :style="{
        width: diaplayData.displayWidth + 'px',
        height: diaplayData.displayHeight + 'px',
      }"
    >
    </canvas>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import { Parsed } from "npyjs";
import { RawImgProps } from "../utils/type";
import { handleImageScale, npytoimg } from "../utils/maskUtil";
import { loadNpyTensor } from "../utils/loadNpy";
const selectedMaskList = reactive<Array<number>>([]);
const lastMouseMoveMakid = ref<number | null>(null);
const rawImgInfo = ref<RawImgProps>();
const npyFileData = ref<Parsed>();
const containerSize = {
  width: 1024,
  height: 512,
};
// 缩放后的宽高
const diaplayData = reactive<{ displayWidth: number; displayHeight: number }>({
  displayWidth: 0,
  displayHeight: 0,
});

const canvasRef = ref<HTMLCanvasElement | null>();

// 获取原始坐标
const getPosition = (e: MouseEvent) => {
  const el = e.target as HTMLElement;
  const rect = el.getBoundingClientRect();
  let x = e.clientX - rect.left;
  let y = e.clientY - rect.top;
  const imageScale = rawImgInfo ? rawImgInfo.value!.width / el.offsetWidth : 1;
  x *= imageScale;
  y *= imageScale;
  return { x: Math.ceil(x), y: Math.ceil(y) }
};

// 获取坐标对应maskid 613376
const getMaskId = ({x,y}: {x: number ,y:number}): number =>{
    console.log((x-1)*1024 + y)
    return npyFileData.value?.data[(y-1)*1024 + x] as number
}
// 移动时判断上一次和这次是否不一样，不一样就重新生成
const mouseMove = (e: MouseEvent) => {
    let position = getPosition(e);
    let maskId = getMaskId(position);
    if(lastMouseMoveMakid.value != maskId){
        // 说明没在已选中的masklist需要去生成；
        npytoimg(npyFileData.value!,[...selectedMaskList,maskId],canvasRef);
        lastMouseMoveMakid.value = maskId;
    }

};
// 移出时设置上一次为null，重新生成mask
const mouseleave = (e: MouseEvent) => {
    lastMouseMoveMakid.value = null;
    npytoimg(npyFileData.value!,[...selectedMaskList],canvasRef);
};

const mouseDown = (e: MouseEvent) => {
    let positon = getPosition(e)
    console.log(positon);
    let maskId = getMaskId(positon);

    let index = selectedMaskList.findIndex(id => id== maskId);
    if(index == -1){
        selectedMaskList.push(maskId);
    }else{
      selectedMaskList.splice(index,1);
    }
    npytoimg(npyFileData.value!,lastMouseMoveMakid.value == null ? [...selectedMaskList] : [...selectedMaskList,lastMouseMoveMakid.value],canvasRef)
    // console.log(maskId);
    // npytoimg(npyFileData.value!,[maskId],canvasRef)
};

onMounted(async() => {
  const width = 1024,
    height = 599;
  // 计算图片的缩放比例
  const widthRatio = containerSize.width / width;
  const heightRatio = containerSize.height / height;

  // 选择较小的比率进行缩放
  const scaleRatio = Math.min(widthRatio, heightRatio);
  diaplayData.displayHeight = height * scaleRatio;
  diaplayData.displayWidth = width * scaleRatio;
  // 设置画布
  canvasRef.value!.width = width;
  canvasRef.value!.height = height;

  rawImgInfo.value = {
    width,
    height,
    src: "../assets/house.jpeg",
    scale: scaleRatio,
  };

  npyFileData.value = await loadNpyTensor('/house.jpeg.npy',"int8");

  npytoimg(npyFileData.value!,[],canvasRef)

  // loadImg('../assets/house.jpeg')
});

const loadImg = async (path: string) => {
  try {
    debugger;
    const img = new Image();
    img.src = path;
    img.onload = () => {
      debugger;
      const { height, width, samScale } = handleImageScale(img);
      // 计算图片的缩放比例
      const widthRatio = containerSize.width / width;
      const heightRatio = containerSize.height / height;

      // 选择较小的比率进行缩放
      const scaleRatio = Math.min(widthRatio, heightRatio);
      if (width / height > containerSize.width / containerSize.height) {
        // 底图过宽时，展示的底图宽度100%，高度按比例展示
        diaplayData.displayWidth = containerSize.width;
        diaplayData.displayHeight = height * (containerSize.width / width);
      } else {
        // 底图过高时，展示的底图高度100%，宽度按比例展示
        diaplayData.displayHeight = containerSize.height;
        diaplayData.displayWidth = width * (containerSize.height / height);
      }

      diaplayData.displayHeight = containerSize.height * scaleRatio;
      diaplayData.displayWidth = containerSize.width * scaleRatio;
      rawImgInfo.value = {
        width: width,
        height: height,
        src: path,
        scale: scaleRatio,
      };
    };
  } catch (error) {
    console.log(error);
  }
};
</script>

<style>
.segment_container {
  width: 1024px;
  height: 512px;
  position: relative;
  padding: 0;
  margin: 0;
  text-align: left;
}
.rawimg {
  max-width: 100%; /* 图片最大宽度为父元素宽度 */
  height: auto; /* 高度自适应保持宽高比 */
  position: relative;
}
.maskimg {
  position: absolute;
  left: 0;
  top: 0;
  pointer-events: none;
  opacity: 0.6;
}

.hiddenmsg {
  /* visibility: hidden; */
}
</style>
