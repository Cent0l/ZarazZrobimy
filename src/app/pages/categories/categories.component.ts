import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface Category {
  id: number;
  categoryName: string;
  description: string;
  parentCategoryId: number | null;
  subcategories?: Category[];
  parentCategoryName?: string;
  level?: number;
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  allCategories: Category[] = []; // Płaska lista wszystkich kategorii
  hierarchicalCategories: Category[] = []; // Drzewiasta struktura
  isLoading: boolean = true;
  error: string | null = null;
  successMessage: string | null = null;

  // Zmienne dla modala edycji
  showEditModal: boolean = false;
  editingCategory: Category | null = null;
  editCategoryName: string = '';
  editDescription: string = '';
  editParentCategoryId: number | null = null;
  editInProgress: boolean = false;

  // Zmienne dla modala usuwania
  showDeleteModal: boolean = false;
  categoryToDelete: Category | null = null;
  affectedSubcategories: Category[] = [];
  deleteInProgress: boolean = false;

  // Zmienne dla dodawania kategorii
  showAddModal: boolean = false;
  newCategory: Category = this.getEmptyCategory();
  addInProgress: boolean = false;

  // Zmienne dla sortowania
  sortColumn: keyof Category = 'id';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Flaga rozwinięcia kategorii
  expandedCategories: { [key: number]: boolean } = {};

  // Zmienne dla modala struktury
  showStructureModal: boolean = false;
  selectedCategory: Category | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.authToken = localStorage.getItem('authToken');

    if (this.authToken) {
      this.fetchCategories();
    } else {
      this.error = 'Brak autoryzacji. Proszę zalogować się na stronie głównej.';
      this.isLoading = false;
    }

    // Naprawienie problemów z modalem
    this.fixModalBackdropIssue();
  }

  // Metoda do naprawienia problemu z tłem modala
  private fixModalBackdropIssue(): void {
    // Dodajemy listener na klawisze Escape, żeby móc zamknąć modal
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        if (this.showDeleteModal) this.closeDeleteModal();
        if (this.showEditModal) this.closeEditModal();
        if (this.showAddModal) this.closeAddModal();
      }
    });

    // Naprawianie problemu z modalem przy odświeżaniu strony
    window.addEventListener('beforeunload', () => {
      document.body.classList.remove('modal-open');
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }
    });
  }

  private authToken: string | null = null;

  getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authToken}`,
      'Content-Type': 'application/json'
    });
  }

  // Sprawdzenie czy kategoria jest rodzicem
  isParentCategory(categoryId: number): boolean {
    return this.allCategories.some(cat => cat.parentCategoryId === categoryId);
  }

  // Uzyskanie pełnej ścieżki dla kategorii (np. Elektronika/Telefony/Smartphone)
  getCategoryPath(categoryId: number): string {
    const paths: string[] = [];
    let currentCategory = this.allCategories.find(c => c.id === categoryId);

    while (currentCategory) {
      paths.unshift(currentCategory.categoryName);

      if (currentCategory.parentCategoryId) {
        currentCategory = this.allCategories.find(c => c.id === currentCategory?.parentCategoryId);
      } else {
        currentCategory = undefined;
      }
    }

    return paths.join(' / ');
  }

  // Pobieranie kategorii z API
  fetchCategories(): void {
    this.isLoading = true;
    this.error = null;

    this.http.get<Category[]>('/api/categories', {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (data) => {
        this.allCategories = data;

        // Dodaj nazwy kategorii nadrzędnych
        this.allCategories.forEach(category => {
          if (category.parentCategoryId) {
            const parentCategory = this.allCategories.find(c => c.id === category.parentCategoryId);
            if (parentCategory) {
              category.parentCategoryName = parentCategory.categoryName;
            }
          }
        });

        // Budowanie hierarchii
        this.buildCategoryHierarchy();

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Błąd pobierania kategorii:', err);
        if (err.status === 401) {
          this.error = 'Błąd autoryzacji. Proszę zalogować się ponownie.';
          this.authToken = null;
          localStorage.removeItem('authToken');
        } else {
          this.error = `Błąd podczas pobierania danych kategorii: ${err.message}`;
        }
        this.isLoading = false;
      }
    });
  }

  // Budowanie hierarchii kategorii
  buildCategoryHierarchy(): void {
    // Resetujemy drzewo
    this.hierarchicalCategories = [];

    // Znajdowanie kategorii głównych (bez rodzica)
    const rootCategories = this.allCategories.filter(c => c.parentCategoryId === null);

    // Budowanie drzewa dla każdej kategorii głównej
    rootCategories.forEach(root => {
      this.addSubcategories(root, 0);
      this.hierarchicalCategories.push(root);
    });
  }

  // Rekurencyjne dodawanie podkategorii
  addSubcategories(category: Category, level: number): void {
    category.level = level;
    category.subcategories = this.allCategories
      .filter(c => c.parentCategoryId === category.id)
      .map(subCategory => {
        this.addSubcategories(subCategory, level + 1);
        return subCategory;
      });
  }

  // Obsługa rozwijania/zwijania kategorii
  toggleCategory(categoryId: number): void {
    this.expandedCategories[categoryId] = !this.expandedCategories[categoryId];
  }

  isCategoryExpanded(categoryId: number): boolean {
    return this.expandedCategories[categoryId] || false;
  }

  // Metody dla modala edycji
  openEditModal(category: Category): void {
    this.editingCategory = { ...category };
    this.editCategoryName = category.categoryName;
    this.editDescription = category.description || '';
    this.editParentCategoryId = category.parentCategoryId;
    this.showEditModal = true;
    this.error = null;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingCategory = null;
    this.error = null;
    document.body.classList.remove('modal-open');
  }

  saveCategory(): void {
    if (!this.editingCategory) return;

    this.editInProgress = true;
    this.error = null;

    // Sprawdzenie poprawności danych
    if (!this.editCategoryName.trim()) {
      this.error = "Nazwa kategorii nie może być pusta";
      this.editInProgress = false;
      return;
    }

    // Przygotowanie danych do wysłania
    const updatedCategory = {
      categoryName: this.editCategoryName,
      description: this.editDescription,
      parentCategoryId: this.editParentCategoryId
    };

    // Sprawdzenie cyklu w hierarchii
    if (this.wouldCreateCycle(this.editingCategory.id, this.editParentCategoryId)) {
      this.error = "Wybrana kategoria nadrzędna spowodowałaby cykl w hierarchii";
      this.editInProgress = false;
      return;
    }

    // Wysłanie żądania do API
    this.http.put(`/api/categories/${this.editingCategory.id}`, updatedCategory, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (response) => {
        console.log('Kategoria zaktualizowana:', response);
        this.successMessage = `Kategoria "${this.editCategoryName}" została zaktualizowana`;
        this.showEditModal = false;
        this.editInProgress = false;
        this.fetchCategories(); // Odświeżenie listy kategorii

        // Ukryj komunikat po 3 sekundach
        setTimeout(() => {
          this.successMessage = null;
        }, 3000);
      },
      error: (err) => {
        console.error('Błąd aktualizacji kategorii:', err);
        this.editInProgress = false;

        if (err.status === 401) {
          this.error = 'Sesja wygasła. Proszę zalogować się ponownie.';
          this.authToken = null;
          localStorage.removeItem('authToken');
        } else if (err.error && err.error.error) {
          this.error = err.error.error;
        } else {
          this.error = `Wystąpił błąd podczas aktualizacji kategorii: ${err.message || 'Nieznany błąd'}`;
        }
      }
    });
  }

  // Sprawdzanie czy zmiana rodzica nie utworzy cyklu
  wouldCreateCycle(categoryId: number, newParentId: number | null): boolean {
    if (newParentId === null) return false; // Jeśli nie ma rodzica, nie ma cyklu
    if (categoryId === newParentId) return true; // Kategoria nie może być swoim własnym rodzicem

    // Sprawdzamy rekurencyjnie, czy nowy rodzic nie jest potomkiem kategorii
    let currentParentId: number | null = newParentId;
    const visited = new Set<number>();

    while (currentParentId !== null) {
      if (visited.has(currentParentId)) return true; // Wykryto cykl
      visited.add(currentParentId);

      const parent = this.allCategories.find(c => c.id === currentParentId);
      if (!parent) break;

      if (parent.id === categoryId) return true; // Wykryto cykl
      currentParentId = parent.parentCategoryId;
    }

    return false;
  }

  // Metody dla modala usuwania
  openDeleteModal(category: Category): void {
    this.categoryToDelete = category;
    this.affectedSubcategories = this.findAllSubcategories(category.id);
    this.showDeleteModal = true;
    this.error = null;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.categoryToDelete = null;
    this.affectedSubcategories = [];
    this.error = null;

    // Upewnij się, że modal backdrop również zostanie usunięty
    document.body.classList.remove('modal-open');
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
    }
  }

  deleteCategory(): void {
    if (!this.categoryToDelete) return;

    this.deleteInProgress = true;
    this.error = null;

    // Kaskadowe usuwanie kategorii nadrzędnych wraz z podkategoriami
    const hasSubcategories = this.isParentCategory(this.categoryToDelete.id);
    const options = {
      headers: this.getAuthHeaders(),
      params: {
        cascade: hasSubcategories ? 'true' : 'false'
      }
    };

    this.http.delete(`/api/categories/${this.categoryToDelete.id}`, options).subscribe({
      next: (response: any) => {
        if (response && response.deleted) {
          this.successMessage = `Kategoria "${this.categoryToDelete?.categoryName}" została usunięta`;
          this.showDeleteModal = false;
          this.deleteInProgress = false;
          this.fetchCategories(); // Odświeżenie listy kategorii

          // Ukryj komunikat po 3 sekundach
          setTimeout(() => {
            this.successMessage = null;
          }, 3000);
        } else {
          this.error = "Nie udało się usunąć kategorii";
          this.deleteInProgress = false;
        }
      },
      error: (err) => {
        console.error('Błąd usuwania kategorii:', err);
        this.deleteInProgress = false;

        if (err.status === 401) {
          this.error = 'Sesja wygasła. Proszę zalogować się ponownie.';
          this.authToken = null;
          localStorage.removeItem('authToken');
        } else if (err.status === 404) {
          this.error = 'Kategoria o podanym ID nie istnieje w systemie lub została już usunięta.';
        } else if (err.status === 409) {
          this.error = 'Nie można usunąć kategorii, ponieważ zawiera przedmioty.';
        } else if (err.error && err.error.error) {
          this.error = err.error.error;
        } else {
          this.error = `Wystąpił błąd podczas usuwania kategorii: ${err.message || 'Nieznany błąd'}`;
        }
      }
    });
  }

  // Znajdowanie wszystkich podkategorii dla danej kategorii
  findAllSubcategories(categoryId: number): Category[] {
    const result: Category[] = [];

    const addSubcategories = (id: number) => {
      const subcategories = this.allCategories.filter(c => c.parentCategoryId === id);
      result.push(...subcategories);

      subcategories.forEach(subcat => {
        addSubcategories(subcat.id);
      });
    };

    addSubcategories(categoryId);
    return result;
  }

  // Metody dla dodawania kategorii
  openAddModal(): void {
    this.newCategory = this.getEmptyCategory();
    this.showAddModal = true;
    this.error = null;
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.error = null;
    document.body.classList.remove('modal-open');
  }

  getEmptyCategory(): Category {
    return {
      id: 0,
      categoryName: '',
      description: '',
      parentCategoryId: null
    };
  }

  addCategory(): void {
    this.addInProgress = true;
    this.error = null;

    // Sprawdzenie poprawności danych
    if (!this.newCategory.categoryName.trim()) {
      this.error = "Nazwa kategorii nie może być pusta";
      this.addInProgress = false;
      return;
    }

    // Przygotowanie danych do wysłania - bez pola id
    const categoryToAdd = {
      categoryName: this.newCategory.categoryName,
      description: this.newCategory.description,
      parentCategoryId: this.newCategory.parentCategoryId
    };

    // Wysłanie żądania do API
    this.http.post('/api/categories', categoryToAdd, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (response) => {
        console.log('Kategoria dodana:', response);
        this.successMessage = `Kategoria "${this.newCategory.categoryName}" została dodana`;
        this.showAddModal = false;
        this.addInProgress = false;
        this.fetchCategories(); // Odświeżenie listy kategorii

        // Ukryj komunikat po 3 sekundach
        setTimeout(() => {
          this.successMessage = null;
        }, 3000);
      },
      error: (err) => {
        console.error('Błąd dodawania kategorii:', err);
        this.addInProgress = false;

        if (err.status === 401) {
          this.error = 'Sesja wygasła. Proszę zalogować się ponownie.';
          this.authToken = null;
          localStorage.removeItem('authToken');
        } else if (err.error && err.error.error) {
          this.error = err.error.error;
        } else {
          this.error = `Wystąpił błąd podczas dodawania kategorii: ${err.message || 'Nieznany błąd'}`;
        }
      }
    });
  }

  // Metody dla modala struktury kategorii
  showCategoryStructure(category: Category): void {
    console.log('Otwieranie struktury kategorii:', category);
    this.selectedCategory = { ...category };
    this.affectedSubcategories = this.findAllSubcategories(category.id);
    this.showStructureModal = true;
    // Dodanie klasy modal-open do body, aby zablokować przewijanie
    document.body.classList.add('modal-open');
  }

  closeStructureModal(): void {
    console.log('Zamykanie modala struktury');
    this.showStructureModal = false;
    this.selectedCategory = null;
    document.body.classList.remove('modal-open');
  }

  hasSubcategories(category: Category): boolean {
    return this.isParentCategory(category.id);
  }

  hasSubcategoriesOrItems(category: Category): boolean {
    // Prawdziwe sprawdzenie przedmiotów wymagałoby zapytania do API,
    // ale możemy założyć, że wystarczy sprawdzić podkategorie
    return this.hasSubcategories(category);
  }

  // Generuje sformatowane podkategorie w stylu drzewa
  getFormattedSubcategories(): string[] {
    if (!this.selectedCategory) return [];

    const result: string[] = [];
    const subcategories = this.findAllSubcategoriesWithLevels(this.selectedCategory.id);

    // Grupowanie podkategorii według rodzica
    const subcatsByParent: { [key: number]: Category[] } = {};
    subcategories.forEach(subcat => {
      const parentId = subcat.parentCategoryId || 0;
      if (!subcatsByParent[parentId]) {
        subcatsByParent[parentId] = [];
      }
      subcatsByParent[parentId].push(subcat);
    });

    // Rekurencyjna funkcja do formatowania drzewa
    const formatTree = (categoryId: number, prefix: string, isLast: boolean = true) => {
      const category = subcategories.find(c => c.id === categoryId);
      if (!category) return;

      // Tworzymy linię dla bieżącej kategorii
      if (categoryId !== this.selectedCategory!.id) {
        const connector = isLast ? '└── ' : '├── ';
        result.push(`${prefix}${connector}${category.categoryName}`);
      }

      // Przetwarzamy podkategorie
      const childPrefix = prefix + (isLast ? '    ' : '│   ');
      const children = subcatsByParent[categoryId] || [];

      children.forEach((child, index) => {
        const isLastChild = index === children.length - 1;
        formatTree(child.id, childPrefix, isLastChild);
      });
    };

    // Rozpoczynamy od głównej kategorii
    const directChildren = subcatsByParent[this.selectedCategory.id] || [];
    directChildren.forEach((child, index) => {
      const isLastChild = index === directChildren.length - 1;
      formatTree(child.id, '', isLastChild);
    });

    return result;
  }

  // Znajdowanie wszystkich podkategorii z poziomami dla danej kategorii
  findAllSubcategoriesWithLevels(categoryId: number): Category[] {
    // Kopia wybranej kategorii - będzie korzeniem
    const rootCategory = this.allCategories.find(c => c.id === categoryId);
    if (!rootCategory) return [];

    const result: Category[] = [{ ...rootCategory, level: 0 }];
    const processed = new Set<number>([categoryId]);

    // Funkcja rekurencyjna do znajdowania podkategorii
    const findSubcats = (parentId: number, level: number) => {
      // Znajdujemy bezpośrednie podkategorie
      const subcats = this.allCategories.filter(c => c.parentCategoryId === parentId && !processed.has(c.id));

      // Dodajemy je do wyników z odpowiednim poziomem
      subcats.forEach(subcat => {
        processed.add(subcat.id);
        result.push({ ...subcat, level: level });
        findSubcats(subcat.id, level + 1);
      });
    };

    findSubcats(categoryId, 1);
    return result;
  }

  // Metody pomocnicze
  getCategoryNameById(id: number | null): string {
    if (id === null) return 'Brak (kategoria główna)';
    const category = this.allCategories.find(c => c.id === id);
    return category ? category.categoryName : 'Nieznana';
  }

  // Metody do sortowania
  sortCategories(column: keyof Category): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    // Sortowanie płaskiej listy kategorii
    this.allCategories.sort((a, b) => {
      let valueA = a[column];
      let valueB = b[column];

      // Specjalne przypadki
      if (column === 'parentCategoryId') {
        valueA = this.getCategoryNameById(a.parentCategoryId);
        valueB = this.getCategoryNameById(b.parentCategoryId);
      }

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return this.sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      } else {
        valueA = String(valueA || '').toLowerCase();
        valueB = String(valueB || '').toLowerCase();
        return this.sortDirection === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
    });

    // Przebudowanie hierarchii
    this.buildCategoryHierarchy();
  }

  // Formatowanie wcięcia dla hierarchii
  getCategoryPadding(level: number): string {
    return `padding-left: ${(level * 20) + 12}px`;
  }

  // Generowanie klasy dla ikonki rozwijania/zwijania
  getExpandIconClass(categoryId: number): string {
    return this.isCategoryExpanded(categoryId) ? 'bi bi-chevron-down' : 'bi bi-chevron-right';
  }

  // Drzewo w stylu shell - metoda do generowania odpowiednich znaków
  getTreePrefix(level: number, isLast: boolean = false): string {
    if (level === 0) return '';

    let prefix = '';
    for (let i = 0; i < level - 1; i++) {
      prefix += '│   ';
    }

    prefix += isLast ? '└── ' : '├── ';
    return prefix;
  }

  // Sprawdzanie, czy element jest ostatni w swojej grupie
  isLastInGroup(category: Category, siblings: Category[]): boolean {
    const index = siblings.findIndex(c => c.id === category.id);
    return index === siblings.length - 1;
  }
}
