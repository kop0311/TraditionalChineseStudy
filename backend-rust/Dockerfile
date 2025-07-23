# Multi-stage Rust build for Traditional Chinese Study backend
FROM rust:1.75-alpine AS builder

# Install build dependencies
RUN apk add --no-cache musl-dev pkgconfig openssl-dev

# Set working directory
WORKDIR /app

# Create app user
RUN addgroup -g 1001 -S rustuser && \
    adduser -S rustuser -u 1001

# Copy dependency files
COPY Cargo.toml Cargo.lock ./

# Create a dummy main.rs to build dependencies
RUN mkdir src && echo "fn main() {}" > src/main.rs

# Build dependencies (this will be cached if Cargo.toml doesn't change)
RUN cargo build --release && rm -rf src

# Copy source code
COPY src ./src
COPY migrations ./migrations

# Build the actual application
RUN cargo build --release

# Runtime stage
FROM alpine:3.19 AS runtime

# Install runtime dependencies
RUN apk add --no-cache ca-certificates openssl libgcc

# Create app user
RUN addgroup -g 1001 -S rustuser && \
    adduser -S rustuser -u 1001

# Set working directory
WORKDIR /app

# Copy the binary from builder stage
COPY --from=builder /app/target/release/backend-rust ./backend-rust

# Copy migrations
COPY --from=builder /app/migrations ./migrations

# Change ownership to rustuser
RUN chown -R rustuser:rustuser /app

# Switch to rustuser
USER rustuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Expose port
EXPOSE 8080

# Set environment variables
ENV RUST_LOG=info
ENV RUST_BACKTRACE=1
ENV PORT=8080

# Start the application
CMD ["./backend-rust"]