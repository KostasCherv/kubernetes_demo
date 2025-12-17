# Frontend Service

A Next.js management dashboard for the Kubernetes microservices demo.

## Features

- **Authentication**: Login with JWT token
- **Dashboard**: Overview of users and products
- **Users Management**: View, create, edit, and delete users
- **Products Management**: View, create, edit, and delete products

## Local Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

1. Install dependencies:
```bash
npm install
```

2. Set environment variable (optional, defaults to `http://localhost:3000`):
```bash
export NEXT_PUBLIC_API_URL=http://localhost:3000
```

3. Run development server:
```bash
npm run dev
```

4. Open [http://localhost:3001](http://localhost:3001) in your browser

### Default Login Credentials

- Username: `testuser`
- Password: `testpass123`

## API Integration

The frontend connects to the API Gateway at the following endpoints:

- `POST /auth/login` - User authentication
- `GET /auth/validate` - Token validation
- `GET /users` - List all users
- `POST /users` - Create user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `GET /products` - List all products
- `POST /products` - Create product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

## Kubernetes Deployment

### Build Docker Image

```bash
cd app/services/frontend
docker build -t frontend:latest .
```

### Deploy to Kubernetes

```bash
# Apply namespace (if not already created)
kubectl apply -f ../../namespace.yaml

# Apply ConfigMap
kubectl apply -f k8s/configmap.yaml

# Apply Deployment
kubectl apply -f k8s/deployment.yaml

# Apply Service
kubectl apply -f k8s/service.yaml
```

### Check Status

```bash
# Check pods
kubectl get pods -n k8s-microservices -l app.kubernetes.io/name=frontend

# Check logs
kubectl logs -n k8s-microservices -l app.kubernetes.io/name=frontend --tail=50

# Port forward for local access
kubectl port-forward -n k8s-microservices svc/frontend 3001:3000
```

### Access via Ingress

If Ingress is configured, access the frontend at:
```
http://<ingress-host>/
```

## Project Structure

```
frontend/
├── app/
│   ├── dashboard/      # Dashboard page
│   ├── login/          # Login page
│   ├── users/          # Users management page
│   ├── products/       # Products management page
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page (redirects)
├── components/
│   └── Navbar.tsx      # Navigation component
├── lib/
│   └── api.ts          # API client
└── k8s/
    ├── configmap.yaml  # Environment configuration
    ├── deployment.yaml # Kubernetes deployment
    └── service.yaml    # Kubernetes service
```

## Technologies

- **Next.js 16**: React framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Axios**: HTTP client
