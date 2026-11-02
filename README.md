# SOLE HOUSE — Premium Shoe Market

A responsive shoe-store frontend built with HTML, CSS and vanilla JavaScript. It upgrades the original basic Nike pages into a multi-category shoe marketplace demo.

## Run the project

1. Extract `premium_shoe_market.zip`.
2. Open the `premium_shoe_market` folder.
3. Double-click `index.html` to open it in Chrome, Edge or Firefox.
4. Internet is required for Google Fonts and the Unsplash product photography. The shop interactions run in your browser.

Recommended: use the VS Code Live Server extension and open `index.html` with Live Server.

## Included features

- Responsive homepage and promotional sections
- 24 sample products across Men, Women, Kids, Sports and Lifestyle
- Search by product name, brand, category and color
- Category, brand, price, size and stock filters
- Sorting by featured, price, rating and newest
- Product detail modal with size selection
- Quick add and shopping cart with quantity controls
- Wishlist
- Demo customer profile
- Demo checkout form and order history
- Newsletter signup demo
- Cart, wishlist, profile, orders and newsletter subscriptions saved in browser LocalStorage

## Project files

- `index.html` — page structure and dialogs
- `style.css` — layout, visual design and responsive rules
- `products.js` — sample product catalogue
- `app.js` — search, filtering, cart, wishlist, checkout and LocalStorage logic

## Important: demo vs real online store

This is a frontend prototype. It does **not** yet have:
- A shared server/database, so each browser has its own LocalStorage data
- Secure server-side customer accounts or password authentication
- Real stock synchronization or order processing
- Real payment processing
- Admin permissions or a protected admin dashboard
- Email/SMS notifications, shipping integration or tax calculation

Do not collect real customer data or accept real payments with this demo. For production, add a backend (for example Python Flask), MySQL database, secure authentication, server-side validation, admin authorization, payment provider integration and HTTPS.

## Suggested next development stage

1. Create Flask backend and MySQL schema.
2. Add secure registration/login and roles (customer/admin).
3. Replace sample products with database-driven inventory and image uploads.
4. Store carts, orders, addresses and reviews in MySQL.
5. Build a protected admin dashboard.
6. Integrate a supported payment provider and order notifications.
