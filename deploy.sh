#!/bin/bash
set -e

# Load environment variables from .env if present
if [ -f .env ]; then
  echo "📄 Loading environment variables from .env..."
  export $(grep -v '^#' .env | xargs)
fi

# Configuration
PROJECT_ID=$(gcloud config get-value project)
APP_NAME="explorai-app"
REGION="us-central1"
ZONE="us-central1-a"
IMAGE_TAG="gcr.io/$PROJECT_ID/$APP_NAME:latest"
INSTANCE_NAME="explorai-vm"

echo "🚀 Starting Deployment to GCP Project: $PROJECT_ID"

# 1. Enable Required Services
echo "Enable required services..."
gcloud services enable artifactregistry.googleapis.com cloudbuild.googleapis.com compute.googleapis.com

# 2. Build Container Image
echo "📦 Building Docker Image..."

# Create temporary cloudbuild.yaml
cat > cloudbuild.yaml <<EOF
steps:
- name: 'gcr.io/cloud-builders/docker'
  args: [ 'build', '-t', '\$_IMAGE_TAG', '--build-arg', 'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=\$_MAPS_KEY', '.' ]
images:
- '\$_IMAGE_TAG'
EOF

# Submit build with substitutions
gcloud builds submit --config cloudbuild.yaml --substitutions _IMAGE_TAG=$IMAGE_TAG,_MAPS_KEY="$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" .

# Cleanup
rm cloudbuild.yaml

# 3. Create/Update VM Instance
if gcloud compute instances describe $INSTANCE_NAME --zone=$ZONE > /dev/null 2>&1; then
    echo "🔄 Updating existing VM..."
    gcloud compute instances update-container $INSTANCE_NAME \
        --container-image $IMAGE_TAG \
        --zone $ZONE \
        --container-env=GOOGLE_API_KEY="$GOOGLE_API_KEY",NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY",DATABASE_URL="file:/app/data/dev.db"
else
    echo "✨ Creating new VM..."
    gcloud compute instances create-with-container $INSTANCE_NAME \
        --zone $ZONE \
        --machine-type e2-medium \
        --container-image $IMAGE_TAG \
        --tags http-server,https-server \
        --boot-disk-size=20GB \
        --container-env=GOOGLE_API_KEY="$GOOGLE_API_KEY",NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY",DATABASE_URL="file:/app/data/dev.db" \
        --container-mount-host-path mount-path=/app/data,host-path=/home/explorai/data,mode=rw
fi

# 4. Open Firewall
echo "🛡️ Configuring Firewall..."
gcloud compute firewall-rules create allow-http-3000 \
    --allow tcp:3000 \
    --target-tags http-server \
    --description "Allow port 3000 for Next.js" || echo "Firewall rule likely exists, skipping."

echo "✅ Deployment Complete!"
echo "You can access your app at: http://$(gcloud compute instances describe $INSTANCE_NAME --zone=$ZONE --format='get(networkInterfaces[0].accessConfigs[0].natIP)'):3000"
