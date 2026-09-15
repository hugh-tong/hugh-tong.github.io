---
title: 工业级 Python 项目从零构建与规范清单
date: 2026-09-15 16:00:00
categories:
  - [CS, 编程, Python]
tags:
  - CS/编程/Python
  - Git
  - Bash
  - 浸没边界法
  - Python
description: 从项目骨架到工具链配置的 Python 工业级项目规范清单。
mathjax: true
---

# 工业级 Python 项目从零构建与规范清单

下面给出一套在团队/企业中可落地的“从零到上线”的项目骨架、工具链与最佳实践。适用于库、CLI 工具与服务端项目（Web/微服务）。示例采用现代 `pyproject.toml` 工作流与 `src/` 布局，工具以稳定与团队协作友好为优先。

---

## 1. 选型与总原则

- **Python 版本策略**：统一最低版本（如 3.10+），设定 EOL 升级节奏；CI 覆盖需要支持的多个版本。
- **布局**：推荐 `src/` 布局，避免测试时意外导入本地目录。
- **依赖管理**：使用基于 `pyproject.toml` 的单一真源。
  - 现代方案：uv（快、全能）、Poetry（成熟）、PDM（纯 PEP 实现）、pip-tools（简洁可控）。
- **代码质量四件套**：格式化（black/ruff format）、静态检查（ruff）、类型检查（mypy/pyright）、测试（pytest）。
- **自动化**：pre-commit 钩子 + CI（GitHub Actions/GitLab CI）。
- **配置与秘密**：12-Factor，环境变量优先；不要把密钥进仓库，集中用 Vault/Secrets 管理。
- **可观测性**：结构化日志、指标、追踪；生产日志建议 JSON。
- **安全与合规**：SCA（pip-audit/safety）、代码扫描（bandit）、许可证/依赖白名单、SBOM。

---

## 2. 项目目录模板

```text
your-project/
├─ pyproject.toml
├─ README.md
├─ LICENSE
├─ .gitignore
├─ .editorconfig
├─ .pre-commit-config.yaml
├─ .ruff.toml
├─ mypy.ini
├─ pytest.ini
├─ Makefile                # 或 noxfile.py / justfile
├─ docs/                   # Sphinx/MkDocs
├─ src/
│  └─ your_pkg/
│     ├─ __init__.py
│     ├─ app.py
│     └─ core/
├─ tests/
│  ├─ conftest.py
│  └─ test_app.py
├─ scripts/                # 仅开发脚本，不打包
└─ docker/
   ├─ Dockerfile
   └─ gunicorn.conf.py
```

---

## 3. pyproject.toml（示例：Poetry/uv 二选一）

### 方案 A：Poetry（经典稳定）
```toml
[tool.poetry]
name = "your-project"
version = "0.1.0"
description = "Awesome service/library"
authors = ["Team <dev@example.com>"]
readme = "README.md"
license = "MIT"
packages = [{ include = "your_pkg", from = "src" }]

[tool.poetry.dependencies]
python = ">=3.10,<3.13"
pydantic = "^2.7"

[tool.poetry.group.dev.dependencies]
pytest = "^8.2"
pytest-cov = "^5.0"
ruff = "^0.5"
mypy = "^1.10"
black = "^24.8"
pre-commit = "^3.8"
pip-audit = "^2.7"
bandit = "^1.7"

[tool.poetry.scripts]
your-cli = "your_pkg.app:main"  # 生成可执行 CLI

[build-system]
requires = ["poetry-core>=1.9"]
build-backend = "poetry.core.masonry.api"
```

安装与锁定：
```bash
poetry install
poetry run pre-commit install
```

### 方案 B：uv（超快、简洁）
```toml
[project]
name = "your-project"
version = "0.1.0"
description = "Awesome service/library"
readme = "README.md"
requires-python = ">=3.10"
license = {text = "MIT"}
dependencies = ["pydantic>=2.7"]
scripts = { your-cli = "your_pkg.app:main" }

[project.optional-dependencies]
dev = ["pytest>=8.2", "pytest-cov>=5.0", "ruff>=0.5", "mypy>=1.10", "black>=24.8", "pre-commit>=3.8", "pip-audit>=2.7", "bandit>=1.7"]

[tool.uv]
dev-dependencies = ["your-project[dev]"]

[build-system]
requires = ["hatchling>=1.25"]
build-backend = "hatchling.build"
```

安装与锁定：
```bash
uv venv && . .venv/bin/activate
uv pip install -e ".[dev]"  # 可生成 uv.lock
pre-commit install
```

> 若你偏好 requirements.txt 工作流，用 pip-tools：`pip-compile --generate-hashes` + `pip-sync`。

---

## 4. 代码风格与检查

- **格式化**：统一用 `ruff format` 或 `black`，CI 强制。
- **静态检查**：`ruff`（替代 flake8+isort+pydocstyle 等）。
- **类型**：`mypy`（或 `pyright`），对公共 API 要求 100% 类型注解。
- **Docstring**：Google 或 NumPy 风格 + PEP 257。

示例 `.ruff.toml`：
```toml
line-length = 100
target-version = "py310"
lint.select = ["E","F","W","I","N","D","UP","B","C4","SIM","PERF","ARG","RUF"]
lint.ignore = ["D203","D212"]  # 依据团队偏好
```

`mypy.ini`：
```ini
[mypy]
python_version = 3.10
strict = True
warn_unused_ignores = True
disallow_untyped_defs = True
plugins = pydantic.mypy
```

---

## 5. 测试与覆盖率

- 框架：`pytest`
- 目标：单元测试覆盖率 ≥ 80%（关键模块更高），集成测试分层。
- 工具：`pytest-cov`、`hypothesis`（性质测试）、`factory_boy`/`faker`。

`pytest.ini`：
```ini
[pytest]
addopts = -q --strict-markers --maxfail=1 --cov=your_pkg --cov-report=term-missing
testpaths = tests
```

示例测试：
```python
# tests/test_app.py
from your_pkg.app import add

def test_add():
    assert add(1, 2) == 3
```

---

## 6. 预提交钩子与自动化

`.pre-commit-config.yaml`：
```yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.5.6
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format
  - repo: https://github.com/psf/black
    rev: 24.8.0
    hooks: [{ id: black }]
  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.10.1
    hooks: [{ id: mypy, additional_dependencies: [pydantic] }]
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.6.0
    hooks:
      - id: check-merge-conflict
      - id: end-of-file-fixer
      - id: trailing-whitespace
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.2
    hooks: [{ id: gitleaks }]

```

`Makefile`（或 nox/just）：
```makefile
.PHONY: fmt lint test type audit
fmt: ; ruff format && black .
lint: ; ruff .
type: ; mypy .
test: ; pytest
audit: ; pip-audit || true
all: fmt lint type test
```

---

## 7. 配置、日志与错误处理

- **配置**：使用环境变量，必要时 `.env` 文件；用 `pydantic-settings` 做强类型配置，多环境覆盖。
- **日志**：`logging`/`structlog`，生产输出 JSON（便于 ELK/云日志）。
- **错误**：定义领域异常层级；重试使用 `tenacity`；外部接口要超时与重试策略。

示例：
```python
import logging, os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    env: str = "dev"
    db_url: str
    class Config: env_file = ".env"

settings = Settings()
log = logging.getLogger(__name__)
logging.basicConfig(level=os.getenv("LOG_LEVEL","INFO"), format="%(asctime)s %(levelname)s %(name)s %(message)s")
```

---

## 8. Web/服务特化（如 FastAPI）

- 服务器：`uvicorn`（ASGI），生产用 `gunicorn -k uvicorn.workers.UvicornWorker`。
- 健康检查、就绪探针、超时、限流、CORS。
- 数据层：SQLAlchemy + Alembic 迁移；或异步栈（async SQL drivers）。
- 可观测性：OpenTelemetry（traces, metrics），Prometheus 指标。
- 并发：I/O 密集选 asyncio；CPU 密集用多进程或 C 扩展；避免阻塞事件循环。

---

## 9. 打包与发布

- 库：发布 sdist + wheel 到私服（Artifactory/DevPi）或 PyPI；版本用 **SemVer** 或 **CalVer**。
- 应用/服务：容器化部署（K8s、Nomad）。

Docker 多阶段示例（slim、非 root、可复现）：
```dockerfile
FROM python:3.11-slim AS base
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
RUN useradd -m app

FROM base AS builder
WORKDIR /app
COPY pyproject.toml ./
RUN pip install --upgrade pip uv
COPY . .
RUN uv pip install --system -e ".[dev]"  # 或 poetry export + pip install

FROM base AS runtime
WORKDIR /app
COPY --from=builder /usr/local /usr/local
COPY src/ src/
USER app
CMD ["your-cli"]  # 或 gunicorn -c docker/gunicorn.conf.py your_pkg.web:app
```

---

## 10. 安全与供应链

- 依赖审计：`pip-audit`/`safety`；CI 阶段强制。
- 代码安全：`bandit`；密钥扫描：`gitleaks`/`trufflehog`。
- 可重现构建：锁定版本与哈希（pip-tools 生成 hashes，或用 lockfile）；记录 SBOM（CycloneDX）。
- 私有源与镜像：配置可信索引、凭证隔离；不在仓库存放 `.pypirc` 明文。

---

## 11. 文档与协作

- 文档站：Sphinx 或 MkDocs（Material 主题）；README 面向上手，docs 面向用户。
- 变更日志：Keep a Changelog；自动生成（commitizen、towncrier）。
- 贡献指南与规范：`CONTRIBUTING.md`、`CODE_OF_CONDUCT.md`、`SECURITY.md`。
- ADR（架构决策记录）：`docs/adr/` 保留关键决策的背景与取舍。

---

## 12. 常见陷阱与实践

- 避免相对导入地狱，统一用绝对导入。
- 不要用可变对象作默认参数（用 `None` + 初始化）。
- 时区使用 UTC，持久化用 ISO-8601；金额用 `decimal.Decimal`。
- 文件路径用 `pathlib`; 文本编码显式 `utf-8`。
- 小心循环依赖；拆分模块或延迟导入。
- 长任务注意优雅退出与信号处理（SIGTERM）；使用上下文管理器确保资源释放。
- 性能诊断：`cProfile`, `py-spy`, `scalene`；热点再优化，不做过早优化。

---

## 13. 一键初始化脚本（可选）

```bash
# 初始化项目骨架（Poetry 版简化示例）
poetry new --src your-project && cd your-project
poetry add pydantic
poetry add -D pytest pytest-cov ruff black mypy pre-commit pip-audit bandit
git init && pre-commit install
```

---

如果你能提供项目类型（库/CLI/服务）、运行环境（容器/K8s/本地/Serverless）、组织的合规要求（私有源、审计、SBOM），我可以给出更精确的模板文件与 CI 配置。
