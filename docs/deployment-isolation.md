# WSK 部署隔离

Docker 项目、应用镜像前缀、Kubernetes 命名空间统一为 `wsk-auto`。不迁移旧 `go-ecom-admin` / `ecom` 的任何资源或数据。

## Docker Compose

在本仓库根目录运行：

```sh
cp .env.example .env.wsk
docker compose --env-file .env.wsk -p wsk-auto config
docker compose --env-file .env.wsk -p wsk-auto up -d --build
docker compose --env-file .env.wsk -p wsk-auto ps
curl http://127.0.0.1:18090/healthz
```

所有 Compose 配置变量使用 `WSK_` 前缀，避免继承旧项目 `MYSQL_*`、`JWT_SECRET`、`TAG` 等环境变量。不要复制旧 `.env`，不要传入 `-p go-ecom-admin` 或把本清单合并到旧项目。Makefile 和 PowerShell 入口固定 Compose 文件、`.env.wsk` 和项目名，项目参数优先于 `COMPOSE_PROJECT_NAME`。部署前自行确认 Docker / kubectl context。

| 服务 | WSK 宿主机端口 | 容器端口 |
| --- | --- | --- |
| 管理台 dev / preview | 15173 | — |
| 官网 dev / preview | 15174 | — |
| API 网关 | 18090 | 8080 |
| MySQL / Redis | 13316 / 16389 | 3306 / 6379 |
| Elasticsearch | 19210 | 9200 |
| RocketMQ Proxy / 控制台 | 18091 / 28090 | 8081 / 8080 |
| Jaeger UI / OTLP | 26696 / 14327 | 16686 / 4317 |
| Prometheus / Grafana | 19090 / 13010 | 9090 / 3000 |

Docker 宿主机端口仅绑定 `127.0.0.1`，可在 `.env.wsk` 调整 `WSK_*_HOST_PORT`。内部服务继续使用 Compose DNS 和容器端口。构建镜像为 `wsk-auto/<service>:<WSK_TAG>`；MySQL 等第三方镜像仍可共享只读镜像层。

网络为 `wsk-auto_default`。数据卷独立创建为 `wsk-auto_mysql-data`、`wsk-auto_redis-data`、`wsk-auto_es-data`、`wsk-auto_rocketmq-data`，没有 external 卷或旧数据库目录绑定。业务库为 `wsk_auto`、账号为 `wsk`、ES 索引为 `wsk_products`。模板凭证和 JWT 密钥为 WSK 独立的本地演示值；生产部署需自行生成独立凭证。`.env.wsk` 已被 Git 和 Docker 构建上下文排除。

```sh
# 显式执行才会清表灌入电商演示数据
docker compose --env-file .env.wsk -p wsk-auto run --rm seed
# 停止 WSK 并保留数据
docker compose --env-file .env.wsk -p wsk-auto down
```

`make clean` / `dev-down.ps1 -Volumes` 会删除 WSK 卷，常规停止保留卷。无需对原项目执行 down、prune、重命名或数据迁移。

## 前端与宿主机 Go 调试

两个前端分别在 `frontend/`、`shop/` 运行 `npm ci`、`npm run dev`。dev / preview 均启用 strictPort，端口冲突直接退出。`dev-up.ps1` 启动后端并打印前端命令，由用户在各自终端运行，以便 Ctrl+C 停止；`dev-down.ps1 -KillFrontend` 直接报错，不再按端口杀进程。

两个前端的 `/api` 默认代理到 `http://127.0.0.1:18090`。调整网关端口时，在启动 Vite 的终端设置 `WSK_API_PROXY_TARGET`。根 `.env.wsk` 仅供 Compose，不自动注入 Vite。官网仍为静态构建 `shop/dist/`，试驾预约仍为本地演示。

`configs/config.yaml` 的宿主机地址同步隔离：HTTP 18090，gRPC 19001/19002/19003；MySQL 13316、Redis 16389、ES 19210、MQ 18091、OTLP 14327。宿主机调试应只启动所需基础设施，避免与同一 WSK Compose 网关同时占用 18090。Compose / K8s 用显式环境变量保持原有容器内部端口。裸 Go 进程仍支持原有环境变量覆盖，启动前应清理旧项目的 `MYSQL_*`、`GRPC_CLIENT_*` 等变量。

## Kubernetes

需要 Python 3（Makefile 默认 `python3`，可用 `PYTHON=python` 覆盖），以及 kubectl。

```sh
make k8s-build TAG=dev-wsk
# kind 或远程集群需自行加载/推送对应的 wsk-auto/*:dev-wsk 镜像
make k8s-apply TAG=dev-wsk
make k8s-status
kubectl port-forward -n wsk-auto svc/api-gateway 18090:8080
```

Secret、ConfigMap、StatefulSet、PVC 均在 `wsk-auto` 内独立创建，服务短名在本命名空间解析。可选 Ingress 使用 `wsk-auto.local`，HPA 同样在新命名空间。不要绑定旧 PV/PVC 或自动导入旧备份。

常规 `k8s-apply` 不包含 seed Job，只有 `make k8s-seed TAG=dev-wsk` 才会重建演示数据 Job。渲染器为各清单添加 YAML 文档边界，并统一替换镜像 TAG。`make k8s-delete` 删除 WSK 工作负载及可选 Ingress/HPA，保留命名空间和 PVC，避免 namespace delete 级联删除数据。

现有 K8s 清单仍未部署 ES / Jaeger，沿用 MySQL 搜索降级并关闭追踪。RocketMQ 仍为原本的 emptyDir 演示形态，Pod 重建消息会清空。上述清单及凭证模板仅为开发基线。

## 离线验证

```sh
python -m pip install PyYAML
python scripts/check-deployment-isolation.py
```

检查需要 Docker Compose CLI，无需启动 Docker 引擎或连接 K8s：覆盖默认渲染、旧环境变量注入、WSK 自定义覆盖、数据卷、端口、K8s 镜像和引用、seed 隔离与删除范围。代码检查之外，真实启动和原项目并存验证需在目标部署机器执行。
