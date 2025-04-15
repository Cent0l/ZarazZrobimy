INSERT INTO Categories (category_name, description) VALUES
                                                        ('AGD', 'Sprzęt AGD: pralki, lodówki, miksery, ekspresy do kawy itp.'),
                                                        ('Elektronika', 'Telewizory, laptopy, tablety, smartfony, konsole do gier itp.'),
                                                        ('Biżuteria', 'Złote, srebrne i platynowe pierścionki, łańcuszki, kolczyki, zegarki itp.'),
                                                        ('Narzędzia', 'Elektronarzędzia i narzędzia ręczne: wiertarki, szlifierki, młotki itp.'),
                                                        ('Instrumenty muzyczne', 'Gitary, keyboardy, skrzypce, perkusje i inne instrumenty.'),
                                                        ('Sprzęt sportowy', 'Rowerki, hulajnogi, hantle, sprzęt fitness, narty itp.'),
                                                        ('Gry i zabawki', 'Konsolowe gry, gry planszowe, zabawki dla dzieci.'),
                                                        ('Zegarki', 'Zegarki naręczne, kieszonkowe, luksusowe i sportowe.'),
                                                        ('Fotografia', 'Aparaty fotograficzne, kamery wideo, obiektywy, statywy.'),
                                                        ('Antyki i kolekcje', 'Przedmioty kolekcjonerskie, antyki, monety, znaczki, figurki.');

INSERT INTO Customers (first_name, last_name, id_type, id_number, do_not_serve) VALUES
                                                        ('Anna', 'Kowalska', 'Dowód osobisty', 'ABC123456', FALSE),
                                                        ('Marek', 'Nowak', 'Paszport', 'PA987654', FALSE),
                                                        ('Katarzyna', 'Wiśniewska', 'Dowód osobisty', 'XYZ654321', TRUE),
                                                        ('Tomasz', 'Zieliński', 'Prawo jazdy', 'PJ112233', FALSE),
                                                        ('Ewa', 'Dąbrowska', 'Dowód osobisty', 'DOC998877', FALSE);

INSERT INTO Items (
    category_id, description, serial_number, name, brand, model, condition,
    bought_for, asking_price, status, reported_stolen, created_by, updated_by
) VALUES
      (1, 'Ekspres do kawy w bardzo dobrym stanie', 'SN123456', 'Ekspres do kawy', 'DeLonghi', 'Magnifica S', 'bardzo dobry', 200.00, 350.00, 'in_inventory', FALSE,1, 1),
      (2, 'Smartfon z lekkimi śladami użytkowania', 'IMEI987654321', 'Smartfon', 'Samsung', 'Galaxy S21', 'dobry', 600.00, 950.00, 'in_inventory', FALSE,1, 1),
      (3, 'Złoty pierścionek z cyrkonią', NULL, 'Pierścionek', 'Brak', 'Brak', 'idealny', 300.00, 550.00, 'in_inventory', FALSE,1, 1),
      (4, 'Szlifierka kątowa używana, sprawna', 'TOOL2024A', 'Szlifierka kątowa', 'Bosch', 'GWS 7-125', 'używany', 100.00, 200.00, 'in_inventory', FALSE,1, 1),
      (5, 'Gitara klasyczna bez uszkodzeń', NULL, 'Gitara klasyczna', 'Yamaha', 'C40', 'bardzo dobry', 150.00, 280.00, 'redeemed', FALSE,1, 1),
      (6, 'Zegarek męski z mechanizmem automatycznym', 'WATCHSN2025', 'Zegarek', 'Seiko', '5 Sports', 'idealny', 450.00, 700.00, 'redeemed', FALSE, 1, 1),
      (7, 'Hulajnoga elektryczna – bateria 100%', 'HUL12345EL', 'Hulajnoga elektryczna', 'Xiaomi', 'Mi Electric Scooter 3', 'bardzo dobry', 800.00, 1150.00, 'redeemed', FALSE,1, 1),
      (8, 'Gra konsolowa PS5 – stan idealny', 'DISC-PS5-0001', 'Gra PS5: God of War Ragnarök', 'Sony', 'PS5', 'idealny', 100.00, 200.00, 'redeemed', FALSE,1, 1),
      (9, 'Lustrzanka cyfrowa z obiektywem', 'CAM998877', 'Aparat fotograficzny', 'Canon', 'EOS 2000D', 'dobry', 500.00, 850.00, 'sold', FALSE,1, 1),
      (10, 'Kolekcjonerska moneta srebrna – 1 oz', NULL, 'Moneta kolekcjonerska', 'Mennica Polska', 'Orzeł Bielik 2024', 'idealny', 120.00, 250.00, 'sold', FALSE,1, 1),
      (2, 'Laptop z lekkimi rysami, sprawny', 'LAPTOPSN0023', 'Laptop', 'HP', 'Pavilion 15', 'dobry', 850.00, 1200.00, 'sold', FALSE,1, 1),
      (3, 'Naszyjnik srebrny, klasyczny wzór', NULL, 'Naszyjnik', 'Brak', 'Brak', 'bardzo dobry', 180.00, 300.00, 'sold', FALSE,1, 1),
      (5, 'Keyboard elektroniczny z zasilaczem', NULL, 'Keyboard', 'Casio', 'CTK-3500', 'dobry', 300.00, 500.00, 'sold', FALSE,1, 1),
      (7, 'Rower miejski, rama aluminiowa', 'BIKE2025SN', 'Rower miejski', 'Kross', 'Trans 5.0', 'dobry', 600.00, 900.00, 'in_inventory', FALSE,1, 1),
      (6, 'Zegarek sportowy z GPS', 'SMARTWATCH4567', 'Zegarek sportowy', 'Garmin', 'Forerunner 55', 'bardzo dobry', 450.00, 700.00, 'in_inventory', FALSE,1, 1),
      (8, 'Gra planszowa w stanie idealnym', NULL, 'Gra planszowa', 'Rebel', 'Terraformacja Marsa', 'idealny', 80.00, 150.00, 'in_inventory', FALSE,1, 1),
      (4, 'Wiertarka udarowa w oryginalnej walizce', 'TOOL-W1234', 'Wiertarka', 'Makita', 'HP1631K', 'bardzo dobry', 250.00, 400.00, 'in_inventory', TRUE,1, 1),
      (1, 'Lodówka dwudrzwiowa, brak uszkodzeń', 'FRIDGE-SN999', 'Lodówka', 'Samsung', 'RB34T', 'bardzo dobry', 900.00, 1400.00, 'in_inventory', TRUE,1, 1),
      (9, 'Lustrzanka cyfrowa bez obiektywu', 'CANON-STOLEN', 'Aparat fotograficzny', 'Canon', 'EOS 4000D', 'dobry', 350.00, 650.00, 'in_inventory', TRUE,1, 1);

INSERT INTO Transactions (
    customer_id, employee_id,transaction_type,
    total_amount, pawn_duration_days, interest_rate, redemption_price,
    expiry_date, related_transaction_id, notes
) VALUES
      (1, 1, 'pawn', 1130.00, 30, 1.2, 1143.56, '2025-05-25 15:15:00', NULL, 'Towar przyjęty, wypłata gotówką,kilent poinformował że może przedłużyć czas wykupu'),
      (3, 1, 'purchase', 1500.00, NULL, NULL, NULL, NULL, NULL, 'Towar zabezpieczony przez policje, przebywa w magazynie do przyjazdu służb'),
      (2, 1, 'pawn', 1200, 30, 1.8, 1221.60, '2025-05-15 10:15:00', NULL, 'Towar przyjęty, wypłata przelana na konto'),
      (4, 1, 'sale', 3100, NULL, NULL, NULL, NULL, NULL, 'Towar wydany, kwota zapłacona przelewem'),
      (5, 1, 'redemption', 1500, Null, NULL, NULL, NULL, NULL, 'Towar opłacony gotówką i wydany klientowi');



INSERT INTO Transaction_Items (
    transaction_id, item_id, price,
) VALUES
      (1, 14, 600),
      (1, 15, 450),
      (1, 16, 80),
      (2, 17, 250),
      (2, 18, 900),
      (2, 19, 350),
      (3, 1, 200),
      (3, 2, 600),
      (3, 3, 300),
      (3, 4, 100),
      (4, 9, 850),
      (4, 10, 250),
      (4, 11, 1200),
      (4, 12, 300),
      (4, 13, 500),
      (5, 5, 150),
      (5,6, 450),
      (5, 7, 800),
      (5, 8, 200);

     -- ak  40, 39, 38 / kw 41, 42, 43 / mn 25, 26, 27, 28 / tz 33, 34, 35, 36, 37 / ed 29, 30, 31, 32
     --     16  15  14      17  18  19       1   2   3   4       9  10  11  12  13       5   6   7   8   (),