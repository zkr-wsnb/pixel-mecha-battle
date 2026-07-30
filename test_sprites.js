// Load and test sprites.js
const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync(__dirname + '/sprites.js', 'utf8');

// Run in current context so const declarations are available
vm.runInThisContext(code, __filename);

const chars = ['knight', 'ranger', 'mage', 'ninja'];
const anims = ['idle', 'walk', 'attack', 'hit', 'death'];
let allOk = true;

for (const ch of chars) {
  const data = CHAR_SPRITES[ch];
  for (const anim of anims) {
    const spr = data.sprites[anim];
    if (spr.length !== 48) {
      console.log('ERROR: ' + ch + '/' + anim + ' has ' + spr.length + ' rows (expected 48)');
      allOk = false;
    }
    for (let r = 0; r < spr.length; r++) {
      if (spr[r].length !== 48) {
        console.log('ERROR: ' + ch + '/' + anim + ' row ' + r + ' has ' + spr[r].length + ' cols (expected 48)');
        allOk = false;
      }
    }
    const parsed = parseSprite(spr, data.pal);
    if (parsed.length !== 48) {
      console.log('ERROR: parseSprite ' + ch + '/' + anim + ' rows');
      allOk = false;
    }
    for (let r = 0; r < parsed.length; r++) {
      if (parsed[r].length !== 48) {
        console.log('ERROR: parseSprite ' + ch + '/' + anim + ' row ' + r + ' cols');
        allOk = false;
      }
    }
  }
}

for (const ch of chars) {
  for (const anim of anims) {
    const spr = CHAR_SPRITES_PARSED[ch][anim];
    if (!spr || spr.length !== 48) {
      console.log('ERROR: CHAR_SPRITES_PARSED ' + ch + '/' + anim + ' missing or wrong rows');
      allOk = false;
    }
  }
}

if (allOk) {
  console.log('ALL TESTS PASSED:');
  console.log('  - 4 characters x 5 animations = 20 sprite definitions');
  console.log('  - All sprites are exactly 48x48');
  console.log('  - parseSprite produces 48x48 integer arrays');
  console.log('  - CHAR_SPRITES_PARSED structure is valid');
  for (const ch of chars) {
    const pal = CHAR_SPRITES[ch].pal;
    const colors = Object.keys(pal).filter(k => k !== '.').length;
    console.log('  - ' + ch + ': palette has ' + colors + ' color codes');
  }
} else {
  process.exit(1);
}