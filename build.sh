#!/usr/bin/env bash
# Build the full simple-editor-v18 chain end-to-end:
#   1. ngx-treeview library  (peer dep of base-blocks)
#   2. base-blocks library   (compile-time dep of simple-editor)
#   3. simple-editor-v18 app (the plugin bundle)
#
# Run from anywhere — script resolves paths relative to its own location.
#
# Flags:
#   --skip-libs        Build only the simple-editor app (assume libs are
#                      already built; use when iterating on app code only).
#   --skip-install     Skip npm install for simple-editor-v18 (use when
#                      package.json hasn't changed since last install).
#   --base-href <path> Override the simple-editor build's --base-href.
#                      Default: /smart-page/simpleditorplugin/ (matches
#                      smart-page's expected static path).
#   --stage            After building, copy the dist/ output into
#                      smart-page/public/simpleditorplugin/. (Equivalent to
#                      calling ../build-simple-editor.sh, but skips the
#                      duplicate simple-editor build that script does.)
#
# Examples:
#   ./build.sh                       # full chain, no staging
#   ./build.sh --stage               # full chain + stage to smart-page
#   ./build.sh --skip-libs           # rebuild app only
#   ./build.sh --skip-libs --stage   # rebuild app + stage

set -euo pipefail

# --- Paths --------------------------------------------------------------------

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SE_DIR="${SCRIPT_DIR}"
LIB_DIR="${SE_DIR}/baseblock-library-v18"
WORKSPACE_DIR="$(cd "${SE_DIR}/.." && pwd)"
SP_DIR="${WORKSPACE_DIR}/smart-page"
STAGE_TARGET="${SP_DIR}/public/simpleditorplugin"

# --- Defaults / arg parsing ---------------------------------------------------

SKIP_LIBS=0
SKIP_INSTALL=0
DO_STAGE=0
BASE_HREF="/smart-page/simpleditorplugin/"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip-libs)    SKIP_LIBS=1; shift ;;
    --skip-install) SKIP_INSTALL=1; shift ;;
    --stage)        DO_STAGE=1; shift ;;
    --base-href)    BASE_HREF="${2:?--base-href requires a value}"; shift 2 ;;
    -h|--help)
      sed -n '2,30p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *)
      echo "[build.sh] Unknown flag: $1" >&2
      echo "Run with --help for usage." >&2
      exit 2
      ;;
  esac
done

# --- Helpers ------------------------------------------------------------------

log()  { printf '\033[1;36m[build.sh]\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[build.sh]\033[0m %s\n' "$*" >&2; }
fail() { printf '\033[1;31m[build.sh]\033[0m %s\n' "$*" >&2; exit 1; }

require_dir() {
  [[ -d "$1" ]] || fail "Required directory missing: $1${2:+ — $2}"
}

require_node_modules() {
  local dir="$1" hint="$2"
  if [[ ! -d "${dir}/node_modules" ]]; then
    fail "${dir}/node_modules not found. ${hint}"
  fi
}

# --- Pre-flight ---------------------------------------------------------------

require_dir "${SE_DIR}"  "simple-editor-v18 root"
require_dir "${LIB_DIR}" "baseblock-library-v18 (nested base-blocks source)"

if ! command -v npx >/dev/null 2>&1; then
  fail "npx not found in PATH. Install Node.js / npm first."
fi

# --- 1 & 2: libraries ---------------------------------------------------------

if [[ ${SKIP_LIBS} -eq 0 ]]; then
  log "Building base-blocks workspace libraries…"
  require_node_modules "${LIB_DIR}" \
    "Run: cd '${LIB_DIR}' && npm install --legacy-peer-deps"

  log "  → ngx-treeview (peer dep, must build first)"
  ( cd "${LIB_DIR}" && npx ng build ngx-treeview --configuration=production ) \
    || fail "ngx-treeview build failed."

  log "  → base-blocks"
  ( cd "${LIB_DIR}" && npx ng build base-blocks --configuration=production ) \
    || fail "base-blocks build failed."

  # Sanity-check: dist artifacts exist where simple-editor's file dep points.
  for d in "${LIB_DIR}/dist/ngx-treeview" "${LIB_DIR}/dist/base-blocks"; do
    [[ -f "${d}/package.json" ]] \
      || fail "Expected dist artifact missing: ${d}/package.json"
  done
  log "Libraries built."
else
  log "Skipping library builds (--skip-libs)."
  for d in "${LIB_DIR}/dist/ngx-treeview" "${LIB_DIR}/dist/base-blocks"; do
    [[ -f "${d}/package.json" ]] \
      || fail "Cannot --skip-libs: missing ${d}/package.json. Run without --skip-libs first."
  done
fi

# --- 3: simple-editor-v18 -----------------------------------------------------

if [[ ${SKIP_INSTALL} -eq 0 ]]; then
  log "Refreshing simple-editor-v18 dependencies (file deps need a re-link after a fresh lib build)…"
  ( cd "${SE_DIR}" && npm install --legacy-peer-deps ) \
    || fail "npm install in simple-editor-v18 failed."
else
  log "Skipping npm install (--skip-install)."
  require_node_modules "${SE_DIR}" \
    "Run: cd '${SE_DIR}' && npm install --legacy-peer-deps"
fi

log "Building simple-editor-v18 (base-href=${BASE_HREF})…"
( cd "${SE_DIR}" && npx ng build \
    --configuration=production \
    --base-href="${BASE_HREF}" \
    --output-hashing=none ) \
  || fail "simple-editor-v18 build failed."

# Find what Angular emitted (angular.json controls the outputPath).
SE_DIST=""
for candidate in \
  "${SE_DIR}/dist/simpleditorplugin" \
  "${SE_DIR}/dist/simple-editor-v18/browser" \
  "${SE_DIR}/dist/simple-editor-v18"
do
  if [[ -d "${candidate}" ]]; then SE_DIST="${candidate}"; break; fi
done
[[ -n "${SE_DIST}" ]] \
  || fail "Couldn't locate simple-editor's dist output. Check angular.json → architect.build.options.outputPath."

log "simple-editor built → ${SE_DIST}"

# --- Optional staging ---------------------------------------------------------

if [[ ${DO_STAGE} -eq 1 ]]; then
  require_dir "${SP_DIR}" "smart-page (staging target). Pass --stage only if smart-page exists."
  log "Staging bundle into ${STAGE_TARGET}"
  mkdir -p "$(dirname "${STAGE_TARGET}")"
  rm -rf "${STAGE_TARGET}"
  mkdir -p "${STAGE_TARGET}"
  cp -R "${SE_DIST}/." "${STAGE_TARGET}/"
  log "Staged. Files: $(ls -1 "${STAGE_TARGET}" | tr '\n' ' ')"
fi

log "Done."
