/**
 * 像素机甲美术资源生成器 v2
 * 生成：4种角色全套精灵图 + 多帧动画spritesheet + 完整赛博战斗场景 + HUD框 + 按钮图标
 * 用法: node generate-assets.js
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// ============ 调色板 ============
const PAL = {
  '.': null,
  'k': [13,13,24],     'd': [43,43,61],     'g': [92,92,114],
  'l': [155,155,176],  'w': [244,244,255],
  'r': [216,50,75],    'R': [255,102,119],
  'b': [47,111,224],   'B': [95,160,255],
  'y': [255,214,74],   'o': [255,138,31],
  'c': [57,240,216],   'p': [176,69,240],   'P': [210,120,255],
  'O': [255,170,60],   'e': [255,85,30],    'E': [255,170,100],
  'G': [60,220,110],   'S': [90,180,255],
  'n': [20,20,34],     'N': [30,25,48],
  '1': [22,26,42],     '2': [38,44,68],     '3': [60,64,94],
  'm': [200,50,200],   'M': [240,120,240],
  'u': [40,48,96],     'U': [60,90,160],
  'q': [45,20,70],     'Q': [90,50,140],
};

// ============ Sprite 定义 ============
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
  block: [
    "......kkkk......",".....kwwwwk.....","....kwwwwwwk....","....kwwllwwk....",
    "....kwwllwwk....","....kllllllk....","...kllggrrllk...","..kllggggggllk..",
    ".kllgggyyyggllk.",".kllggggggggllk.","...kllggggllk...","....kllllllk....",
    "....kllggllk....","....kkllllkk....",".....kk..kk.....",".....kk..kk.....",
    "....kkk..kkk....","....kk....kk....",
  ],
  hit: [
    "......kkkk......",".....kwwwwk.....","....kwkkkkwk....","....kwkkkkwk....",
    "....kwkkkkwk....","....kkllllkk....","...kkllddddllk..","..kllddddddddllk",
    ".kllddwwwwddddlk",".kldddddddddddlk","...klddddddllk..","....kkllllllk...",
    "....kllggllk....","....kkllllkk....",".....kk..kk.....",".....kk..kk.....",
    "....kkk..kkk....","....kk....kk....",
  ],
};

// ============ 4 个角色的配色方案 (与 CHARS 对应) ============
// 0 重甲红 Tager, 1 高速蓝 Jin, 2 紫均衡 Lambda, 3 金蓄力 Ragna
const CHAR_PALETTES = [
  { // [0] Tager 红
    name:'tager', accent:'r', accent2:'R', eye:'y', armor:'r', body:'r',
    map:{} // 默认
  },
  { // [1] Jin 蓝
    name:'jin', accent:'b', accent2:'B', eye:'c', armor:'b', body:'b',
    map:{ r:'b', R:'B', y:'c', o:'S' }
  },
  { // [2] Lambda 紫
    name:'lambda', accent:'p', accent2:'P', eye:'w', armor:'p', body:'p',
    map:{ r:'p', R:'P', y:'M', o:'p', c:'P' }
  },
  { // [3] Ragna 金
    name:'ragna', accent:'o', accent2:'O', eye:'y', armor:'o', body:'r',
    map:{ r:'r', R:'e', y:'y', o:'O', c:'y' }
  },
];

function recolor(spr, map){
  if(!map || Object.keys(map).length===0) return spr;
  return spr.map(r=>r.split('').map(c=>map[c]||c).join(''));
}
function flipH(spr){ return spr.map(r=>r.split('').reverse().join('')); }

// ============ PNG 编码器 ============
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
function encodePNG(pixels, w, h){
  const raw = Buffer.alloc((w*4+1)*h);
  let p = 0;
  for(let y=0;y<h;y++){
    raw[p++] = 0;
    for(let x=0;x<w;x++){
      const idx = (y*w+x)*4;
      raw[p++] = pixels[idx]; raw[p++] = pixels[idx+1];
      raw[p++] = pixels[idx+2]; raw[p++] = pixels[idx+3];
    }
  }
  const idat = zlib.deflateSync(raw, {level:9});
  const sig = Buffer.from([137,80,78,71,13,10,26,10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w,0); ihdr.writeUInt32BE(h,4);
  ihdr[8]=8; ihdr[9]=6; ihdr[10]=0; ihdr[11]=0; ihdr[12]=0;
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

// ============ 像素工具 ============
function spriteToPixels(spr, scale, flip){
  const sw = spr[0].length, sh = spr.length;
  const w = sw*scale, h = sh*scale;
  const pixels = new Array(w*h*4).fill(0);
  for(let y=0;y<h;y++){
    const sy = Math.floor(y/scale);
    const row = flip ? flipH([spr[sy]])[0] : spr[sy];
    for(let x=0;x<w;x++){
      const sx = Math.floor(x/scale);
      const col = PAL[row[sx]];
      const idx = (y*w+x)*4;
      if(col){ pixels[idx]=col[0]; pixels[idx+1]=col[1]; pixels[idx+2]=col[2]; pixels[idx+3]=255; }
    }
  }
  return {pixels, w, h};
}
function createPixelBuffer(w, h){
  return { pixels: new Array(w*h*4).fill(0), w, h };
}
function setPixel(buf, x, y, rgba){
  if(x<0||y<0||x>=buf.w||y>=buf.h) return;
  const i=(y*buf.w+x)*4;
  buf.pixels[i]=rgba[0]; buf.pixels[i+1]=rgba[1]; buf.pixels[i+2]=rgba[2]; buf.pixels[i+3]=rgba[3];
}
function fillRect(buf, x, y, w, h, rgba){
  for(let j=0;j<h;j++) for(let i=0;i<w;i++) setPixel(buf,x+i,y+j,rgba);
}
function blit(destBuf, srcPixels, sw, sh, dx, dy){
  for(let y=0;y<sh;y++) for(let x=0;x<sw;x++){
    const si=(y*sw+x)*4; if(srcPixels[si+3]===0) continue;
    const di=((dy+y)*destBuf.w+(dx+x))*4;
    destBuf.pixels[di]=srcPixels[si]; destBuf.pixels[di+1]=srcPixels[si+1];
    destBuf.pixels[di+2]=srcPixels[si+2]; destBuf.pixels[di+3]=srcPixels[si+3];
  }
}
function savePNG(filepath, buf){
  fs.mkdirSync(path.dirname(filepath), {recursive:true});
  const png = encodePNG(buf.pixels, buf.w, buf.h);
  fs.writeFileSync(filepath, png);
  console.log(`  ✓ ${path.relative(path.join(__dirname,'assets'), filepath)} (${buf.w}x${buf.h}, ${(png.length/1024).toFixed(1)}KB)`);
}

// ============ 主流程 ============
const OUT = path.join(__dirname, 'assets');
const SCALE = 6;
const SW = 16, SH = 18;           // 机甲原始尺寸
const CW = SW*SCALE, CH = SH*SCALE; // 机甲导出尺寸 96x108

console.log('=== 生成机甲美术资源 v2 ===\n');

// ---------- 每个角色：全部姿态 + 翻转 + 自己的 spritesheet ----------
const ORDER = ['idle','walk1','walk2','attack','jump','roll','block','hit'];
CHAR_PALETTES.forEach((char, ci) => {
  const dir = path.join(OUT, 'characters', char.name);
  console.log(`[角色${ci}: ${char.name}]`);
  // 单姿态
  for(const [name, spr] of Object.entries(SPRITES)){
    const colored = recolor(spr, char.map);
    // 朝右
    savePNG(path.join(dir, `${name}_r.png`), { ...spriteToPixels(colored, SCALE, false) });
    // 朝左 (翻转)
    savePNG(path.join(dir, `${name}_l.png`), { ...spriteToPixels(colored, SCALE, true) });
  }
  // 该角色专属 spritesheet: 8姿态 x 2朝向 （16格）
  const ssW = ORDER.length*CW, ssH = 2*CH;
  const ss = createPixelBuffer(ssW, ssH);
  ORDER.forEach((n,i)=>{
    const colored = recolor(SPRITES[n], char.map);
    blit(ss, spriteToPixels(colored, SCALE, false).pixels, CW, CH, i*CW, 0);
    blit(ss, spriteToPixels(colored, SCALE, true ).pixels, CW, CH, i*CW, CH);
  });
  savePNG(path.join(dir, 'spritesheet.png'), ss);
});

// ---------- 总览 sprite sheet: 4角色 × 8姿态 × 朝右 ----------
console.log('\n[总览 sprite_sheet_4x8.png]');
{
  const cols = ORDER.length, rows = CHAR_PALETTES.length;
  const W = cols*CW, H = rows*CH;
  const ss = createPixelBuffer(W, H);
  CHAR_PALETTES.forEach((char, ci)=>{
    ORDER.forEach((n, i)=>{
      const colored = recolor(SPRITES[n], char.map);
      blit(ss, spriteToPixels(colored, SCALE, false).pixels, CW, CH, i*CW, ci*CH);
    });
  });
  savePNG(path.join(OUT, 'sprite_sheet_4x8.png'), ss);
}

// ============ 战斗场景：完整 960x360 赛博霓虹夜 ============
console.log('\n[场景 / 960x360]');
{
  const W=960, H=360;
  const bg = createPixelBuffer(W, H);

  // 1. 天空 深紫→品红 渐变 (从上到下)
  for(let y=0; y<H*0.72; y++){
    const t = y/(H*0.72);
    const r = Math.floor(22 + (200-22)*t*0.25);
    const g = Math.floor(14 + (30-14)*t*0.5);
    const b = Math.floor(58 + (120-58)*t*0.5);
    for(let x=0;x<W;x++){
      // 加水平条纹模拟 CRT
      const scanline = (y%4===0) ? 0.9 : 1.0;
      const i=(y*W+x)*4;
      bg.pixels[i  ]=Math.floor(r*scanline);
      bg.pixels[i+1]=Math.floor(g*scanline);
      bg.pixels[i+2]=Math.floor(b*scanline+20);
      bg.pixels[i+3]=255;
    }
  }

  // 2. 星星
  for(let i=0;i<80;i++){
    const sx = Math.floor(Math.random()*W);
    const sy = Math.floor(Math.random()*H*0.55);
    const s = Math.random()<0.2 ? 2 : 1;
    const br = 180 + Math.floor(Math.random()*75);
    for(let dy=0;dy<s;dy++) for(let dx=0;dx<s;dx++) setPixel(bg, sx+dx, sy+dy, [br,br,br,255]);
  }

  // 3. 月亮 (上右)
  const mx = W-130, my = 55, mr = 34;
  for(let y=-mr; y<=mr; y++) for(let x=-mr; x<=mr; x++){
    const d = Math.sqrt(x*x+y*y);
    if(d<mr-4){
      // 环形山
      const crater = (x===8&&y===-10)||(x===-12&&y===4)||(x===4&&y===12)||(x===-2&&y===-18);
      setPixel(bg, mx+x, my+y, crater ? [180,180,210,255] : [230,230,255,255]);
    } else if(d<mr){
      setPixel(bg, mx+x, my+y, [255,255,255,180]);
    }
  }
  // 月亮外辉光
  for(let y=-mr*1.8; y<=mr*1.8; y++) for(let x=-mr*1.8; x<=mr*1.8; x++){
    const d = Math.sqrt(x*x+y*y);
    if(d>=mr && d<mr*1.7){
      const a = Math.floor(40*(1-(d-mr)/(mr*0.7)));
      const i=((my+y)*W+(mx+x))*4;
      if(bg.pixels[i+3]===255){
        bg.pixels[i  ]=Math.min(255, bg.pixels[i  ]+a);
        bg.pixels[i+1]=Math.min(255, bg.pixels[i+1]+a);
        bg.pixels[i+2]=Math.min(255, bg.pixels[i+2]+Math.floor(a*1.3));
      }
    }
  }

  // 4. 远景山脉 + 楼宇 (按块迭代避免嵌套问题)
  const skylineBase = Math.floor(H*0.62);
  // 4a. 后层山 (按x逐列)
  for(let x=0; x<W; x++){
    const y1 = skylineBase - Math.floor(20*Math.sin(x*0.012) + 16*Math.sin(x*0.027+1.3));
    for(let y=y1; y<Math.floor(H*0.72); y++){
      const i=(y*W+x)*4;
      bg.pixels[i]=28; bg.pixels[i+1]=18; bg.pixels[i+2]=58; bg.pixels[i+3]=255;
    }
  }
  // 4b. 前层楼宇 (按36px一栋)
  const BLKW=36;
  const numBlk = Math.ceil(W/BLKW);
  // 先把每栋山高度表记住
  const mountY1 = [];
  for(let x=0;x<W;x++) mountY1[x] = skylineBase - Math.floor(20*Math.sin(x*0.012) + 16*Math.sin(x*0.027+1.3));
  for(let blk=0; blk<numBlk; blk++){
    const bh = 15 + ((blk*37)%52) + Math.floor(Math.sin(blk)*8);
    const y2 = skylineBase - bh;
    const xL = blk*BLKW;
    const xR = Math.min(W, xL+BLKW-2);
    // 楼宇主体填充
    for(let x=xL; x<xR; x++){
      const y1 = mountY1[x] ?? skylineBase;
      for(let y=y2; y<y1; y++){
        const i=(y*W+x)*4;
        bg.pixels[i]=18; bg.pixels[i+1]=14; bg.pixels[i+2]=42; bg.pixels[i+3]=255;
      }
    }
    // 窗户 (按 6x4 像素网格, 每栋约20%点亮)
    const rows = Math.max(1, Math.floor(bh/4));
    const cols = Math.max(1, Math.floor((BLKW-2)/6));
    for(let r=0;r<rows;r++){
      for(let c=0;c<cols;c++){
        if(((blk*13 + c*7 + r*5) % 5) !== 0) continue;
        const col = ((blk+r)%3===0) ? [120,220,255] :
                    ((blk+r)%3===1) ? [255,120,200] : [255,220,120];
        const wx = xL + 1 + c*6;
        const wy = y2 + 1 + r*4;
        for(let dy=0;dy<2;dy++) for(let dx=0;dx<4;dx++){
          const px = wx+dx, py = wy+dy;
          if(px<0||px>=W||py<0||py>=H) continue;
          const i=(py*W+px)*4;
          if(bg.pixels[i+3]===255){
            bg.pixels[i]=col[0]; bg.pixels[i+1]=col[1]; bg.pixels[i+2]=col[2];
          }
        }
      }
    }
  }

  // 5. 霓虹广告牌 (左)
  const bx=70, by=skylineBase-72, bw=160, bh=42;
  for(let y=0;y<bh;y++) for(let x=0;x<bw;x++){
    const edge = (y===0||y===bh-1||x===0||x===bw-1);
    const col = edge ? [255,80,200] : [60,20,60];
    setPixel(bg, bx+x, by+y, [...col, 255]);
  }
  // 广告牌内文字 (伪像素字 "ARENA")
  const letters = "NEXUS ARENA";
  for(let li=0; li<letters.length; li++){
    const lx = bx+10 + li*10;
    const ly = by+12;
    for(let yy=0; yy<18; yy++) for(let xx=0; xx<8; xx++){
      // 简单用随机块模拟文字
      if(((li*7+xx*3+yy*5)%4) < 2 && yy<14 && xx<6){
        setPixel(bg, lx+xx, ly+yy, [255,220,255,255]);
      }
    }
  }

  // 6. 地面：破碎沥青 + 霓虹分割线
  const groundTop = Math.floor(H*0.72);
  for(let y=groundTop; y<H; y++){
    for(let x=0;x<W;x++){
      const depth = (y-groundTop)/(H-groundTop);
      const shade = 18 + depth*28;
      const i=(y*W+x)*4;
      bg.pixels[i  ]=Math.floor(shade*0.9);
      bg.pixels[i+1]=Math.floor(shade*0.95);
      bg.pixels[i+2]=Math.floor(shade*1.2);
      bg.pixels[i+3]=255;
    }
  }
  // 裂纹
  for(let c=0;c<14;c++){
    let cx = Math.random()*W, cy = groundTop + 10+Math.random()*(H-groundTop-20);
    for(let s=0;s<28;s++){
      cx += (Math.random()-0.5)*10;
      cy += (Math.random()-0.5)*4;
      if(cx<0||cx>=W||cy<groundTop||cy>=H) break;
      setPixel(bg, Math.floor(cx), Math.floor(cy), [90,100,120,255]);
      setPixel(bg, Math.floor(cx)+1, Math.floor(cy), [60,70,90,255]);
    }
  }
  // 地面中线 (霓虹青)
  for(let x=0;x<W;x++){
    if(x%40<24){
      setPixel(bg, x, groundTop+6,  [0,220,220,255]);
      setPixel(bg, x, groundTop+7,  [0,180,180,255]);
    }
  }
  // 前景左右霓虹柱
  function drawPillar(px, col1, col2){
    const ph=110, pw=20, top=groundTop-ph+8;
    for(let y=0;y<ph;y++) for(let x=0;x<pw;x++){
      const edge = (x===0||x===pw-1||y<3||y===ph-1);
      let col;
      if(y<3) col=col2;
      else if(edge) col=[PAL.k[0],PAL.k[1],PAL.k[2]];
      else if((x>=6&&x<=13)&&(y%10<4)) col=col1;
      else col=col2;
      setPixel(bg, px+x, top+y, [...col,255]);
    }
    // 顶部灯
    for(let dy=-3;dy<=3;dy++) for(let dx=-6;dx<=6;dx++){
      if(Math.abs(dx)+Math.abs(dy)===3 || (dx===0&&dy===0)){
        setPixel(bg, px+10+dx, top+1+dy, [...col1, dx===0&&dy===0?255:120]);
      }
    }
  }
  drawPillar(30, [255,70,200], [60,20,60]);
  drawPillar(W-50, [80,220,255], [20,40,70]);

  savePNG(path.join(OUT, 'scene', 'battle_bg_960x360.png'), bg);
}

// ============ 能量弹 4 色 ============
console.log('\n[能量弹 4 色]');
[
  { n:'red',    c1:[255,85,102], c2:[255,214,74] },
  { n:'blue',   c1:[95,160,255], c2:[57,240,216] },
  { n:'purple', c1:[210,120,255], c2:[255,180,255] },
  { n:'gold',   c1:[255,170,60],  c2:[255,230,140] },
].forEach(b=>{
  const W=30, H=10;
  const bm = createPixelBuffer(W,H);
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){
    if(y>=3&&y<=6&&x>=2&&x<=W-3){
      const inCore = y>=4&&y<=5&&x>=5&&x<=W-7;
      setPixel(bm,x,y, inCore ? [...b.c2,255] : [...b.c1,255]);
    }
    if(y>=4&&y<=5&&x>=W-7&&x<=W-3) setPixel(bm,x,y,[255,255,255,255]);
  }
  savePNG(path.join(OUT,'scene',`beam_${b.n}.png`), bm);
});

// ============ HUD 框：血条/能量条/防御条 (圆角赛博霓虹边) ============
console.log('\n[HUD UI 元素]');
function drawHudBar(w, h, border, accentAlpha=255){
  const b = createPixelBuffer(w, h);
  // 底色
  fillRect(b, 0,0, w,h, [10,10,20,200]);
  // 内部深色
  fillRect(b, 4,4, w-8,h-8, [6,6,14,255]);
  // 四角装饰 + 边框
  const c = border;
  // 顶部
  for(let x=2;x<w-2;x++){ setPixel(b,x,0,c); setPixel(b,x,1,[c[0],c[1],c[2],140]); }
  // 底部
  for(let x=2;x<w-2;x++){ setPixel(b,x,h-1,c); setPixel(b,x,h-2,[c[0],c[1],c[2],140]); }
  // 左侧
  for(let y=2;y<h-2;y++){ setPixel(b,0,y,c); setPixel(b,1,y,[c[0],c[1],c[2],140]); }
  // 右侧
  for(let y=2;y<h-2;y++){ setPixel(b,w-1,y,c); setPixel(b,w-2,y,[c[0],c[1],c[2],140]); }
  // 角块 (粗)
  [[0,0],[w-4,0],[0,h-4],[w-4,h-4]].forEach(([ax,ay])=>{
    for(let dy=0;dy<4;dy++) for(let dx=0;dx<4;dx++){
      if((dx===0||dx===3||dy===0||dy===3)) setPixel(b,ax+dx,ay+dy,c);
    }
  });
  // 侧边电路小灯
  for(let i=0;i<3;i++){
    const ly = 6 + i*Math.floor((h-12)/2);
    setPixel(b, 3, ly, c);
    setPixel(b, w-4, ly, c);
  }
  return b;
}
savePNG(path.join(OUT,'ui','hp_bar_frame.png'), drawHudBar(360, 28, [255,120,50,255]));
savePNG(path.join(OUT,'ui','en_bar_frame.png'), drawHudBar(220, 18, [80,200,255,255]));
savePNG(path.join(OUT,'ui','gd_bar_frame.png'), drawHudBar(180, 14, [220,80,220,255]));

// ============ 动作按钮图标 (圆形金属按钮 + 图案) ============
console.log('\n[动作按钮图标 6 种]');
function drawRoundButton(size, rim, labelFn){
  const b = createPixelBuffer(size,size);
  const cx=size/2, cy=size/2, r=size/2-1;
  for(let y=0;y<size;y++) for(let x=0;x<size;x++){
    const d=Math.hypot(x-cx+0.5, y-cy+0.5);
    if(d<r-4){
      // 中心渐变
      const t=d/(r-4);
      const c1 = [60,64,94], c2=[22,26,42];
      const r1=Math.floor(c1[0]*(1-t)+c2[0]*t);
      const g1=Math.floor(c1[1]*(1-t)+c2[1]*t);
      const bl=Math.floor(c1[2]*(1-t)+c2[2]*t);
      setPixel(b,x,y,[r1,g1,bl,255]);
    } else if(d<r-1){
      // 高光环
      setPixel(b,x,y, d<r-2 ? [155,155,176,255] : [92,92,114,255]);
    } else if(d<r){
      // 外环
      setPixel(b,x,y, rim);
    }
  }
  // 标签图案
  labelFn(b, cx, cy, r);
  return b;
}
function punch(b,cx,cy,r){
  // 拳头
  for(let dy=-8;dy<=6;dy++) for(let dx=-8;dx<=8;dx++){
    const inF = (Math.abs(dx)+Math.abs(dy)<10)&&!(dy<-5&&Math.abs(dx)>5);
    if(inF) setPixel(b,Math.floor(cx+dx),Math.floor(cy+dy),
      (dy<-2&&dx>-5&&dx<-1)?[255,255,255,255]:[155,155,176,255]);
  }
}
function heavy(b,cx,cy){
  // 重剑 X
  for(let i=-10;i<=10;i++){
    setPixel(b,Math.floor(cx+i),Math.floor(cy+i),[255,220,255,255]);
    setPixel(b,Math.floor(cx+i),Math.floor(cy-i),[255,220,255,255]);
  }
}
function sweep(b,cx,cy){
  // 弧线扫腿
  for(let a=200;a<=340;a+=3){
    const rad=a*Math.PI/180;
    const x=Math.floor(cx+Math.cos(rad)*11);
    const y=Math.floor(cy+Math.sin(rad)*11);
    setPixel(b,x,y,[255,180,100,255]);
    setPixel(b,x+1,y,[200,120,60,255]);
  }
}
function special(b,cx,cy){
  // 爆裂星
  for(let k=0;k<4;k++){
    const a=k*Math.PI/2;
    for(let i=0;i<=10;i++){
      setPixel(b, Math.floor(cx+Math.cos(a)*i), Math.floor(cy+Math.sin(a)*i), [255,220,120,255]);
      setPixel(b, Math.floor(cx+Math.cos(a+Math.PI/4)*i*0.7), Math.floor(cy+Math.sin(a+Math.PI/4)*i*0.7), [255,140,50,255]);
    }
  }
  setPixel(b,Math.floor(cx),Math.floor(cy),[255,255,255,255]);
}
function skill(b,cx,cy){
  // 能量炮
  for(let dy=-5;dy<=5;dy++) for(let dx=-10;dx<=10;dx++){
    if(Math.abs(dy)<=2 && dx>-10){
      if(dx<=-7) setPixel(b,Math.floor(cx+dx),Math.floor(cy+dy),[255,255,255,255]);
      else if(Math.abs(dy)<=1 && dx>-7) setPixel(b,Math.floor(cx+dx),Math.floor(cy+dy),[120,230,255,255]);
      else setPixel(b,Math.floor(cx+dx),Math.floor(cy+dy),[80,160,255,255]);
    }
  }
}
function roll(b,cx,cy){
  // 滚动箭头
  for(let i=-10;i<=10;i++){
    setPixel(b,Math.floor(cx+i),Math.floor(cy),[180,180,200,255]);
  }
  for(let i=-3;i<=3;i++){
    setPixel(b,Math.floor(cx+7-i),Math.floor(cy-i),[220,220,240,255]);
    setPixel(b,Math.floor(cx+7-i),Math.floor(cy+i),[220,220,240,255]);
  }
}
const BS=64;
savePNG(path.join(OUT,'ui','btn_punch.png'),  drawRoundButton(BS,[255,120,60,255],punch));
savePNG(path.join(OUT,'ui','btn_heavy.png'),  drawRoundButton(BS,[200,80,220,255],heavy));
savePNG(path.join(OUT,'ui','btn_sweep.png'),  drawRoundButton(BS,[80,200,255,255],sweep));
savePNG(path.join(OUT,'ui','btn_special.png'),drawRoundButton(BS,[255,220,80,255],special));
savePNG(path.join(OUT,'ui','btn_skill.png'),  drawRoundButton(BS,[100,255,200,255],skill));
savePNG(path.join(OUT,'ui','btn_roll.png'),   drawRoundButton(BS,[180,180,200,255],roll));

// ============ 场景小元素 (月亮、星、柱) 保留兼容 ============
console.log('\n[兼容: 小元素 / 精灵目录索引]');
{ // moon 大像素
  const W=60,H=60;
  const m=createPixelBuffer(W,H);
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){
    const dx=x-W/2, dy=y-H/2, d=Math.hypot(dx,dy);
    if(d<22) setPixel(m,x,y, [232,232,255,255]);
    else if(d<28) setPixel(m,x,y, [255,255,255,120]);
  }
  savePNG(path.join(OUT,'scene','moon_60.png'), m);
}

// 统计文件数
function countFiles(dir){
  let n=0;
  for(const e of fs.readdirSync(dir,{withFileTypes:true})){
    if(e.isDirectory()) n+=countFiles(path.join(dir,e.name));
    else if(e.name.endsWith('.png')) n++;
  }
  return n;
}

console.log(`\n=== 完成 ✓  PNG总数: ${countFiles(OUT)} ===`);
console.log(`输出: ${OUT}/`);
console.log('');
console.log('目录结构:');
console.log('  assets/');
console.log('  ├── characters/           4角色 8姿态×2朝向 + spritesheet');
CHAR_PALETTES.forEach(c=> console.log(`  │   ├── ${c.name}/`));
console.log('  ├── scene/                战斗场景背景 + 能量弹×4 + 月亮');
console.log('  ├── ui/                   HUD血条/能量/防御框 + 6个动作按钮图标');
console.log('  └── sprite_sheet_4x8.png  总览: 4角色 × 8姿态 (朝右)');
