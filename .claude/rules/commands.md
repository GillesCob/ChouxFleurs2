# Commandes du projet ChouxFleurs2

## Infrastructure Docker

```bash
# Démarrer MySQL + phpMyAdmin
docker compose up -d

# Arrêter les services
docker compose down

# Arrêter et supprimer les volumes (RESET BDD)
docker compose down -v
```

phpMyAdmin accessible sur http://localhost:8080

## Backend — NestJS (`/back`)

```bash
cd back

# Développement avec hot-reload
npm run start:dev

# Build production
npm run build

# Linter (corrige automatiquement)
npm run lint

# Tests
npm run test
```

## Backend — Prisma (`/back`)

```bash
cd back

# Synchroniser le schéma Prisma → BDD (dev, sans migration)
npm run prisma:push

# Créer une migration (avec nom)
npm run prisma:migrate

# Générer le client Prisma (après modification du schema.prisma)
npm run prisma:generate

# Interface graphique BDD
npm run prisma:studio
```

> Ordre typique après modification de `schema.prisma` :
> 1. `prisma:migrate` (crée la migration + applique)
> 2. `prisma:generate` (regénère le client TypeScript)

## Frontend — React/Vite (`/front`)

```bash
cd front

# Serveur de développement (http://localhost:5173)
npm run dev

# Build production
npm run build

# Prévisualiser le build
npm run preview

# Linter
npm run lint
```

## Ordre de démarrage recommandé

1. `docker compose up -d` (lance MySQL)
2. `cd back && npm run start:dev`
3. `cd front && npm run dev`
