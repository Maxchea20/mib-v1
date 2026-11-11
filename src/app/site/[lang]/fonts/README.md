Self-hosted fonts for the public website (latin subset, variable weight).

- Playfair Display: SIL Open Font License 1.1, https://github.com/clauseggers/Playfair-Display
- Plus Jakarta Sans: SIL Open Font License 1.1, https://github.com/tokotype/PlusJakartaSans

Files come from the @fontsource-variable packages. They are kept in the project (next/font/local)
so a deploy never depends on downloading fonts from Google, which made Vercel builds fail
with "next/font/google queries have exactly one entry" when a stale build cache was restored.
