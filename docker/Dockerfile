FROM mcr.microsoft.com/dotnet/sdk:8.0

# Install Node.js 20.x
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /workspace

# Copy evaluator and install dependencies
COPY evaluator/ /workspace/evaluator/
RUN cd /workspace/evaluator && npm install && npm run build

# Copy config and scripts
COPY config/ /workspace/config/
COPY scripts/ /workspace/scripts/
RUN chmod +x /workspace/scripts/*.sh

# Default entrypoint runs evaluate-run.sh against /run mount
ENTRYPOINT ["/workspace/scripts/evaluate-run.sh", "/run"]
