#!/bin/bash
set -e

INSTANCE_NAME="explorai-vm"
ZONE="us-central1-a"
LOCAL_DB="./dev.db"
REMOTE_DB_PATH="/home/explorai/data/dev.db"

echo "🌱 Seeding Database on GCP VM..."

# 1. Upload dev.db to VM (tmp first to avoid permissions issues)
echo "⬆️ Uploading dev.db to tmp..."
gcloud compute scp $LOCAL_DB $INSTANCE_NAME:/tmp/dev.db --zone=$ZONE

# 2. Move to final location and set permissions
echo "🔧 Moving and fixing permissions..."
gcloud compute ssh $INSTANCE_NAME --zone=$ZONE --command="sudo mkdir -p /home/explorai/data && sudo mv /tmp/dev.db $REMOTE_DB_PATH && sudo chown -R 1001:1001 /home/explorai/data && sudo chmod 666 $REMOTE_DB_PATH"

echo "✅ Database Seeded!"
