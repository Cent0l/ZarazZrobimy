# ZarazZrobimy

# System Zarządzania Inwentarzem Lombardu

## Opis projektu
System umożliwia zarządzanie inwentarzem lombardu, oferując funkcje dodawania, edytowania oraz usuwania przedmiotów. Obsługuje także zmiany cen, statusu dostępności oraz przechowywanie zdjęć produktów.

## Funkcjonalności
### 0. Zarządzanie inwentarzem:
- Dodawanie/usuwanie przedmiotów
- Edycja przedmiotu:
  - Zmiana ceny
  - Opis ogólny
  - Stan zużycia (od 1 do 10)
  - Zmiana statusu dostępności
- Obsługa zdjęć przedmiotów
### 1. **System ról i uprawnień**
- **Opis**: Aplikacja umożliwia przydzielanie ról do użytkowników (np. magazynier, kierownik) oraz zarządzanie dostępem do różnych funkcji systemu w zależności od przypisanej roli.
- **Zakres**:
  - **Magazynier**: Dodawanie/usuwanie przedmiotów, edytowanie przedmiotów, zarządzanie zdjęciami.
  - **Kierownik**: Wszystkie funkcje magazyniera plus możliwość zatwierdzania zmian w systemie, generowanie raportów.
- **Funkcjonalność**:
  - Zmienianie ról pracowników
  - Definiowanie poziomów dostępu do funkcji aplikacji
  - Wyświetlanie tylko dozwolonych opcji w zależności od roli

### 2. **Historia operacji na przedmiotach**
- **Opis**: Aplikacja umożliwia rejestrowanie wszystkich zmian dotyczących przedmiotów, takich jak dodanie, edycja, zmiana statusu, itp.
- **Zakres**:
  - Historia wszystkich operacji związanych z przedmiotami.
  - Rejestrowanie daty, godziny i pracownika, który dokonał zmiany.
- **Funkcjonalność**:
  - Wyświetlanie historii przedmiotów (dodanie, edytowanie, usunięcie)
  - Możliwość przeglądania historii zmian w odniesieniu do konkretnego przedmiotu
  - Generowanie raportów o zmianach w magazynie

### 3. **Raporty i statystyki**
- **Opis**: Funkcja generowania raportów i statystyk na podstawie danych zgromadzonych w systemie. Może obejmować takie informacje jak liczba przedmiotów, średnia cena, liczba dostępnych przedmiotów, itp.
- **Zakres**:
  - Generowanie raportów o stanie magazynowym.
  - Analiza popularności przedmiotów.
  - Przewidywanie zapotrzebowania na różne kategorie przedmiotów.
- **Funkcjonalność**:
  - Generowanie raportów na żądanie (np. miesięczne, kwartalne)
  - Prezentacja wyników w formie tabeli i wykresów
  - Eksport raportów do plików CSV/PDF

### 4. **Powiadomienia**
- **Opis**: System powiadomień, który informuje pracowników o ważnych wydarzeniach związanych z przedmiotami, takich jak zmiany statusu, niskie stany magazynowe czy konieczność uzupełnienia asortymentu.
- **Zakres**:
  - Powiadomienia o zmianach statusu przedmiotów (np. przedmiot dostępny/wycofany)
  - Powiadomienia o niskim stanie magazynowym
  - Powiadomienia o terminach przechowywania przedmiotów
- **Funkcjonalność**:
  - Powiadomienia push (np. w aplikacji webowej)
  - Wysyłanie maili z powiadomieniami
  - Możliwość wyłączenia powiadomień przez użytkownika

### 5. **Wyszukiwanie i filtrowanie**
- **Opis**: Aplikacja umożliwia wyszukiwanie przedmiotów w bazie danych za pomocą różnych filtrów, takich jak cena, stan, kategoria, dostępność.
- **Zakres**:
  - Filtracja po różnych kryteriach (np. cena, stan zużycia, kategoria, status dostępności)
  - Szybkie wyszukiwanie przedmiotów po nazwie lub kategorii
- **Funkcjonalność**:
  - Wyszukiwanie przedmiotów po nazwie, kategorii, stanie, cenie
  - Możliwość zapisywania preferowanych filtrów
  - Wyświetlanie wyników w formie tabeli z możliwością sortowania

### 6. **System logowania i wylogowywania**
- **Opis**: Funkcja umożliwia pracownikom logowanie i wylogowywanie się z aplikacji, zapewniając bezpieczeństwo dostępu do systemu.
- **Zakres**:
  - Logowanie i wylogowywanie pracowników
  - Obsługa haseł i ewentualnie dwuetapowego uwierzytelniania
- **Funkcjonalność**:
  - Logowanie za pomocą loginu i hasła
  - Możliwość resetowania hasła
  - Funkcja wylogowywania z aplikacji po zakończeniu sesji
  - Zabezpieczenie dostępu do aplikacji przed nieautoryzowanym dostępem


  
### 1. **System ról i uprawnień**
- **Opis**: Aplikacja umożliwia przydzielanie ról do użytkowników (np. magazynier, kierownik) oraz zarządzanie dostępem do różnych funkcji systemu w zależności od przypisanej roli.
- **Zakres**:
  - **Magazynier**: Dodawanie/usuwanie przedmiotów, edytowanie przedmiotów, zarządzanie zdjęciami.
  - **Kierownik**: Wszystkie funkcje magazyniera plus możliwość zatwierdzania zmian w systemie, generowanie raportów.
- **Funkcjonalność**:
  - Zmienianie ról pracowników
  - Definiowanie poziomów dostępu do funkcji aplikacji
  - Wyświetlanie tylko dozwolonych opcji w zależności od roli

### 2. **Historia operacji na przedmiotach**
- **Opis**: Aplikacja umożliwia rejestrowanie wszystkich zmian dotyczących przedmiotów, takich jak dodanie, edycja, zmiana statusu, itp.
- **Zakres**:
  - Historia wszystkich operacji związanych z przedmiotami.
  - Rejestrowanie daty, godziny i pracownika, który dokonał zmiany.
- **Funkcjonalność**:
  - Wyświetlanie historii przedmiotów (dodanie, edytowanie, usunięcie)
  - Możliwość przeglądania historii zmian w odniesieniu do konkretnego przedmiotu
  - Generowanie raportów o zmianach w magazynie

### 3. **Raporty i statystyki**
- **Opis**: Funkcja generowania raportów i statystyk na podstawie danych zgromadzonych w systemie. Może obejmować takie informacje jak liczba przedmiotów, średnia cena, liczba dostępnych przedmiotów, itp.
- **Zakres**:
  - Generowanie raportów o stanie magazynowym.
  - Analiza popularności przedmiotów.
  - Przewidywanie zapotrzebowania na różne kategorie przedmiotów.
- **Funkcjonalność**:
  - Generowanie raportów na żądanie (np. miesięczne, kwartalne)
  - Prezentacja wyników w formie tabeli i wykresów
  - Eksport raportów do plików CSV/PDF

### 4. **Powiadomienia**
- **Opis**: System powiadomień, który informuje pracowników o ważnych wydarzeniach związanych z przedmiotami, takich jak zmiany statusu, niskie stany magazynowe czy konieczność uzupełnienia asortymentu.
- **Zakres**:
  - Powiadomienia o zmianach statusu przedmiotów (np. przedmiot dostępny/wycofany)
  - Powiadomienia o niskim stanie magazynowym
  - Powiadomienia o terminach przechowywania przedmiotów
- **Funkcjonalność**:
  - Powiadomienia push (np. w aplikacji webowej)
  - Wysyłanie maili z powiadomieniami
  - Możliwość wyłączenia powiadomień przez użytkownika

### 5. **Wyszukiwanie i filtrowanie**
- **Opis**: Aplikacja umożliwia wyszukiwanie przedmiotów w bazie danych za pomocą różnych filtrów, takich jak cena, stan, kategoria, dostępność.
- **Zakres**:
  - Filtracja po różnych kryteriach (np. cena, stan zużycia, kategoria, status dostępności)
  - Szybkie wyszukiwanie przedmiotów po nazwie lub kategorii
- **Funkcjonalność**:
  - Wyszukiwanie przedmiotów po nazwie, kategorii, stanie, cenie
  - Możliwość zapisywania preferowanych filtrów
  - Wyświetlanie wyników w formie tabeli z możliwością sortowania

### 6. **System logowania i wylogowywania**
- **Opis**: Funkcja umożliwia pracownikom logowanie i wylogowywanie się z aplikacji, zapewniając bezpieczeństwo dostępu do systemu.
- **Zakres**:
  - Logowanie i wylogowywanie pracowników
  - Obsługa haseł i ewentualnie dwuetapowego uwierzytelniania
- **Funkcjonalność**:
  - Logowanie za pomocą loginu i hasła
  - Możliwość resetowania hasła
  - Funkcja wylogowywania z aplikacji po zakończeniu sesji
  - Zabezpieczenie dostępu do aplikacji przed nieautoryzowanym dostępem


## Technologie
- **Frontend:** Angular
- **Backend:** Spring Boot
- **Baza danych:** PostgreSQL

## Zespół
### Backend:
- Mateusz
- Adam Czajkowski

### Frontend:
- Kuba
- Adam Czaplicki 

### Interface:
- Kamil Dawid *(tabelki + diagramy)*

### Dodatkowe:
- **Diagramy:** Centol może pomagać
- **Bazy danych:** Kuba


###
trello
-https://trello.com/b/kImd2CMv/zaraz-zrobimy
