# Intelligent Inventory Management System inventory-ai- Requirements

## Problem Description
Small-scale warehouse and store managers spend time on manual inventory monitoring
and tend to over order or run out of inventory. The system automatically monitors
the inventory levels and forecasts demand via machine learning algorithms before it gets too late.

## Stakeholders
- Small warehouses managers
- Store owners

## Functional Requirements
1. User registration and login using secure authentication method (JWT auth)
2. Ability for the user to perform CRUD operations on inventory items
3. System to forecast the demand for the upcoming 7 days using sales history (LSTM model)
4. System to alert the manager in case of predicted demand being higher than inventory available
5. Graphs showing inventory changes

## Non-Functional Requirements
- Response time less than 500ms on performing CRUD operations on API endpoints
- JWT token expiration in 24 hours
- No credentials stored in the code, use environment variables

## Out of scope
- Multitenant implementation
- Mobile application
- Payments processing functionality