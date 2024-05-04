import npyjs , { Parsed } from 'npyjs'

export async function loadNpyTensor(tensorFile: string , dType: string) : Promise<Parsed> {
    const npyLoader = new npyjs();
    const npData = await npyLoader.load(tensorFile);
    console.log(npData)
    return npData
}