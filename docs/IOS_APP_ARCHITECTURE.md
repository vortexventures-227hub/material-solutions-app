# Vortex Forklift Sales Machine — iOS App Architecture

**Project:** Native iOS App for Material Solutions Sales Machine  
**Version:** 1.0  
**Date:** 2026-03-29  
**Architect:** Axis (Opus)  
**Status:** Architecture Complete — Ready for Cipher

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Technical Stack](#2-technical-stack)
3. [App Structure](#3-app-structure)
4. [Data Layer](#4-data-layer)
5. [Networking Layer](#5-networking-layer)
6. [Features by Tab](#6-features-by-tab)
7. [Push Notifications](#7-push-notifications)
8. [Offline Mode](#8-offline-mode)
9. [Security](#9-security)
10. [UI/UX Guidelines](#10-uiux-guidelines)
11. [Implementation Tasks](#11-implementation-tasks)
12. [Environment & Deployment](#12-environment--deployment)

---

# 1. Executive Summary

## 1.1 Vision

A native iOS app that serves as **mobile headquarters** for the Vortex Forklift Sales Machine. Chris can manage inventory, track leads, publish to marketplaces, review intake submissions, and receive real-time notifications — all from his phone.

## 1.2 Backend

The app connects to the **existing Render backend**:
- **API Base URL:** `https://material-solutions-app.onrender.com`
- **Auth:** JWT tokens (access + refresh)
- **Test Credentials:** `admin@test.com` / `password123`

## 1.3 Key Features

| Feature | Priority | Description |
|---------|----------|-------------|
| **Dashboard** | P0 | Real-time stats (inventory count, leads, revenue) |
| **Inventory** | P0 | Full CRUD, photos, pricing, condition scoring |
| **Leads** | P0 | Pipeline view, scoring, contact info, notes |
| **Marketplace** | P1 | Publish controls, listing status, republish |
| **Intake** | P1 | Review seller submissions, approve/reject |
| **Notifications** | P1 | Push alerts for hot leads, new intake |
| **Offline Mode** | P2 | View cached data, queue changes for sync |

---

# 2. Technical Stack

## 2.1 Core Technologies

| Component | Technology | Rationale |
|-----------|------------|-----------|
| **UI Framework** | SwiftUI | Modern, declarative, iOS 17+ |
| **Data Persistence** | Swift Data | Apple's new persistence framework, simpler than Core Data |
| **Networking** | URLSession + async/await | Native, no dependencies |
| **Auth Storage** | Keychain | Secure token storage |
| **Push Notifications** | APNs + Firebase (optional) | Real-time alerts |
| **Image Loading** | AsyncImage + caching | Native SwiftUI |
| **Architecture** | MVVM + Repository Pattern | Clean separation |

## 2.2 Minimum Requirements

- **iOS:** 17.0+
- **Xcode:** 15.0+
- **Swift:** 5.9+

## 2.3 Dependencies (Minimal)

```swift
// Package.swift dependencies
.package(url: "https://github.com/auth0/JWTDecode.swift", from: "3.0.0"),
.package(url: "https://github.com/kishikawakatsumi/KeychainAccess", from: "4.2.0"),
```

---

# 3. App Structure

## 3.1 Project Layout

```
VortexSalesMachine/
├── App/
│   ├── VortexSalesMachineApp.swift     # Entry point
│   ├── AppState.swift                   # Global app state
│   └── ContentView.swift                # Root view with TabView
├── Models/
│   ├── Inventory.swift                  # Inventory model + Swift Data
│   ├── Lead.swift                       # Lead model + Swift Data
│   ├── Intake.swift                     # Intake submission model
│   ├── User.swift                       # User/auth model
│   └── Dashboard.swift                  # Dashboard stats model
├── Views/
│   ├── Dashboard/
│   │   ├── DashboardView.swift
│   │   └── StatCard.swift
│   ├── Inventory/
│   │   ├── InventoryListView.swift
│   │   ├── InventoryDetailView.swift
│   │   ├── InventoryEditView.swift
│   │   └── InventoryRow.swift
│   ├── Leads/
│   │   ├── LeadsListView.swift
│   │   ├── LeadDetailView.swift
│   │   └── LeadRow.swift
│   ├── Marketplace/
│   │   ├── MarketplaceView.swift
│   │   ├── PublishView.swift
│   │   └── ListingStatusView.swift
│   ├── Intake/
│   │   ├── IntakeListView.swift
│   │   └── IntakeDetailView.swift
│   ├── Settings/
│   │   └── SettingsView.swift
│   └── Auth/
│       ├── LoginView.swift
│       └── AuthGuard.swift
├── ViewModels/
│   ├── DashboardViewModel.swift
│   ├── InventoryViewModel.swift
│   ├── LeadsViewModel.swift
│   ├── MarketplaceViewModel.swift
│   └── IntakeViewModel.swift
├── Services/
│   ├── APIClient.swift                  # Base networking
│   ├── AuthService.swift                # Login, logout, token refresh
│   ├── InventoryService.swift           # Inventory API calls
│   ├── LeadsService.swift               # Leads API calls
│   ├── MarketplaceService.swift         # Publish API calls
│   ├── IntakeService.swift              # Intake API calls
│   └── NotificationService.swift        # Push notification handling
├── Repositories/
│   ├── InventoryRepository.swift        # Combines API + local cache
│   ├── LeadsRepository.swift
│   └── SyncManager.swift                # Offline sync queue
├── Utilities/
│   ├── KeychainManager.swift            # Secure storage
│   ├── ImageCache.swift                 # Image caching
│   └── Extensions.swift                 # Swift extensions
└── Resources/
    ├── Assets.xcassets                  # App icons, colors
    └── Info.plist
```

## 3.2 Tab Structure

```swift
TabView {
    DashboardView()
        .tabItem { Label("Dashboard", systemImage: "chart.bar.fill") }
    
    InventoryListView()
        .tabItem { Label("Inventory", systemImage: "shippingbox.fill") }
    
    LeadsListView()
        .tabItem { Label("Leads", systemImage: "person.crop.circle.badge.plus") }
    
    MarketplaceView()
        .tabItem { Label("Publish", systemImage: "megaphone.fill") }
    
    SettingsView()
        .tabItem { Label("Settings", systemImage: "gearshape.fill") }
}
```

---

# 4. Data Layer

## 4.1 Swift Data Models

### Inventory Model

```swift
import SwiftData

@Model
final class Inventory {
    @Attribute(.unique) var id: UUID
    var make: String
    var model: String
    var year: Int?
    var serial: String?
    var hours: Int?
    var capacityLbs: Int?
    var mastType: String?
    var liftHeightInches: Int?
    var powerType: String?
    var batteryInfo: String?
    var attachments: [String]
    var conditionNotes: String?
    var conditionScore: Int?
    var images: [String]  // URLs
    var purchasePrice: Decimal?
    var listingPrice: Decimal?
    var floorPrice: Decimal?
    var ceilingPrice: Decimal?
    var status: InventoryStatus
    var createdAt: Date
    var updatedAt: Date
    
    // Sync metadata
    var lastSyncedAt: Date?
    var pendingChanges: Bool = false
    
    enum InventoryStatus: String, Codable {
        case available, pending, sold, archived
    }
}
```

### Lead Model

```swift
@Model
final class Lead {
    @Attribute(.unique) var id: UUID
    var name: String?
    var email: String?
    var phone: String?
    var company: String?
    var source: String?
    var score: Int
    var status: LeadStatus
    var notes: String?
    var inventoryInterests: [UUID]  // Inventory IDs they viewed
    var createdAt: Date
    var updatedAt: Date
    var lastContactedAt: Date?
    
    // Computed
    var scoreCategory: ScoreCategory {
        if score >= 80 { return .hot }
        if score >= 40 { return .warm }
        return .cool
    }
    
    enum LeadStatus: String, Codable {
        case new, contacted, qualified, negotiating, won, lost
    }
    
    enum ScoreCategory {
        case hot, warm, cool
        
        var color: Color {
            switch self {
            case .hot: return .red
            case .warm: return .orange
            case .cool: return .blue
            }
        }
        
        var emoji: String {
            switch self {
            case .hot: return "🔥"
            case .warm: return "🟡"
            case .cool: return "🔵"
            }
        }
    }
}
```

## 4.2 Model Container Setup

```swift
@main
struct VortexSalesMachineApp: App {
    let container: ModelContainer
    
    init() {
        let schema = Schema([
            Inventory.self,
            Lead.self,
            Intake.self
        ])
        let config = ModelConfiguration(isStoredInMemoryOnly: false)
        container = try! ModelContainer(for: schema, configurations: config)
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(container)
    }
}
```

---

# 5. Networking Layer

## 5.1 API Client

```swift
actor APIClient {
    static let shared = APIClient()
    
    private let baseURL = URL(string: "https://material-solutions-app.onrender.com")!
    private let decoder: JSONDecoder = {
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        decoder.dateDecodingStrategy = .iso8601
        return decoder
    }()
    
    func request<T: Decodable>(
        endpoint: String,
        method: HTTPMethod = .get,
        body: Encodable? = nil,
        requiresAuth: Bool = true
    ) async throws -> T {
        var request = URLRequest(url: baseURL.appendingPathComponent(endpoint))
        request.httpMethod = method.rawValue
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        if requiresAuth {
            guard let token = await AuthService.shared.accessToken else {
                throw APIError.unauthorized
            }
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        if let body = body {
            request.httpBody = try JSONEncoder().encode(body)
        }
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        switch httpResponse.statusCode {
        case 200...299:
            return try decoder.decode(T.self, from: data)
        case 401:
            // Try refresh token
            try await AuthService.shared.refreshTokens()
            return try await self.request(endpoint: endpoint, method: method, body: body)
        case 403:
            throw APIError.forbidden
        case 404:
            throw APIError.notFound
        default:
            throw APIError.serverError(httpResponse.statusCode)
        }
    }
    
    enum HTTPMethod: String {
        case get = "GET"
        case post = "POST"
        case put = "PUT"
        case patch = "PATCH"
        case delete = "DELETE"
    }
    
    enum APIError: Error, LocalizedError {
        case unauthorized
        case forbidden
        case notFound
        case invalidResponse
        case serverError(Int)
        case networkError(Error)
        
        var errorDescription: String? {
            switch self {
            case .unauthorized: return "Please log in again"
            case .forbidden: return "You don't have permission"
            case .notFound: return "Resource not found"
            case .invalidResponse: return "Invalid server response"
            case .serverError(let code): return "Server error (\(code))"
            case .networkError(let error): return error.localizedDescription
            }
        }
    }
}
```

## 5.2 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | Login, returns tokens |
| `/api/auth/refresh` | POST | Refresh access token |
| `/api/dashboard/stats` | GET | Dashboard statistics |
| `/api/inventory` | GET | List inventory |
| `/api/inventory/:id` | GET/PATCH/DELETE | Single inventory |
| `/api/inventory` | POST | Create inventory |
| `/api/leads` | GET | List leads |
| `/api/leads/:id` | GET/PATCH | Single lead |
| `/api/publish/:id` | POST | Publish to marketplaces |
| `/api/publish/:id/status/:jobId` | GET | Publish job status |
| `/api/intake` | GET | List intake submissions |
| `/api/intake/:id` | GET/PATCH | Single intake |

---

# 6. Features by Tab

## 6.1 Dashboard

**Stats Cards:**
- Total Inventory (available/pending/sold)
- Leads This Month (hot/warm/cool breakdown)
- Revenue This Month
- Marketplace Listings Active

**Quick Actions:**
- Add Inventory
- View Hot Leads
- Recent Activity Feed

## 6.2 Inventory

**List View:**
- Search + filters (status, make, price range)
- Grid or list toggle
- Pull-to-refresh
- Swipe actions (edit, archive, publish)

**Detail View:**
- Photo gallery (horizontal scroll)
- Full specs
- Pricing (purchase, listing, floor, ceiling)
- Condition scoring
- Edit button
- Publish button (opens marketplace sheet)

**Edit View:**
- All fields editable
- Photo picker (camera + library)
- Auto-save on background

## 6.3 Leads

**List View:**
- Segmented control: All / Hot / Warm / Cool
- Search by name, company, phone
- Sort by score, date, status

**Detail View:**
- Contact info with tap-to-call, tap-to-email
- Score with history
- Inventory interests
- Notes (editable)
- Status picker
- Activity timeline

## 6.4 Marketplace

**List View:**
- Inventory items with publish status
- Filter: Published / Not Published / All

**Publish Flow:**
1. Select inventory item
2. Choose platforms (Website, Facebook, Craigslist, eBay, LinkedIn)
3. Preview AI-generated content per platform
4. Confirm and publish
5. Real-time progress (polling job status)
6. Results with links

## 6.5 Settings

- Account info
- Logout
- Notification preferences
- Clear cache
- App version
- Support contact

---

# 7. Push Notifications

## 7.1 Notification Types

| Type | Trigger | Payload |
|------|---------|---------|
| `hot_lead` | Lead score hits 80+ | lead_id, name, score |
| `new_intake` | New seller submission | intake_id, equipment |
| `publish_complete` | Marketplace job done | inventory_id, platforms |
| `daily_digest` | 8 AM daily | stats summary |

## 7.2 Implementation

```swift
class NotificationService: NSObject, UNUserNotificationCenterDelegate {
    static let shared = NotificationService()
    
    func requestPermission() async -> Bool {
        let center = UNUserNotificationCenter.current()
        do {
            let granted = try await center.requestAuthorization(options: [.alert, .badge, .sound])
            if granted {
                await MainActor.run {
                    UIApplication.shared.registerForRemoteNotifications()
                }
            }
            return granted
        } catch {
            return false
        }
    }
    
    func handleNotification(_ userInfo: [AnyHashable: Any]) {
        guard let type = userInfo["type"] as? String else { return }
        
        switch type {
        case "hot_lead":
            if let leadId = userInfo["lead_id"] as? String {
                NotificationCenter.default.post(
                    name: .navigateToLead,
                    object: nil,
                    userInfo: ["leadId": leadId]
                )
            }
        case "new_intake":
            if let intakeId = userInfo["intake_id"] as? String {
                NotificationCenter.default.post(
                    name: .navigateToIntake,
                    object: nil,
                    userInfo: ["intakeId": intakeId]
                )
            }
        default:
            break
        }
    }
}
```

---

# 8. Offline Mode

## 8.1 Sync Strategy

**Read (always available):**
- All data cached in Swift Data on fetch
- Last sync timestamp per entity type
- Stale data indicator (> 5 min since sync)

**Write (queue when offline):**
- Changes saved to Swift Data immediately
- `pendingChanges` flag set to true
- SyncManager queues API call
- On reconnect, flush queue in order
- Conflict resolution: server wins, notify user

## 8.2 SyncManager

```swift
actor SyncManager {
    static let shared = SyncManager()
    
    private var pendingOperations: [SyncOperation] = []
    private var isOnline = true
    
    struct SyncOperation: Codable {
        let id: UUID
        let entityType: String
        let entityId: UUID
        let operation: OperationType
        let payload: Data
        let createdAt: Date
        
        enum OperationType: String, Codable {
            case create, update, delete
        }
    }
    
    func queueOperation(_ operation: SyncOperation) {
        pendingOperations.append(operation)
        persistQueue()
    }
    
    func flushQueue() async {
        guard isOnline else { return }
        
        for operation in pendingOperations {
            do {
                try await executeOperation(operation)
                removeFromQueue(operation.id)
            } catch {
                // Keep in queue for retry
                break
            }
        }
    }
    
    // ... persistence and execution logic
}
```

---

# 9. Security

## 9.1 Token Storage

```swift
class KeychainManager {
    static let shared = KeychainManager()
    private let keychain = Keychain(service: "com.vortexventures.salesmachine")
    
    var accessToken: String? {
        get { try? keychain.get("access_token") }
        set {
            if let value = newValue {
                try? keychain.set(value, key: "access_token")
            } else {
                try? keychain.remove("access_token")
            }
        }
    }
    
    var refreshToken: String? {
        get { try? keychain.get("refresh_token") }
        set {
            if let value = newValue {
                try? keychain.set(value, key: "refresh_token")
            } else {
                try? keychain.remove("refresh_token")
            }
        }
    }
    
    func clearAll() {
        try? keychain.removeAll()
    }
}
```

## 9.2 Security Measures

- Tokens stored in Keychain (not UserDefaults)
- Certificate pinning for API calls (optional, P2)
- Biometric auth for app unlock (optional, P2)
- Auto-logout after 30 days inactive
- Clear cache on logout

---

# 10. UI/UX Guidelines

## 10.1 Design System

**Colors:**
```swift
extension Color {
    static let vortexOrange = Color(hex: "#F97316")
    static let vortexSteel = Color(hex: "#64748B")
    static let vortexDark = Color(hex: "#1E293B")
    static let vortexLight = Color(hex: "#F8FAFC")
}
```

**Typography:**
- SF Pro Display for headings
- SF Pro Text for body
- SF Mono for prices/numbers

**Spacing:**
- 8pt grid system
- Standard padding: 16pt
- Card padding: 20pt

## 10.2 Components

- **StatCard:** Dashboard stat display
- **InventoryRow:** List item with image, title, price, status badge
- **LeadRow:** List item with avatar, name, score badge, status
- **StatusBadge:** Colored pill (available/pending/sold/hot/warm/cool)
- **PriceDisplay:** Formatted currency with floor/ceiling range
- **PhotoGallery:** Horizontal scroll with zoom
- **ActionButton:** Primary CTA style

## 10.3 Animations

- Pull-to-refresh with haptic
- Tab switch: cross-dissolve
- List insert/delete: slide
- Status changes: spring animation
- Loading states: skeleton views

---

# 11. Implementation Tasks

## Phase 1: Foundation (Day 1)

| Task | Owner |
|------|-------|
| Create Xcode project with Swift Data | Cipher |
| Set up project structure | Cipher |
| Implement APIClient | Cipher |
| Implement AuthService + KeychainManager | Cipher |
| Create LoginView | Cipher |
| Set up TabView skeleton | Cipher |

## Phase 2: Core Features (Days 2-3)

| Task | Owner |
|------|-------|
| Dashboard: DashboardView + ViewModel | Cipher |
| Inventory: List + Detail + Edit views | Cipher |
| Inventory: Photo picker + gallery | Cipher |
| Leads: List + Detail views | Cipher |
| Pull-to-refresh + loading states | Cipher |

## Phase 3: Advanced Features (Days 4-5)

| Task | Owner |
|------|-------|
| Marketplace: Publish flow | Cipher |
| Intake: List + Detail + approve/reject | Cipher |
| Push notifications setup | Cipher |
| Offline mode + SyncManager | Cipher |
| Settings view | Cipher |

## Phase 4: Polish (Day 6)

| Task | Owner |
|------|-------|
| Design system refinement | Cipher |
| Animations + haptics | Cipher |
| Error handling + empty states | Cipher |
| App icon + launch screen | Cipher |
| TestFlight build | Cipher |

---

# 12. Environment & Deployment

## 12.1 Environment Variables

```swift
enum Environment {
    static let apiBaseURL: String = {
        #if DEBUG
        return "https://material-solutions-app.onrender.com"
        #else
        return "https://material-solutions-app.onrender.com"
        #endif
    }()
    
    static let apnsEnvironment: String = {
        #if DEBUG
        return "development"
        #else
        return "production"
        #endif
    }()
}
```

## 12.2 Build Configurations

- **Debug:** Local testing, verbose logging
- **Release:** Production API, no logging

## 12.3 App Store Submission

**App Info:**
- Name: Vortex Sales Machine
- Bundle ID: com.vortexventures.salesmachine
- Category: Business
- Age Rating: 4+

**Required:**
- Privacy Policy URL
- App Store screenshots (6.7", 6.5", 5.5")
- App description
- Keywords

---

# Appendix A: API Response Examples

## Inventory List Response

```json
{
  "data": [
    {
      "id": "uuid",
      "make": "Raymond",
      "model": "8610",
      "year": 2019,
      "serial": "8610-12345",
      "hours": 4200,
      "capacity_lbs": 4500,
      "mast_type": "triple",
      "lift_height_inches": 300,
      "power_type": "electric",
      "condition_score": 85,
      "images": ["https://..."],
      "listing_price": 17500.00,
      "status": "available",
      "created_at": "2026-03-29T..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

## Lead Response

```json
{
  "id": "uuid",
  "name": "John Smith",
  "email": "john@example.com",
  "phone": "973-555-1234",
  "company": "ABC Logistics",
  "source": "website",
  "score": 85,
  "status": "qualified",
  "notes": "Interested in reach trucks",
  "inventory_interests": ["uuid1", "uuid2"],
  "created_at": "2026-03-29T...",
  "last_contacted_at": "2026-03-29T..."
}
```

---

**Architecture Complete.**

Ready for Cipher to implement.

**Timeline:** 6 days to TestFlight

**Next Session:** Delegate Phase 1 (Foundation) to Cipher immediately.

---

_Architected by Axis on Opus | 2026-03-29 23:50 EDT_
