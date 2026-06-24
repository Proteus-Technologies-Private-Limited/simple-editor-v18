#!/bin/bash
# Deploy SimpleEditorPlugin to WildFly WAR
# Usage: ./deploy-to-wildfly.sh [WILDFLY_WAR_DIR]
#
# After deployment, access at:
#   https://<server>:8443/ibase/E12BROWSER/simpleditorplugin/index.html
#   https://<server>:8443/ibase/Insight/simpleditorplugin/index.html
#
# To load in an iframe (pre-authenticated):
#   <iframe src="/ibase/E12BROWSER/simpleditorplugin/index.html#/editor?OBJ_NAME=sorder&EDIT_FLAG=A"></iframe>

set -e

WILDFLY_WAR_DIR="${1:-/wildfly/server/default/deploy/ibase.ear/ibase.war}"
# Deploy the same build into both folders.
TARGET_DIRS=(
  "$WILDFLY_WAR_DIR/E12BROWSER/simpleditorplugin"
  "$WILDFLY_WAR_DIR/Insight/simpleditorplugin"
)
DIST_DIR="dist/simpleditorplugin"

echo "=== SimpleEditorPlugin WildFly Deployment ==="

# Build
echo "Building Angular app..."
ng build --configuration=production

if [ ! -d "$DIST_DIR" ]; then
  echo "ERROR: Build output not found at $DIST_DIR"
  exit 1
fi

# Verify WAR directory exists
if [ ! -d "$WILDFLY_WAR_DIR" ]; then
  echo "ERROR: WildFly WAR directory not found: $WILDFLY_WAR_DIR"
  echo "Usage: $0 /path/to/ibase.war"
  exit 1
fi

# Deploy to each target folder (E12BROWSER and Insight)
for TARGET_DIR in "${TARGET_DIRS[@]}"; do
  echo "Deploying to $TARGET_DIR ..."
  rm -rf "$TARGET_DIR"
  mkdir -p "$TARGET_DIR"
  cp -r "$DIST_DIR"/* "$TARGET_DIR/"
done

echo ""
echo "=== Deployment complete ==="
for TARGET_DIR in "${TARGET_DIRS[@]}"; do
  echo "Deployed to: $TARGET_DIR"
done
echo "Access URLs:"
echo "  https://<server>:8443/ibase/E12BROWSER/simpleditorplugin/index.html"
echo "  https://<server>:8443/ibase/Insight/simpleditorplugin/index.html"
