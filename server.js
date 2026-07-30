/**
 * 像素机甲对战 - WebSocket 联机服务器
 * 用法: node server.js [port]
 * 默认端口 3000
 */
const { WebSocketServer } = require('ws');
const http = require('http');

const PORT = parseInt(process.argv[2], 10) || 3000;

// 简单的 HTTP 服务器用于健康检查
const httpServer = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end(`Mecha Battle Server running. Players: ${stats.connected}, Rooms: ${stats.rooms}`);
});
httpServer.listen(0, () => { // 随机端口，避免冲突
  console.log(`[HTTP] 健康检查端口: ${PORT + 1}`);
});

const wss = new WebSocketServer({ port: PORT });
console.log(`[WS] 像素机甲对战服务器启动于 ws://0.0.0.0:${PORT}`);

const queue = [];        // 等待队列
const rooms = new Map(); // roomId -> { id, players: [ws, ws] }
let idCounter = 0;

const stats = { connected: 0, rooms: 0 };

function uid() { return `p${++idCounter}`; }
function rid() { return `room${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

wss.on('connection', (ws, req) => {
  ws.playerId = uid();
  ws.alive = true;
  ws.roomId = null;
  stats.connected++;
  console.log(`[+] ${ws.playerId} 已连接 (在线: ${stats.connected})`);

  // 发送玩家ID
  ws.send(JSON.stringify({ type: 'welcome', playerId: ws.playerId }));

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }

    switch (msg.type) {
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }));
        break;

      case 'match':
        // 加入匹配队列
        if (ws.roomId) {
          ws.send(JSON.stringify({ type: 'error', message: '已在房间中' }));
          return;
        }
        queue.push(ws);
        ws.send(JSON.stringify({ type: 'queued', position: queue.length }));
        console.log(`[Q] ${ws.playerId} 进入匹配队列 (队列长度: ${queue.length})`);
        tryMatch();
        break;

      case 'leave_queue':
        const idx = queue.indexOf(ws);
        if (idx !== -1) queue.splice(idx, 1);
        ws.send(JSON.stringify({ type: 'left_queue' }));
        break;

      case 'input':
        // 转发输入给同房间的另一位玩家
        if (!ws.roomId) return;
        const room = rooms.get(ws.roomId);
        if (!room) return;
        const other = room.players.find(p => p !== ws);
        if (other && other.readyState === 1) {
          other.send(JSON.stringify({
            type: 'remote_input',
            input: msg.input,
            seq: msg.seq || 0,
          }));
        }
        break;

      case 'game_over':
        // 转发游戏结束消息
        if (!ws.roomId) return;
        const r = rooms.get(ws.roomId);
        if (!r) return;
        const o = r.players.find(p => p !== ws);
        if (o && o.readyState === 1) {
          o.send(JSON.stringify({ type: 'opponent_left' }));
        }
        // 关闭房间
        closeRoom(ws.roomId);
        break;
    }
  });

  ws.on('close', () => {
    stats.connected--;
    console.log(`[-] ${ws.playerId} 断开连接 (在线: ${stats.connected})`);

    // 从队列移除
    const qi = queue.indexOf(ws);
    if (qi !== -1) queue.splice(qi, 1);

    // 通知同房间的对手
    if (ws.roomId) {
      const room = rooms.get(ws.roomId);
      if (room) {
        const other = room.players.find(p => p !== ws);
        if (other && other.readyState === 1) {
          other.send(JSON.stringify({ type: 'opponent_left' }));
        }
      }
      closeRoom(ws.roomId);
    }
  });

  ws.on('error', () => {});
});

function tryMatch() {
  while (queue.length >= 2) {
    const p1 = queue.shift();
    const p2 = queue.shift();
    if (p1.readyState !== 1 || p2.readyState !== 1) {
      // 如果有人断线，重新处理
      if (p1.readyState === 1) queue.unshift(p1);
      if (p2.readyState === 1) queue.unshift(p2);
      continue;
    }
    const roomId = rid();
    const room = { id: roomId, players: [p1, p2] };
    rooms.set(roomId, room);
    p1.roomId = roomId;
    p2.roomId = roomId;
    stats.rooms = rooms.size;

    console.log(`[ROOM] 匹配成功: ${p1.playerId} vs ${p2.playerId} (${roomId})`);

    p1.send(JSON.stringify({ type: 'matched', roomId, playerIndex: 0, opponentId: p2.playerId }));
    p2.send(JSON.stringify({ type: 'matched', roomId, playerIndex: 1, opponentId: p1.playerId }));
  }
}

function closeRoom(roomId) {
  const room = rooms.get(roomId);
  if (room) {
    for (const p of room.players) {
      if (p.readyState === 1) p.roomId = null;
    }
    rooms.delete(roomId);
    stats.rooms = rooms.size;
    console.log(`[ROOM] 房间关闭: ${roomId}`);
  }
}

// 心跳检测
setInterval(() => {
  wss.clients.forEach(ws => {
    if (ws.alive === false) return ws.terminate();
    ws.alive = false;
    ws.ping();
  });
}, 30000);

wss.on('close', () => ws.alive = false);

console.log(`[OK] 等待玩家连接...`);