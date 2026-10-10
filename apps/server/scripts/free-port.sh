#!/usr/bin/env sh
# Libera el puerto del dev server si quedó un wrangler/workerd vivo de una sesión anterior
# (p. ej. una terminal olvidada). Cierra el workerd y su wrangler padre, nada más.
PORT="${1:-3009}"
MAX_WAIT_SECONDS=5

PIDS=$(lsof -t -iTCP:"$PORT" -sTCP:LISTEN 2>/dev/null)
[ -z "$PIDS" ] && exit 0

for PID in $PIDS; do
  PARENT=$(ps -o ppid= -p "$PID" | tr -d ' ')
  echo "Puerto $PORT ocupado por PID $PID ($(ps -o comm= -p "$PID")); cerrando sesión anterior..."
  kill "$PID" 2>/dev/null
  if [ -n "$PARENT" ] && ps -o cmd= -p "$PARENT" | grep -q wrangler; then
    kill "$PARENT" 2>/dev/null
  fi
done

WAITED=0
while lsof -t -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; do
  if [ "$WAITED" -ge "$MAX_WAIT_SECONDS" ]; then
    echo "No se cerró a tiempo; forzando (SIGKILL)."
    lsof -t -iTCP:"$PORT" -sTCP:LISTEN | xargs -r kill -9
    break
  fi
  sleep 1
  WAITED=$((WAITED + 1))
done
