# ===========================================
# Food Platform - Makefile
# ===========================================

.PHONY: help install dev build start stop logs clean db-migrate db-seed db-studio docker-dev docker-up docker-down

# Default target
help:
	@echo "Food Platform - Available commands:"
	@echo ""
	@echo "  Development:"
	@echo "    make install    - Install all dependencies"
	@echo "    make dev        - Start development servers"
	@echo "    make build      - Build all applications"
	@echo ""
	@echo "  Database:"
	@echo "    make db-migrate - Run database migrations"
	@echo "    make db-seed    - Seed database with test data"
	@echo "    make db-studio  - Open Prisma Studio"
	@echo ""
	@echo "  Docker:"
	@echo "    make docker-dev - Start dev infrastructure (DB, Redis, n8n)"
	@echo "    make docker-up  - Start all services in production mode"
	@echo "    make docker-down- Stop all Docker services"
	@echo "    make logs       - View Docker logs"
	@echo ""
	@echo "  Cleanup:"
	@echo "    make clean      - Remove node_modules and build artifacts"

# ===========================================
# Development
# ===========================================

install:
	pnpm install

dev:
	pnpm dev

build:
	pnpm build

start:
	pnpm start

# ===========================================
# Database
# ===========================================

db-migrate:
	pnpm db:migrate

db-push:
	pnpm db:push

db-seed:
	pnpm db:seed

db-studio:
	pnpm db:studio

db-generate:
	pnpm db:generate

# ===========================================
# Docker
# ===========================================

docker-dev:
	docker-compose -f docker-compose.dev.yml up -d
	@echo ""
	@echo "✅ Development infrastructure started!"
	@echo ""
	@echo "  PostgreSQL: localhost:5432"
	@echo "  Redis:      localhost:6379"
	@echo "  n8n:        http://localhost:5678 (admin/admin123)"
	@echo "  MinIO:      http://localhost:9001 (minioadmin/minioadmin)"
	@echo "  Adminer:    http://localhost:8080"
	@echo "  Redis GUI:  http://localhost:8081"
	@echo ""

docker-up:
	docker-compose up -d --build
	@echo ""
	@echo "✅ All services started!"
	@echo ""
	@echo "  User App:     http://localhost:3000"
	@echo "  Merchant App: http://localhost:3001"
	@echo "  Admin Panel:  http://localhost:3002"
	@echo "  API:          http://localhost:4000"
	@echo "  n8n:          http://localhost:5678"
	@echo ""

docker-down:
	docker-compose down
	docker-compose -f docker-compose.dev.yml down

docker-down-volumes:
	docker-compose down -v
	docker-compose -f docker-compose.dev.yml down -v

logs:
	docker-compose logs -f

logs-api:
	docker-compose logs -f api

# ===========================================
# Cleanup
# ===========================================

clean:
	rm -rf node_modules
	rm -rf apps/*/node_modules
	rm -rf packages/*/node_modules
	rm -rf apps/*/.next
	rm -rf packages/*/dist
	rm -rf .turbo

# ===========================================
# Quick Start
# ===========================================

setup: install docker-dev db-push db-seed
	@echo ""
	@echo "✅ Setup complete! Run 'make dev' to start development."

