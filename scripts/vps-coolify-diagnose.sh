#!/usr/bin/env bash
# Coolify / Traefik routing diagnostic for energyprecisions.com
# Run on the VPS: bash vps-coolify-diagnose.sh

set -uo pipefail

DOMAIN="${DOMAIN:-energyprecisions.com}"
PROJECT_UUID="${PROJECT_UUID:-nf5o3ozeuqxmdukeau8f4475}"
REPORT="/tmp/coolify-diagnose-$(date +%Y%m%d-%H%M%S).txt"

exec > >(tee "$REPORT") 2>&1

section() { echo; echo "========== $* =========="; }
ok()   { echo "  OK   $*"; }
warn() { echo "  WARN $*"; }
fail() { echo "  FAIL $*"; }

section "1. Host & DNS"
echo "Hostname: $(hostname)"
echo "Public IP (best effort): $(curl -4 -s --max-time 3 ifconfig.me 2>/dev/null || echo 'unknown')"
echo "dig $DOMAIN: $(dig +short "$DOMAIN" A 2>/dev/null | tr '\n' ' ')"
echo "dig www.$DOMAIN: $(dig +short "www.$DOMAIN" A 2>/dev/null | tr '\n' ' ')"

section "2. Ports 80 / 443 / 8000"
if command -v ss >/dev/null 2>&1; then
  ss -tlnp | grep -E ':80 |:443 |:8000 ' || warn "Nothing listening on 80/443/8000?"
else
  netstat -tlnp 2>/dev/null | grep -E ':80 |:443 |:8000 ' || true
fi

section "3. Coolify proxy container"
PROXY=$(docker ps --format '{{.Names}}' | grep -E 'coolify-proxy|traefik' | head -1 || true)
if [[ -n "$PROXY" ]]; then
  ok "Proxy container: $PROXY"
  docker ps --filter "name=$PROXY" --format '  Status: {{.Status}}'
else
  fail "No coolify-proxy / traefik container found"
fi

section "4. App containers (project $PROJECT_UUID)"
docker ps -a --filter "name=$PROJECT_UUID" --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' || true
FRONTEND=$(docker ps --format '{{.Names}}' | grep "frontend-$PROJECT_UUID" | head -1 || true)
BACKEND=$(docker ps --format '{{.Names}}' | grep "backend-$PROJECT_UUID" | head -1 || true)
DB=$(docker ps --format '{{.Names}}' | grep "db-$PROJECT_UUID" | head -1 || true)
[[ -n "$FRONTEND" ]] && ok "Frontend: $FRONTEND" || fail "Frontend container not running"
[[ -n "$BACKEND" ]]  && ok "Backend:  $BACKEND"  || fail "Backend container not running"
[[ -n "$DB" ]]       && ok "DB:       $DB"       || fail "DB container not running"

section "5. In-container health checks"
if [[ -n "$FRONTEND" ]]; then
  echo -n "  frontend /health: "
  docker exec "$FRONTEND" wget -qO- http://127.0.0.1/health 2>/dev/null || echo "FAILED"
fi
if [[ -n "$BACKEND" ]]; then
  echo -n "  backend /api/health: "
  docker exec "$BACKEND" curl -sf http://127.0.0.1:8000/api/health 2>/dev/null || echo "FAILED"
fi

section "6. Docker networks (frontend must be on 'coolify')"
if docker network inspect coolify >/dev/null 2>&1; then
  echo "Containers on network 'coolify':"
  docker network inspect coolify --format '{{range .Containers}}  - {{.Name}}{{"\n"}}{{end}}' 2>/dev/null || true
  if [[ -n "$FRONTEND" ]]; then
    if docker network inspect coolify --format '{{range .Containers}}{{.Name}} {{end}}' | grep -q "$FRONTEND"; then
      ok "$FRONTEND is attached to coolify network"
    else
      fail "$FRONTEND is NOT on coolify network — enable 'Connect To Predefined Network' in Coolify Advanced and redeploy"
    fi
  fi
else
  fail "Docker network 'coolify' does not exist"
fi

section "7. Traefik labels on frontend"
if [[ -n "$FRONTEND" ]]; then
  docker inspect "$FRONTEND" --format '{{range $k,$v := .Config.Labels}}{{$k}}={{$v}}{{"\n"}}{{end}}' \
    | grep -E 'traefik|coolify' | sort || warn "No traefik/coolify labels found"
  echo
  echo "Loadbalancer port labels (must include port=80 and UUID $PROJECT_UUID):"
  docker inspect "$FRONTEND" --format '{{range $k,$v := .Config.Labels}}{{if or (contains $k "loadbalancer.server.port") (contains $k "traefik.http")}}{{$k}}={{$v}}{{"\n"}}{{end}}{{end}}' 2>/dev/null \
    | grep -E 'loadbalancer|routers|services' || true
fi

section "8. Local routing tests (via host → Traefik)"
for url in \
  "http://127.0.0.1/health" \
  "http://127.0.0.1:80/health" \
  "https://127.0.0.1/health"
do
  echo -n "  curl -sk -H Host:$DOMAIN $url → "
  out=$(curl -sk --max-time 5 -H "Host: $DOMAIN" "$url" 2>/dev/null || echo "curl error")
  echo "$out"
done

section "9. Public domain test"
echo -n "  https://$DOMAIN/health → "
curl -sk --max-time 10 "https://$DOMAIN/health" 2>/dev/null || echo "curl error"
echo
echo -n "  https://$DOMAIN/api/health → "
curl -sk --max-time 10 "https://$DOMAIN/api/health" 2>/dev/null || echo "curl error"

section "10. coolify-proxy recent logs (last 40 lines)"
if [[ -n "$PROXY" ]]; then
  docker logs "$PROXY" --tail 40 2>&1 || true
else
  docker ps -a --format '{{.Names}}' | grep -i proxy | while read -r p; do
    echo "--- $p ---"
    docker logs "$p" --tail 20 2>&1 || true
  done
fi

section "11. Frontend logs (last 25 lines)"
[[ -n "$FRONTEND" ]] && docker logs "$FRONTEND" --tail 25 2>&1 || true

section "12. Quick interpretation"
if [[ -n "$FRONTEND" ]]; then
  IN_HEALTH=$(docker exec "$FRONTEND" wget -qO- http://127.0.0.1/health 2>/dev/null || true)
  ON_COOLIFY=$(docker network inspect coolify --format '{{range .Containers}}{{.Name}} {{end}}' 2>/dev/null | grep -c "$FRONTEND" || echo 0)
  LOCAL=$(curl -sk --max-time 5 -H "Host: $DOMAIN" http://127.0.0.1/health 2>/dev/null || true)
  PUBLIC=$(curl -sk --max-time 10 "https://$DOMAIN/health" 2>/dev/null || true)

  if [[ "$IN_HEALTH" == *healthy* ]]; then ok "App responds inside frontend container"; else fail "nginx not healthy inside container"; fi
  if [[ "$ON_COOLIFY" -ge 1 ]]; then ok "Frontend on coolify network"; else fail "Fix: Coolify → Advanced → Connect To Predefined Network → Redeploy"; fi
  if [[ "$LOCAL" == *healthy* ]]; then ok "Traefik routes locally"; else fail "Traefik not routing to frontend (labels/proxy/restart coolify-proxy)"; fi
  if [[ "$PUBLIC" == *healthy* ]]; then ok "Public URL works"; elif [[ "$LOCAL" == *healthy* ]]; then warn "Local works but public fails — check DNS, Hostinger website hosting, or SSL"; else fail "Public URL still broken"; fi
fi

section "DONE"
echo "Full report saved to: $REPORT"
echo "Copy/paste the whole file to share for debugging: cat $REPORT"
