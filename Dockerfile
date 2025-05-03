# Use the official Bun image as the base
FROM oven/bun:latest

# Set the working directory inside the container
WORKDIR /app

# Install system dependencies required by Playwright
# Note: This list might need adjustments based on the specific Playwright version and target OS
RUN apt-get update && apt-get install -y --no-install-recommends \
    libnss3 \
    libnspr4 \
    libdbus-1-3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libgbm1 \
    libasound2 \
    libatspi2.0-0 \
    libx11-6 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libxtst6 \
    libfontconfig1 \
    libpango-1.0-0 \
    libcairo2 \
    libjpeg62-turbo \
    libexpat1 \
    libgcc1 \
    libglib2.0-0 \
    libstdc++6 \
    libxcb1 \
    libx11-xcb1 \
    # Clean up apt cache
    && rm -rf /var/lib/apt/lists/*

# Copy package.json and bun.lockb first for dependency caching
COPY package.json bun.lockb ./

# Install dependencies using bun install --frozen-lockfile for reproducibility
RUN bun install --frozen-lockfile

# Install Playwright browsers
# This command downloads the browser binaries needed by Playwright
RUN bunx playwright install --with-deps chromium

# Copy the rest of the application code
COPY . .

# Expose the port the API server will run on (default 3000)
EXPOSE 3000

# Define the command to run the API server
CMD ["bun", "run", "src/api/server.ts"]
