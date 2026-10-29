# MARTVERSE — Immersive 3D Virtual Supermarket

> **"Walk In. Pick What You Love. Shop in 3D."**

A production-grade, immersive 3D virtual supermarket e-commerce platform inspired by the physical shopping experience of **DMart** and the convenience of **BigBasket**.

---

## 🏬 What is Martverse?

Martverse moves beyond flat 2D e-commerce catalogs by recreating the tactile, sensory thrill of visiting an Indian hypermarket in real-time 3D:

1. **Two Full Floors**:
   - **Ground Floor (Grocery & Staples)**: Aisle 1 (Snacks & Biscuits), Aisle 2 (Grains, Atta, Rice & Edible Oils), Aisle 3 (Fresh Dairy & Beverages), Aisle 4 (Noodles & Packaged Foods), Aisle 5 (Detergents & Home Care).
   - **First Floor (Fashion & Apparel)**: Reached via a moving 3D escalator — Men’s Shirts, Jeans, Kurtas, Ethnic Wear, Women’s Western Wear, Kids Fashion.
2. **Physical Shopping Trolley**:
   - DMart-style tubular wire mesh cart with signature red handlebar and caster wheels.
   - Smoothly follows behind the shopper in 3D space.
   - Live products visibly stack inside the trolley basket.
   - Parabolic 3D arc flight animation when adding items from shelf to trolley!
3. **Realistic POS Barcode Billing**:
   - Shoppers walk to Checkout Counters 1–3.
   - Animated conveyor belt and pulsing red laser barcode scanner with realistic sound beeps.
   - Digital POS receipt calculation with DMart Bachat savings.
4. **Instant Test Payment & Razorpay Gateway**:
   - Verified sandbox checkout or live Razorpay integration.
5. **Smart Anti-Theft Exit Gates**:
   - RFID scanner turnstiles lock with warning buzzer if unpaid items remain.
   - Unlocks with green illumination, open swing animation, and celebration confetti upon checkout completion!

---

## 🛠️ Architecture & Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **3D Engine**: Three.js + React Three Fiber (`@react-three/fiber`) + `@react-three/drei`
- **Styling**: Tailwind CSS + Modern Dark Mode Aesthetic
- **State Management**: Zustand stores (`useMartStore`, `useCartStore`, `useBillingStore`)
- **Audio Synthesizer**: Web Audio API Sound Effects (no external audio files needed!)
- **Celebration Effects**: `canvas-confetti`

### Backend
- **Framework**: Java 21 + Spring Boot 3.2.x
- **Database**: PostgreSQL (Supabase compatible)
- **Security**: Spring Security + Stateless JWT (JJWT 0.12.x)
- **Documentation**: SpringDoc OpenAPI / Swagger UI
- **Payment Processing**: Razorpay SDK + HMAC-SHA256 signature verification + Test mode sandbox

---

## 🚀 Running the Application Locally

### 1. Running Frontend
```bash
cd frontend
npm install
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 2. Running Backend
```bash
cd backend
mvn spring-boot:run
```
- API Base URL: `http://localhost:8080/api`
- Swagger UI Documentation: `http://localhost:8080/swagger-ui.html`
- OpenAPI Specification: `http://localhost:8080/api-docs`

---

## 🎮 3D Navigation Controls

| Key / Action | Action |
|---|---|
| **W / A / S / D** or **Arrow Keys** | Walk forward, left, backward, right |
| **Mouse Drag** | Look around in 360° |
| **E Key** or **Left Click** | Inspect product on shelf / Start POS billing / Open exit gate |
| **Escalator (Right wall)** | Walk on the escalator to glide up to Floor 2 (Fashion) |
| **Top Right Trolley Button** | Open shopping trolley drawer and bill breakdown |
| **Minimap (Bottom Right)** | Real-time top-down store radar showing player location |
| **Camera Toggle** | Switch between First-Person eye view and Third-Person trolley view |

---

## 📦 Key Directory Structure

```text
3d Ecommerce/
├── backend/
│   ├── src/main/java/com/martverse/
│   │   ├── config/            # SecurityConfig, OpenApiConfig
│   │   ├── controller/        # Auth, Product, Layout, Cart, Order, Payment
│   │   ├── dto/               # Request & response models
│   │   ├── entity/            # JPA entities (Floor, Aisle, Placement, Product, Cart, Order)
│   │   ├── enums/             # OrderStatus, PaymentStatus, UserRole
│   │   ├── exception/         # GlobalExceptionHandler
│   │   ├── repository/        # Spring Data JPA repositories
│   │   ├── security/          # JwtTokenProvider, JwtAuthenticationFilter
│   │   └── service/           # AuthService, ProductService, MartLayoutService, CartService, OrderService, PaymentService
│   └── src/main/resources/
│       ├── application.yml    # App & Database configuration
│       └── db/
│           ├── schema.sql     # Full relational schema
│           └── seed.sql       # 66 realistic Indian products & 3D shelf coordinates
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── admin/         # Operations & Inventory Dashboard (/admin)
    │   │   ├── layout.tsx     # Global layout & SEO metadata
    │   │   └── page.tsx       # 3D Supermarket main experience (/)
    │   ├── components/
    │   │   ├── supermarket/   # SupermarketScene, StoreArchitecture, ShelfUnit, TrolleyModel, BillingCounter3D, ExitGate3D, PlayerController, FlyingProductArc
    │   │   └── ui/            # SupermarketHUD, ProductModal, CartDrawer, BillingModal, ExitModal
    │   ├── lib/               # api.ts, mockData.ts, sound.ts
    │   ├── store/             # useMartStore.ts, useCartStore.ts, useBillingStore.ts
    │   └── types/             # TypeScript definitions
```
