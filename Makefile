# wsk-auto 开发环境常用操作。
# 前置：cp .env.example .env.wsk（仅使用 WSK 配置）

COMPOSE := docker compose --env-file .env.wsk -f docker-compose.yml -p wsk-auto
K8S_DIR := deploy/k8s
PYTHON ?= python3

TAG ?= $(shell git rev-parse --short HEAD)

.PHONY: help up down restart logs ps build seed clean mq-up mq-dashboard k8s-build k8s-apply k8s-delete k8s-seed k8s-status k8s-rollout proto

help: ## 显示本帮助
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-10s %s\n", $$1, $$2}'

proto: ## 重新生成 pb（插件版本须与 pb.go 头注释一致：protoc v6.33.x / protoc-gen-go v1.36.x）

	protoc --go_out=. --go_opt=paths=source_relative \
	  --go-grpc_out=. --go-grpc_opt=paths=source_relative \
	  proto/product/product.proto proto/user/user.proto proto/order/order.proto

up: ## 构建镜像并后台启动整套环境
	$(COMPOSE) up -d --build

down: ## 停止并移除容器（数据卷保留，数据不丢）
	$(COMPOSE) down

restart: ## 重启四个 Go 服务（不动 MySQL 和数据）
	$(COMPOSE) restart user-service product-service order-service api-gateway

logs: ## 跟踪全部服务日志（Ctrl-C 退出，不影响运行中的服务）
	$(COMPOSE) logs -f --tail=100

ps: ## 查看各容器状态
	$(COMPOSE) ps

build: ## 只构建镜像不启动
	$(COMPOSE) build

seed: ## 灌入测试数据（10 用户 + 20 商品，用户密码均为 123456）
	$(COMPOSE) run --rm seed

clean: ## 停止并删除容器和数据卷（数据会清零，慎用）
	$(COMPOSE) down -v

mq-up: ## 只启动 RocketMQ 三件套（nameserver + broker + proxy）
	$(COMPOSE) up -d rocketmq-nameserver rocketmq-broker rocketmq-proxy
	@echo "--- proxy gRPC 入口: 127.0.0.1:18091 ---"

mq-topics: ## 创建业务 topic（stock-restore / order-timeout）。幂等：已存在则提示重复，无副作用
	$(COMPOSE) exec rocketmq-broker sh mqadmin updateTopic -n rocketmq-nameserver:9876 -t stock-restore -c DefaultCluster
	$(COMPOSE) exec rocketmq-broker sh mqadmin updateTopic -n rocketmq-nameserver:9876 -t order-timeout -c DefaultCluster

mq-dashboard: ## 启动 RocketMQ 控制台（tools profile，http://localhost:28090）
	$(COMPOSE) --profile tools up -d rocketmq-dashboard

k8s-build: ## 构建全部镜像并打唯一 TAG（kind 集群经 containerd 镜像存储可直接使用）
	WSK_TAG=$(TAG) $(COMPOSE) --profile tools build

k8s-apply: ## 部署整套到 K8s（namespace wsk-auto；清单里的 :TAG 占位替换为当前 TAG）
	# 渲染时替换镜像 TAG，并在文件之间保留 YAML 文档分隔。seed 仅手动执行。
	kubectl apply -f $(K8S_DIR)/00-namespace.yaml
	$(PYTHON) scripts/render-k8s.py --tag "$(TAG)" | kubectl apply -n wsk-auto -f -

k8s-rollout: ## 只滚动更新四个服务到当前 TAG（镜像已构建好、只想换版本时用）
	kubectl set image -n wsk-auto deployment/user-service user-service=wsk-auto/user-service:$(TAG)
	kubectl set image -n wsk-auto deployment/product-service product-service=wsk-auto/product-service:$(TAG)
	kubectl set image -n wsk-auto deployment/order-service order-service=wsk-auto/order-service:$(TAG)
	kubectl set image -n wsk-auto deployment/api-gateway api-gateway=wsk-auto/api-gateway:$(TAG)

k8s-delete: ## 删除 WSK 工作负载（保留命名空间和 PVC）
	$(PYTHON) scripts/render-k8s.py --tag "$(TAG)" --scope delete | kubectl delete -n wsk-auto --ignore-not-found -f -

k8s-seed: ## 灌入测试数据（先等 MySQL 就绪；Job 不可重入，删旧建新）
	kubectl wait --for=condition=ready pod/mysql-0 -n wsk-auto --timeout=180s
	kubectl delete job seed -n wsk-auto --ignore-not-found
	$(PYTHON) scripts/render-k8s.py --tag "$(TAG)" --scope seed | kubectl apply -n wsk-auto -f -
	@echo "--- seed 输出 ---"
	kubectl wait --for=condition=complete job/seed -n wsk-auto --timeout=180s
	kubectl logs -n wsk-auto job/seed

k8s-status: ## 查看 wsk-auto 命名空间全部资源状态
	kubectl get all -n wsk-auto
