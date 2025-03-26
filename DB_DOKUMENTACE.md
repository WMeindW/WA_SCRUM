# Dokumentace databáze `jidelna`

Tato dokumentace popisuje strukturu databáze `jidelna` a její uložené procedury.

## Tabulky

### `lunch_menus`

Ukládá informace o denních menu.

| Sloupec              | Datový typ | Omezení                               | Popis                                      |
| -------------------- | ----------- | -------------------------------------- | ------------------------------------------ |
| `id`                 | INT         | PRIMARY KEY AUTO_INCREMENT           | Unikátní ID menu                           |
| `date`               | DATE        | NOT NULL                               | Datum menu                                 |
| `soup_id`            | INT         | NOT NULL, FOREIGN KEY `soups` (`id`) | ID polévky                                 |
| `main_course_1_id`   | INT         | NOT NULL, FOREIGN KEY `lunches` (`id`) | ID hlavního jídla 1                          |
| `main_course_2_id`   | INT         | NOT NULL, FOREIGN KEY `lunches` (`id`) | ID hlavního jídla 2                          |

### `lunches`

Ukládá informace o hlavních jídlech.

| Sloupec       | Datový typ    | Omezení                     | Popis            |
| ------------- | ------------- | --------------------------- | ---------------- |
| `id`          | INT           | PRIMARY KEY AUTO_INCREMENT | Unikátní ID jídla |
| `name`        | VARCHAR(255)  | NOT NULL, UNIQUE            | Název jídla      |
| `lunch_date` | DATE          | NOT NULL                    | Datum jídla      |

### `question_options`

Ukládá možnosti pro otázky hodnocení.

| Sloupec       | Datový typ    | Omezení                                  | Popis               |
| ------------- | ------------- | ---------------------------------------- | ------------------- |
| `id`          | INT           | PRIMARY KEY AUTO_INCREMENT               | Unikátní ID možnosti|
| `question_id` | INT           | NOT NULL, FOREIGN KEY `questions` (`id`) | ID otázky           |
| `option_text` | VARCHAR(255)  | NOT NULL                                 | Text možnosti       |

### `questions`

Ukládá otázky pro hodnocení jídel.

| Sloupec     | Datový typ    | Omezení                     | Popis                    |
| ----------- | ------------- | --------------------------- | ------------------------ |
| `id`        | INT           | PRIMARY KEY AUTO_INCREMENT | Unikátní ID otázky       |
| `text`      | VARCHAR(255)  | NOT NULL                    | Text otázky              |
| `min_value` | INT           | DEFAULT '1'                 | Minimální hodnota hodnocení|
| `max_value` | INT           | DEFAULT '5'                 | Maximální hodnota hodnocení|

### `soups`

Ukládá informace o polévkách.

| Sloupec       | Datový typ    | Omezení                     | Popis            |
| ------------- | ------------- | --------------------------- | ---------------- |
| `id`          | INT           | PRIMARY KEY AUTO_INCREMENT | Unikátní ID polévky |
| `name`        | VARCHAR(255)  | NOT NULL, UNIQUE            | Název polévky      |
| `lunch_date` | DATE          | NOT NULL                    | Datum polévky      |

### `user_lunch_ratings`

Ukládá hodnocení jídel od uživatelů.

| Sloupec        | Datový typ    | Omezení                                         | Popis                  |
| -------------- | ------------- | ----------------------------------------------- | ---------------------- |
| `id`           | INT           | PRIMARY KEY AUTO_INCREMENT                      | Unikátní ID hodnocení  |
| `user_id`      | INT           | NOT NULL, FOREIGN KEY `users` (`id`)            | ID uživatele           |
| `lunch_menu_id`| INT           | NOT NULL, FOREIGN KEY `lunch_menus` (`id`)      | ID menu                |
| `question_id`  | INT           | NOT NULL, FOREIGN KEY `questions` (`id`)        | ID otázky              |
| `rating`       | INT           | CHECK `rating` BETWEEN 1 AND 5                | Hodnocení              |
| `created_at`   | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP                       | Čas hodnocení          |

### `user_lunch_votes`

Ukládá informace o hlasování uživatelů.

| Sloupec        | Datový typ    | Omezení                                         | Popis                  |
| -------------- | ------------- | ----------------------------------------------- | ---------------------- |
| `user_id`      | INT           | NOT NULL, FOREIGN KEY `users` (`id`)            | ID uživatele           |
| `lunch_menu_id`| INT           | NOT NULL, FOREIGN KEY `lunch_menus` (`id`)      | ID menu                |
| `rated`        | TINYINT(1)    | DEFAULT '0'                                     | Označení hodnocení     |
| `voted_at`     | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP                       | Čas hlasování          |

### `users`

Ukládá informace o uživatelích.

| Sloupec           | Datový typ    | Omezení                     | Popis             |
| ----------------- | ------------- | --------------------------- | ----------------- |
| `id`              | INT           | PRIMARY KEY AUTO_INCREMENT | Unikátní ID uživatele|
| `email`           | VARCHAR(255)  | NOT NULL, UNIQUE            | Email uživatele    |
| `password_hash`   | VARCHAR(255)  | NOT NULL                    | Hash hesla        |
| `last_rating_date`| DATE          | DEFAULT NULL                | Datum posledního hodnocení |
| `is_admin`        | TINYINT(1)    | NOT NULL, DEFAULT '0'       | Označení admina   |

## Procedury

### `AddFullLunchMenu`

Přidá nové menu do databáze.

* **Vstupní parametry:**
    * `soup_name` (VARCHAR): Název polévky.
    * `main_course_1_name` (VARCHAR): Název hlavního jídla 1.
    * `main_course_2_name` (VARCHAR): Název hlavního jídla 2.
    * `menu_date` (DATE): Datum menu.
* **Funkce:**
    * Zkontroluje, zda polévka s daným názvem a datem již existuje. Pokud ne, přidá ji do tabulky `soups`.
    * Zkontroluje, zda hlavní jídlo 1 s daným názvem a datem již existuje. Pokud ne, přidá ho do tabulky `lunches`.
    * Zkontroluje, zda hlavní jídlo 2 s daným názvem a datem již existuje. Pokud ne, přidá ho do tabulky `lunches`.
    * Přidá nové menu do tabulky `lunch_menus` s odkazy na ID polévky a hlavních jídel.

### `GetLast5LunchMenusForUser`

Získá posledních 5 menu pro daného uživatele.

* **Vstupní parametr:**
    * `userEmail` (VARCHAR): Email uživatele.
* **Funkce:**
    * Získá ID uživatele z tabulky `users` na základě emailu.
    * Získá posledních 5 menu z tabulky `lunch_menus` seřazených podle data sestupně.
    * Pro každé menu získá název polévky z tabulky `soups` a názvy hlavních jídel z tabulky `lunches`.
    * Vrátí JSON s informacemi o menu, včetně názvů jídel a hodnocení uživatele.
### `GetLunchOverallRating`

Získá celkové hodnocení oběda.

* Vstupní parametr:
    * `lunch_menu_id` (INT): ID menu oběda.
* Funkce:
    * Vypočítá průměrné hodnocení oběda na základě hodnocení od uživatelů.
    * Vrací průměrné hodnocení oběda.
### `GetUserLastLunchesWithRating`

Získá poslední obědy, které uživatel hodnotil.