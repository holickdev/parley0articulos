# ETAPA 1: Compilación del Frontend (Node + Vite + React)
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# ETAPA 2: Producción (FrankenPHP)
FROM dunglas/frankenphp:1-php8.4 AS runner

RUN install-php-extensions \
    pdo_mysql \
    gd \
    intl \
    zip \
    bcmath \
    pcntl \
    opcache \
    sockets

WORKDIR /app

# Restricciones de carga (Bloqueo de multimedia masiva) y optimización Opcache
RUN echo "upload_max_filesize = 2M" > /usr/local/etc/php/conf.d/uploads.ini && \
    echo "post_max_size = 2M" >> /usr/local/etc/php/conf.d/uploads.ini && \
    echo "variables_order = EGPCS" >> /usr/local/etc/php/conf.d/uploads.ini && \
    echo "memory_limit = 128M" >> /usr/local/etc/php/conf.d/uploads.ini && \
    echo "opcache.enable=1" >> /usr/local/etc/php/conf.d/opcache.ini

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts --no-autoloader

COPY . .

# Inyección de estáticos compilados en la Etapa 1
COPY --from=frontend-builder /app/public/build ./public/build

# Optimización extrema de Laravel para producción
RUN composer dump-autoload --optimize && \
    mkdir -p storage/logs bootstrap/cache storage/framework/views storage/framework/cache storage/framework/sessions && \
    php artisan config:cache && \
    php artisan event:cache && \
    php artisan route:cache && \
    php artisan view:cache

# Ajuste de permisos para root
RUN chown -R root:root /app/storage /app/bootstrap/cache && \
    chmod -R 775 /app/storage /app/bootstrap/cache

# CORRECCIÓN: Exposición de los puertos necesarios para SSL y HTTP/3
EXPOSE 80 443 443/udp

# CORRECCIÓN: Cambio del puerto de Octane al 443 para coincidir con la emisión de SSL
CMD ["php", "artisan", "octane:start", "--server=frankenphp", "--host=0.0.0.0", "--port=80", "--admin-port=2019"]
