module.exports = {
    databes_project_time_update_interval: 30/*sekund*/ * 1000, //czas zapisywania co jaki czas pracy nad projektem jest synchronizowany z bazą danych
    login_callback_address: "https://timecubeproject.github.io/TimeCubeProject/index.html", //adres aplikacji frontendowe do przekierowania po zalogowaniu
    port: 3000, //port aplikacji
    database_host: "localhost", //link do bazy danych, lub localhost w przypadku bazy lokalnej
    database_name: "kostka", //nazwa bazy danych używanej przez aplikację
    database_table_name: "kostka", //nazwa tabeli w bazie danych używanej przez aplikację
    server_address: "https://dergcube.westus.cloudapp.azure.com" //adres internetowy serwera
}
