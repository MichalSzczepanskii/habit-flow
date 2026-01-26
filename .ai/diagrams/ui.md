<architecture_analysis>
1. **Komponenty z plików referencyjnych**:
   - Layouty: `Root Layout`, `Auth Layout`, `App Layout`
   - Strony Autentykacji: `Login Page`, `Register Page`, `Forgot Password Page`
   - Strony Aplikacji: `Dashboard Page`, `Settings Page`
   - Logika Serwerowa: `Auth Actions` (login, register, logout, update, delete), `Route Protection` (load function), `Auth Callback`
   - Zewnętrzne: `Supabase Auth Service`, `Supabase Database`

2. **Główne strony i komponenty**:
   - `(auth)/+layout.svelte`: Kontener dla stron logowania/rejestracji (karta wyśrodkowana).
   - `(auth)/login/+page.svelte`: Formularz logowania.
   - `(auth)/register/+page.svelte`: Formularz rejestracji.
   - `(auth)/forgot-password/+page.svelte`: Formularz odzyskiwania hasła.
   - `(app)/+layout.svelte`: Główny layout aplikacji z nawigacją i przyciskiem wylogowania.
   - `(app)/dashboard/+page.svelte`: Główny widok nawyków (istniejący, przeniesiony).
   - `(app)/settings/+page.svelte`: Widok ustawień konta (zmiana hasła, usunięcie konta).

3. **Przepływ danych**:
   - Formularze (Client) -> Form Actions (Server) -> Supabase Auth (External).
   - Supabase Auth -> Session/Cookies -> Hooks (Server) -> `locals.session`.
   - `locals.session` -> Layout Load (Server) -> Dostęp do stron chronionych.

4. **Opis funkcjonalności**:
   - **Auth Layout**: Zapewnia spójny wygląd dla stron autoryzacji (minimalistyczny design).
   - **App Layout**: Chroni dostęp do tras (przekierowanie przy braku sesji) i wyświetla główne menu.
   - **Form Actions**: Obsługują logikę biznesową logowania, rejestracji i zarządzania kontem po stronie serwera.
   - **Supabase Auth**: Zarządza użytkownikami, sesjami i tokenami JWT.
</architecture_analysis>

<mermaid_diagram>
mermaid
flowchart TD
    %% Zewnętrzne systemy
    subgraph External["Zewnętrzne Usługi"]
        SupabaseAuth[("Supabase Auth API")]
        SupabaseDB[("Supabase Database")]
    end

    %% Warstwa Klienta - Router SvelteKit
    subgraph ClientRouter["Router SvelteKit (Client)"]
        direction TB
        
        %% Grupa Publiczna
        subgraph PublicRoutes["Trasy Publiczne (auth)"]
            AuthLayout["(auth)/+layout.svelte\n[Layout Autentykacji]"]
            LoginPage["login/+page.svelte\n[Logowanie]"]
            RegisterPage["register/+page.svelte\n[Rejestracja]"]
            ForgotPage["forgot-password/+page.svelte\n[Odzyskiwanie Hasła]"]
        end

        %% Grupa Chroniona
        subgraph ProtectedRoutes["Trasy Chronione (app)"]
            AppLayout["(app)/+layout.svelte\n[Layout Aplikacji + Navbar]"]
            DashboardPage["dashboard/+page.svelte\n[Dashboard Nawyków]"]
            SettingsPage["settings/+page.svelte\n[Ustawienia Konta]"]
        end
    end

    %% Warstwa Serwera - Logika i Ochrona
    subgraph ServerLayer["Warstwa Serwera (SvelteKit)"]
        direction TB
        
        %% Hooks i Ochrona
        Hooks["hooks.server.ts\n[Zarządzanie Sesją]"]
        AppGuard["(app)/+layout.server.ts\n[Strażnik Sesji - Load]"]
        
        %% Akcje Formularzy
        subgraph AuthActions["Akcje Formularzy (Actions)"]
            LoginAction[[Akcja: login]]
            RegisterAction[[Akcja: register]]
            LogoutAction[[Akcja: logout]]
            UpdatePasswordAction[[Akcja: update_password]]
            DeleteAccountAction[[Akcja: delete_account]]
        end
        
        CallbackRoute["auth/callback/+server.ts\n[Obsługa Linków Magic/Reset]"]
    end

    %% POŁĄCZENIA

    %% Renderowanie Layoutów
    AuthLayout --> LoginPage
    AuthLayout --> RegisterPage
    AuthLayout --> ForgotPage
    
    AppLayout --> DashboardPage
    AppLayout --> SettingsPage

    %% Przepływ Logowania i Rejestracji
    LoginPage -- "POST form" --> LoginAction
    RegisterPage -- "POST form" --> RegisterAction
    ForgotPage -- "POST form" --> SupabaseAuth

    %% Przepływ Aplikacji
    AppLayout -- "Wyloguj" --> LogoutAction
    SettingsPage -- "Aktualizuj Hasło" --> UpdatePasswordAction
    SettingsPage -- "Usuń Konto" --> DeleteAccountAction

    %% Logika Serwera -> Supabase
    LoginAction --> SupabaseAuth
    RegisterAction --> SupabaseAuth
    LogoutAction --> SupabaseAuth
    UpdatePasswordAction --> SupabaseAuth
    DeleteAccountAction --> SupabaseAuth
    CallbackRoute --> SupabaseAuth

    %% Sesja i Ochrona
    SupabaseAuth -- "JWT / Session" --> Hooks
    Hooks -- "locals.session" --> AppGuard
    AppGuard -- "Brak sesji: Przekieruj" --> LoginPage
    AppGuard -- "Sesja OK: Renderuj" --> AppLayout

    %% Relacje z Bazą Danych (pośrednio przez Auth/API)
    RegisterAction -.-> SupabaseDB
    DeleteAccountAction -.-> SupabaseDB
    DashboardPage -.-> SupabaseDB

    %% Style
    classDef layout fill:#e1f5fe,stroke:#01579b,stroke-width:2px;
    classDef page fill:#fff9c4,stroke:#fbc02d,stroke-width:2px;
    classDef server fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px;
    classDef external fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,stroke-dasharray: 5 5;
    classDef action fill:#ffe0b2,stroke:#ef6c00,stroke-width:1px;

    class AuthLayout,AppLayout layout;
    class LoginPage,RegisterPage,ForgotPage,DashboardPage,SettingsPage page;
    class Hooks,AppGuard,CallbackRoute server;
    class SupabaseAuth,SupabaseDB external;
    class LoginAction,RegisterAction,LogoutAction,UpdatePasswordAction,DeleteAccountAction action;
</mermaid_diagram>