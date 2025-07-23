#!/bin/bash

# Traditional Chinese Study - Project Setup Script
# This script sets up the complete Rust + Next.js development environment

set -e  # Exit on any error

echo "🚀 Setting up Traditional Chinese Study Project..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if required tools are installed
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    # Check Rust
    if ! command -v rustc &> /dev/null; then
        print_error "Rust is not installed. Please install from https://rustup.rs/"
        exit 1
    fi
    print_status "Rust is installed: $(rustc --version)"
    
    # Check Cargo
    if ! command -v cargo &> /dev/null; then
        print_error "Cargo is not installed"
        exit 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+"
        exit 1
    fi
    print_status "Node.js is installed: $(node --version)"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    # Check PostgreSQL
    if ! command -v psql &> /dev/null; then
        print_warning "PostgreSQL client not found. Please install PostgreSQL"
    else
        print_status "PostgreSQL client is available"
    fi
    
    # Check Redis
    if ! command -v redis-cli &> /dev/null; then
        print_warning "Redis CLI not found. Please install Redis"
    else
        print_status "Redis CLI is available"
    fi
    
    # Check Docker (optional)
    if command -v docker &> /dev/null; then
        print_status "Docker is available: $(docker --version)"
    else
        print_warning "Docker not found (optional for development)"
    fi
}

# Setup Rust backend
setup_backend() {
    print_info "Setting up Rust backend..."
    
    cd backend
    
    # Install diesel CLI if not present
    if ! command -v diesel &> /dev/null; then
        print_info "Installing Diesel CLI..."
        cargo install diesel_cli --no-default-features --features postgres
    fi
    print_status "Diesel CLI is ready"
    
    # Copy environment file
    if [ ! -f .env ]; then
        cp .env.example .env
        print_status "Created .env file from template"
        print_warning "Please update .env with your database credentials"
    fi
    
    # Build the project
    print_info "Building Rust backend..."
    cargo build
    print_status "Backend build completed"
    
    cd ..
}

# Setup Next.js frontend
setup_frontend() {
    print_info "Setting up Next.js frontend..."
    
    # Install dependencies
    print_info "Installing npm dependencies..."
    npm install
    
    # Install additional dependencies for the API integration
    npm install axios @sentry/nextjs hanzi-writer
    npm install -D @types/node
    
    print_status "Frontend dependencies installed"
    
    # Copy environment file
    if [ ! -f .env.local ]; then
        cat > .env.local << EOF
# Next.js Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:9005
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn-here

# Development settings
NODE_ENV=development
EOF
        print_status "Created .env.local file"
    fi
}

# Setup database
setup_database() {
    print_info "Setting up PostgreSQL database..."
    
    # Check if PostgreSQL is running
    if ! pg_isready -h localhost -p 5432 &> /dev/null; then
        print_warning "PostgreSQL is not running on localhost:5432"
        print_info "Starting PostgreSQL with Docker..."
        
        # Start PostgreSQL with Docker
        docker run -d \
            --name traditional-chinese-postgres \
            -e POSTGRES_DB=traditional_chinese_db \
            -e POSTGRES_USER=postgres \
            -e POSTGRES_PASSWORD=password \
            -p 5432:5432 \
            postgres:15
        
        # Wait for PostgreSQL to be ready
        print_info "Waiting for PostgreSQL to be ready..."
        sleep 10
    fi
    
    cd backend
    
    # Run database migrations
    print_info "Running database migrations..."
    export DATABASE_URL="postgresql://postgres:password@localhost:5432/traditional_chinese_db"
    diesel migration run
    print_status "Database migrations completed"
    
    cd ..
}

# Setup Redis
setup_redis() {
    print_info "Setting up Redis..."
    
    # Check if Redis is running
    if ! redis-cli ping &> /dev/null; then
        print_warning "Redis is not running on localhost:6379"
        print_info "Starting Redis with Docker..."
        
        # Start Redis with Docker
        docker run -d \
            --name traditional-chinese-redis \
            -p 6379:6379 \
            redis:7-alpine
        
        # Wait for Redis to be ready
        sleep 5
    fi
    
    print_status "Redis is ready"
}

# Install development tools
install_dev_tools() {
    print_info "Installing development tools..."
    
    # Install k6 for performance testing
    if ! command -v k6 &> /dev/null; then
        print_info "Installing k6 for performance testing..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            brew install k6
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux
            sudo gpg -k
            sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
            echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
            sudo apt-get update
            sudo apt-get install k6
        fi
        print_status "k6 installed successfully"
    else
        print_status "k6 is already installed"
    fi
    
    # Install Rust development tools
    print_info "Installing Rust development tools..."
    rustup component add rustfmt clippy
    print_status "Rust tools installed"
}

# Create test data
create_test_data() {
    print_info "Creating test data..."
    
    # Create test users (this would typically be done through a seed script)
    cd tests/performance
    
    # Generate more test accounts if needed
    if [ ! -f test-accounts-extended.csv ]; then
        echo "email,password" > test-accounts-extended.csv
        for i in {51..1000}; do
            printf "test%03d@example.com,password123\n" $i >> test-accounts-extended.csv
        done
        print_status "Extended test accounts created"
    fi
    
    cd ../..
}

# Start development servers
start_dev_servers() {
    print_info "Starting development servers..."
    
    # Create a simple start script
    cat > start-dev.sh << 'EOF'
#!/bin/bash

# Start all development servers
echo "🚀 Starting Traditional Chinese Study Development Environment"

# Start backend in background
echo "Starting Rust backend on port 9005..."
cd backend && cargo run &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 5

# Start frontend
echo "Starting Next.js frontend on port 3001..."
cd .. && npm run dev &
FRONTEND_PID=$!

echo "✅ Development servers started!"
echo "📱 Frontend: http://localhost:3001"
echo "🔧 Backend API: http://localhost:9005"
echo "📊 Health Check: http://localhost:9005/health"

# Function to cleanup on exit
cleanup() {
    echo "🛑 Stopping development servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Trap Ctrl+C
trap cleanup INT

# Wait for processes
wait
EOF

    chmod +x start-dev.sh
    print_status "Development start script created (./start-dev.sh)"
}

# Main setup function
main() {
    print_info "Starting Traditional Chinese Study project setup..."
    
    check_prerequisites
    setup_backend
    setup_frontend
    setup_database
    setup_redis
    install_dev_tools
    create_test_data
    start_dev_servers
    
    echo ""
    echo "🎉 Setup completed successfully!"
    echo "=================================================="
    echo ""
    print_status "Project is ready for development!"
    echo ""
    print_info "Next steps:"
    echo "1. Update backend/.env with your database credentials"
    echo "2. Update .env.local with your API settings"
    echo "3. Run './start-dev.sh' to start development servers"
    echo "4. Visit http://localhost:3001 to see the application"
    echo ""
    print_info "Available commands:"
    echo "• ./start-dev.sh - Start development servers"
    echo "• cd backend && cargo test - Run backend tests"
    echo "• npm test - Run frontend tests"
    echo "• k6 run tests/performance/login-test.js - Run performance tests"
    echo ""
    print_info "Documentation:"
    echo "• API Integration: docs/API_INTEGRATION.md"
    echo "• Database Optimization: database/optimize-queries.sql"
    echo "• Performance Testing: tests/performance/"
    echo ""
    print_status "Happy coding! 🚀"
}

# Run main function
main "$@"
