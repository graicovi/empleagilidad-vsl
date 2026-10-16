#!/usr/bin/env bash

# ==============================================================================
# Script de Despliegue para AWS S3 y CloudFront Invalidation
# Proyecto: Empleagilidad VSL
# ==============================================================================

set -euo pipefail

# Colores para salida en consola
BOLD="\033[1m"
GREEN="\033[32m"
YELLOW="\033[33m"
BLUE="\033[34m"
CYAN="\033[36m"
RED="\033[31m"
NC="\033[0m" # No Color

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

# ------------------------------------------------------------------------------
# Cargar variables de entorno desde .env si existe
# ------------------------------------------------------------------------------
if [[ -f "$ROOT_DIR/.env" ]]; then
    # Leer .env ignorando comentarios y líneas vacías
    set -a
    # shellcheck disable=SC1091
    source "$ROOT_DIR/.env"
    set +a
fi

# Variables de configuración (pueden venir de .env o flags)
S3_BUCKET="${S3_BUCKET:-}"
CLOUDFRONT_DISTRIBUTION_ID="${CLOUDFRONT_DISTRIBUTION_ID:-}"
AWS_REGION="${AWS_REGION:-}"
AWS_PROFILE="${AWS_PROFILE:-}"

LIST_FILE=""
UPLOAD_ALL=false
FULL_INVALIDATE=false
SKIP_INVALIDATION=false
DRY_RUN=false
declare -a CLI_FILES=()

# ------------------------------------------------------------------------------
# Función de Ayuda
# ------------------------------------------------------------------------------
mostrar_ayuda() {
    echo -e "${BOLD}Uso:${NC}"
    echo -e "  ./deploy.sh [opciones] [archivo1 archivo2 ...]\n"
    echo -e "${BOLD}Descripción:${NC}"
    echo -e "  Sube archivos a un bucket de AWS S3 e invalida la caché de CloudFront para reflejar"
    echo -e "  los cambios de inmediato. Permite subir archivos individuales, listas desde archivo o todo el sitio.\n"
    echo -e "${BOLD}Opciones:${NC}"
    echo -e "  -l, --list <archivo>         Ruta a un archivo con lista de archivos a subir (uno por línea)."
    echo -e "  -a, --all                    Sube todos los archivos estáticos del repositorio."
    echo -e "  -b, --bucket <nombre>        Sobreescribe el nombre del bucket S3 configurado en .env."
    echo -e "  -d, --distribution <id>      Sobreescribe el ID de la distribución de CloudFront de .env."
    echo -e "  --region <region>            Especifica la región de AWS (ej. us-east-1)."
    echo -e "  --profile <perfil>           Especifica el perfil de credenciales de AWS CLI."
    echo -e "  --full-invalidate            Invalida todo el sitio en CloudFront (/*) en vez de solo los archivos subidos."
    echo -e "  --skip-invalidation          Sube archivos a S3 pero NO crea la invalidación en CloudFront."
    echo -e "  --dry-run                    Simulación: muestra qué se subiría e invalidaría sin ejecutar cambios reales."
    echo -e "  -h, --help                   Muestra esta ayuda.\n"
    echo -e "${BOLD}Ejemplos:${NC}"
    echo -e "  # 1. Subir archivos específicos indicados en el comando:"
    echo -e "  ./deploy.sh index.html styles.css programa/gracias/index.html\n"
    echo -e "  # 2. Subir una lista de archivos definida en un archivo de texto:"
    echo -e "  ./deploy.sh --list deploy-files.txt\n"
    echo -e "  # 3. Subir todos los archivos del proyecto con invalidación completa:"
    echo -e "  ./deploy.sh --all --full-invalidate\n"
    echo -e "  # 4. Probar en modo simulación (dry-run):"
    echo -e "  ./deploy.sh --list deploy-files.txt --dry-run"
}

# ------------------------------------------------------------------------------
# Parsear Argumentos de Línea de Comandos
# ------------------------------------------------------------------------------
while [[ $# -gt 0 ]]; do
    case "$1" in
        -h|--help)
            mostrar_ayuda
            exit 0
            ;;
        -l|--list)
            LIST_FILE="$2"
            shift 2
            ;;
        -a|--all)
            UPLOAD_ALL=true
            shift
            ;;
        -b|--bucket)
            S3_BUCKET="$2"
            shift 2
            ;;
        -d|--distribution)
            CLOUDFRONT_DISTRIBUTION_ID="$2"
            shift 2
            ;;
        --region)
            AWS_REGION="$2"
            shift 2
            ;;
        --profile)
            AWS_PROFILE="$2"
            shift 2
            ;;
        --full-invalidate)
            FULL_INVALIDATE=true
            shift
            ;;
        --skip-invalidation)
            SKIP_INVALIDATION=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        -*)
            echo -e "${RED}Error: Opción desconocida: $1${NC}"
            echo "Usa './deploy.sh --help' para ver las opciones disponibles."
            exit 1
            ;;
        *)
            CLI_FILES+=("$1")
            shift
            ;;
    esac
done

# ------------------------------------------------------------------------------
# Verificar dependencias (AWS CLI)
# ------------------------------------------------------------------------------
if ! command -v aws &> /dev/null; then
    if [[ "$DRY_RUN" = true ]]; then
        echo -e "${YELLOW}ℹ 'aws' CLI no está instalado, continuando en modo simulación (--dry-run).${NC}"
    else
        echo -e "${RED}${BOLD}Error:${NC} 'aws' CLI no está instalado en tu sistema."
        echo ""
        echo "Para instalar AWS CLI en Linux Ubuntu/Debian:"
        echo "  curl \"https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip\" -o \"awscliv2.zip\""
        echo "  unzip awscliv2.zip"
        echo "  sudo ./aws/install"
        echo ""
        echo "Luego configura tus credenciales con:"
        echo "  aws configure"
        exit 1
    fi
fi

# ------------------------------------------------------------------------------
# Validar Parámetros Esenciales
# ------------------------------------------------------------------------------
if [[ -z "$S3_BUCKET" ]]; then
    echo -e "${RED}${BOLD}Error:${NC} No se ha especificado el bucket de S3."
    echo "Configúralo en el archivo .env (S3_BUCKET=tu-bucket) o pásalo con el flag -b/--bucket."
    exit 1
fi

if [[ "$SKIP_INVALIDATION" = false && -z "$CLOUDFRONT_DISTRIBUTION_ID" ]]; then
    echo -e "${YELLOW}${BOLD}Advertencia:${NC} No se configuró CLOUDFRONT_DISTRIBUTION_ID."
    echo "Configúralo en .env o pásalo con -d/--distribution si deseas invalidación automática."
    echo "Continuando sin invalidación de CloudFront..."
    SKIP_INVALIDATION=true
fi

# Preparar opciones base para AWS CLI
declare -a AWS_ARGS=()
if [[ -n "$AWS_REGION" ]]; then
    AWS_ARGS+=(--region "$AWS_REGION")
fi
if [[ -n "$AWS_PROFILE" ]]; then
    AWS_ARGS+=(--profile "$AWS_PROFILE")
fi

# ------------------------------------------------------------------------------
# Construir Lista de Archivos a Subir
# ------------------------------------------------------------------------------
declare -a FILES_TO_PROCESS=()

if [[ "$UPLOAD_ALL" = true ]]; then
    echo -e "${CYAN}→ Buscando todos los archivos para subir...${NC}"
    # Excluir git, node_modules, dist, envs, scripts y docs
    while IFS= read -r -d '' f; do
        rel_path="${f#./}"
        FILES_TO_PROCESS+=("$rel_path")
    done < <(find . -type f \
        ! -path '*/.*' \
        ! -path '*/node_modules/*' \
        ! -path '*/dist/*' \
        ! -name '.env*' \
        ! -name 'deploy.sh' \
        ! -name 'deploy-files*.txt' \
        ! -name '*.example.*' \
        ! -name 'README.md' \
        ! -name 'vercel.json' \
        ! -name 'package-lock.json' \
        ! -name 'package.json' \
        ! -name 'tsconfig.json' \
        ! -name 'vite.config.*' \
        -print0 | sort -z)
elif [[ -n "$LIST_FILE" || ( ${#CLI_FILES[@]} -eq 0 && -f "$ROOT_DIR/deploy-files.txt" ) ]]; then
    ACTUAL_LIST_FILE="${LIST_FILE:-$ROOT_DIR/deploy-files.txt}"
    if [[ ! -f "$ACTUAL_LIST_FILE" ]]; then
        echo -e "${RED}Error: El archivo de lista '$ACTUAL_LIST_FILE' no existe.${NC}"
        exit 1
    fi
    echo -e "${CYAN}→ Leyendo lista de archivos desde: $ACTUAL_LIST_FILE${NC}"
    while IFS= read -r linea || [[ -n "$linea" ]]; do
        # Quitar espacios en blanco al inicio/fin
        linea="$(echo "$linea" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
        # Omitir vacíos y comentarios
        if [[ -z "$linea" || "$linea" =~ ^# ]]; then
            continue
        fi
        FILES_TO_PROCESS+=("$linea")
    done < "$ACTUAL_LIST_FILE"
elif [[ ${#CLI_FILES[@]} -gt 0 ]]; then
    for f in "${CLI_FILES[@]}"; do
        FILES_TO_PROCESS+=("$f")
    done
else
    echo -e "${YELLOW}No se especificaron archivos para subir.${NC}"
    echo "Opciones:"
    echo "  1. Especificar archivos: ./deploy.sh index.html styles.css"
    echo "  2. Usar una lista:       ./deploy.sh --list deploy-files.txt"
    echo "  3. Crear un archivo 'deploy-files.txt' con tus archivos y ejecutar: ./deploy.sh"
    echo "  4. Subir todo:           ./deploy.sh --all"
    echo ""
    echo "Para ver todas las opciones disponibles usa: ./deploy.sh --help"
    exit 0
fi

# Expandir directorios si alguno de los elementos es una carpeta
declare -a FINAL_FILES=()
for item in "${FILES_TO_PROCESS[@]}"; do
    clean_item="${item#./}"
    if [[ -d "$clean_item" ]]; then
        while IFS= read -r -d '' subfile; do
            FINAL_FILES+=("${subfile#./}")
        done < <(find "$clean_item" -type f ! -path '*/.*' -print0)
    elif [[ -f "$clean_item" ]]; then
        FINAL_FILES+=("$clean_item")
    else
        echo -e "${RED}Advertencia: El archivo o carpeta '$clean_item' no fue encontrado. Omitiendo.${NC}"
    fi
done

# Eliminar duplicados en FINAL_FILES
if [[ ${#FINAL_FILES[@]} -eq 0 ]]; then
    echo -e "${RED}Error: No hay archivos válidos para procesar.${NC}"
    exit 1
fi

declare -a UNIQUE_FILES=()
while IFS= read -r f; do
    UNIQUE_FILES+=("$f")
done < <(printf '%s\n' "${FINAL_FILES[@]}" | sort -u)

# ------------------------------------------------------------------------------
# Resumen Previo
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}${BLUE}=== RESUMEN DEL DESPLIEGUE ===${NC}"
echo -e "  ${BOLD}Bucket S3:${NC}           s3://$S3_BUCKET"
if [[ "$SKIP_INVALIDATION" = false ]]; then
    echo -e "  ${BOLD}CloudFront Dist ID:${NC}  $CLOUDFRONT_DISTRIBUTION_ID"
else
    echo -e "  ${BOLD}CloudFront Dist ID:${NC}  (Omitido)"
fi
if [[ -n "$AWS_REGION" ]]; then
    echo -e "  ${BOLD}Región AWS:${NC}          $AWS_REGION"
fi
if [[ -n "$AWS_PROFILE" ]]; then
    echo -e "  ${BOLD}Perfil AWS:${NC}          $AWS_PROFILE"
fi
echo -e "  ${BOLD}Total de Archivos:${NC}   ${#UNIQUE_FILES[@]}"
if [[ "$DRY_RUN" = true ]]; then
    echo -e "  ${YELLOW}${BOLD}Modo:${NC}                [DRY-RUN / SIMULACIÓN]${NC}"
fi
echo -e "${BLUE}==============================${NC}\n"

# ------------------------------------------------------------------------------
# Subida a S3
# ------------------------------------------------------------------------------
echo -e "${BOLD}${CYAN}[1/2] Subiendo archivos a S3...${NC}"

declare -a INVALIDATION_PATHS=()

for file in "${UNIQUE_FILES[@]}"; do
    target_s3="s3://${S3_BUCKET}/${file}"
    ext="${file##*.}"

    # Asignar Cache-Control y Content-Type según el tipo de archivo
    CACHE_CONTROL="public, max-age=3600, must-revalidate"
    CONTENT_TYPE=""

    case "$ext" in
        html)
            # El HTML nunca debe quedarse congelado en el navegador del usuario
            CACHE_CONTROL="public, max-age=0, must-revalidate"
            CONTENT_TYPE="text/html; charset=utf-8"
            ;;
        css)
            CONTENT_TYPE="text/css; charset=utf-8"
            ;;
        js)
            CONTENT_TYPE="application/javascript; charset=utf-8"
            ;;
        svg)
            CONTENT_TYPE="image/svg+xml"
            ;;
        png)
            CONTENT_TYPE="image/png"
            CACHE_CONTROL="public, max-age=86400"
            ;;
        jpg|jpeg)
            CONTENT_TYPE="image/jpeg"
            CACHE_CONTROL="public, max-age=86400"
            ;;
        webp)
            CONTENT_TYPE="image/webp"
            CACHE_CONTROL="public, max-age=86400"
            ;;
        mp3)
            CONTENT_TYPE="audio/mpeg"
            CACHE_CONTROL="public, max-age=86400"
            ;;
        json)
            CONTENT_TYPE="application/json; charset=utf-8"
            ;;
    esac

    UPLOAD_OPTS=(--cache-control "$CACHE_CONTROL")
    if [[ -n "$CONTENT_TYPE" ]]; then
        UPLOAD_OPTS+=(--content-type "$CONTENT_TYPE")
    fi

    echo -e "  ${GREEN}↑${NC} $file  →  $target_s3"

    if [[ "$DRY_RUN" = false ]]; then
        aws "${AWS_ARGS[@]}" s3 cp "$file" "$target_s3" "${UPLOAD_OPTS[@]}"
    fi

    # Registrar rutas para invalidación de CloudFront
    if [[ "$FULL_INVALIDATE" = false ]]; then
        cf_path="/$file"
        INVALIDATION_PATHS+=("$cf_path")

        # Casos especiales de index.html para rutas amigables en CloudFront
        if [[ "$file" == "index.html" ]]; then
            INVALIDATION_PATHS+=("/")
        elif [[ "$file" =~ /index\.html$ ]]; then
            dir_path="/${file%/index.html}/"
            dir_path_no_slash="/${file%/index.html}"
            INVALIDATION_PATHS+=("$dir_path" "$dir_path_no_slash")
        fi
    fi
done

echo -e "\n${GREEN}✓ Subida a S3 completada.${NC}\n"

# ------------------------------------------------------------------------------
# Invalidación en CloudFront
# ------------------------------------------------------------------------------
if [[ "$SKIP_INVALIDATION" = true ]]; then
    echo -e "${YELLOW}ℹ Invalidación en CloudFront omitida según lo configurado.${NC}"
    exit 0
fi

echo -e "${BOLD}${CYAN}[2/2] Creando invalidación en CloudFront...${NC}"

declare -a FINAL_PATHS=()

if [[ "$FULL_INVALIDATE" = true ]]; then
    FINAL_PATHS=("/*")
else
    # Eliminar rutas duplicadas
    while IFS= read -r path; do
        FINAL_PATHS+=("$path")
    done < <(printf '%s\n' "${INVALIDATION_PATHS[@]}" | sort -u)
fi

echo -e "Rutas a invalidar (${#FINAL_PATHS[@]}):"
for p in "${FINAL_PATHS[@]}"; do
    echo -e "  ${BLUE}•${NC} $p"
done

if [[ "$DRY_RUN" = true ]]; then
    echo -e "\n${YELLOW}[DRY-RUN] Simulación completa. No se creó invalidación real.${NC}"
    exit 0
fi

# Ejecutar invalidación en CloudFront
INVALIDATION_OUTPUT=$(aws "${AWS_ARGS[@]}" cloudfront create-invalidation \
    --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
    --paths "${FINAL_PATHS[@]}")

INVALIDATION_ID=$(echo "$INVALIDATION_OUTPUT" | grep -o '"Id": "[^"]*' | cut -d'"' -f4 || echo "")

if [[ -n "$INVALIDATION_ID" ]]; then
    echo -e "\n${GREEN}${BOLD}✓ Invalidación creada exitosamente!${NC}"
    echo -e "  ${BOLD}ID:${NC} $INVALIDATION_ID"
    echo -e "  Para consultar el estado:"
    echo -e "  aws cloudfront get-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --id $INVALIDATION_ID"
else
    echo -e "\n${GREEN}✓ Invalidación enviada a CloudFront.${NC}"
fi

echo -e "\n${GREEN}${BOLD}¡Despliegue finalizado con éxito!${NC}\n"
