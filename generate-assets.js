/**
 * 像素机甲美术资源生成器
 * 把字符数组 sprite 渲染成独立的 PNG 文件
 * 用法: node generate-assets.js
 * 输出: assets/ 目录
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// ============ 调色板 (与游戏一致) ============
const PAL = {
  '.': null,
  'k': [13,13,24],     'd': [43,43,61],     'g': [92,92,114],
  'l': [155,155,176],  'w': [244,244,255],
  'r': [216,50,75],    'R': [255,102,119],
  'b': [47,111,224],   'B': [95,160,255],
  'y': [255,214,74],   'o': [255,138,31],
  'c': [57,240,216],   'p': [176,69,240],
};

// ============ Sprite 定义 (与 index.html 一致) ============
const SPRITES = {
  idle: [
    "......kkkk......",".....kwwwwk.....","....kwwwwwwk....","....kwwllwwk....",
    "....kwwllwwk....","....kllllllk....","...kllrrrrllk...","..kllrrrrrrllk..",
    ".kllrryyyyrrllk.",".kllrrrrrrrrllk.","...kllrrrrllk...","....kllllllk....",
    "....kllggllk....","....kkllllkk....",".....kk..kk.....",".....kk..kk.....",
    "....kkk..kkk....","....kk....kk....",
  ],
  walk1: [
    "......kkkk......",".....kwwwwk.....","....kwwwwwwk....","....kwwllwwk....",
    "....kwwllwwk....","....kllllllk....","...kllrrrrllk...","..kllrrrrrrllk..",
    ".kllrryyyyrrllk.",".kllrrrrrrrrllk.","...kllrrrrllk...","....kllllllk....",
    "....kllggllk....","....kkllllkk....","....kk..kk......","....kk..kk......",
    "...kkk..kkk.....","..kk....kk......",
  ],
  walk2: [
    "......kkkk......",".....kwwwwk.....","....kwwwwwwk....","....kwwllwwk....",
    "....kwwllwwk....","....kllllllk....","...kllrrrrllk...","..kllrrrrrrllk..",
    ".kllrryyyyrrllk.",".kllrrrrrrrrllk.","...kllrrrrllk...","....kllllllk....",
    "....kllggllk....","....kkllllkk....","......kk..kk....","......kk..kk....",
    ".....kkk..kkk...","......kk....kk..",
  ],
  attack: [
    "......kkkk......",".....kwwwwk.....","....kwwwwwwk....","....kwwllwwk....",
    "....kwwllwwk....","....kllllllk....","klllkllrrrrllk..","klllkrrrrrrrlk..",
    "klllkrryyyyrrk..","...kllrrrrrrrk..","...kllrrrrllk...","....kllllllk....",
    "....kllggllk....","....kkllllkk....",".....kk..kk.....",".....kk..kk.....",
    "....kkk..kkk....","....kk....kk....",
  ],
  jump: [
    "......kkkk......",".....kwwwwk.....","....kwwwwwwk....","....kwwllwwk....",
    "....kwwllwwk....","....kllllllk....","...kllrrrrllk...","..kllrrrrrrllk..",
    ".kllrryyyyrrllk.",".kllrrrrrrrrllk.","...kllrrrrllk...","....kllllllk....",
    "....kllggllk....","....kkllllkk....","....kkk..kkk....","..kk........kk..",
    "..kk........kk..","...kkk..kkk.....",
  ],
  roll: [
    "......kkkk......",".....kwwwwk.....","....kwwwwwwk....","....kwwllwwk....",
    "....kwwllwwk....","....kllllllk....","...kllrrrrllk...","..kllrrrrrrllk..",
    ".kllrryyyyrrllk.",".kllrrrrrrrrllk.","...kllrrrrllk...","....kllllllk....",
    "....kllggllk....","....kkllllkk....","..kkk......kkk..","..kk........kk..",
    "..kk........kk..","..kk........kk..",
  ],
};

const P2M = {'r':'b','R':'B'};
function recolor(spr, map){ return spr.map(r=>r.split('').map(c=>map[c]||c).join('')); }
function flipH(spr){ return spr.map(r=>r.split('').reverse().join('')); }

// ============ PNG 编码器 (纯 zlib, 无第三方依赖) ============
const CRC_TABLE = (()=>{
  const t = new Int32Array(256);
  for(let n=0;n<256;n++){
    let c = n;
    for(let k=0;k<8;k++) c = (c & 1) ? (0xEDB88320 ^ (c>>>1)) : (c>>>1);
    t[n] = c;
  }
  return t;
})();
function crc32(buf){
  let c = 0xFFFFFFFF;
  for(let i=0;i<buf.length;i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c>>>8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}
function chunk(type, data){
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length,0);
  const typeBuf = Buffer.from(type,'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf,data])),0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}
/**
 * 把像素数组编码为 PNG
 * @param {number[]} pixels - [r,g,b,a, r,g,b,a, ...]
 * @param {number} w
 * @param {number} h
 */
function encodePNG(pixels, w, h){
  // 每行前加 filter byte (0=None)
  const raw = Buffer.alloc((w*4+1)*h);
  let p = 0;
  for(let y=0;y<h;y++){
    raw[p++] = 0; // filter: None
    for(let x=0;x<w;x++){
      const idx = (y*w+x)*4;
      raw[p++] = pixels[idx];
      raw[p++] = pixels[idx+1];
      raw[p++] = pixels[idx+2];
      raw[p++] = pixels[idx+3];
    }
  }
  const idat = zlib.deflateSync(raw, {level:9});

  const sig = Buffer.from([137,80,78,71,13,10,26,10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w,0); ihdr.writeUInt32BE(h,4);
  ihdr[8]=8;   // bit depth
  ihdr[9]=6;   // color type RGBA
  ihdr[10]=0;  // compression
  ihdr[11]=0;  // filter
  ihdr[12]=0;  // interlace

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/**
 * 把 sprite 字符数组渲染成 PNG 像素数组
 * @param {string[]} spr
 * @param {number} scale - 放大倍数
 * @param {boolean} flip - 水平翻转
 */
function spriteToPixels(spr, scale, flip){
  const sw = spr[0].length, sh = spr.length;
  const w = sw*scale, h = sh*scale;
  const pixels = new Array(w*h*4);
  for(let y=0;y<h;y++){
    const sy = Math.floor(y/scale);
    const row = flip ? flipH([spr[sy]])[0] : spr[sy];
    for(let x=0;x<w;x++){
      const sx = Math.floor(x/scale);
      const ch = row[sx];
      const col = PAL[ch];
      const idx = (y*w+x)*4;
      if(col){
        pixels[idx]=col[0]; pixels[idx+1]=col[1]; pixels[idx+2]=col[2]; pixels[idx+3]=255;
      } else {
        pixels[idx]=0; pixels[idx+1]=0; pixels[idx+2]=0; pixels[idx+3]=0;
      }
    }
  }
  return {pixels, w, h};
}

function savePNG(filepath, pixels, w, h){
  const png = encodePNG(pixels, w, h);
  fs.writeFileSync(filepath, png);
  console.log(`  ✓ ${path.basename(filepath)} (${w}x${h}, ${png.length} bytes)`);
}

// ============ 主流程 ============
const OUT = path.join(__dirname, 'assets');
const SCALE = 6; // 放大6倍: 16x18 -> 96x108

if(!fs.existsSync(OUT)) fs.mkdirSync(OUT, {recursive:true});
// 子目录
['mecha_red','mecha_blue','scene'].forEach(d=>{
  const p = path.join(OUT,d);
  if(!fs.existsSync(p)) fs.mkdirSync(p,{recursive:true});
});

console.log('=== 生成机甲美术资源 (PNG) ===');
console.log(`原始尺寸: 16x18, 放大倍数: ${SCALE}x -> ${16*SCALE}x${18*SCALE}\n`);

// 红色机甲 (P1)
console.log('[红色机甲 P1]');
for(const [name, spr] of Object.entries(SPRITES)){
  const {pixels,w,h} = spriteToPixels(spr, SCALE, false);
  savePNG(path.join(OUT,'mecha_red',`${name}.png`), pixels, w, h);
}

// 蓝色机甲 (P2)
console.log('\n[蓝色机甲 P2]');
for(const [name, spr] of Object.entries(SPRITES)){
  const spr2 = recolor(spr, P2M);
  const {pixels,w,h} = spriteToPixels(spr2, SCALE, false);
  savePNG(path.join(OUT,'mecha_blue',`${name}.png`), pixels, w, h);
}

// 翻转版本 (左朝向) - 只导出关键姿态
console.log('\n[朝左翻转版本 (红色)]');
for(const name of ['idle','attack','walk1']){
  const spr = SPRITES[name];
  const {pixels,w,h} = spriteToPixels(spr, SCALE, true);
  savePNG(path.join(OUT,'mecha_red',`${name}_flip.png`), pixels, w, h);
}

// ============ Sprite Sheet (所有姿态拼一张) ============
console.log('\n[Sprite Sheet 预览图]');
const sheetCols = 6, sheetRows = 4; // 6姿态 x (红/蓝/红翻转/蓝翻转)
const cellW = 16*SCALE, cellH = 18*SCALE;
const sheetW = sheetCols*cellW, sheetH = sheetRows*cellH;
const sheetPixels = new Array(sheetW*sheetH*4).fill(0);
function blit(srcPixels, sw, sh, dx, dy){
  for(let y=0;y<sh;y++) for(let x=0;x<sw;x++){
    const si=(y*sw+x)*4, di=((dy+y)*sheetW+(dx+x))*4;
    sheetPixels[di]=srcPixels[si]; sheetPixels[di+1]=srcPixels[si+1];
    sheetPixels[di+2]=srcPixels[si+2]; sheetPixels[di+3]=srcPixels[si+3];
  }
}
const order = ['idle','walk1','walk2','attack','jump','roll'];
// 行0: 红色正向
order.forEach((n,i)=> blit(spriteToPixels(SPRITES[n],SCALE,false).pixels, cellW, cellH, i*cellW, 0));
// 行1: 蓝色正向
order.forEach((n,i)=> blit(spriteToPixels(recolor(SPRITES[n],P2M),SCALE,false).pixels, cellW, cellH, i*cellW, cellH));
// 行2: 红色翻转
order.forEach((n,i)=> blit(spriteToPixels(SPRITES[n],SCALE,true).pixels, cellW, cellH, i*cellW, 2*cellH));
// 行3: 蓝色翻转
order.forEach((n,i)=> blit(spriteToPixels(recolor(SPRITES[n],P2M),SCALE,true).pixels, cellW, cellH, i*cellW, 3*cellH));
savePNG(path.join(OUT,'sprite_sheet.png'), sheetPixels, sheetW, sheetH);

// ============ 场景元素 ============
console.log('\n[场景元素]');

// 月亮
const moonW=40, moonH=40;
const moonPx = new Array(moonW*moonH*4).fill(0);
for(let y=0;y<moonH;y++)for(let x=0;x<moonW;x++){
  const dx=x-moonW/2, dy=y-moonH/2;
  const d=Math.sqrt(dx*dx+dy*dy);
  const i=(y*moonW+x)*4;
  if(d<14){ moonPx[i]=230; moonPx[i+1]=230; moonPx[i+2]=255; moonPx[i+3]=255; }
  else if(d<18 && Math.abs(dx-3)<12 && Math.abs(dy-3)<12){ moonPx[i]=42; moonPx[i+1]=42; moonPx[i+2]=58; moonPx[i+3]=255; }
}
savePNG(path.join(OUT,'scene','moon.png'), moonPx, moonW, moonH);

// 星星 (单个)
const starW=3, starH=3;
const starPx=[
  0,0,0,0, 255,255,255,255, 0,0,0,0,
  255,255,255,255, 255,255,255,255, 255,255,255,255,
  0,0,0,0, 255,255,255,255, 0,0,0,0,
];
savePNG(path.join(OUT,'scene','star.png'), starPx, starW, starH);

// 能量弹 (红色)
const beamW=24, beamH=8;
const beamPx=new Array(beamW*beamH*4).fill(0);
for(let y=0;y<beamH;y++)for(let x=0;x<beamW;x++){
  const i=(y*beamW+x)*4;
  if(y>=2 && y<=5 && x>=2 && x<=beamW-3){
    if(y>=3 && y<=4 && x>=4 && x<=beamW-7){ beamPx[i]=255; beamPx[i+1]=214; beamPx[i+2]=74; beamPx[i+3]=255; }
    else { beamPx[i]=255; beamPx[i+1]=85; beamPx[i+2]=102; beamPx[i+3]=255; }
  }
  if(y>=3 && y<=4 && x>=beamW-6 && x<=beamW-3){ beamPx[i]=255; beamPx[i+1]=255; beamPx[i+2]=255; beamPx[i+3]=255; }
}
savePNG(path.join(OUT,'scene','beam_red.png'), beamPx, beamW, beamH);

// 装饰柱
const pillarW=12, pillarH=28;
const pillarPx=new Array(pillarW*pillarH*4).fill(0);
for(let y=0;y<pillarH;y++)for(let x=0;x<pillarW;x++){
  const i=(y*pillarW+x)*4;
  const isEdge = (x===0||x===pillarW-1||y===0||y===pillarH-1);
  const isTop = (y>=0&&y<=3);
  if(isTop){ pillarPx[i]=43; pillarPx[i+1]=35; pillarPx[i+2]=64; pillarPx[i+3]=255; }
  else if(isEdge){ pillarPx[i]=43; pillarPx[i+1]=35; pillarPx[i+2]=64; pillarPx[i+3]=255; }
  else if(x>=4 && x<=7){ pillarPx[i]=92; pillarPx[i+1]=92; pillarPx[i+2]=114; pillarPx[i+3]=255; }
  else { pillarPx[i]=13; pillarPx[i+1]=13; pillarPx[i+2]=24; pillarPx[i+3]=255; }
}
savePNG(path.join(OUT,'scene','pillar.png'), pillarPx, pillarW, pillarH);

// ============ 索引文件 ============
const index = `# 像素机甲对战 - 美术资源

本目录包含游戏所有像素美术资源 (PNG 格式)。

## 目录结构

\`\`\`
assets/
├── mecha_red/          # 红色机甲 P1 (6种姿态)
│   ├── idle.png        # 待机
│   ├── walk1.png       # 走路帧1
│   ├── walk2.png       # 走路帧2
│   ├── attack.png      # 攻击
│   ├── jump.png        # 跳跃
│   ├── roll.png        # 翻滚
│   ├── idle_flip.png   # 朝左版本
│   ├── attack_flip.png
│   └── walk1_flip.png
├── mecha_blue/         # 蓝色机甲 P2 (6种姿态)
│   └── ...
├── scene/              # 场景元素
│   ├── moon.png        # 月亮
│   ├── star.png        # 星星
│   ├── beam_red.png    # 能量弹
│   └── pillar.png      # 装饰柱
└── sprite_sheet.png    # 总览预览图 (所有姿态拼一张)
\`\`\`

## 规格

- 原始尺寸: 16x18 像素 (机甲)
- 导出尺寸: 96x108 像素 (放大6倍)
- 格式: PNG, RGBA, 8位
- 调色板: 16色

## 在游戏中使用

游戏当前使用程序化绘制 (Canvas), 性能更好且无需网络。
这些 PNG 文件作为美术资源提供, 可用于:
- 查看实际效果
- 在图像编辑器中修改
- 导入到其他游戏引擎 (Unity/Godot 等)
- 作为参考重新绘制

重新生成: \`node generate-assets.js\`
`;
fs.writeFileSync(path.join(OUT,'README.md'), index);

console.log('\n=== 全部完成 ===');
console.log(`输出目录: ${OUT}`);
console.log(`文件总数: ${countFiles(OUT)}`);
function countFiles(dir){
  let n=0;
  for(const e of fs.readdirSync(dir,{withFileTypes:true})){
    if(e.isDirectory()) n+=countFiles(path.join(dir,e.name));
    else if(e.name.endsWith('.png')) n++;
  }
  return n;
}
