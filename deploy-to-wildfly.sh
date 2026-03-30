#!/bin/bash
# Deploy SimpleEditorPlugin to WildFly WAR
# Usage: ./deploy-to-wildfly.sh [WILDFLY_WAR_DIR]
#
# After deployment, access at:
#   https://<server>:8443/ibase/E12BROWSER/simpleditorplugin/index.html
#
# To load in an iframe (pre-authenticated):
#   <iframe src="/ibase/E12BROWSER/simpleditorplugin/index.html#/editor?OBJ_NAME=sorder&EDIT_FLAG=A"></iframe>

set -e

WILDFLY_WAR_DIR="${1:-/wildfly/server/default/deploy/ibase.ear/ibase.war}"
TARGET_DIR="$WILDFLY_WAR_DIR/E12BROWSER/simpleditorplugin"
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

# Deploy
echo "Deploying to $TARGET_DIR ..."
rm -rf "$TARGET_DIR"
mkdir -p "$TARGET_DIR"
cp -r "$DIST_DIR"/* "$TARGET_DIR/"

echo ""
echo "=== Deployment complete ==="
echo "Deployed to: $TARGET_DIR"
echo "Access URL: https://<server>:8443/ibase/E12BROWSER/simpleditorplugin/index.html"
