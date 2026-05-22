# ChesifApp? — Gestione eventi tra amici

> Organizza eventi di gruppo, traccia le partecipazioni e dividi le spese. Semplice, senza registrazione.

**Live:** [chesifapp.pavo.pw](https://chesifapp.pavo.pw)

---

## Cos'è

ChesifApp? permette a chiunque di creare un evento (cena, gita, ombrellone al mare…), invitare i partecipanti tramite un codice e tenere traccia di chi viene e chi ha pagato.

- **Crea un evento** con nome, costo totale, date opzionali e info di pagamento
- **Condividi il codice invito** — i partecipanti confermano o declinano senza registrarsi
- **Quota pro-capite** aggiornata in tempo reale in base ai confermati
- **Pannello admin** protetto da codice per gestire partecipanti e pagamenti

Nessun account, nessun login. Solo un link e due codici.

---

## Stack

| Layer | Tecnologia |
|---|---|
| Framework | Next.js 16 App Router + TypeScript |
| Stile | Tailwind CSS v4 |
| ORM | Prisma 7 |
| Database | Neon PostgreSQL |
| Deploy | Vercel |

---

## Sviluppo locale

### Prerequisiti

- Node.js 20+
- pnpm 10+
- Un database PostgreSQL (o un progetto [Neon](https://neon.tech) gratuito)

### Setup

```bash
git clone git@github.com:andp97/chesifapp.git
cd chesifapp
pnpm install
```

Crea `.env.local` con la stringa di connessione al database:

```env
DATABASE_URL=postgresql://...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

Esegui le migrazioni e avvia il server:

```bash
npx prisma migrate deploy
pnpm dev
```

Apri [http://localhost:3000](http://localhost:3000).

---

## Deploy su Vercel

1. Collega il repo a Vercel
2. Aggiungi l'integrazione **Neon** dal Vercel Marketplace (provisiona `DATABASE_URL` automaticamente)
3. Imposta `NEXT_PUBLIC_BASE_URL` al dominio di produzione
4. Deploy

---

## Contribuire

Pull request benvenute. Per modifiche sostanziali apri prima una issue per discutere la direzione.

---

## Licenza

[MIT](LICENSE)
