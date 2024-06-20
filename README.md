## Инструкция по запуску

Установите зависимости
```sh
npm install
```
Запустите докер-контейнер БД
```sh
docker-compose up -d
```
Проверьте, что нужная БД (bank) создалась. Если получаете ошибку `ERROR 2002 (HY000): Can't connect to local MySQL server through socket '/var/run/mysqld/mysqld.sock' (2)`, просто выполните команду повторно.
```sh
docker exec -it mysql-container mysql -uroot -proot -e "SHOW DATABASES;"
```
Запустите веб-сервер
```sh
node index.js
```
Перейдите по ссылке http://localhost:3000
