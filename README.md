<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

````bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode

# Inventory Management API

## How to Run

1. Install dependencies:
   ```bash
   npm install
````

2. Start the server (default port 3000):
   ```bash
   npm run start:dev
   ```
3. Environment variables (create a `.env` file):
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=your_db_user
   DB_PASS=your_db_password
   DB_NAME=your_db_name
   # Add other relevant envs as needed
   ```

## API Endpoints

### Product

- `POST /products` - Create product
- `GET /products` - List products
- `GET /products/paginated` - Paginated products
- `GET /products/:uuid` - Get product by UUID
- `PUT /products/:uuid` - Update product
- `DELETE /products/:uuid` - Delete product
- `GET /products/stats/total` - Product stats

### Warehouse

- `POST /warehouses` - Create warehouse
- `GET /warehouses` - List warehouses
- `GET /warehouses/paginated` - Paginated warehouses
- `GET /warehouses/:uuid` - Get warehouse by UUID
- `PUT /warehouses/:uuid` - Update warehouse
- `DELETE /warehouses/:uuid` - Delete warehouse
- `GET /warehouses/stats/total` - Non-deleted warehouse stats
- `GET /warehouses/stats/deleted` - Deleted warehouse stats

### Stock

- `POST /stocks` - Create stock
- `GET /stocks` - List stocks
- `GET /stocks/paginated` - Paginated stocks
- `GET /stocks/:uuid` - Get stock by UUID
- `PUT /stocks/:uuid` - Update stock
- `DELETE /stocks/:uuid` - Delete stock
- `GET /stocks/stats/refill` - Refill stats
- `GET /stocks/stats/stock-status-pie` - Stock status pie
- `GET /stocks/stats/products-by-quantity-order` - Products by quantity order

### Transaction

- `POST /transactions` - Create transaction
- `GET /transactions` - List transactions
- `GET /transactions/paginated` - Paginated transactions
- `GET /transactions/:uuid` - Get transaction by UUID
- `PUT /transactions/:uuid` - Update transaction
- `DELETE /transactions/:uuid` - Delete transaction
- `GET /transactions/stats/monthly-sales` - Monthly sales stats
- `GET /transactions/stats/daily-warehouse-sales` - Daily warehouse sales chart

### Transfer

- `POST /transfers` - Create transfer
- `POST /transfers/:uuid/receive` - Receive transfer
- `POST /transfers/:uuid/approve` - Approve transfer
- `POST /transfers/:uuid/decline` - Decline transfer

## Other Information

- All endpoints return a standardized ApiResponse object.
- Pagination endpoints accept `page` and `limit` query parameters.
- Filtering/searching is available via query parameters.
- UUID parameters must be valid resource identifiers.
- CORS is enabled for all origins.
- For request/response DTOs, see the respective module's `dtos` folder.

---

For more details, see the source code in the `src/modules` directory.

- `DELETE /transactions/:uuid` - Delete transaction by UUID
- `GET /transactions/stats/monthly-sales` - Get monthly sales stats (query: warehouseId)
- `GET /transactions/stats/daily-warehouse-sales` - Get daily warehouse sales chart (query: startDate, endDate)

### Transfer Endpoints

- `POST /transfers` - Create a transfer
- `POST /transfers/:uuid/receive` - Receive a transfer
- `POST /transfers/:uuid/approve` - Approve a transfer
- `POST /transfers/:uuid/decline` - Decline a transfer

---

## Additional Details

- All endpoints return a standardized ApiResponse object.
- Pagination endpoints accept `page` and `limit` query parameters.
- Most endpoints support filtering and searching via query parameters.
- UUID parameters must be valid resource identifiers.
- For request/response DTOs, see the respective module's `dtos` folder.
- Authentication and authorization are not enabled by default.
- CORS is enabled for all origins.

For more details, see the source code in the `src/modules` directory.
