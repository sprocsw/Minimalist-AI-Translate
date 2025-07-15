#!/bin/bash

# 默认端口
DEFAULT_PORT=5173

# 获取端口参数
if [ "$1" == "--port" ] && [ -n "$2" ]; then
  PORT=$2
  echo "启动 TRANSLATEAI 开发环境 (端口: $PORT)..."
else
  PORT=$DEFAULT_PORT
  echo "启动 TRANSLATEAI 开发环境 (默认端口: $PORT)..."
fi

echo "同时启动 API 服务器和前端开发服务器"

# 设置端口环境变量并运行
PORT=$PORT npm run dev:all 