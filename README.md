# FinData API - 企业级金融数据API基础设施

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🚀 项目简介

企业级金融数据API基础设施，为多智能体系统提供高并发、全景上下文的数据管道服务。

### 核心特性

- **多市场覆盖**: 中国(沪深北)、香港、美国、全球四大市场
- **多资产类别**: 股票、期货、指数、外汇、大宗商品、数字货币
- **实时推送**: WebSocket毫秒级行情更新
- **L2订单簿**: 深度订单簿数据，支持交易决策
- **历史数据**: OHLCV历史K线数据查询
- **Rate Limiting**: Token Bucket限流算法

## 📦 技术栈

### 后端
- Express.js + TypeScript
- Socket.io (WebSocket实时推送)
- Redis (缓存层，可选)
- Node.js Cluster (高并发支持)

### 前端
- React 18 + TypeScript
- Tailwind CSS
- Recharts (数据可视化)
- Zustand (状态管理)
- Socket.io-client

## 🔌 API接口

### 实时行情
```bash
GET /api/v1/quotes
GET /api/v1/quotes/:symbol
```

### 订单簿
```bash
GET /api/v1/orderbook/:symbol?levels=10
```

### 历史数据
```bash
GET /api/v1/history/:symbol?days=30&interval=1d
```

### 搜索
```bash
GET /api/v1/search?query=AAPL
```

## 🏃 运行项目

### 1. 安装依赖
```bash
pnpm install
```

### 2. 启动开发服务器
```bash
pnpm dev
```

### 3. 访问应用
- 前端: http://localhost:5174
- API: http://localhost:3001/api/v1

## 📁 项目结构

```
├── api/                    # 后端服务
│   ├── routes/             # API路由
│   │   └── market.ts       # 市场数据接口
│   ├── services/           # 核心服务
│   │   ├── cache.ts        # Redis缓存层
│   │   └── mockData.ts     # 模拟数据源
│   ├── types/              # TypeScript类型定义
│   ├── app.ts              # Express应用
│   └── server.ts           # 服务器入口
├── src/                    # 前端代码
│   ├── components/          # UI组件
│   ├── pages/              # 页面
│   ├── services/           # API服务
│   └── types/              # 类型定义
└── package.json
```

## 🌐 市场覆盖

| 市场 | 交易所 | 资产类别 |
|------|--------|----------|
| 中国 | SSE, SZSE, BSE, SHFE, DCE, ZCE, CFFEX, INE | A股、期货 |
| 香港 | HKEX, HKFE | H股、涡轮 |
| 美国 | NYSE, NASDAQ, AMEX, ARCA, BATS | 股票、ETF |
| 全球 | LME, CBOT, CME | 大宗商品 |

## 📜 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件